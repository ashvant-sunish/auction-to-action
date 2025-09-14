const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const MysteryBoxReveal = require('../models/MysteryBoxReveal');

// Mock mystery box data (you can replace this with a database model later)
const mockMysteryBoxes = [
  { boxId: 1, content: "Gain 2× your bid amount", itemType: "cash", itemName: "Double Cash" },
  { boxId: 2, content: "Gain 2× your bid amount", itemType: "cash", itemName: "Double Cash" },
  { boxId: 3, content: "Gain 1.5× your bid amount", itemType: "cash", itemName: "1.5x Cash" },
  { boxId: 4, content: "Gain 1.5× your bid amount", itemType: "cash", itemName: "1.5x Cash" },
  { boxId: 5, content: "Nothing", itemType: "nothing", itemName: "Empty" },
  { boxId: 6, content: "Nothing", itemType: "nothing", itemName: "Empty" },
  { boxId: 7, content: "Nothing", itemType: "nothing", itemName: "Empty" },
  { boxId: 8, content: "Nothing", itemType: "nothing", itemName: "Empty" },
  { boxId: 9, content: "Nothing", itemType: "nothing", itemName: "Empty" },
  { boxId: 10, content: "Nothing", itemType: "nothing", itemName: "Empty" },
  { boxId: 11, content: "Nothing", itemType: "nothing", itemName: "Empty" },
  { boxId: 12, content: "Nothing", itemType: "nothing", itemName: "Empty" },
  { boxId: 13, content: "Nothing", itemType: "nothing", itemName: "Empty" },
  { boxId: 14, content: "Gain 6 Technology, 2 Utilities", itemType: "resources", itemName: "Tech Bundle" },
  { boxId: 15, content: "Gain 6 Transportation, 2 Office Space", itemType: "resources", itemName: "Transport Bundle" },
  { boxId: 16, content: "Gain 3 Property, 3 Machinery & Tools, 2 Electricity Supply", itemType: "resources", itemName: "Property Bundle" },
  { boxId: 17, content: "Gain 5 Skilled Labour, 1 Technology, 2 Construction Material", itemType: "resources", itemName: "Labor Bundle" },
  { boxId: 18, content: "Gain 3 Technology, 3 Machinery & Tools, 2 Utilities", itemType: "resources", itemName: "Industrial Bundle" },
  { boxId: 19, content: "Gain 6 Utilities, 2 Property", itemType: "resources", itemName: "Utility Bundle" },
  { boxId: 20, content: "Gain 4 Electricity Supply, 3 Technology, 1 Skilled Labour", itemType: "resources", itemName: "Energy Bundle" },
  { boxId: 21, content: "Say phrase 5 times to get 2× bid amount", itemType: "challenge", itemName: "Cash Challenge" },
  { boxId: 22, content: "Say phrase 5 times to get 5 Property, 3 Skilled Labour", itemType: "challenge", itemName: "Property Challenge" },
  { boxId: 23, content: "Say phrase 5 times to get 4 Machinery & Tools, 4 Technology", itemType: "challenge", itemName: "Tech Challenge" },
  { boxId: 24, content: "Say phrase 5 times to get 1.5× bid amount", itemType: "challenge", itemName: "Bonus Challenge" },
  { boxId: 25, content: "Say phrase 5 times to get 5 Electricity Supply, 3 Machinery & Tools", itemType: "challenge", itemName: "Energy Challenge" },
];

// Get all mystery boxes
router.get('/', protectAdmin, (req, res) => {
  try {
    res.status(200).json(mockMysteryBoxes);
  } catch (error) {
    console.error('Error fetching mystery boxes:', error);
    res.status(500).json({ message: 'Error fetching mystery boxes' });
  }
});

// Get admin info for role verification
router.get('/admin-info', protectAdmin, (req, res) => {
  try {
    // Use the user info from the protectAdmin middleware
    const adminInfo = {
      role: req.user.role,
      userId: req.user.userId,
      canReveal: req.user.role === 'superadmin'
    };
    res.status(200).json(adminInfo);
  } catch (error) {
    console.error('Error fetching admin info:', error);
    res.status(500).json({ message: 'Error fetching admin info' });
  }
});

