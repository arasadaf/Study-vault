const express = require('express');
const Room = require('../models/Room');
const RoomState = require('../models/RoomState');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vault_secret_key_123';

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username').sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get my recent rooms (created or joined)
router.get('/my-rooms', auth, async (req, res) => {
  try {
    // 1. Find rooms where user is a participant
    const joinedRoomStates = await RoomState.find({ participants: req.user.username })
      .sort({ lastActive: -1 })
      .limit(20);
    
    // 2. Find rooms created by the user
    const createdRooms = await Room.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Merge and get unique room IDs
    const roomIds = new Set();
    joinedRoomStates.forEach(rs => roomIds.add(rs.roomId));
    createdRooms.forEach(r => roomIds.add(r.roomId));

    // 3. Fetch full metadata and state for these rooms
    const result = await Promise.all(Array.from(roomIds).map(async (rid) => {
      const roomMeta = await Room.findOne({ roomId: rid }).populate('createdBy', 'username');
      const roomState = await RoomState.findOne({ roomId: rid });
      
      return {
        roomId: rid,
        name: roomMeta ? roomMeta.name : rid,
        description: roomMeta ? roomMeta.description : '',
        createdBy: roomMeta ? roomMeta.createdBy.username : 'Unknown',
        isCreator: roomMeta ? roomMeta.createdBy._id.toString() === req.user.id : false,
        lastActive: roomState ? roomState.lastActive : (roomMeta ? roomMeta.createdAt : new Date()),
        notes: roomState ? roomState.notes : '',
        hasPassword: roomMeta ? !!roomMeta.password : false,
        participantCount: roomState ? roomState.participants.length : 0
      };
    }));

    // Sort merged results by lastActive
    result.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));

    res.json(result.slice(0, 12));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a room
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, roomId, password } = req.body;
    
    // Check if roomId already exists
    const existingRoom = await Room.findOne({ roomId });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room ID already exists' });
    }

    const newRoom = new Room({
      name,
      description,
      roomId,
      password,
      createdBy: req.user.id
    });
    
    const room = await newRoom.save();
    res.json(room);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Check if room exists and requires password
router.get('/check/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ 
      exists: true, 
      hasPassword: !!room.password,
      name: room.name
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Verify room password
router.post('/verify-password', async (req, res) => {
  try {
    const { roomId, password } = req.body;
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (!room.password) {
      return res.json({ success: true });
    }
    
    const isMatch = await bcrypt.compare(password, room.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
