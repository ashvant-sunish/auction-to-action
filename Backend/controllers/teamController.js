const Team = require('../models/Team');
const GameItem = require('../models/GameItem');
const BidHistory = require('../models/BidHistory');
const TradeHistory = require('../models/TradeHistory');
const TradeWishlist = require('../models/TradeWishlist');

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
          $or: [{ 'teamOne.teamCode': teamCode }, { 'teamTwo.teamCode': teamCode }]
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

/**
 * Gets the team profile information including resources and balance
 */
exports.getTeamProfile = async (req, res) => {
    try {
        const team = await Team.findById(req.user.teamId).select('-password');
        
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Convert resources Map to object for easier frontend handling
        const teamData = {
            ...team.toObject(),
            resources: Object.fromEntries(team.resources || new Map())
        };

        res.status(200).json(teamData);
    } catch (error) {
        console.error("Error fetching team profile:", error);
        res.status(500).json({ message: 'Server error while fetching team profile.' });
    }
};

/**
 * Submits or updates a team's trade wishlist for Round 3
 */
exports.submitTradeWishlist = async (req, res) => {
    try {
        {
            // Team has existing wishlist - accumulate items
            const existingItems = new Map();
            
            // Add existing items to map
            existingWishlist.itemsToTrade.forEach(item => {
                existingItems.set(item.name, item.count);
            });
            
            // Add new items to map (accumulating quantities)
            itemsToTrade.forEach(item => {
                const currentCount = existingItems.get(item.name) || 0;
                existingItems.set(item.name, currentCount + item.count);
            });
            
            // Convert map back to array
            const updatedItemsToTrade = Array.from(existingItems.entries()).map(([name, count]) => ({
                name,
                count
            }));
            
            const updatedTotalItems = updatedItemsToTrade.reduce((sum, item) => sum + item.count, 0);
            
            // Update existing record
            wishlistRecord = await TradeWishlist.findOneAndUpdate(
                filter,
                {
                    $set: {
                        itemsToTrade: updatedItemsToTrade,
                        totalItems: updatedTotalItems,
                        submittedAt: new Date(),
                        teamName: team.teamName,
                        teamId: team._id
                    }
                },
                { 
                    new: true,
                    runValidators: true
                }
            );
            
            );

        // Create a map of team codes to their latest trade wishlist
        const wishlistMap = new Map();
        tradeWishlists.forEach(wishlist => {
            const teamCode = wishlist.teamCode;
            if (!wishlistMap.has(teamCode)) {
                

        // Combine teams data with their trade wishlists
        const teamsWithWishlists = teams.map(team => {
            // Safely convert resources Map to object
            let resources = {};
            try {
                if (team.resources && team.resources instanceof Map) {
                    resources = Object.fromEntries(team.resources);
                } else if (team.resources && typeof team.resources === 'object') {
                    resources = team.resources;
                }
            } catch (error) {
                .json({
            success: true,
            teams: teamsWithWishlists
        });

    } catch (error) {
        console.error("Error fetching all teams trade offers:", error);
        res.status(500).json({ message: 'Server error while fetching teams trade offers.' });
    }
};

/**
 * Update wishlist by removing traded items
 */
exports.updateWishlist = async (req, res) => {
    try {
        const { teamCode, itemsToRemove } = req.body;
        
        