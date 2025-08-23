const express = require('express');
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');

const router = express.Router();


router.post('/login', async (req, res) => {
  try {

    const { teamNumber, teamCredential } = req.body;
    console.log({ teamNumber, teamCredential });

    const team = await Team.findOne({ teamNumber, teamCredential });

    if (!team) {
      return res.status(401).json({ message: 'Invalid Team Number or Credential.' });
    }

    team.isActive = true;
    await team.save();

    const token = jwt.sign(
        { teamId: team._id, teamNumber: team.teamNumber, role: 'participant' },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({ message: 'Login successful!', token });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Security guard for team routes
const protectTeam = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'participant') return res.status(403).json({ message: 'Forbidden' });
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid' });
    }
};

// Protected endpoint for the Team's Dashboard
router.get('/dashboard', protectTeam, async (req, res) => {
    try {
        const team = await Team.findById(req.user.teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        
        const dashboardData = {
            message: `Welcome, Team ${team.teamNumber}!`,
            teamNumber: team.teamNumber,
            budget: team.budget,
            members: team.members,
            isActive: team.isActive
        };
        res.json(dashboardData);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;