import { MongoClient } from 'mongodb';
import { requireAdmin } from './lib/auth-middleware.js';

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

// Global keys to backup (shared across all leagues)
const GLOBAL_BACKUP_KEYS = [
  'players',
  'contestants',
  'leagues',
  'leagueMemberships',
  '_multiLeagueMigrated'
];

// League-specific keys (will be backed up with league_{id}_ prefix)
const LEAGUE_SPECIFIC_KEYS = [
  'picks',
  'picksLocked',
  'questionnaires',
  'submissions',
  'qotWVotes',
  'pickScores',
  'playerScores',
  'latePenalties',
  'playerAdvantages',
  'advantages',
  'episodes',
  'notifications',
  'challenges',
  'challengeAttempts',
  'gamePhase',
  'currentSeason',
  'seasonHistory',
  'seasonFinalized'
];

// Legacy keys for backwards compatibility during restore
const LEGACY_BACKUP_KEYS = [
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

  // All backup operations require admin
  const user = requireAdmin(req, res);
  if (!user) return; // Response already sent

  try {
    const { db } = await connectToDatabase();
    const gameDataCollection = db.collection('game_data');
    const backupsCollection = db.collection('backups');

    const { action } = req.method === 'GET' ? req.query : req.body;

    switch (action) {
      case 'createSnapshot': {
        // Create a snapshot of all game data (multi-league aware)
        const { trigger } = req.body;

        if (!trigger) {
          res.status(400).json({ error: 'Missing trigger parameter' });
          return;
        }

        const gameData = {};

        // Fetch global data
        for (const key of GLOBAL_BACKUP_KEYS) {
          const doc = await gameDataCollection.findOne({ key });
          if (doc) {
            gameData[key] = doc.value;
          }
        }

        // Get all league IDs to backup
        const leaguesDoc = await gameDataCollection.findOne({ key: 'leagues' });
        const leagues = leaguesDoc ? JSON.parse(leaguesDoc.value) : [{ id: 1 }];

        // Fetch league-specific data for all leagues
        for (const league of leagues) {
          for (const baseKey of LEAGUE_SPECIFIC_KEYS) {
            const prefixedKey = `league_${league.id}_${baseKey}`;
            const doc = await gameDataCollection.findOne({ key: prefixedKey });
            if (doc) {
              gameData[prefixedKey] = doc.value;
            }
          }
        }

        // Also backup any season archive keys (league-specific)
        const archiveDocs = await gameDataCollection.find({ key: /^league_\d+_season_\d+_archive$/ }).toArray();
        for (const doc of archiveDocs) {
          gameData[doc.key] = doc.value;
        }

        // Also backup password and security keys (without exposing them in export)
        const passwordDocs = await gameDataCollection.find({ key: /^password_/ }).toArray();
        const securityDocs = await gameDataCollection.find({ key: /^security_/ }).toArray();

        gameData._passwords = passwordDocs.map(d => ({ key: d.key, value: d.value }));
        gameData._security = securityDocs.map(d => ({ key: d.key, value: d.value }));
        gameData._version = '2.0'; // Multi-league version

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
        // Restore from a specific snapshot (multi-league aware)
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

        // First, create a "pre-restore" snapshot for safety (using current backup logic)
        const currentData = {};

        // Backup global data
        for (const key of GLOBAL_BACKUP_KEYS) {
          const doc = await gameDataCollection.findOne({ key });
          if (doc) {
            currentData[key] = doc.value;
          }
        }

        // Backup league-specific data
        const currentLeaguesDoc = await gameDataCollection.findOne({ key: 'leagues' });
        const currentLeagues = currentLeaguesDoc ? JSON.parse(currentLeaguesDoc.value) : [{ id: 1 }];
        for (const league of currentLeagues) {
          for (const baseKey of LEAGUE_SPECIFIC_KEYS) {
            const prefixedKey = `league_${league.id}_${baseKey}`;
            const doc = await gameDataCollection.findOne({ key: prefixedKey });
            if (doc) {
              currentData[prefixedKey] = doc.value;
            }
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
        const isMultiLeague = data._version === '2.0' || data.leagues !== undefined;

        if (isMultiLeague) {
          // Multi-league restore: restore all keys as-is
          for (const [key, value] of Object.entries(data)) {
            // Skip internal fields
            if (key.startsWith('_')) continue;

            await gameDataCollection.updateOne(
              { key },
              { $set: { key, value, updatedAt: new Date() } },
              { upsert: true }
            );
          }
        } else {
          // Legacy restore: restore old keys and also copy to league_1_ prefix
          for (const key of LEGACY_BACKUP_KEYS) {
            if (data[key] !== undefined) {
              // Restore to original key (for legacy compatibility)
              await gameDataCollection.updateOne(
                { key },
                { $set: { key, value: data[key], updatedAt: new Date() } },
                { upsert: true }
              );

              // Also restore to league_1_ prefixed key if it's league-specific
              if (LEAGUE_SPECIFIC_KEYS.includes(key)) {
                const prefixedKey = `league_1_${key}`;
                await gameDataCollection.updateOne(
                  { key: prefixedKey },
                  { $set: { key: prefixedKey, value: data[key], updatedAt: new Date() } },
                  { upsert: true }
                );
              }
            }
          }

          // Ensure leagues and memberships exist
          const players = data.players ? JSON.parse(data.players) : [];
          const defaultLeague = { id: 1, name: 'Main League', createdAt: new Date().toISOString(), createdBy: 1, isDefault: true };
          const defaultMemberships = players.map(p => ({ playerId: p.id, leagueId: 1 }));

          await gameDataCollection.updateOne(
            { key: 'leagues' },
            { $set: { key: 'leagues', value: JSON.stringify([defaultLeague]), updatedAt: new Date() } },
            { upsert: true }
          );
          await gameDataCollection.updateOne(
            { key: 'leagueMemberships' },
            { $set: { key: 'leagueMemberships', value: JSON.stringify(defaultMemberships), updatedAt: new Date() } },
            { upsert: true }
          );
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
        // Export all game data as JSON (for manual download) - multi-league aware
        const gameData = {};

        // Export global data
        for (const key of GLOBAL_BACKUP_KEYS) {
          const doc = await gameDataCollection.findOne({ key });
          if (doc) {
            gameData[key] = doc.value;
          }
        }

        // Get all league IDs to export
        const leaguesDoc = await gameDataCollection.findOne({ key: 'leagues' });
        const leagues = leaguesDoc ? JSON.parse(leaguesDoc.value) : [{ id: 1 }];

        // Export league-specific data for all leagues
        for (const league of leagues) {
          for (const baseKey of LEAGUE_SPECIFIC_KEYS) {
            const prefixedKey = `league_${league.id}_${baseKey}`;
            const doc = await gameDataCollection.findOne({ key: prefixedKey });
            if (doc) {
              gameData[prefixedKey] = doc.value;
            }
          }
        }

        // Export any season archive keys
        const archiveDocs = await gameDataCollection.find({ key: /^league_\d+_season_\d+_archive$/ }).toArray();
        for (const doc of archiveDocs) {
          gameData[doc.key] = doc.value;
        }

        // Include metadata
        gameData._exportedAt = new Date().toISOString();
        gameData._version = '2.0';
        gameData._leagueCount = leagues.length;

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
