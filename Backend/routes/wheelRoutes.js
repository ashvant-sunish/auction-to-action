const express = require('express');
const router = express.Router();
const WheelSelection = require('../models/WheelSelection');
const { protectAdmin } = require('../middleware/authMiddleware');

// Get public live wheel selection for a round (for user side reconnect/mount)
router.get('/public/wheel-selection/live/:round', async (req, res) => {
  try {
    const { round } = req.params;
    const latestSelection = await WheelSelection.getLatestSelection(parseInt(round));
    
    res.json({
      success: true,
      latestSelection,
      message: latestSelection ? 'Live selection found' : 'No active selection found'
    });
  } catch (error) {
    console.error(' Error fetching public live wheel selection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live wheel selection',
      error: error.message
    });
  }
});

// Get latest wheel selection for a round
router.get('/wheel-selection/:round', protectAdmin, async (req, res) => {
  try {
    const { round } = req.params;
    
    const latestSelection = await WheelSelection.getLatestSelection(parseInt(round));
    
    res.json({
      success: true,
      latestSelection,
      message: latestSelection ? 'Latest selection found' : 'No active selection found'
    });
  } catch (error) {
    console.error(' Error fetching wheel selection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wheel selection',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get wheel state for a round
router.get('/wheel-state/:round', protectAdmin, async (req, res) => {
  try {
    const { round } = req.params;
    
    const wheelState = await WheelSelection.getWheelState(parseInt(round));
    
    res.json({
      success: true,
      wheelState,
      message: wheelState ? 'Wheel state found' : 'No wheel state found'
    });
  } catch (error) {
    console.error('Error fetching wheel state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wheel state',
      error: error.message
    });
  }
});

// Record random selection event
router.post('/wheel-selection/random', protectAdmin, async (req, res) => {
  try {
    const {
      round,
      itemDetails,
      wheelState,
      sessionId
    } = req.body;

    // Extract admin ID from the user object (check different possible field names)
    const adminId = req.user.id || req.user._id || req.user.adminId || req.user.userId || 'unknown';
    // Deactivate any previous selections for this round
    const updateResult = await WheelSelection.updateMany(
      { round, eventType: 'RANDOM_SELECTED', isLive: true },
      { isLive: false }
    );
    
    const wheelSelection = new WheelSelection({
      round,
      eventType: 'RANDOM_SELECTED',
      itemDetails,
      wheelState,
      adminId,
      sessionId,
      isLive: true
    });

    const savedSelection = await wheelSelection.save();
    // Emit real-time event
    req.app.get('io').emit('wheelRandomSelection', {
      round,
      eventType: 'RANDOM_SELECTED',
      itemDetails,
      wheelState,
      timestamp: savedSelection.timestamp,
      sessionId
    });
    res.status(201).json({
      success: true,
      wheelSelection: savedSelection,
      message: 'Random selection recorded successfully'
    });
  } catch (error) {
    console.error(' Error recording random selection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record random selection',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Trigger a visual reset of the animation on the user side without altering database state
router.post('/wheel-selection/reset-animation', protectAdmin, async (req, res) => {
  try {
    const { round, sessionId } = req.body;
    
    // We only emit the socket event to reset the user-side animation
    req.app.get('io').emit('wheelResetAnimation', {
      round,
      sessionId
    });

    res.json({
      success: true,
      message: 'Animation reset signal sent to user side'
    });
  } catch (error) {
    console.error('Error resetting animation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset animation',
      error: error.message
    });
  }
});

// Record confirmation/removal event
router.post('/wheel-selection/confirm', protectAdmin, async (req, res) => {
  try {
    const {
      round,
      itemDetails,
      wheelState,
      sessionId
    } = req.body;

    // Extract admin ID from the user object
    const adminId = req.user.id || req.user._id || req.user.adminId || req.user.userId || 'unknown';

    // Deactivate the random selection
    await WheelSelection.updateMany(
      { round, eventType: 'RANDOM_SELECTED', isLive: true },
      { isLive: false }
    );

    const wheelSelection = new WheelSelection({
      round,
      eventType: 'CONFIRMED_REMOVED',
      itemDetails,
      wheelState: {
        ...wheelState,
        currentlySelectedItem: null // Clear selection after confirmation
      },
      adminId,
      sessionId,
      isLive: false // Confirmation events are not live
    });

    await wheelSelection.save();

    // Emit real-time event
    req.app.get('io').emit('wheelConfirmation', {
      round,
      eventType: 'CONFIRMED_REMOVED',
      itemDetails,
      wheelState: wheelSelection.wheelState,
      timestamp: wheelSelection.timestamp,
      sessionId
    });

    res.status(201).json({
      success: true,
      wheelSelection,
      message: 'Confirmation recorded successfully'
    });
  } catch (error) {
    console.error('Error recording confirmation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record confirmation',
      error: error.message
    });
  }
});

// Record skip event
router.post('/wheel-selection/skip', protectAdmin, async (req, res) => {
  try {
    const {
      round,
      itemDetails,
      wheelState,
      sessionId
    } = req.body;

    // Extract admin ID from the user object
    const adminId = req.user.id || req.user._id || req.user.adminId || req.user.userId || 'unknown';

    // Deactivate the random selection
    await WheelSelection.updateMany(
      { round, eventType: 'RANDOM_SELECTED', isLive: true },
      { isLive: false }
    );

    const wheelSelection = new WheelSelection({
      round,
      eventType: 'SKIPPED',
      itemDetails,
      wheelState: {
        ...wheelState,
        currentlySelectedItem: null // Clear selection after skip
      },
      adminId,
      sessionId,
      isLive: false // Skip events are not live
    });

    await wheelSelection.save();

    // Emit real-time event
    req.app.get('io').emit('wheelSkip', {
      round,
      eventType: 'SKIPPED',
      itemDetails,
      wheelState: wheelSelection.wheelState,
      timestamp: wheelSelection.timestamp,
      sessionId
    });

    res.status(201).json({
      success: true,
      wheelSelection,
      message: 'Skip recorded successfully'
    });
  } catch (error) {
    console.error('Error recording skip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record skip',
      error: error.message
    });
  }
});

// Get wheel selection history for a round
router.get('/wheel-history/:round', protectAdmin, async (req, res) => {
  try {
    const { round } = req.params;
    const { limit = 50, eventType } = req.query;
    
    const query = { round: parseInt(round) };
    if (eventType) {
      query.eventType = eventType;
    }
    
    const history = await WheelSelection.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      history,
      count: history.length,
      message: 'Wheel history retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching wheel history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wheel history',
      error: error.message
    });
  }
});

module.exports = router;