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
const mysteryBoxRoutes = require('./routes/mysteryBoxRoutes');
const constructionRoutes = require('./routes/constructionRoutes');

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

// Add request logging middleware
app.use((req, res, next) => {
  

// Socket.io Connection Logic
io.on('connection', (socket) => {
  

  // Handle team room leaving
  socket.on('leaveTeam', (teamNumber) => {
    socket.leave(`team_${teamNumber}`);
    