// server.js

//MONGO-DB OVER DEFAULT DNS
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['1.1.1.1', '8.8.8.8']);
//FIXED for now

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
const Team = require('./models/Team');

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
  
  if (req.body && Object.keys(req.body).length > 0) {
    
  }
  next();
});

// Make the io instance available to all routes
app.set('socketio', io);
app.set('io', io); // Also set as 'io' for the wheel routes

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    
  })
  .catch((err) => console.error('❌ Database connection error:', err));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/wheel', wheelRoutes); // Wheel selection routes
app.use('/api/mysterybox', mysteryBoxRoutes); // Mystery box routes
app.use('/api/construction', constructionRoutes); // Construction routes
app.use('/', socketRoutes); // Socket routes for real-time updates

// Welcome Route
app.get('/', (req, res) => {
  res.send('🚀 Auction to Action API is live!');
});

// Maps socket.id → teamCode so we can clear the session when a socket disconnects
const socketTeamMap = new Map();
  

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Handle team room joining — also tracks which team owns this socket
  socket.on('joinTeam', (teamCode) => {
    socket.join(`team_${teamCode}`);
    socketTeamMap.set(socket.id, teamCode);
    
  });
  

  // Handle team room leaving
  socket.on('leaveTeam', (teamCode) => {
    socket.leave(`team_${teamCode}`);
    socketTeamMap.delete(socket.id);
    
  });

  // Handle admin room joining
  socket.on('joinAdmin', () => {
    socket.join('admin');
    
  });

  // Handle admin room leaving
  socket.on('leaveAdmin', () => {
    socket.leave('admin');
    
  });

  socket.on('disconnect', async () => {
    const teamCode = socketTeamMap.get(socket.id);
    socketTeamMap.delete(socket.id);
    

    // If this socket was associated with a team, wait a short moment to see if they reconnect (e.g. page refresh).
    // If they don't reconnect within 5 seconds, assume the tab was permanently closed and log them out immediately.
    if (teamCode) {
      setTimeout(async () => {
        // Check if there are any active sockets remaining for this team
        const activeSockets = Array.from(socketTeamMap.values()).filter(code => code === teamCode);
        
        if (activeSockets.length === 0) {
          try {
            await Team.findOneAndUpdate(
              { teamCode },
              { isActive: false, sessionExpiry: null }
            );
           
          } catch (err) {
            console.error(`❌ Failed to clear session for team ${teamCode}:`, err.message);
          }
        } else {
          
        }
      }, 5000);
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  
});
  socket.on('leaveTeam', (teamNumber) => {
    socket.leave(`team_${teamNumber}`);
    