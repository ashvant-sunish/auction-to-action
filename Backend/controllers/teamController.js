const Team = require('../models/Team');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

// Handles Team Login
exports.loginTeam = async (req, res) => {
  try {
    const { teamNumber, teamCredential } = req.body;
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
};

// Gets all dashboard data for the logged-in team
exports.getDashboardData = async (req, res) => {
  try {
    // req.user.teamId comes from the decoded JWT in the protectTeam middleware
    const team = await Team.findById(req.user.teamId).populate('inventory');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    res.json({
      teamNumber: team.teamNumber,
      budget: team.budget,
      inventory: team.inventory,
      isActive: team.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Gets transaction history for the logged-in team
exports.getTransactionHistory = async (req, res) => {
    try {
        // Find transactions using the teamId from the token
        const transactions = await Transaction.find({ teamId: req.user.teamId })
          .populate("itemId", "name") // Populates the item's name
          .sort({ timestamp: -1 });

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};