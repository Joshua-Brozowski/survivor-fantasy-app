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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
