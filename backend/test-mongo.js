/**
 * Quick test script to verify Mongoose can connect to your Atlas cluster
 * Loads .env and attempts to list collections in the configured database.
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: undefined, maxPoolSize: 5 });
    console.log('Connected to MongoDB via MONGO_URI');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    // Optionally print a sample from 'sessions' if it exists
    if (collections.some(c => c.name === 'sessions')) {
      const docs = await db.collection('sessions').find().limit(5).toArray();
      console.log('Sample sessions documents (up to 5):', docs);
    }

    await mongoose.disconnect();
    console.log('Disconnected. Test complete.');
  } catch (err) {
    console.error('MongoDB connection or query error:', err);
    process.exit(1);
  }
}

run();
