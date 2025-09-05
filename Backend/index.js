require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Team = require('./team.model');
const tradeModule = require('./tradeTransaction'); // we'll update this file to export a function

const app = express();
const server = http.createServer(app);

// allow CORS for dev (restrict in production)
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB!"))
  .catch(err => console.error("❌ Error connecting to MongoDB:", err));

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Client can join a team room: socket.emit('joinTeam','001') from client
  socket.on('joinTeam', (teamNumber) => {
    socket.join(`team-${teamNumber}`);
    console.log(socket.id, 'joined team', teamNumber);
  });

  socket.on('leaveTeam', (teamNumber) => {
    socket.leave(`team-${teamNumber}`);
    console.log(socket.id, 'left team', teamNumber);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

/**
 * Admin update route: updates DB then emits update via sockets
 * Body: { teamNumber, creditChange, debitChange, addItem, removeItem, broadcastScope }
 * broadcastScope: 'team' (only that team room) or 'all' (everyone)
 */
app.post('/admin/updateTeam', async (req, res) => {
  try {
    const { teamNumber, creditChange = 0, debitChange = 0, addItem = null, removeItem = null, broadcastScope = 'all' } = req.body;

    const updateOps = {};
    if (creditChange) updateOps.$inc = { ...(updateOps.$inc || {}), credit: creditChange };
    if (debitChange) updateOps.$inc = { ...(updateOps.$inc || {}), debit: debitChange };
    if (addItem) updateOps.$push = { ...(updateOps.$push || {}), items: addItem };
    if (removeItem) updateOps.$pull = { ...(updateOps.$pull || {}), items: removeItem };

    const result = await Team.updateOne({ teamNumber }, updateOps);

    const updatedTeam = await Team.findOne({ teamNumber }).lean();

    if (updatedTeam) {
      // emit update: either to a room or to all clients
      if (broadcastScope === 'team') {
        io.to(`team-${teamNumber}`).emit('teamUpdated', updatedTeam);
      } else {
        io.emit('teamUpdated', updatedTeam);
      }
    }

    res.json({ success: true, modifiedCount: result.modifiedCount, team: updatedTeam });
  } catch (err) {
    console.error('Error in /admin/updateTeam:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin trade route: uses the trade module (transaction) and emits updates.
 * Body: { teamA, teamB, itemFromA, creditFromB, broadcastScope }
 */
app.post('/admin/trade', async (req, res) => {
  const { teamA, teamB, itemFromA, creditFromB = 0, broadcastScope = 'all' } = req.body;
  try {
    // tradeModule.tradeItems should return the updated teams (see next file)
    const { updatedA, updatedB } = await tradeModule.tradeItems(teamA, teamB, itemFromA, creditFromB);

    // Emit updated team data
    if (broadcastScope === 'team') {
      io.to(`team-${teamA}`).emit('teamUpdated', updatedA);
      io.to(`team-${teamB}`).emit('teamUpdated', updatedB);
    } else {
      io.emit('teamUpdated', updatedA);
      io.emit('teamUpdated', updatedB);
    }

    res.json({ success: true, updatedA, updatedB });
  } catch (err) {
    console.error('Trade failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
setTimeout(() => {
  io.emit("databaseUpdate", { test: "Hello from backend!" });
}, 5000);


