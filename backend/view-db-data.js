const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Session = require('./module/user');
const User = require('./module/userModel');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

async function viewDatabaseData() {
  try {
    // Connect to database
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected...\n');
    console.log('Connected to:', mongoose.connection.name || 'test (default database)');
    console.log('='.repeat(60));

    // Get all sessions
    console.log('\n📋 SESSIONS COLLECTION:');
    console.log('='.repeat(60));
    const sessions = await Session.find({});
    
    if (sessions.length === 0) {
      console.log('No sessions found in the database.');
    } else {
      console.log(`Found ${sessions.length} session(s):\n`);
      sessions.forEach((session, index) => {
        console.log(`Session ${index + 1}:`);
        console.log(`  ID: ${session._id}`);
        console.log(`  Name: ${session.sessionName}`);
        console.log(`  Created At: ${session.createdAt}`);
        console.log(`  Drawing Data Length: ${session.drawingData.length} items`);
        console.log('-'.repeat(60));
      });
    }

    // Get all users
    console.log('\n👥 USERS COLLECTION:');
    console.log('='.repeat(60));
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Provider: ${user.provider}`);
        console.log(`  Photo URL: ${user.photoURL || 'N/A'}`);
        console.log(`  Created At: ${user.createdAt}`);
        console.log(`  Updated At: ${user.updatedAt}`);
        console.log('-'.repeat(60));
      });
    }

    console.log('\n✅ Database query completed!\n');
    
    // Get collection stats
    console.log('📊 COLLECTION STATISTICS:');
    console.log('='.repeat(60));
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed.');
  }
}

// Run the function
viewDatabaseData();
