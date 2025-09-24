const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authController = require('../controllers/authController');
const { protectTeam } = require('../middleware/authMiddleware');

// Public route for a team to log in
router.post('/login', authController.loginTeam);

// Protected route for a team to log out
router.post('/logout', protectTeam, authController.logoutTeam);

// --- Protected Routes ---
// The following routes require a valid team JWT to be sent in the Authorization header.

// Fetches all dashboard data for the logged-in team
router.get('/dashboard', protectTeam, teamController.getDashboardData);

// Fetches the personal bid and trade history for the logged-in team
router.get('/history', protectTeam, teamController.getTransactionHistory);

// Fetches all game items that are still available for auction
router.get('/items', protectTeam, teamController.getAvailableItems);

// Team profile route
router.get('/profile', protectTeam, teamController.getTeamProfile);

// Trade wishlist routes
router.post('/trade-wishlist', protectTeam, teamController.submitTradeWishlist);
router.get('/trade-wishlist', protectTeam, teamController.getTradeWishlist);
router.put('/update-wishlist', protectTeam, teamController.updateWishlist);

// All teams trade offers for the trading market view
router.get('/all-trade-offers', protectTeam, teamController.getAllTeamsTradeOffers);

module.exports = router;

