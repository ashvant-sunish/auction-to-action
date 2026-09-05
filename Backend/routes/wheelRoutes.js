const express = require('express');
const router = express.Router();
const WheelSelection = require('../models/WheelSelection');
const { protectAdmin } = require('../middleware/authMiddleware');

// Get latest wheel selection for a round
router.get('/wheel-selection/:round', protectAdmin, async (req, res) => {
  try {
    const { round } = req.params;
    
    console.log('🎯 Fetching wheel selection for round:', round);
    
    const latestSelection = await WheelSelection.getLatestSelection(parseInt(round));
    
    console.log('📡 Latest selection found:', latestSelection ? latestSelection._id : 'None');
    
    res.json({
      success: true,
      latestSelection,
      message: latestSelection ? 'Latest selection found' : 'No active selection found'
    });
  } catch (error) {
    console.error('❌ Error fetching wheel selection:', error);
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
    console.log('🎯 Received random selection request:', req.body);
    console.log('👤 Admin user object:', req.user);
    
    const {
      round,
      itemDetails,
      wheelState,
      sessionId
    } = req.body;

    console.log('📝 Processing for round:', round);
    
    // Extract admin ID from the user object (check different possible field names)
    const adminId = req.user.id || req.user._id || req.user.adminId || req.user.userId || 'unknown';
    console.log('� Admin ID extracted:', adminId);

    // Deactivate any previous selections for this round
    const updateResult = await WheelSelection.updateMany(
      { round, eventType: 'RANDOM_SELECTED', isLive: true },
      { isLive: false }
    );
    
    console.log('🔄 Updated previous selections:', updateResult.modifiedCount);

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
    console.log('💾 Saved selection:', savedSelection._id);

    // Emit real-time event
    req.app.get('io').emit('wheelRandomSelection', {
      round,
      eventType: 'RANDOM_SELECTED',
      itemDetails,
      wheelState,
      timestamp: savedSelection.timestamp,
      sessionId
    });

    console.log('📡 Emitted real-time event');

    res.status(201).json({
      success: true,
      wheelSelection: savedSelection,
      message: 'Random selection recorded successfully'
    });
  } catch (error) {
    console.error('❌ Error recording random selection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record random selection',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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