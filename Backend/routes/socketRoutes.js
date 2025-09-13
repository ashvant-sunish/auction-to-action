const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const GameState = require('../models/GameState');

/**
 * Update round with real-time broadcasting
 * POST /admin/updateRound
 */
router.post('/admin/updateRound', protectAdmin, async (req, res) => {
  try {
    const { roundNumber, roundStatus, timestamp } = req.body;
    
    // Validate input
    if (typeof roundNumber !== 'number' || !roundStatus) {
      return res.status(400).json({
        success: false,
        message: 'Invalid round data. roundNumber must be a number and roundStatus is required.'
      });
    }

    // Get or create game state document
    let gameState = await GameState.findOne({ singleton: 'main' });
    if (!gameState) {
      gameState = new GameState({ singleton: 'main' });
    }

    // Update game state in database
    gameState.currentRound = roundNumber;
    gameState.isAuctionLive = roundStatus === 'ongoing';
    await gameState.save();

    // Create current round state for broadcasting
    const currentRoundState = {
      roundNumber,
      roundStatus,
      timestamp: timestamp || new Date().toISOString()
    };

    // Get Socket.IO instance from app
    const io = req.app.get('socketio');
    
    if (io) {
      // Broadcast round update to all connected clients
      io.emit('roundUpdated', currentRoundState);
      console.log('📡 Round update broadcasted:', currentRoundState);
    }

    res.json({
      success: true,
      message: 'Round updated and broadcasted successfully',
      roundData: currentRoundState
    });
  } catch (error) {
    console.error('Error updating round:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating round',
      error: error.message
    });
  }
});

/**
 * Get current round state
 * GET /api/round/current
 */
router.get('/api/round/current', async (req, res) => {
  try {
    // Get game state from database
    const gameState = await GameState.findOne({ singleton: 'main' });
    
    let currentRoundState;
    if (gameState) {
      currentRoundState = {
        roundNumber: gameState.currentRound,
        roundStatus: gameState.isAuctionLive ? 'ongoing' : 'ended',
        timestamp: gameState.updatedAt || new Date().toISOString()
      };
    } else {
      // Default state if no game state exists
      currentRoundState = {
        roundNumber: 0,
        roundStatus: 'not_started',
        timestamp: new Date().toISOString()
      };
    }

    res.json({
      success: true,
      roundData: currentRoundState
    });
  } catch (error) {
    console.error('Error fetching current round:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching round state',
      error: error.message
    });
  }
});

/**
 * Update team data with real-time broadcasting
 * POST /admin/updateTeam
 */
router.post('/admin/updateTeam', protectAdmin, (req, res) => {
  try {
    const { 
      teamNumber, 
      creditChange, 
      debitChange, 
      addItem, 
      removeItem, 
      broadcastScope 
    } = req.body;

    if (!teamNumber) {
      return res.status(400).json({
        success: false,
        message: 'Team number is required'
      });
    }

    // Create update data object
    const updateData = {
      teamNumber,
      creditChange: creditChange || 0,
      debitChange: debitChange || 0,
      addItem,
      removeItem,
      timestamp: new Date().toISOString()
    };

    // Get Socket.IO instance
    const io = req.app.get('socketio');
    
    if (io) {
      if (broadcastScope === 'team') {
        // Broadcast only to specific team room
        io.to(`team_${teamNumber}`).emit('teamUpdated', updateData);
        console.log(`📡 Team update sent to team ${teamNumber}:`, updateData);
      } else {
        // Broadcast to all clients
        io.emit('teamUpdated', updateData);
        console.log('📡 Team update broadcasted to all clients:', updateData);
      }
    }

    res.json({
      success: true,
      message: 'Team update broadcasted successfully',
      updateData
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating team',
      error: error.message
    });
  }
});

/**
 * Execute trade with real-time broadcasting
 * POST /admin/trade
 */
router.post('/admin/trade', protectAdmin, (req, res) => {
  try {
    const { 
      teamA, 
      teamB, 
      itemFromA, 
      creditFromB, 
      broadcastScope 
    } = req.body;

    if (!teamA || !teamB) {
      return res.status(400).json({
        success: false,
        message: 'Both team identifiers are required'
      });
    }

    // Create trade data object
    const tradeData = {
      teamA,
      teamB,
      itemFromA,
      creditFromB: creditFromB || 0,
      timestamp: new Date().toISOString()
    };

    // Get Socket.IO instance
    const io = req.app.get('socketio');
    
    if (io) {
      if (broadcastScope === 'team') {
        // Broadcast to both teams involved
        io.to(`team_${teamA}`).emit('tradeExecuted', tradeData);
        io.to(`team_${teamB}`).emit('tradeExecuted', tradeData);
        console.log(`📡 Trade update sent to teams ${teamA} and ${teamB}:`, tradeData);
      } else {
        // Broadcast to all clients
        io.emit('tradeExecuted', tradeData);
        console.log('📡 Trade update broadcasted to all clients:', tradeData);
      }
    }

    res.json({
      success: true,
      message: 'Trade executed and broadcasted successfully',
      tradeData
    });
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({
      success: false,
      message: 'Server error executing trade',
      error: error.message
    });
  }
});

/**
 * General database update broadcast
 * POST /admin/broadcastUpdate
 */
router.post('/admin/broadcastUpdate', protectAdmin, (req, res) => {
  try {
    const { type, data, targetTeam } = req.body;

    const updateData = {
      type: type || 'general',
      data: data || {},
      timestamp: new Date().toISOString()
    };

    // Get Socket.IO instance
    const io = req.app.get('socketio');
    
    if (io) {
      if (targetTeam) {
        // Broadcast to specific team
        io.to(`team_${targetTeam}`).emit('databaseUpdate', updateData);
        console.log(`📡 Database update sent to team ${targetTeam}:`, updateData);
      } else {
        // Broadcast to all clients
        io.emit('databaseUpdate', updateData);
        console.log('📡 Database update broadcasted to all clients:', updateData);
      }
    }

    res.json({
      success: true,
      message: 'Database update broadcasted successfully',
      updateData
    });
  } catch (error) {
    console.error('Error broadcasting update:', error);
    res.status(500).json({
      success: false,
      message: 'Server error broadcasting update',
      error: error.message
    });
  }
});

module.exports = router;
