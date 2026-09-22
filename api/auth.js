import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractRefreshTokenFromCookie,
  setRefreshTokenCookie,
  clearRefreshTokenCookie
} from './lib/jwt.js';
import { authenticateRequest } from './lib/auth-middleware.js';

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

// Rate limiting settings
const MAX_LOGIN_ATTEMPTS = 10;       // Max failed attempts before lockout
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;  // 15 minutes

// Get client IP from request (handles Vercel proxying)
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

// Check if IP is rate limited for a specific player
async function isRateLimited(collection, ip, playerId) {
  const key = `ratelimit_${ip}_${playerId}`;
  const doc = await collection.findOne({ key });

  if (!doc) return { limited: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };

  const { attempts, lockedUntil } = doc.value;

  // Check if currently locked out
  if (lockedUntil && new Date(lockedUntil) > new Date()) {
    const remainingMs = new Date(lockedUntil) - new Date();
    const remainingMin = Math.ceil(remainingMs / 60000);
    return { limited: true, remainingMinutes: remainingMin };
  }

  // Lockout expired, reset if needed
  if (lockedUntil && new Date(lockedUntil) <= new Date()) {
    await collection.deleteOne({ key });
    return { limited: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };
  }

  return { limited: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - attempts };
}

// Record a failed login attempt
async function recordFailedAttempt(collection, ip, playerId) {
  const key = `ratelimit_${ip}_${playerId}`;
  const doc = await collection.findOne({ key });

  let attempts = 1;
  let lockedUntil = null;

  if (doc) {
    attempts = (doc.value.attempts || 0) + 1;
  }

  // Lock out if max attempts reached
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
  }

  await collection.updateOne(
    { key },
    { $set: { key, value: { attempts, lockedUntil, lastAttempt: new Date().toISOString() } } },
    { upsert: true }
  );

  return { attempts, lockedUntil, attemptsLeft: MAX_LOGIN_ATTEMPTS - attempts };
}

// Clear rate limit on successful login
async function clearRateLimit(collection, ip, playerId) {
  const key = `ratelimit_${ip}_${playerId}`;
  await collection.deleteOne({ key });
}

