// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const socketRoutes = require('./routes/socketRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const wheelRoutes = require('./routes/wheelRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make the io instance available to all routes
app.set('socketio', io);
app.set('io', io); // Also set as 'io' for the wheel routes

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB!'))
  .catch((err) => console.error('❌ Database connection error:', err));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/wheel', wheelRoutes); // Wheel selection routes
app.use('/', socketRoutes); // Socket routes for real-time updates

// Welcome Route
app.get('/', (req, res) => {
  res.send('🚀 Auction to Action API is live!');
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Handle team room joining
  socket.on('joinTeam', (teamNumber) => {
    socket.join(`team_${teamNumber}`);
    console.log(`👥 Socket ${socket.id} joined team room: team_${teamNumber}`);
  });

  // Handle team room leaving
  socket.on('leaveTeam', (teamNumber) => {
    socket.leave(`team_${teamNumber}`);
    console.log(`👋 Socket ${socket.id} left team room: team_${teamNumber}`);
  });

  // Handle admin room joining
  socket.on('joinAdmin', () => {
    socket.join('admin');
    console.log(`👑 Socket ${socket.id} joined admin room`);
  });

  // Handle admin room leaving
  socket.on('leaveAdmin', () => {
    socket.leave('admin');
    console.log(`👑 Socket ${socket.id} left admin room`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});