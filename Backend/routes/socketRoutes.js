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
    }
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
      }
    }  
    
    if (io) {
      if (targetTeam) {
        // Broadcast to specific team
        io.to(`team_${targetTeam}`).emit('databaseUpdate', updateData);
        
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