async function connectToDatabase() {
  // Check if cached connection is still alive
  if (cachedClient && cachedDb) {
    try {
      // Ping to verify connection is healthy
      await cachedDb.command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      // Connection died, clear cache and reconnect
      console.log('Cached connection unhealthy, reconnecting...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('survivor_fantasy');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// CORS helper - restrict to allowed origins
function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://survivor-fantasy-app-gamma.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  // Allow exact matches or any vercel.app preview deployment
  if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://survivor-fantasy-app-gamma.vercel.app');
  }

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  // Enable CORS
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('game_data');
    const { action, playerId, password, newPassword, securityAnswer } = req.body;

    // Special cases that don't need playerId
    if (action === 'refresh' || action === 'logout') {
      // These actions use the refresh token cookie, not playerId
      if (action === 'refresh') {
        const refreshToken = extractRefreshTokenFromCookie(req);
        if (!refreshToken) {
          res.status(401).json({ error: 'No refresh token' });
          return;
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
          clearRefreshTokenCookie(res);
          res.status(401).json({ error: 'Invalid or expired refresh token' });
          return;
        }

        // Fetch player data
        const playersDoc = await collection.findOne({ key: 'players' });
        const players = playersDoc ? JSON.parse(playersDoc.value) : [];
        const player = players.find(p => p.id === decoded.playerId);

        if (!player) {
          clearRefreshTokenCookie(res);
          res.status(401).json({ error: 'Player not found' });
          return;
        }

        // Block deactivated players from refreshing tokens
        if (player.active === false) {
          clearRefreshTokenCookie(res);
          res.status(403).json({ error: 'This account has been deactivated. Contact the league admin.' });
          return;
        }

        // Generate new access token
        const accessToken = generateAccessToken(player);

        res.status(200).json({
          success: true,
          accessToken,
          user: { id: player.id, name: player.name, isAdmin: player.isAdmin || false }
        });
        return;
      }

      if (action === 'logout') {
        clearRefreshTokenCookie(res);
        res.status(200).json({ success: true, message: 'Logged out' });
        return;
      }
    }

    if (action === 'checkDefaultPasswords') {
      // Check which players still have the default password - admin only
      const authUser = authenticateRequest(req);
      if (!authUser) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      if (!authUser.isAdmin) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const passwordDocs = await collection.find({ key: /^password_/ }).toArray();
      const results = {};

      for (const doc of passwordDocs) {
        // Extract playerId from key (password_1 -> 1)
        const id = parseInt(doc.key.replace('password_', ''));
        const storedPassword = doc.value;
        const isHashed = storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'));

        if (isHashed) {
          // Compare with default password
          const isDefault = await bcrypt.compare(DEFAULT_PASSWORD, storedPassword);
          results[id] = isDefault;
        } else {
          // Legacy plaintext - check directly
          results[id] = storedPassword === DEFAULT_PASSWORD;
        }
      }

      res.status(200).json({ success: true, results });
      return;
    }

    // joinLeague action — no playerId needed (creates a new player)
    if (action === 'joinLeague') {
      const { name, joinCode, password: joinPassword } = req.body;

      // Validate inputs
      if (!name?.trim() || !joinCode?.trim() || !joinPassword) {
        return res.status(400).json({ error: 'Name, join code, and password are required.' });
      }
      if (joinPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      }

      const trimmedName = name.trim();
      const upperCode = joinCode.trim().toUpperCase();

      // Validate join code
      const codesData = await collection.findOne({ key: 'joinCodes' });
      const codes = codesData?.value ? JSON.parse(codesData.value) : {};
      const codeEntry = codes[upperCode];

      if (!codeEntry || !codeEntry.enabled) {
        return res.status(400).json({ error: 'Invalid or disabled join code.' });
      }

      // Check name not already taken (case-insensitive)
      const playersData = await collection.findOne({ key: 'players' });
      const allPlayers = playersData?.value ? JSON.parse(playersData.value) : [];
      const nameTaken = allPlayers.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
      if (nameTaken) {
        return res.status(400).json({ error: 'That name is already taken. Try a variation.' });
      }

      // Generate new player ID
      const newId = allPlayers.length > 0 ? Math.max(...allPlayers.map(p => p.id)) + 1 : 1;
      const newPlayer = { id: newId, name: trimmedName, isAdmin: false, active: true };

      // Add player
      const updatedPlayers = [...allPlayers, newPlayer];
      await collection.updateOne(
        { key: 'players' },
        { $set: { key: 'players', value: JSON.stringify(updatedPlayers), updatedAt: new Date() } },
        { upsert: true }
      );

      // Add league membership
      const membershipsData = await collection.findOne({ key: 'leagueMemberships' });
      const memberships = membershipsData?.value ? JSON.parse(membershipsData.value) : [];
      const updatedMemberships = [...memberships, { playerId: newId, leagueId: codeEntry.leagueId }];
      await collection.updateOne(
        { key: 'leagueMemberships' },
        { $set: { key: 'leagueMemberships', value: JSON.stringify(updatedMemberships), updatedAt: new Date() } },
        { upsert: true }
      );

      // Hash and store password
      const hashedJoinPassword = await bcrypt.hash(joinPassword, SALT_ROUNDS);
      const joinPasswordKey = `password_${newId}`;
      await collection.updateOne(
        { key: joinPasswordKey },
        { $set: { key: joinPasswordKey, value: hashedJoinPassword, updatedAt: new Date() } },
        { upsert: true }
      );

      // Issue JWT tokens (same pattern as login)
      const accessToken = generateAccessToken(newPlayer);
      const refreshToken = generateRefreshToken(newPlayer, 0);
      setRefreshTokenCookie(res, refreshToken);

      return res.status(200).json({
        success: true,
        player: newPlayer,
        leagueId: codeEntry.leagueId,
        accessToken,
        user: { id: newPlayer.id, name: newPlayer.name, isAdmin: false }
      });
    }

    if (!action || !playerId) {
      res.status(400).json({ error: 'Missing action or playerId' });
      return;
    }

    const passwordKey = `password_${playerId}`;

    switch (action) {
      case 'login': {
        // Verify password
        if (!password) {
          res.status(400).json({ error: 'Missing password' });
          return;
        }

        // Check rate limiting
        const clientIP = getClientIP(req);
        const rateLimitStatus = await isRateLimited(collection, clientIP, playerId);

        if (rateLimitStatus.limited) {
          res.status(429).json({
            success: false,
            error: `Too many failed attempts. Try again in ${rateLimitStatus.remainingMinutes} minute(s).`
          });
          return;
        }

        // Helper to handle successful login - generates tokens
        const handleLoginSuccess = async () => {
          await clearRateLimit(collection, clientIP, playerId);

          // Fetch player data to include in token
          const playersDoc = await collection.findOne({ key: 'players' });
          const players = playersDoc ? JSON.parse(playersDoc.value) : [];
          const player = players.find(p => p.id === playerId);

          if (!player) {
            res.status(500).json({ error: 'Player not found' });
            return;
          }

          // Block deactivated players
          if (player.active === false) {
            res.status(403).json({ success: false, error: 'This account has been deactivated. Contact the league admin.' });
            return;
          }

          // Generate tokens
          const accessToken = generateAccessToken(player);
          const refreshToken = generateRefreshToken(player, 0);

          // Set refresh token as httpOnly cookie
          setRefreshTokenCookie(res, refreshToken);

          res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            user: { id: player.id, name: player.name, isAdmin: player.isAdmin || false }
          });
        };

        // Helper to handle failed login
        const handleLoginFailure = async () => {
          const failInfo = await recordFailedAttempt(collection, clientIP, playerId);
          res.status(401).json({
            success: false,
            error: failInfo.attemptsLeft > 0
              ? `Invalid password. ${failInfo.attemptsLeft} attempt(s) remaining.`
              : 'Too many failed attempts. Account locked for 15 minutes.'
          });
        };

        const doc = await collection.findOne({ key: passwordKey });

        if (!doc) {
          // No password set - check against default (for migration)
          if (password === DEFAULT_PASSWORD) {
            // Auto-migrate: hash and store the default password
            const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
            await collection.updateOne(
              { key: passwordKey },
              { $set: { key: passwordKey, value: hashedPassword, updatedAt: new Date() } },
              { upsert: true }
            );
            await handleLoginSuccess();
            return;
          }
          await handleLoginFailure();
          return;
        }

        const storedPassword = doc.value;

        // Check if password is already hashed (starts with $2a$ or $2b$)
        const isHashed = storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'));

        if (isHashed) {
          // Compare with hashed password
          const isValid = await bcrypt.compare(password, storedPassword);
          if (isValid) {
            await handleLoginSuccess();
          } else {
            await handleLoginFailure();
          }
        } else {
          // Legacy plaintext password - migrate it
          if (password === storedPassword) {
            // Migrate to hashed password
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            await collection.updateOne(
              { key: passwordKey },
              { $set: { key: passwordKey, value: hashedPassword, updatedAt: new Date() } }
            );
            await handleLoginSuccess();
          } else {
            await handleLoginFailure();
          }
        }
        break;
      }

      case 'setPassword': {
        // Set/change password (hashed) - requires authentication
        // User can only change their own password (or admin can change anyone's)
        const authUser = authenticateRequest(req);
        if (!authUser) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        // Check authorization: user can only change own password unless admin
        if (authUser.playerId !== playerId && !authUser.isAdmin) {
          res.status(403).json({ error: 'Cannot change another player\'s password' });
          return;
        }

        if (!newPassword) {
          res.status(400).json({ error: 'Missing newPassword' });
          return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await collection.updateOne(
          { key: passwordKey },
          { $set: { key: passwordKey, value: hashedPassword, updatedAt: new Date() } },
          { upsert: true }
        );
        res.status(200).json({ success: true, message: 'Password updated' });
        break;
      }

      case 'resetToDefault': {
        // Reset password to default (hashed) - admin only
        const authUser = authenticateRequest(req);
        if (!authUser) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }
        if (!authUser.isAdmin) {
          res.status(403).json({ error: 'Admin access required' });
          return;
        }

        const hashedDefault = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
        await collection.updateOne(
          { key: passwordKey },
          { $set: { key: passwordKey, value: hashedDefault, updatedAt: new Date() } },
          { upsert: true }
        );

        // Audit log — admin password resets leave a trail
        const auditKey = 'adminActionLog';
        const auditDoc = await collection.findOne({ key: auditKey });
        const auditLog = auditDoc ? JSON.parse(auditDoc.value) : [];
        auditLog.push({
          action: 'resetPassword',
          adminId: authUser.playerId,
          targetPlayerId: playerId,
          at: new Date().toISOString()
        });
        await collection.updateOne(
          { key: auditKey },
          { $set: { key: auditKey, value: JSON.stringify(auditLog), updatedAt: new Date() } },
          { upsert: true }
        );

        res.status(200).json({ success: true, message: 'Password reset to default' });
        break;
      }

      case 'verifyCurrentPassword': {
        // Verify current password before allowing change
        if (!password) {
          res.status(400).json({ error: 'Missing password' });
          return;
        }

        // Apply same rate limiting as login to prevent brute-force
        const vcpIP = getClientIP(req);
        const vcpRateLimit = await isRateLimited(collection, vcpIP, playerId);
        if (vcpRateLimit.limited) {
          res.status(429).json({ valid: false, error: `Too many attempts. Try again in ${vcpRateLimit.remainingMinutes} minute(s).` });
          return;
        }

        const doc = await collection.findOne({ key: passwordKey });

        let isValid = false;
        if (!doc) {
          isValid = password === DEFAULT_PASSWORD;
        } else {
          const storedPassword = doc.value;
          const isHashed = storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'));
          isValid = isHashed
            ? await bcrypt.compare(password, storedPassword)
            : password === storedPassword;
        }

        if (!isValid) await recordFailedAttempt(collection, vcpIP, playerId);
        else await clearRateLimit(collection, vcpIP, playerId);

        res.status(200).json({ valid: isValid });
        break;
      }

      case 'clearRateLimit': {
        // Clear ALL rate limits for a player across all IPs - admin only
        const authUser = authenticateRequest(req);
        if (!authUser) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }
        if (!authUser.isAdmin) {
          res.status(403).json({ error: 'Admin access required' });
          return;
        }

        // Delete all ratelimit entries for this player regardless of IP
        const deleteResult = await collection.deleteMany({
          key: { $regex: `^ratelimit_.*_${playerId}$` }
        });
        res.status(200).json({ success: true, message: `Rate limit cleared (${deleteResult.deletedCount} entries removed)` });
        break;
      }

      case 'checkRateLimit': {
        // Check if a player is rate limited (for debugging) - admin only
        const authUser = authenticateRequest(req);
        if (!authUser) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }
        if (!authUser.isAdmin) {
          res.status(403).json({ error: 'Admin access required' });
          return;
        }

        // Return all rate limit entries for this player
        const rateDocs = await collection.find({
          key: { $regex: `^ratelimit_.*_${playerId}$` }
        }).toArray();

        const entries = rateDocs.map(d => ({
          key: d.key,
          attempts: d.value?.attempts,
          lockedUntil: d.value?.lockedUntil,
          lastAttempt: d.value?.lastAttempt
        }));

        const anyLocked = entries.some(e => e.lockedUntil && new Date(e.lockedUntil) > new Date());
        res.status(200).json({
          success: true,
          limited: anyLocked,
          entries,
        });
        break;
      }

      case 'resetPasswordViaRecovery': {
        // Reset password via security question verification — no auth token required.
        // The server verifies the security answer before allowing the password change.
        if (!securityAnswer || !newPassword) {
          res.status(400).json({ error: 'Missing required fields' });
          return;
        }

        if (newPassword.length < 8) {
          res.status(400).json({ error: 'Password must be at least 8 characters' });
          return;
        }

        // Fetch stored security question/answer from database
        const securityKey = `security_${playerId}`;
        const securityDoc = await collection.findOne({ key: securityKey });

        if (!securityDoc) {
          res.status(400).json({ error: 'No security question set for this player' });
          return;
        }

        const { answer: storedAnswer } = JSON.parse(securityDoc.value);

        // Verify the answer (case-insensitive, trimmed — same as client-side check)
        if (securityAnswer.toLowerCase().trim() !== storedAnswer.toLowerCase().trim()) {
          res.status(401).json({ error: 'Incorrect security answer' });
          return;
        }

        // Answer verified — hash and store new password
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await collection.updateOne(
          { key: passwordKey },
          { $set: { key: passwordKey, value: hashedPassword, updatedAt: new Date() } },
          { upsert: true }
        );
        res.status(200).json({ success: true, message: 'Password reset successfully' });
        break;
      }

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
