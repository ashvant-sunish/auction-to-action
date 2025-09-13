const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { protectAdmin, protectSuperAdmin } = require('../middleware/authMiddleware');

// --- Auth Routes ---
// The logic is now correctly handled by authController
router.post('/register', authController.registerAdmin);
router.post('/login', authController.loginAdmin);
router.get('/verify-role', protectAdmin, (req, res) => {
    // The protectAdmin middleware already verifies the token and adds user to req
    res.json({ 
        role: req.user.role,
        userId: req.user.userId,
        message: 'Role verified successfully'
    });
});

// --- SuperAdmin-only routes ---
router.post('/create-superadmin', protectSuperAdmin, authController.registerAdmin);


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
router.post('/complete-trade', protectAdmin, adminController.completeTrade);

// --- Round 1 Spinning Wheel ---
router.get('/game-items/round/:round', protectAdmin, adminController.getGameItemsByRound);
// Public endpoint for users to view game items (read-only)
router.get('/public/game-items/round/:round', adminController.getGameItemsByRound);
router.post('/game-items/select', protectAdmin, adminController.selectGameItem);
router.get('/game-state', protectAdmin, adminController.getGameState);

// --- History ---
router.get('/bid-history', protectAdmin, adminController.getBidHistory);
router.put('/bid-history/:id', protectAdmin, adminController.updateBidHistory);
router.delete('/bid-history/:id', protectAdmin, adminController.deleteBidHistory);
router.get('/trade-history', protectAdmin, adminController.getTradeHistory);
router.put('/trade-history/:id', protectAdmin, adminController.updateTradeHistory);
router.delete('/trade-history/:id', protectAdmin, adminController.deleteTradeHistory);

// Public endpoint (no authentication required) for user components
router.get('/public/game-items/round/:round', adminController.getGameItemsByRound);

module.exports = router;
