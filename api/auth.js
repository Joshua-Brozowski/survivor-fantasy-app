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

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

// Rate limiting settings
const MAX_LOGIN_ATTEMPTS = 5;        // Max failed attempts before lockout
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
    'https://survivor-fantasy-app.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  // Allow exact matches or any vercel.app preview deployment
  if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://survivor-fantasy-app.vercel.app');
  }

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    const { action, playerId, password, newPassword } = req.body;

    // Special case: checkDefaultPasswords doesn't need playerId
    if (action === 'checkDefaultPasswords') {
      // Check which players still have the default password
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
        // Set/change password (hashed)
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
        // Reset password to default (hashed)
        const hashedDefault = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
        await collection.updateOne(
          { key: passwordKey },
          { $set: { key: passwordKey, value: hashedDefault, updatedAt: new Date() } },
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

        const doc = await collection.findOne({ key: passwordKey });

        if (!doc) {
          // No password set - check against default
          const isValid = password === DEFAULT_PASSWORD;
          res.status(200).json({ valid: isValid });
          return;
        }

        const storedPassword = doc.value;
        const isHashed = storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'));

        if (isHashed) {
          const isValid = await bcrypt.compare(password, storedPassword);
          res.status(200).json({ valid: isValid });
        } else {
          // Legacy plaintext
          res.status(200).json({ valid: password === storedPassword });
        }
        break;
      }

      case 'refresh': {
        // Refresh access token using refresh token from cookie
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

        // Generate new access token
        const accessToken = generateAccessToken(player);

        res.status(200).json({
          success: true,
          accessToken,
          user: { id: player.id, name: player.name, isAdmin: player.isAdmin || false }
        });
        break;
      }

      case 'logout': {
        // Clear refresh token cookie
        clearRefreshTokenCookie(res);
        res.status(200).json({ success: true, message: 'Logged out' });
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
