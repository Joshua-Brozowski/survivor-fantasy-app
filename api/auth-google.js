import { MongoClient } from 'mongodb';
import { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } from './lib/jwt.js';

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    try { await cachedDb.command({ ping: 1 }); return { client: cachedClient, db: cachedDb }; }
    catch { cachedClient = null; cachedDb = null; }
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('survivor_fantasy');
  cachedClient = client; cachedDb = db;
  return { client, db };
}

const PRODUCTION_URL = 'https://survivor-fantasy-app.vercel.app';
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
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    });
    res.setHeader('Location', `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
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

      // Look up player by email in MongoDB
      const { db } = await connectToDatabase();
      const collection = db.collection('game_data');

      const mappingDoc = await collection.findOne({ key: 'google_email_mapping' });
      const mapping = mappingDoc ? JSON.parse(mappingDoc.value) : {};
      // mapping is { "playerId": "email@gmail.com", ... }
      const playerId = Object.keys(mapping).find(
        id => mapping[id]?.toLowerCase() === email
      );

      if (!playerId) {
        res.setHeader('Location', `${PRODUCTION_URL}?auth_error=email_not_linked&hint=${encodeURIComponent(email)}`);
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

  return res.status(400).json({ error: 'Invalid request' });
}
