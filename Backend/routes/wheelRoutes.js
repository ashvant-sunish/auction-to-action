const express = require('express');
const router = express.Router();
const WheelSelection = require('../models/WheelSelection');
const { protectAdmin } = require('../middleware/authMiddleware');

// Get latest wheel selection for a round
router.get('/wheel-selection/:round', protectAdmin, async (req, res) => {
  try {
    const { round } = req.params;
    
    
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
    const { round, selection } = req.body;
    if (typeof round !== 'number' || !selection) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input. Round must be a number and selection is required.'
      });
    }

    const newSelection = new WheelSelection({ round, selection });
    await newSelection.save();

    res.json({
      success: true,
      message: 'Random selection recorded successfully',
      data: newSelection
    });
  } catch (error) {
    console.error('Error recording random selection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record random selection',
      error: error.message
    });
  }
});

module.exports = router;
    