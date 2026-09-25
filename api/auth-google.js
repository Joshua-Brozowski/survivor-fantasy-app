import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken, generateRefreshToken, setRefreshTokenCookie,
  generateGoogleLinkToken, verifyGoogleLinkToken,
  generateSettingsLinkToken, verifySettingsLinkToken,
  verifyAccessToken, extractTokenFromHeader,
} from './lib/jwt.js';

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    try { await cachedDb.command({ ping: 1 }); return { client: cachedClient, db: cachedDb }; }
    catch { cachedClient = null; cachedDb = null; }
  }
  const client = new MongoClient(uri, { maxPoolSize: 1 });
  await client.connect();
  const db = client.db('survivor_fantasy');
  cachedClient = client; cachedDb = db;
  return { client, db };
}

const PRODUCTION_URL = 'https://survivor-fantasy-app-gamma.vercel.app';
const REDIRECT_URI = `${PRODUCTION_URL}/api/auth-google`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', PRODUCTION_URL);
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  const { action, code, error } = req.query;

  // Step 1: Redirect to Google
  if (action === 'redirect') {
    if (!process.env.GOOGLE_CLIENT_ID) {
      res.setHeader('Location', `${PRODUCTION_URL}?auth_error=not_configured`);
      return res.status(302).end();
    }
    const oauthParams = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    };
    // If a settings link token is provided, thread it through as OAuth state
    // so the callback knows to link the email to an already-authenticated player
    if (req.query.link_token) {
      oauthParams.state = `link:${req.query.link_token}`;
    }
    res.setHeader('Location', `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(oauthParams)}`);
    return res.status(302).end();
  }

  // User denied Google login
  if (error) {
    res.setHeader('Location', `${PRODUCTION_URL}?auth_error=google_denied`);
    return res.status(302).end();
  }

  // Step 2: Handle OAuth callback
  if (code) {
    try {
      // Exchange code for access token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });
      const tokenData = await tokenRes.json();

      if (!tokenData.access_token) {
        res.setHeader('Location', `${PRODUCTION_URL}?auth_error=token_failed`);
        return res.status(302).end();
      }

      // Get user email from Google
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userInfo = await userInfoRes.json();
      const email = userInfo.email?.toLowerCase();

      if (!email) {
        res.setHeader('Location', `${PRODUCTION_URL}?auth_error=no_email`);
        return res.status(302).end();
      }

      const { db } = await connectToDatabase();
      const collection = db.collection('game_data');

      // --- Settings link flow: player was already logged in, just proving Google ownership ---
      const state = req.query.state || '';
      if (state.startsWith('link:')) {
        const settingsToken = state.slice(5); // strip "link:"
        const decoded = verifySettingsLinkToken(settingsToken);
        if (!decoded) {
          res.setHeader('Location', `${PRODUCTION_URL}?auth_error=link_token_expired`);
          return res.status(302).end();
        }
        // Check the email isn't already claimed by a different player
        const mappingDoc2 = await collection.findOne({ key: 'google_email_mapping' });
        const mapping2 = mappingDoc2 ? JSON.parse(mappingDoc2.value) : {};
        const claimedBy = Object.entries(mapping2).find(
          ([pid, em]) => em?.toLowerCase() === email && String(pid) !== String(decoded.playerId)
        );
        if (claimedBy) {
          res.setHeader('Location', `${PRODUCTION_URL}?auth_error=email_taken`);
          return res.status(302).end();
        }
        mapping2[decoded.playerId] = email;
        await collection.updateOne(
          { key: 'google_email_mapping' },
          { $set: { key: 'google_email_mapping', value: JSON.stringify(mapping2), updatedAt: new Date() } },
          { upsert: true }
        );
        res.setHeader('Location', `${PRODUCTION_URL}/?google_linked=success`);
        return res.status(302).end();
      }

      // --- Normal login flow ---

      const mappingDoc = await collection.findOne({ key: 'google_email_mapping' });
      const mapping = mappingDoc ? JSON.parse(mappingDoc.value) : {};
      // mapping is { "playerId": "email@gmail.com", ... }
      const playerId = Object.keys(mapping).find(
        id => mapping[id]?.toLowerCase() === email
      );

      if (!playerId) {
        // Email not yet mapped — send player to the self-link flow instead of an error
        const linkToken = generateGoogleLinkToken(email);
        res.setHeader('Location', `${PRODUCTION_URL}/?google_link_token=${encodeURIComponent(linkToken)}`);
        return res.status(302).end();
      }

      // Get full player data
      const playersDoc = await collection.findOne({ key: 'players' });
      const players = playersDoc ? JSON.parse(playersDoc.value) : [];
      const player = players.find(p => String(p.id) === String(playerId));

      if (!player) {
        res.setHeader('Location', `${PRODUCTION_URL}?auth_error=player_not_found`);
        return res.status(302).end();
      }

      // Issue our own JWT tokens
      const accessToken = generateAccessToken(player);
      const refreshToken = generateRefreshToken(player, 0);

      // Set httpOnly refresh cookie (same as existing login)
      setRefreshTokenCookie(res, refreshToken);

      // Redirect to frontend with access token in URL
      res.setHeader('Location', `${PRODUCTION_URL}/?google_token=${encodeURIComponent(accessToken)}`);
      return res.status(302).end();

    } catch (err) {
      console.error('Google OAuth error:', err);
      res.setHeader('Location', `${PRODUCTION_URL}?auth_error=server_error`);
      return res.status(302).end();
    }
  }

  // POST: link a Google email to a player account (self-service)
  if (req.method === 'POST') {
    const { action: postAction, linkToken, name, password } = req.body || {};

    // Generate a short-lived token so a logged-in player can link from Settings
    if (postAction === 'createLinkToken') {
      const token = extractTokenFromHeader(req);
      const user = token ? verifyAccessToken(token) : null;
      if (!user) return res.status(401).json({ error: 'Not authenticated' });
      const settingsLinkToken = generateSettingsLinkToken(user.playerId);
      return res.status(200).json({ linkToken: settingsLinkToken });
    }

    if (postAction !== 'link') {
      return res.status(400).json({ error: 'Invalid action' });
    }

    if (!linkToken || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the signed link token
    const decoded = verifyGoogleLinkToken(linkToken);
    if (!decoded) {
      return res.status(400).json({ error: 'Link token is invalid or expired. Please sign in with Google again.' });
    }
    const email = decoded.email;

    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('game_data');

      // Find player by name (case-insensitive)
      const playersDoc = await collection.findOne({ key: 'players' });
      const players = playersDoc ? JSON.parse(playersDoc.value) : [];
      const player = players.find(p => p.name.toLowerCase() === name.trim().toLowerCase());

      if (!player) {
        return res.status(401).json({ error: 'Player not found. Check your name and try again.' });
      }

      // Verify password
      const passwordKey = `password_${player.id}`;
      const passwordDoc = await collection.findOne({ key: passwordKey });

      let passwordValid = false;
      if (!passwordDoc) {
        // No password stored — accept default password
        passwordValid = password === 'password123';
      } else {
        const storedPassword = passwordDoc.value;
        if (storedPassword.startsWith('$2')) {
          passwordValid = await bcrypt.compare(password, storedPassword);
        } else {
          // Legacy plaintext
          passwordValid = password === storedPassword;
        }
      }

      if (!passwordValid) {
        return res.status(401).json({ error: 'Incorrect password.' });
      }

      // Check the email isn't already linked to a different player
      const mappingDoc = await collection.findOne({ key: 'google_email_mapping' });
      const mapping = mappingDoc ? JSON.parse(mappingDoc.value) : {};
      const takenByOther = Object.entries(mapping).find(
        ([pid, em]) => em?.toLowerCase() === email && String(pid) !== String(player.id)
      );
      if (takenByOther) {
        return res.status(409).json({ error: 'That Google account is already linked to another player.' });
      }

      // Save the mapping
      mapping[player.id] = email;
      await collection.updateOne(
        { key: 'google_email_mapping' },
        { $set: { key: 'google_email_mapping', value: JSON.stringify(mapping), updatedAt: new Date() } },
        { upsert: true }
      );

      // Issue JWT tokens so the player is immediately logged in
      const accessToken = generateAccessToken(player);
      const refreshToken = generateRefreshToken(player, 0);
      setRefreshTokenCookie(res, refreshToken);

      return res.status(200).json({
        success: true,
        accessToken,
        player: { id: player.id, name: player.name, isAdmin: player.isAdmin || false }
      });

    } catch (err) {
      console.error('Google link error:', err);
      return res.status(500).json({ error: 'Server error. Please try again.' });
    }
  }

  return res.status(400).json({ error: 'Invalid request' });
}
