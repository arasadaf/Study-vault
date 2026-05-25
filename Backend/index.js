const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
  exposedHeaders: ['x-auth-token']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vault';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/doubts', require('./routes/doubts'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vault API is running' });
});

const RoomState = require('./models/RoomState');


// Socket.io for Real-time Collaboration
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a study room
  socket.on('join_room', async ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);
    
    // Fetch or create room state
    try {
      let roomState = await RoomState.findOne({ roomId });
      if (!roomState) {
        roomState = await RoomState.create({ roomId, participants: [username] });
      } else {
        if (username) {
          await RoomState.findOneAndUpdate(
            { roomId },
            { $addToSet: { participants: username }, $set: { lastActive: Date.now() } }
          );
        }
      }
      // Send current state to the joining user
      socket.emit('load_room_data', {
        notes: roomState.notes,
        whiteboard: roomState.whiteboard,
        chat: roomState.chat
      });
    } catch (err) {
      console.error('Error loading room state:', err);
    }

    // Broadcast to others in the room
    socket.to(roomId).emit('user_joined', { username, id: socket.id });
  });

  // Real-time Chat
  socket.on('send_message', async (data) => {
    try {
      await RoomState.findOneAndUpdate(
        { roomId: data.roomId },
        { $push: { chat: data }, $set: { lastActive: Date.now() } }
      );
    } catch (err) {
      console.error('Error saving chat:', err);
    }
    socket.to(data.roomId).emit('receive_message', data);
  });

  // Shared Whiteboard
  socket.on('draw', async (data) => {
    try {
      await RoomState.findOneAndUpdate(
        { roomId: data.roomId },
        { $push: { whiteboard: data }, $set: { lastActive: Date.now() } }
      );
    } catch (err) {
      console.error('Error saving draw:', err);
    }
    socket.to(data.roomId).emit('receive_draw', data);
  });

  // Shared Notes
  socket.on('update_notes', async (data) => {
    try {
      await RoomState.findOneAndUpdate(
        { roomId: data.roomId },
        { notes: data.content, lastActive: Date.now() }
      );
    } catch (err) {
      console.error('Error saving notes:', err);
    }
    socket.to(data.roomId).emit('receive_notes', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
