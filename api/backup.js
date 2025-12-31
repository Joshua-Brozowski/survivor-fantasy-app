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

// Keys to backup (all important game data)
const BACKUP_KEYS = [
  'players',
  'contestants',
  'picks',
  'gamePhase',
  'questionnaires',
  'submissions',
  'qotWVotes',
  'latePenalties',
  'pickScores',
  'playerAdvantages',
  'episodes',
  'notifications',
  'currentSeason',
  'seasonHistory',
  'challenges',
  'challengeAttempts'
];

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
    const backupsCollection = db.collection('backups');

    const { action } = req.method === 'GET' ? req.query : req.body;

    switch (action) {
      case 'createSnapshot': {
        // Create a snapshot of all game data
        const { trigger } = req.body;

        if (!trigger) {
          res.status(400).json({ error: 'Missing trigger parameter' });
          return;
        }

        // Fetch all game data
        const gameData = {};
        for (const key of BACKUP_KEYS) {
          const doc = await gameDataCollection.findOne({ key });
          if (doc) {
            gameData[key] = doc.value;
          }
        }

        // Also backup password and security keys (without exposing them in export)
        const passwordDocs = await gameDataCollection.find({ key: /^password_/ }).toArray();
        const securityDocs = await gameDataCollection.find({ key: /^security_/ }).toArray();

        gameData._passwords = passwordDocs.map(d => ({ key: d.key, value: d.value }));
        gameData._security = securityDocs.map(d => ({ key: d.key, value: d.value }));

        // Create snapshot document
        const snapshot = {
          id: Date.now(),
          trigger,
          createdAt: new Date().toISOString(),
          data: gameData
        };

        await backupsCollection.insertOne(snapshot);

        res.status(200).json({
          success: true,
          message: `Snapshot created (${trigger})`,
          snapshotId: snapshot.id
        });
        break;
      }

      case 'getSnapshots': {
        // Get list of all snapshots (without full data for efficiency)
        const snapshots = await backupsCollection
          .find({})
          .project({ id: 1, trigger: 1, createdAt: 1, _id: 0 })
          .sort({ createdAt: -1 })
          .toArray();

        res.status(200).json({ success: true, snapshots });
        break;
      }

      case 'restoreSnapshot': {
        // Restore from a specific snapshot
        const { snapshotId } = req.body;

        if (!snapshotId) {
          res.status(400).json({ error: 'Missing snapshotId' });
          return;
        }

        const snapshot = await backupsCollection.findOne({ id: parseInt(snapshotId) });

        if (!snapshot) {
          res.status(404).json({ error: 'Snapshot not found' });
          return;
        }

        // First, create a "pre-restore" snapshot for safety
        const currentData = {};
        for (const key of BACKUP_KEYS) {
          const doc = await gameDataCollection.findOne({ key });
          if (doc) {
            currentData[key] = doc.value;
          }
        }

        const preRestoreSnapshot = {
          id: Date.now(),
          trigger: 'pre-restore-safety',
          createdAt: new Date().toISOString(),
          data: currentData
        };
        await backupsCollection.insertOne(preRestoreSnapshot);

        // Restore all game data from snapshot
        const { data } = snapshot;

        for (const key of BACKUP_KEYS) {
          if (data[key] !== undefined) {
            await gameDataCollection.updateOne(
              { key },
              { $set: { key, value: data[key], updatedAt: new Date() } },
              { upsert: true }
            );
          }
        }

        // Restore passwords and security questions
        if (data._passwords) {
          for (const pwDoc of data._passwords) {
            await gameDataCollection.updateOne(
              { key: pwDoc.key },
              { $set: { key: pwDoc.key, value: pwDoc.value, updatedAt: new Date() } },
              { upsert: true }
            );
          }
        }

        if (data._security) {
          for (const secDoc of data._security) {
            await gameDataCollection.updateOne(
              { key: secDoc.key },
              { $set: { key: secDoc.key, value: secDoc.value, updatedAt: new Date() } },
              { upsert: true }
            );
          }
        }

        res.status(200).json({
          success: true,
          message: 'Snapshot restored successfully',
          restoredFrom: snapshot.createdAt
        });
        break;
      }

      case 'exportData': {
        // Export all game data as JSON (for manual download)
        const gameData = {};

        for (const key of BACKUP_KEYS) {
          const doc = await gameDataCollection.findOne({ key });
          if (doc) {
            gameData[key] = doc.value;
          }
        }

        // Include metadata
        gameData._exportedAt = new Date().toISOString();
        gameData._version = '1.0';

        res.status(200).json({
          success: true,
          data: gameData
        });
        break;
      }

      case 'deleteSnapshot': {
        // Delete a specific snapshot
        const { snapshotId } = req.body;

        if (!snapshotId) {
          res.status(400).json({ error: 'Missing snapshotId' });
          return;
        }

        await backupsCollection.deleteOne({ id: parseInt(snapshotId) });

        res.status(200).json({ success: true, message: 'Snapshot deleted' });
        break;
      }

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
