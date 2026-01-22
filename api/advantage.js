import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Advantage API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
