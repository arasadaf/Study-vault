const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vault';

async function checkUserEmail() {
  try {
    await mongoose.connect(MONGO_URI);
    // Let's find the most recent users
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    console.log('Recent Users:');
    users.forEach(u => {
      console.log(`Username: ${u.username}, Email: ${u.email}, Verified: ${u.isVerified}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserEmail();
