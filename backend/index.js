const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Session = require('./module/user');
// auth routes
const authRoutes = require('./route/authRoute');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow requests from our React app
    methods: ['GET', 'POST'],
  },
});

// --- Middleware ---
// Enable CORS for all routes; allow client origin via env or default to permissive for ease of local testing
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
app.use(cors({ origin: CLIENT_ORIGIN, methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json()); // To parse JSON bodies

// --- REST API Routes ---
// Use the session routes for any requests to /api/sessions [cite: 144, 145]
// app.use('/api/sessions', sessionRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Stromboard backend is running!' });
});

// Simple ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount session routes (create/list/get sessions stored in MongoDB)
const sessionRoutes = require('./route/userRoute');
app.use('/api/sessions', sessionRoutes);

// --- WebSocket Logic ---
// Real-time layer using WebSockets
const activeUsers = new Map(); // Track users per session

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // If client passed a JWT in handshake auth, verify and attach user info
  try {
    const token = socket.handshake && socket.handshake.auth && socket.handshake.auth.token;
    if (token) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret');
      socket.user = decoded;
    }
  } catch (err) {
    console.warn('Socket auth token invalid:', err.message);
  }

  // Join a specific whiteboard session room
  socket.on('join-session', ({ sessionId, userName, userAvatar }) => {
    socket.join(sessionId);
    
    // Store user info
    socket.sessionId = sessionId;
    socket.userName = userName;
    socket.userAvatar = userAvatar;
    
    // Add to active users map
    if (!activeUsers.has(sessionId)) {
      activeUsers.set(sessionId, new Map());
    }
    activeUsers.get(sessionId).set(socket.id, {
      id: socket.id,
      name: userName,
      avatar: userAvatar,
      joinedAt: Date.now()
    });
    
    // Broadcast updated user list to all in session
    const sessionUsers = Array.from(activeUsers.get(sessionId).values());
    io.to(sessionId).emit('users-update', sessionUsers);
    
    console.log(`User ${userName} (${socket.id}) joined session ${sessionId}`);
  });

  // Listen for drawing actions and broadcast them
  socket.on('draw-action', (data) => {
    // Add userId to the data before broadcasting
    socket.to(data.sessionId).emit('draw-action', {
      ...data,
      userId: socket.id
    });
  });
  
  // Listen for canvas clear actions
  socket.on('clear-canvas', ({ sessionId }) => {
    socket.to(sessionId).emit('clear-canvas');
  });

  // Handle cursor movement for live cursors
  socket.on('cursor-move', ({ sessionId, x, y, userName }) => {
    socket.to(sessionId).emit('cursor-move', {
      userId: socket.id,
      x,
      y,
      userName
    });
  });

  // Handle text input
  socket.on('add-text', (data) => {
    socket.to(data.sessionId).emit('add-text', {
      ...data,
      userId: socket.id
    });
  });

  // Handle shape drawing
  socket.on('add-shape', (data) => {
    socket.to(data.sessionId).emit('add-shape', data);
  });

  // Handle image upload
  socket.on('add-image', (data) => {
    socket.to(data.sessionId).emit('add-image', data);
  });

  // Handle undo/redo actions
  socket.on('undo-action', ({ sessionId }) => {
    socket.to(sessionId).emit('undo-action', {
      userId: socket.id
    });
  });

  socket.on('redo-action', ({ sessionId }) => {
    socket.to(sessionId).emit('redo-action', {
      userId: socket.id
    });
  });

  // Handle saving the whiteboard state to the database for persistence
  socket.on('save-canvas-state', async ({ sessionId, drawingData }) => {
    try {
      await Session.findByIdAndUpdate(sessionId, { drawingData });
      console.log(`Canvas state saved for session ${sessionId}`);
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from active users
    if (socket.sessionId && activeUsers.has(socket.sessionId)) {
      const sessionUsers = activeUsers.get(socket.sessionId);
      sessionUsers.delete(socket.id);
      
      // Broadcast updated user list
      const updatedUsers = Array.from(sessionUsers.values());
      io.to(socket.sessionId).emit('users-update', updatedUsers);
      
      // Clean up empty sessions
      if (sessionUsers.size === 0) {
        activeUsers.delete(socket.sessionId);
      }
    }
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
// Bind to 0.0.0.0 to ensure server is reachable from localhost/other network interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} and bound to 0.0.0.0`);
});