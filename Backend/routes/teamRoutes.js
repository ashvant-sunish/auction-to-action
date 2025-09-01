const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController'); // Import the new controller
const { protectTeam } = require('../middleware/authMiddleware'); // (See note below)

// Public route for logging in
router.post('/login', teamController.loginTeam);

// Protected routes - only accessible with a valid team token
router.get('/dashboard', protectTeam, teamController.getDashboardData);
router.get('/transactions', protectTeam, teamController.getTransactionHistory);

module.exports = router;