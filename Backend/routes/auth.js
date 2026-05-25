const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');



const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vault_secret_key_123';

// OTP helpers removed (verification flow disabled for demo/dev).



// Register User (verification disabled)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).json({ message: 'User with this username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
    });


    await user.save();

    // Create token for immediate login
    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        xp: user.xp,
        level: user.level,
        tier: user.tier,
        badges: user.badges,
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Server Error', details: err.message || err.toString() });
  }
});






// Login User
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for ${username}`);
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create token
    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username,
        xp: user.xp,
        level: user.level,
        tier: user.tier,
        badges: user.badges
      } 
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message || err.toString() });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Get Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select('username xp level')

      .sort({ xp: -1 })
      .limit(10);
    
    const usersWithTier = topUsers.map(u => {
      const userObj = u.toObject();
      // Tier calculation (replicated from model virtual logic since it's a plain object)
      let tier = 'Bronze';
      if (userObj.level >= 51) tier = 'Diamond';
      else if (userObj.level >= 31) tier = 'Platinum';
      else if (userObj.level >= 16) tier = 'Gold';
      else if (userObj.level >= 6) tier = 'Silver';
      userObj.tier = tier;
      return userObj;
    });

    res.json(usersWithTier);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', details: err.message || err.toString() });
  }
});




// Reset Password (OTP flow disabled)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server Error', details: err.message || err.toString() });
  }
});


module.exports = router;
