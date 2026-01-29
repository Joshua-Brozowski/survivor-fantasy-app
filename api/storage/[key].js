import { MongoClient } from 'mongodb';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  // Enable CORS
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('game_data');

    // Get key from Vercel's dynamic route parameter
    const { key } = req.query;

    if (req.method === 'GET' && key) {
      // Get single key
      const doc = await collection.findOne({ key });
      if (doc) {
        // Add edge caching for rarely-changing data (60s cache, 120s stale-while-revalidate)
        const staticKeys = ['players', 'contestants', 'leagues', 'leagueMemberships'];
        if (staticKeys.includes(key)) {
          res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
        } else {
          // Dynamic data - no caching
          res.setHeader('Cache-Control', 'no-store');
        }
        res.status(200).json({ key: doc.key, value: doc.value });
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    } else if (req.method === 'POST' && key) {
      // Set key
      const { value } = req.body;
      await collection.updateOne(
        { key },
        { $set: { key, value, updatedAt: new Date() } },
        { upsert: true }
      );
      res.status(200).json({ key, value });
    } else if (req.method === 'DELETE' && key) {
      // Delete key
      await collection.deleteOne({ key });
      res.status(200).json({ key, deleted: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
}
