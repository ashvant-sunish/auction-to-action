const Team = require('../models/Team');
const GameItem = require('../models/GameItem');
const BidHistory = require('../models/BidHistory');
const TradeHistory = require('../models/TradeHistory');

/**
 * Gets all dashboard data for the logged-in team.
 * Used for the main dashboard view with financial stats and resources.
 */
exports.getDashboardData = async (req, res) => {
  try {
    // req.user is populated by the authMiddleware with the decoded JWT payload
    const team = await Team.findById(req.user.teamId).select('-password');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json(team);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: 'Server error while fetching dashboard data.' });
  }
};

/**
 * Gets the personal transaction history (bids and trades) for the logged-in team.
 */
exports.getTransactionHistory = async (req, res) => {
    try {
        const teamCode = req.user.teamCode;

        // Find all bids made by this team
        const bids = await BidHistory.find({ teamCode: teamCode }).sort({ createdAt: -1 });

        // Find all trades this team was a part of
        const trades = await TradeHistory.find({
          $or: [{ 'teamOne.code': teamCode }, { 'teamTwo.code': teamCode }]
        }).sort({ createdAt: -1 });

        res.status(200).json({ bids, trades });
    } catch (error) {
        console.error("Error fetching team transaction history:", error);
        res.status(500).json({ message: 'Server error while fetching transaction history.' });
    }
};

/**
 * Gets a list of all available items for auction that have not been won yet.
 */
exports.getAvailableItems = async (req, res) => {
    try {
        const items = await GameItem.find({ isBidOn: false }).sort({ round: 1, itemCode: 1 });
        res.status(200).json(items);
    } catch (error) {
        console.error("Error fetching available items:", error);
        res.status(500).json({ message: 'Server error while fetching items.' });
    }
};

