import { MongoClient } from 'mongodb';
import { GoogleGenAI } from '@google/genai';
import { requireAuth } from './lib/auth-middleware.js';

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

  const client = new MongoClient(uri, { maxPoolSize: 1 });
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ============================================
// MongoDB helpers
// ============================================

async function readKey(collection, key) {
  const doc = await collection.findOne({ key });
  if (!doc) return null;
  try {
    return JSON.parse(doc.value);
  } catch {
    return doc.value;
  }
}

async function writeKey(collection, key, value) {
  await collection.updateOne(
    { key },
    { $set: { key, value: JSON.stringify(value), updatedAt: new Date() } },
    { upsert: true }
  );
}

// ============================================
// Main handler
// ============================================

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // -----------------------------------------------
  // suggestQotw — no auth required, GET only
  // -----------------------------------------------
  if (req.method === 'GET' && req.query.action === 'suggestQotw') {
    const episodeNum = parseInt(req.query.episode) || '?';
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ suggestion: '' });
    }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `For Survivor Season 51, Episode ${episodeNum}, suggest ONE interesting "Question of the Week" for a fantasy league. This is an open-ended short-answer question players answer before watching the episode — about predictions, strategy, alliances, or player dynamics. Make it specific, fun, and thought-provoking. Return ONLY the question text (one sentence, ending in a question mark), nothing else.`;
      const result = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });
      return res.status(200).json({ suggestion: (result.text || '').trim() });
    } catch (e) {
      console.error('[gemini-episode] suggestQotw error:', e.message);
      return res.status(200).json({ suggestion: '' });
    }
  }

  // GET = Vercel cron trigger (no auth needed — endpoint is internal, not sensitive)
  // POST = admin manual trigger (requires JWT auth)
  const isCron = req.method === 'GET';
  let user = null;
  if (!isCron) {
    user = requireAuth(req, res);
    if (!user) return; // Response already sent as 401
  }

  try {
    const { db } = await connectToDatabase();
    const gameDataCollection = db.collection('game_data');

    // Determine action and params (support both GET and POST)
    let action, leagueId, episodeNumber, historyId, scoringData;

    if (req.method === 'GET') {
      action = req.query.action || 'autoscore';
      leagueId = req.query.leagueId ? parseInt(req.query.leagueId) : null;
      episodeNumber = req.query.episodeNumber ? parseInt(req.query.episodeNumber) : null;
    } else {
      // POST
      ({ action, leagueId, episodeNumber, historyId, scoringData } = req.body || {});
      if (leagueId) leagueId = parseInt(leagueId);
      if (episodeNumber) episodeNumber = parseInt(episodeNumber);
    }

    // -----------------------------------------------
    // CRON / autoscore
    // -----------------------------------------------
    if (!action || action === 'autoscore') {
      // Disabled Oct 2026 — unreliable without web search grounding (removed for timeouts).
      // Cron trigger removed from vercel.json; this guard blocks any stray/manual invocation too.
      return res.status(410).json({ error: 'AI Autoscore has been disabled. Score episodes manually via Episode Scoring.' });
    }

    // -----------------------------------------------
    // getHistory
    // -----------------------------------------------
    if (action === 'getHistory') {
      if (!leagueId) {
        return res.status(400).json({ error: 'leagueId is required' });
      }
      const historyKey = `league_${leagueId}_episodeScoringHistory`;
      const history = (await readKey(gameDataCollection, historyKey)) || [];
      return res.status(200).json({ success: true, history });
    }

    // -----------------------------------------------
    // revert — admin only
    // -----------------------------------------------
    if (action === 'revert') {
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      if (!leagueId || !historyId) {
        return res.status(400).json({ error: 'leagueId and historyId are required' });
      }

      const historyKey = `league_${leagueId}_episodeScoringHistory`;
      const history = (await readKey(gameDataCollection, historyKey)) || [];
      const entryIndex = history.findIndex(h => h.id === historyId);

      if (entryIndex === -1) {
        return res.status(404).json({ error: 'History entry not found' });
      }
      const entry = history[entryIndex];
      if (entry.reverted) {
        return res.status(400).json({ error: 'This scoring entry has already been reverted' });
      }

      // Remove applied pick scores
      const pickScores = (await readKey(gameDataCollection, `league_${leagueId}_pickScores`)) || [];
      const filteredPickScores = pickScores.filter(ps => !entry.appliedPickScoreIds.includes(ps.id));
      await writeKey(gameDataCollection, `league_${leagueId}_pickScores`, filteredPickScores);

      // Un-eliminate contestants
      if (entry.eliminatedContestantIds && entry.eliminatedContestantIds.length > 0) {
        const contestants = (await readKey(gameDataCollection, 'contestants')) || [];
        const restoredContestants = contestants.map(c => {
          if (entry.eliminatedContestantIds.includes(c.id)) {
            const restored = { ...c, eliminated: false };
            delete restored.eliminatedEpisode;
            return restored;
          }
          return c;
        });
        await writeKey(gameDataCollection, 'contestants', restoredContestants);
      }

      // Remove episode record
      const episodes = (await readKey(gameDataCollection, `league_${leagueId}_episodes`)) || [];
      const filteredEpisodes = episodes.filter(ep => ep.number !== entry.addedEpisodeNumber || ep.source !== 'gemini-auto');
      await writeKey(gameDataCollection, `league_${leagueId}_episodes`, filteredEpisodes);

      // Mark history entry as reverted
      history[entryIndex] = { ...entry, reverted: true, revertedAt: new Date().toISOString() };
      await writeKey(gameDataCollection, historyKey, history);

      return res.status(200).json({
        success: true,
        message: `Episode ${entry.episodeNumber} scoring has been reverted`,
        removedPickScoreCount: pickScores.length - filteredPickScores.length,
        restoredContestantCount: entry.eliminatedContestantIds?.length || 0
      });
    }

    // -----------------------------------------------
    // generateRecap — admin only
    // -----------------------------------------------
    if (action === 'generateRecap') {
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      if (!leagueId || !episodeNumber) {
        return res.status(400).json({ error: 'leagueId and episodeNumber are required' });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
      }

      const currentSeason = (await readKey(gameDataCollection, `league_${leagueId}_currentSeason`)) || 51;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const scoringSummary = scoringData
        ? `Scoring data: ${JSON.stringify(scoringData)}`
        : 'No detailed scoring data provided.';

      const recapPrompt = `Write a fun, engaging 3-4 sentence recap paragraph for Survivor Season ${currentSeason} Episode ${episodeNumber}.
Use an exciting, casual tone like a sports commentator.
Focus on drama, alliances, and key moments.
${scoringSummary}
Keep it under 100 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: recapPrompt
      });
      const recap = response.text;

      return res.status(200).json({ success: true, recap });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (error) {
    console.error('[gemini-episode] Handler error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