// Get revealed box count and latest revealed box
router.get('/revealed-count', async (req, res) => {
  try {
    const round = parseInt(req.query.round) || 2;
    
    // Get total revealed count
    const revealedCount = await MysteryBoxReveal.getRevealedCount(round);
    
    // Get latest revealed box
    const latestReveal = await MysteryBoxReveal.getLatestRevealedBox(round);
    const currentRevealedBox = latestReveal ? latestReveal.boxId : 0;
    
    console.log('Mystery box reveal data:', {
      revealedCount,
      currentRevealedBox,
      latestReveal: latestReveal?._id
    });
    
    res.json({ 
      revealedCount,
      totalBoxes: mockMysteryBoxes.length,
      currentRevealedBox
    });
  } catch (error) {
    console.error('Error getting revealed count:', error);
    res.status(500).json({ message: 'Error getting revealed count', error: error.message });
  }
});

// Reveal a mystery box
router.post('/reveal/:boxId', protectAdmin, async (req, res) => {
  try {
    const boxId = parseInt(req.params.boxId);
    const box = mockMysteryBoxes.find(b => b.boxId === boxId);
    
    if (!box) {
      return res.status(404).json({ message: 'Mystery box not found' });
    }

    // Check if box is already revealed
    const existingReveal = await MysteryBoxReveal.findOne({ 
      boxId, 
      round: 2, 
      isActive: true 
    });
    
    if (existingReveal) {
      return res.status(400).json({ message: 'Box already revealed' });
    }

    // Save reveal to database
    const mysteryBoxReveal = new MysteryBoxReveal({
      round: 2,
      boxId: box.boxId,
      itemName: box.itemName,
      content: box.content,
      itemType: box.itemType,
      revealedBy: req.user.role,
      revealedAt: new Date()
    });

    await mysteryBoxReveal.save();

    console.log('Box revealed and saved to database:', mysteryBoxReveal);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('mysteryBoxRevealed', {
        boxId: box.boxId,
        itemName: box.itemName || 'Mystery Item',
        content: box.content || 'Mystery Content',
        itemType: box.itemType || 'mystery',
        description: box.content || 'Mystery Description',
        revealedBy: req.user.role,
        revealedAt: new Date()
      });
    }

    res.status(200).json({ 
      message: 'Mystery box revealed successfully',
      box: box,
      revealId: mysteryBoxReveal._id
    });
  } catch (error) {
    console.error('Error revealing mystery box:', error);
    res.status(500).json({ message: 'Error revealing mystery box' });
  }
});

// Undo last action
router.post('/undo', protectAdmin, async (req, res) => {
  try {
    // Get the latest revealed box and mark it as inactive
    const latestReveal = await MysteryBoxReveal.getLatestRevealedBox(2);
    
    if (!latestReveal) {
      return res.status(400).json({ message: 'No revealed boxes to undo' });
    }

    // Mark as inactive instead of deleting
    latestReveal.isActive = false;
    await latestReveal.save();

    console.log('Undid reveal for box:', latestReveal.boxId);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('mysteryBoxUndo', {
        boxId: latestReveal.boxId,
        message: 'Last action undone',
        undoneAt: new Date()
      });
    }

    res.status(200).json({ 
      message: 'Last action undone successfully',
      undonBoxId: latestReveal.boxId
    });
  } catch (error) {
    console.error('Error undoing action:', error);
    res.status(500).json({ message: 'Error undoing action' });
  }
});

// Reset all mystery boxes
router.post('/reset', protectAdmin, async (req, res) => {
  try {
    // Mark all revealed boxes as inactive
    const result = await MysteryBoxReveal.updateMany(
      { round: 2, isActive: true },
      { isActive: false }
    );

    console.log('Reset all mystery boxes, marked inactive:', result.modifiedCount);
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('mysteryBoxReset');
    }

    res.status(200).json({ 
      message: 'All mystery boxes reset successfully',
      resetCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error resetting mystery boxes:', error);
    res.status(500).json({ message: 'Error resetting mystery boxes' });
  }
});

// Get all revealed boxes for admin interface
router.get('/revealed', protectAdmin, async (req, res) => {
  try {
    const round = parseInt(req.query.round) || 2;
    const revealedBoxes = await MysteryBoxReveal.getAllRevealedBoxes(round);
    
    res.status(200).json(revealedBoxes);
  } catch (error) {
    console.error('Error fetching revealed boxes:', error);
    res.status(500).json({ message: 'Error fetching revealed boxes' });
  }
});

module.exports = router;