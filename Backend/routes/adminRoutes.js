const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { protectAdmin } = require('../middleware/authMiddleware');

// --- Auth Routes ---
// The logic is now correctly handled by authController
router.post('/register', authController.registerAdmin);
router.post('/login', authController.loginAdmin);


// --- Admin User Management (for other admins) ---
router.get('/admins', protectAdmin, adminController.getAllAdmins);
router.post('/admins', protectAdmin, adminController.addAdmin);
router.put('/admins/:id', protectAdmin, adminController.updateAdmin);
router.delete('/admins/:id', protectAdmin, adminController.deleteAdmin);

// --- Team Management ---
router.get('/teams', protectAdmin, adminController.getAllTeams);
router.post('/teams', protectAdmin, adminController.addTeam);
router.put('/teams/:id', protectAdmin, adminController.updateTeam);
router.delete('/teams/:id', protectAdmin, adminController.deleteTeam);

// --- Game Management ---
router.post('/award-bid', protectAdmin, adminController.awardBid);
router.post('/execute-trade', protectAdmin, adminController.executeTrade);

// --- History ---
router.get('/bid-history', protectAdmin, adminController.getBidHistory);
router.put('/bid-history/:id', protectAdmin, adminController.updateBidHistory);
router.delete('/bid-history/:id', protectAdmin, adminController.deleteBidHistory);
router.get('/trade-history', protectAdmin, adminController.getTradeHistory);
router.put('/trade-history/:id', protectAdmin, adminController.updateTradeHistory);
router.delete('/trade-history/:id', protectAdmin, adminController.deleteTradeHistory);

module.exports = router;
