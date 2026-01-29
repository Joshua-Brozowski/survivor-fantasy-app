import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
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
            res.status(200).json({ success: true, message: 'Login successful' });
            return;
          }
          res.status(401).json({ success: false, error: 'Invalid password' });
          return;
        }

        const storedPassword = doc.value;

        // Check if password is already hashed (starts with $2a$ or $2b$)
        const isHashed = storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'));

        if (isHashed) {
          // Compare with hashed password
          const isValid = await bcrypt.compare(password, storedPassword);
          if (isValid) {
            res.status(200).json({ success: true, message: 'Login successful' });
          } else {
            res.status(401).json({ success: false, error: 'Invalid password' });
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
            res.status(200).json({ success: true, message: 'Login successful' });
          } else {
            res.status(401).json({ success: false, error: 'Invalid password' });
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

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
