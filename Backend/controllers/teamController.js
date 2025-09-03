const Team = require('../models/Team');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

/**
 * Handles Team Login.
 * Expects { teamNumber, teamCredential } in the request body.
 */
exports.loginTeam = async (req, res) => {
  try {
    const { teamNumber, teamCredential } = req.body;
    const team = await Team.findOne({ teamNumber, teamCredential });

    if (!team) {
      return res.status(401).json({ message: 'Invalid Team Number or Credential.' });
    }
    
    // Set the team as active upon login
    team.isActive = true;
    await team.save();

    // Create a JWT token for the session
    const token = jwt.sign(
      { teamId: team._id, teamNumber: team.teamNumber, role: 'participant' },
      process.env.JWT_SECRET, // Make sure JWT_SECRET is in your .env file
      { expiresIn: '8h' }
    );

    res.status(200).json({ message: 'Login successful!', token });
  } catch (error) {
    console.error("Error during team login:", error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

/**
 * Gets all dashboard data for the logged-in team.
 * Used for the main dashboard view with financial stats.
 */
exports.getDashboardData = async (req, res) => {
  try {
    const teamId = req.user.teamId;
    const team = await Team.findById(teamId).populate('inventory');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({
      teamNumber: team.teamNumber,
      credit: team.credit,
      debit: team.debit,
      balance: team.balance,
      inventory: team.inventory,
      isActive: team.isActive
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: 'Server error while fetching dashboard data.' });
  }
};

/**
 * Gets the personal transaction history for the logged-in team.
 * Used for the "My Bids" page.
 */
exports.getTransactionHistory = async (req, res) => {
    try {
        const teamId = req.user.teamId;
        const transactions = await Transaction.find({ teamId: teamId })
          .populate("itemId", "name description") // Populates the item's details
          .sort({ timestamp: -1 }); // Show newest first

        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching team transaction history:", error);
        res.status(500).json({ message: 'Server error while fetching transaction history.' });
    }
};

/**
 * Gets a list of all available items for auction.
 * Used for the "Available Materials" table on the dashboard.
 */
exports.getAvailableItems = async (req, res) => {
    try {
        const items = await Item.find({});
        res.status(200).json(items);
    } catch (error) {
        console.error("Error fetching available items:", error);
        res.status(500).json({ message: 'Server error while fetching items.' });
    }
};

/**
 * Gets all winning bids from all teams for the public history page.
 * Hides the winning amount for privacy.
 */
exports.getAllTeamBids = async (req, res) => {
    try {
        const bids = await Transaction.find({ type: 'Bid' })
            .populate('teamId', 'teamNumber')
            .populate('itemId', 'name description')
            .select('-amount') // Hides the winning bid amount from other teams
            .sort({ timestamp: -1 });
            
        res.status(200).json(bids);
    } catch (error) {
        console.error("Error fetching all team bids:", error);
        res.status(500).json({ message: 'Server error while fetching all bids.' });
    }
};