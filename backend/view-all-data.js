const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Session = require('./module/user');
const User = require('./module/userModel');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

async function viewAllCollections() {
  try {
    // Connect to database
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected...\n');
    console.log('Database:', mongoose.connection.name || 'test (default database)');
    console.log('='.repeat(70));

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📊 Found ${collections.length} collection(s):\n`);
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      const data = await collection.find({}).limit(10).toArray();
      
      console.log(`📁 Collection: "${collectionName}"`);
      console.log('='.repeat(70));
      console.log(`   Documents: ${count}`);
      
      if (count > 0) {
        console.log(`   Showing first ${Math.min(count, 10)} document(s):\n`);
        data.forEach((doc, index) => {
          console.log(`   Document ${index + 1}:`);
          console.log('   ' + JSON.stringify(doc, null, 4).replace(/\n/g, '\n   '));
          console.log('   ' + '-'.repeat(66));
        });
      } else {
        console.log('   (Empty collection)');
      }
      console.log('\n');
    }

    // Specific views for Users and Sessions with schema info
    console.log('\n' + '='.repeat(70));
    console.log('📋 SESSIONS COLLECTION (with schema):');
    console.log('='.repeat(70));
    const sessions = await Session.find({});
    
    if (sessions.length === 0) {
      console.log('❌ No sessions found.');
      console.log('\nTo create a session, use your frontend or make a POST request to:');
      console.log('   http://localhost:5000/api/sessions');
      console.log('   Body: { "sessionName": "My Session" }');
    } else {
      console.log(`✅ Found ${sessions.length} session(s):\n`);
      sessions.forEach((session, index) => {
        console.log(`Session ${index + 1}:`);
        console.log(`  ID: ${session._id}`);
        console.log(`  Name: ${session.sessionName}`);
        console.log(`  Created At: ${session.createdAt}`);
        console.log(`  Drawing Data: ${session.drawingData.length} items`);
        console.log('-'.repeat(70));
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('👥 USERS COLLECTION (with schema):');
    console.log('='.repeat(70));
    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('❌ No users found.');
      console.log('\nTo register a user, make a POST request to:');
      console.log('   http://localhost:5000/api/auth/signup');
      console.log('   Body: { "name": "John", "email": "john@example.com", "password": "password123" }');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Provider: ${user.provider}`);
        console.log(`  Photo URL: ${user.photoURL || 'N/A'}`);
        console.log(`  Created: ${user.createdAt}`);
        console.log('-'.repeat(70));
      });
    }

    console.log('\n✅ Database inspection completed!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.\n');
  }
}

// Run the function
viewAllCollections();
