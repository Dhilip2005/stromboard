const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Session = require('./module/user');
const User = require('./module/userModel');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

async function addSampleData() {
  try {
    // Connect to database
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected...\n');

    // Add sample users
    console.log('👥 Creating sample users...');
    const bcrypt = require('bcryptjs');
    
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        provider: 'email'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        provider: 'email'
      }
    ];

    // Clear existing users and insert new ones
    await User.deleteMany({});
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    createdUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    // Add sample sessions
    console.log('\n📋 Creating sample sessions...');
    const sessions = [
      {
        sessionName: 'Team Brainstorming Session',
        drawingData: [
          { type: 'line', x1: 10, y1: 10, x2: 100, y2: 100, color: 'black' },
          { type: 'text', x: 50, y: 50, content: 'Hello World', color: 'blue' }
        ]
      },
      {
        sessionName: 'Project Planning',
        drawingData: [
          { type: 'circle', x: 150, y: 150, radius: 50, color: 'red' }
        ]
      },
      {
        sessionName: 'Design Review',
        drawingData: []
      }
    ];

    // Clear existing sessions and insert new ones
    await Session.deleteMany({});
    const createdSessions = await Session.insertMany(sessions);
    console.log(`✅ Created ${createdSessions.length} sessions`);
    createdSessions.forEach(session => {
      console.log(`   - ${session.sessionName} (${session.drawingData.length} drawing items)`);
    });

    console.log('\n✅ Sample data added successfully!\n');

    // Display the data
    console.log('='.repeat(70));
    console.log('📊 CURRENT DATABASE STATE:');
    console.log('='.repeat(70));
    
    const allUsers = await User.find({}).select('-password');
    console.log(`\n👥 Users (${allUsers.length}):`);
    allUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.name} - ${user.email}`);
    });

    const allSessions = await Session.find({});
    console.log(`\n📋 Sessions (${allSessions.length}):`);
    allSessions.forEach((session, i) => {
      console.log(`   ${i + 1}. ${session.sessionName} (${session.drawingData.length} items)`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('\n💡 You can now view this data in MongoDB Atlas or run view-all-data.js\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.\n');
  }
}

// Run the function
addSampleData();
