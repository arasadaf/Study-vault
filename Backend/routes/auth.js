const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { sendVerificationOTP, sendPasswordResetOTP } = require('../utils/emailService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vault_secret_key_123';

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register User
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

    const otp = generateOTP();
    const otpExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours for development

    user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      otp,
      otpExpires
    });
    
    await user.save();

    // Send OTP
    const emailSent = await sendVerificationOTP(email, otp);

    if (!emailSent) {
      return res.status(201).json({ 
        message: `Registration successful. (Dev Mode OTP: ${otp})`,
        devOtp: otp 
      });
    }

    res.status(201).json({ message: 'Registration successful. Please check your email for the OTP.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error', details: err.message || err.toString() });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { username, otp } = req.body;
    console.log(`Verifying OTP for ${username}: provided ${otp}`);
    
    const user = await User.findOne({ username });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });
    
    console.log(`Stored OTP: ${user.otp}, Expires: ${user.otpExpires}`);

    if (user.otp !== otp) {
      console.log('OTP mismatch');
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (user.otpExpires < Date.now()) {
      console.log('OTP expired');
      return res.status(400).json({ message: 'Expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

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
    console.error('Verify OTP Error:', err);
    res.status(500).json({ error: 'Server Error', details: err.message || err.toString() });
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

    if (!user.isVerified) {
      console.log('User not verified');
      return res.status(401).json({ message: 'Please verify your email first', unverified: true });
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
    const topUsers = await User.find({ isVerified: true })
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

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const emailSent = await sendVerificationOTP(user.email, otp);
    if (!emailSent) {
      return res.json({ message: `A new OTP has been generated. (Dev Mode OTP: ${otp})`, devOtp: otp });
    }
    res.json({ message: 'A new OTP has been sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message || err.toString() });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailSent = await sendPasswordResetOTP(email, otp);
    if (!emailSent) {
      return res.json({ message: `Password reset OTP generated. (Dev Mode OTP: ${otp})`, devOtp: otp });
    }
    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message || err.toString() });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.resetPasswordOTP !== otp || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message || err.toString() });
  }
});

module.exports = router;
