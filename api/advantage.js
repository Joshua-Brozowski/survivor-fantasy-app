import { MongoClient } from 'mongodb';
import { requireAuth, canModifyPlayer } from './lib/auth-middleware.js';

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  // Enable CORS
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // All advantage operations require authentication
  const user = requireAuth(req, res);
  if (!user) return; // Response already sent

  try {
    const { db } = await connectToDatabase();
    const gameDataCollection = db.collection('game_data');

    const { action } = req.body;

    switch (action) {
      case 'purchase': {
        // Atomic advantage purchase - prevents race conditions
        const { playerId, advantageId, advantageName, advantageDescription, advantageType, advantageCost, leagueId } = req.body;

        if (!playerId || !advantageId || !leagueId) {
          res.status(400).json({ error: 'Missing required fields' });
          return;
        }

        // Verify user can only purchase for themselves (or admin for anyone)
        if (!canModifyPlayer(user, playerId)) {
          res.status(403).json({ error: 'Cannot purchase advantages for other players' });
          return;
        }

        const key = `league_${leagueId}_playerAdvantages`;

        // Get current advantages
        const doc = await gameDataCollection.findOne({ key });
        const currentAdvantages = doc ? JSON.parse(doc.value) : [];

        // Check if advantage is already owned (not used)
        const alreadyOwned = currentAdvantages.some(
          pa => pa.advantageId === advantageId && !pa.used
        );

        if (alreadyOwned) {
          res.status(409).json({
            error: 'ALREADY_PURCHASED',
            message: 'This advantage has already been purchased by another player!'
          });
          return;
        }

        // Create new advantage entry
        const newAdvantage = {
          id: Date.now(),
          playerId,
          advantageId,
          name: advantageName,
          description: advantageDescription,
          type: advantageType,
          cost: advantageCost,
          purchasedAt: new Date().toISOString(),
          used: false,
          // New weekly system fields
          queuedForWeek: null,      // Episode number this is queued for
          targetPlayerId: null,     // For advantages that target other players
          resolvedAt: null,         // When the advantage effect was applied
          cancelled: false          // If player cancelled before resolution
        };

        // Atomic update - add to array
        const updatedAdvantages = [...currentAdvantages, newAdvantage];

        await gameDataCollection.updateOne(
          { key },
          { $set: { key, value: JSON.stringify(updatedAdvantages), updatedAt: new Date() } },
          { upsert: true }
        );

        res.status(200).json({
          success: true,
          advantage: newAdvantage,
          message: `Successfully purchased ${advantageName}!`
        });
        break;
      }

      case 'queueForWeek': {
        // Queue an advantage to be used for a specific week
        const { advantageId: playerAdvantageId, weekNumber, targetPlayerId, leagueId } = req.body;

        if (!playerAdvantageId || !weekNumber || !leagueId) {
          res.status(400).json({ error: 'Missing required fields' });
          return;
        }

        const key = `league_${leagueId}_playerAdvantages`;
        const doc = await gameDataCollection.findOne({ key });
        const advantages = doc ? JSON.parse(doc.value) : [];

        const advantageIndex = advantages.findIndex(a => a.id === playerAdvantageId);
        if (advantageIndex === -1) {
          res.status(404).json({ error: 'Advantage not found' });
          return;
        }

        const advantage = advantages[advantageIndex];
        if (advantage.used) {
          res.status(400).json({ error: 'Advantage already used' });
          return;
        }

        if (advantage.queuedForWeek) {
          res.status(400).json({ error: 'Advantage already queued for a week' });
          return;
        }

        // Update the advantage
        advantages[advantageIndex] = {
          ...advantage,
          queuedForWeek: weekNumber,
          targetPlayerId: targetPlayerId || null,
          queuedAt: new Date().toISOString()
        };

        await gameDataCollection.updateOne(
          { key },
          { $set: { key, value: JSON.stringify(advantages), updatedAt: new Date() } },
          { upsert: true }
        );

        res.status(200).json({
          success: true,
          message: `Advantage queued for Week ${weekNumber}!`
        });
        break;
      }

      case 'cancelQueue': {
        // Cancel a queued advantage (before it's resolved)
        const { advantageId: playerAdvantageId, leagueId } = req.body;

        if (!playerAdvantageId || !leagueId) {
          res.status(400).json({ error: 'Missing required fields' });
          return;
        }

        const key = `league_${leagueId}_playerAdvantages`;
        const doc = await gameDataCollection.findOne({ key });
        const advantages = doc ? JSON.parse(doc.value) : [];

        const advantageIndex = advantages.findIndex(a => a.id === playerAdvantageId);
        if (advantageIndex === -1) {
          res.status(404).json({ error: 'Advantage not found' });
          return;
        }

        const advantage = advantages[advantageIndex];
        if (advantage.used) {
          res.status(400).json({ error: 'Cannot cancel - advantage already used' });
          return;
        }

        // Clear the queue
        advantages[advantageIndex] = {
          ...advantage,
          queuedForWeek: null,
          targetPlayerId: null,
          queuedAt: null
        };

        await gameDataCollection.updateOne(
          { key },
          { $set: { key, value: JSON.stringify(advantages), updatedAt: new Date() } },
          { upsert: true }
        );

        res.status(200).json({
          success: true,
          message: 'Advantage queue cancelled'
        });
        break;
      }

      case 'grantStealToken': {
        // Admin-only: grant a one-time steal token to a player
        const { playerId: recipientId, leagueId } = req.body;

        if (!recipientId || !leagueId) {
          res.status(400).json({ error: 'Missing required fields' });
          return;
        }

        if (!user.isAdmin) {
          res.status(403).json({ error: 'Admin only' });
          return;
        }

        const key = `league_${leagueId}_playerAdvantages`;
        const doc = await gameDataCollection.findOne({ key });
        const advantages = doc ? JSON.parse(doc.value) : [];

        const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

        const newToken = {
          id: Date.now(),
          playerId: recipientId,
          advantageId: 'steal-token',
          name: 'Steal an Advantage',
          description: 'A secret power. Use it to steal any advantage currently held by another player.',
          type: 'steal-token',
          cost: 0,
          grantedAt: new Date().toISOString(),
          expiresAt,
          used: false,
          queuedForWeek: null,
          targetPlayerId: null,
          stolenAdvantageId: null,
          resolvedAt: null,
          cancelled: false
        };

        const updatedAfterGrant = [...advantages, newToken];
        await gameDataCollection.updateOne(
          { key },
          { $set: { key, value: JSON.stringify(updatedAfterGrant), updatedAt: new Date() } },
          { upsert: true }
        );

        res.status(200).json({ success: true, token: newToken });
        break;
      }

      case 'executeSteal': {
        // Player uses their steal token to take an advantage from another player
        const { stealTokenId, targetAdvantageDbId, leagueId } = req.body;

        if (!stealTokenId || !targetAdvantageDbId || !leagueId) {
          res.status(400).json({ error: 'Missing required fields' });
          return;
        }

        const key = `league_${leagueId}_playerAdvantages`;
        const doc = await gameDataCollection.findOne({ key });
        const advantages = doc ? JSON.parse(doc.value) : [];

        // Find and validate steal token
        const tokenIndex = advantages.findIndex(a => a.id === stealTokenId);
        if (tokenIndex === -1) {
          res.status(404).json({ error: 'Steal token not found' });
          return;
        }

        const stealToken = advantages[tokenIndex];

        if (stealToken.playerId !== user.playerId && !user.isAdmin) {
          res.status(403).json({ error: 'This steal token does not belong to you' });
          return;
        }

        if (stealToken.used) {
          res.status(400).json({ error: 'This steal token has already been used' });
          return;
        }

        if (new Date() > new Date(stealToken.expiresAt)) {
          res.status(400).json({ error: 'This steal token has expired' });
          return;
        }

        // Find and validate target advantage
        const targetIndex = advantages.findIndex(a => a.id === targetAdvantageDbId);
        if (targetIndex === -1) {
          res.status(404).json({ error: 'Target advantage not found' });
          return;
        }

        const targetAdvantage = advantages[targetIndex];

        if (targetAdvantage.used) {
          res.status(400).json({ error: 'That advantage has already been used' });
          return;
        }

        if (targetAdvantage.playerId === stealToken.playerId) {
          res.status(400).json({ error: 'Cannot steal your own advantage' });
          return;
        }

        const stolenFromPlayerId = targetAdvantage.playerId;

        // Atomic: transfer advantage + mark token used in one write
        const updatedAfterSteal = advantages.map((a, i) => {
          if (i === tokenIndex) {
            return {
              ...a,
              used: true,
              resolvedAt: new Date().toISOString(),
              targetPlayerId: stolenFromPlayerId,
              stolenAdvantageId: targetAdvantage.advantageId
            };
          }
          if (i === targetIndex) {
            return {
              ...a,
              playerId: stealToken.playerId,
              queuedForWeek: null,
              targetPlayerId: null,
              queuedAt: null
            };
          }
          return a;
        });

        await gameDataCollection.updateOne(
          { key },
          { $set: { key, value: JSON.stringify(updatedAfterSteal), updatedAt: new Date() } },
          { upsert: true }
        );

        res.status(200).json({
          success: true,
          stolenFromPlayerId,
          stolenAdvantageName: targetAdvantage.name,
          stolenAdvantageType: targetAdvantage.advantageId
        });
        break;
      }

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Advantage API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
