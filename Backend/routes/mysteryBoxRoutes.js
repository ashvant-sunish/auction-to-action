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
    
    
    
    res.status(200).json(revealedBoxes);
  } catch (error) {
    console.error('Error fetching revealed boxes:', error);
    res.status(500).json({ message: 'Error fetching revealed boxes' });
  }
});

module.exports = router;