import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Cron-Secret');
}

// ============================================
// Scoring helpers
// ============================================

function calcPickPoints(scoreData, isInstinct) {
  let pts = 0;
  if (isInstinct && scoreData.survived) pts += 1;
  if (isInstinct && scoreData.madeMerge) pts += 5;
  if (scoreData.immunity) pts += 2;
  if (scoreData.reward) pts += 1;
  if (scoreData.journey) pts += 1;
  if (scoreData.foundIdol) pts += 2;
  if (scoreData.playedIdol) pts += 1;
  if (scoreData.votesReceived) pts += Number(scoreData.votesReceived) || 0;
  if (scoreData.incorrectVote) pts -= 1;
  if (scoreData.votedOutWithIdol) pts -= 2;
  if (scoreData.final5) pts += 10;
  if (scoreData.final3) pts += 15;
  if (scoreData.soleSurvivor) pts += 20;
  return pts;
}

// Fuzzy match a Gemini-returned name against our contestant list
function fuzzyMatchContestant(geminiName, contestants) {
  if (!geminiName) return null;
  const nameLower = geminiName.toLowerCase().trim();

  // Exact match first
  let match = contestants.find(c => c.name.toLowerCase() === nameLower);
  if (match) return match;

  // Partial match: one name is contained in the other
  match = contestants.find(c =>
    c.name.toLowerCase().includes(nameLower) ||
    nameLower.includes(c.name.toLowerCase())
  );
  if (match) return match;

  // First-name match
  const firstName = nameLower.split(' ')[0];
  match = contestants.find(c => c.name.toLowerCase().startsWith(firstName));
  return match || null;
}

// Build the Gemini prompt
function buildScoringPrompt(season, episode, remainingContestants) {
  const contestantList = remainingContestants.join(', ');

  return `You are a Survivor TV show expert helping score a fantasy league. Search the web for detailed information about Survivor Season ${season} Episode ${episode}.

Please search multiple sources including:
- Survivor Wiki (survivor.fandom.com)
- Reddit r/survivor episode discussion threads
- CBS.com episode recaps
- Entertainment Weekly, Vulture, or other entertainment sites with episode recaps
- Fan recap blogs

Cross-reference at least 2-3 sources to ensure accuracy. If sources conflict, use the majority view.

The remaining contestants in this episode are: ${contestantList}

For each contestant, determine the following based on what happened in Episode ${episode}:
- survived: true if they were NOT voted out in this episode, false if they were eliminated
- immunity: true if they won individual immunity challenge this episode
- reward: true if they won a reward challenge this episode
- journey: true if they went on a journey/adventure away from camp this episode
- foundIdol: true if they found a hidden immunity idol or any advantage this episode
- playedIdol: true if they played an idol or advantage at tribal council this episode
- votesReceived: number of votes they received at tribal council but survived (0 if none or if eliminated)
- incorrectVote: true if they voted for someone other than who was eliminated (minority vote, wrong side)
- votedOutWithIdol: true if they were voted out while holding an unplayed hidden immunity idol
- madeMerge: true ONLY if this is the merge episode and they made it to the merge
- eliminated: true if they were voted out in this episode

IMPORTANT: Only set madeMerge=true for contestants in THE specific merge episode. For non-merge episodes, madeMerge must be false for everyone.

Respond with ONLY valid JSON. No markdown, no code blocks, no explanation. The response must start with { and end with }.

Use this exact structure:
{
  "episode": ${episode},
  "season": ${season},
  "confidence": 85,
  "sources": ["source1 URL or name", "source2 URL or name"],
  "summary": "brief 2-3 sentence narrative of what happened in this episode",
  "contestants": {
    "Contestant Name": {
      "survived": true,
      "immunity": false,
      "reward": false,
      "journey": false,
      "foundIdol": false,
      "playedIdol": false,
      "votesReceived": 0,
      "incorrectVote": false,
      "votedOutWithIdol": false,
      "madeMerge": false,
      "eliminated": false
    }
  }
}

Include ALL of these contestants in the response: ${contestantList}

Set confidence (0-100) based on how certain you are about the accuracy of this data. If you cannot find information about this specific episode, set confidence to 0 and explain in the summary field.`;
}

// Parse Gemini response, handling possible markdown wrapping
function parseGeminiResponse(text) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    // Remove opening fence (```json or ```)
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '');
    // Remove closing fence
    cleaned = cleaned.replace(/\s*```\s*$/, '');
  }

  // Find the JSON object boundaries
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No valid JSON object found in Gemini response');
  }

  const jsonStr = cleaned.substring(start, end + 1);
  return JSON.parse(jsonStr);
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

async function appendNotification(collection, leagueId, notification) {
  const notifKey = `league_${leagueId}_notifications`;
  const current = (await readKey(collection, notifKey)) || [];
  await writeKey(collection, notifKey, [...current, notification]);
}

// ============================================
// Core autoscore logic
// ============================================

async function runAutoscore(db, leagueId, episodeNumber, triggeredBy) {
  const gameDataCollection = db.collection('game_data');

  // 1. Read required data
  const contestants = (await readKey(gameDataCollection, 'contestants')) || [];
  const picks = (await readKey(gameDataCollection, `league_${leagueId}_picks`)) || [];
  const pickScores = (await readKey(gameDataCollection, `league_${leagueId}_pickScores`)) || [];
  const episodes = (await readKey(gameDataCollection, `league_${leagueId}_episodes`)) || [];
  const currentSeason = (await readKey(gameDataCollection, `league_${leagueId}_currentSeason`)) || 51;

  // 2. Auto-detect episode number if not provided
  if (!episodeNumber) {
    const maxEpisode = episodes.reduce((max, ep) => Math.max(max, ep.number || 0), 0);
    episodeNumber = maxEpisode + 1;
  }

  // 3. Get remaining (non-eliminated) contestants
  const remainingContestants = contestants.filter(c => !c.eliminated);
  if (remainingContestants.length === 0) {
    throw new Error('No active contestants found');
  }

  // 4. Call Gemini API
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Use gemini-1.5-flash with Google Search grounding
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    tools: [{ googleSearchRetrieval: {} }]
  });

  const prompt = buildScoringPrompt(
    currentSeason,
    episodeNumber,
    remainingContestants.map(c => c.name)
  );

  console.log(`[gemini-episode] Calling Gemini for Season ${currentSeason} Episode ${episodeNumber}...`);
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  console.log(`[gemini-episode] Raw Gemini response (first 500 chars): ${responseText.substring(0, 500)}`);

  // 5. Parse response
  let scoringResult;
  try {
    scoringResult = parseGeminiResponse(responseText);
  } catch (parseError) {
    console.error('[gemini-episode] Failed to parse Gemini response:', parseError.message);
    console.error('[gemini-episode] Raw response:', responseText);
    throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
  }

  const confidence = scoringResult.confidence || 0;
  const sources = scoringResult.sources || [];
  const summary = scoringResult.summary || '';
  const contestantScoresFromGemini = scoringResult.contestants || {};

  // 6. Fan out scores to picks
  const now = new Date().toISOString();
  const newPickScoreEntries = [];
  const eliminatedContestantIds = [];
  const scoringDataByContestantId = {};

  for (const [geminiName, scoreData] of Object.entries(contestantScoresFromGemini)) {
    const contestant = fuzzyMatchContestant(geminiName, contestants);
    if (!contestant) {
      console.warn(`[gemini-episode] Could not match contestant name: "${geminiName}" — skipping`);
      continue;
    }

    // Track eliminated contestants
    if (scoreData.eliminated) {
      eliminatedContestantIds.push(contestant.id);
    }

    scoringDataByContestantId[contestant.id] = scoreData;

    // Find all picks for this contestant
    const contestantPicks = picks.filter(p => p.contestantId === contestant.id);
    for (const pick of contestantPicks) {
      const isInstinct = pick.type === 'instinct';
      const pts = calcPickPoints(scoreData, isInstinct);

      if (pts !== 0) {
        newPickScoreEntries.push({
          id: Date.now() + Math.floor(Math.random() * 10000),
          playerId: pick.playerId,
          contestantId: contestant.id,
          contestantName: contestant.name,
          pickType: pick.type,
          episode: episodeNumber,
          points: pts,
          scoreData: { ...scoreData },
          createdAt: now,
          source: 'gemini-auto'
        });
      }
    }
  }

  // Ensure unique IDs (timestamp + random may collide in tight loop)
  newPickScoreEntries.forEach((entry, i) => {
    entry.id = Date.now() + i;
  });

  const appliedPickScoreIds = newPickScoreEntries.map(e => e.id);

  // 7. Update contestants — mark eliminated ones
  let updatedContestants = contestants;
  if (eliminatedContestantIds.length > 0) {
    updatedContestants = contestants.map(c => {
      if (eliminatedContestantIds.includes(c.id)) {
        return { ...c, eliminated: true, eliminatedEpisode: episodeNumber };
      }
      return c;
    });
    await writeKey(gameDataCollection, 'contestants', updatedContestants);
  }

  // 8. Append new pick scores
  const updatedPickScores = [...pickScores, ...newPickScoreEntries];
  await writeKey(gameDataCollection, `league_${leagueId}_pickScores`, updatedPickScores);

  // 9. Append episode record
  const newEpisode = {
    id: Date.now(),
    number: episodeNumber,
    title: `Episode ${episodeNumber}`,
    summary,
    sources,
    confidence,
    scoredAt: now,
    source: 'gemini-auto'
  };
  const updatedEpisodes = [...episodes, newEpisode];
  await writeKey(gameDataCollection, `league_${leagueId}_episodes`, updatedEpisodes);

  // 10. Store history entry
  const historyKey = `league_${leagueId}_episodeScoringHistory`;
  const history = (await readKey(gameDataCollection, historyKey)) || [];
  const historyEntry = {
    id: Date.now(),
    episodeNumber,
    triggeredBy,
    triggeredAt: now,
    confidence,
    sources,
    summary,
    appliedPickScoreIds,
    eliminatedContestantIds,
    addedEpisodeNumber: episodeNumber,
    scoringData: scoringDataByContestantId,
    reverted: false,
    revertedAt: null
  };
  await writeKey(gameDataCollection, historyKey, [...history, historyEntry]);

  // 11. Send notification
  const notification = {
    id: Date.now() + 1,
    type: 'episode_auto_scored',
    message: `Episode ${episodeNumber} has been auto-scored! (Confidence: ${confidence}%) Check Admin Panel to review or adjust.`,
    targetPlayerId: null,
    createdAt: now,
    readBy: [],
    seenBy: []
  };
  await appendNotification(gameDataCollection, leagueId, notification);

  return {
    success: true,
    episodeNumber,
    scoringResult: {
      summary,
      sources,
      contestantCount: Object.keys(contestantScoresFromGemini).length,
      matchedCount: Object.keys(scoringDataByContestantId).length,
      eliminatedCount: eliminatedContestantIds.length
    },
    appliedScoreIds: appliedPickScoreIds,
    geminiConfidence: confidence,
    historyId: historyEntry.id
  };
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

  // Authentication: accept either cron secret OR admin JWT
  const isCron = req.headers['x-cron-secret'] === process.env.CRON_SECRET && !!process.env.CRON_SECRET;
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
      const triggeredBy = isCron ? 'cron' : 'admin';

      // If leagueId provided, score just that league
      if (leagueId) {
        const result = await runAutoscore(db, leagueId, episodeNumber || null, triggeredBy);
        return res.status(200).json(result);
      }

      // Cron: iterate all leagues
      const leaguesDoc = await gameDataCollection.findOne({ key: 'leagues' });
      const leagues = leaguesDoc ? JSON.parse(leaguesDoc.value) : [];

      if (leagues.length === 0) {
        return res.status(200).json({ success: true, message: 'No leagues found', results: [] });
      }

      const results = [];
      for (const league of leagues) {
        try {
          const result = await runAutoscore(db, league.id, null, triggeredBy);
          results.push({ leagueId: league.id, leagueName: league.name, ...result });
        } catch (leagueError) {
          console.error(`[gemini-episode] Error scoring league ${league.id}:`, leagueError);
          results.push({
            leagueId: league.id,
            leagueName: league.name,
            success: false,
            error: leagueError.message
          });
        }
      }

      return res.status(200).json({ success: true, results });
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

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const scoringSummary = scoringData
        ? `Scoring data: ${JSON.stringify(scoringData)}`
        : 'No detailed scoring data provided.';

      const recapPrompt = `Write a fun, engaging 3-4 sentence recap paragraph for Survivor Season ${currentSeason} Episode ${episodeNumber}.
Use an exciting, casual tone like a sports commentator.
Focus on drama, alliances, and key moments.
${scoringSummary}
Keep it under 100 words.`;

      const result = await model.generateContent(recapPrompt);
      const recap = result.response.text();

      return res.status(200).json({ success: true, recap });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (error) {
    console.error('[gemini-episode] Handler error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
