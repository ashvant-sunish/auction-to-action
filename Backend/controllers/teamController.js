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
        console.log('=== TRADE WISHLIST SUBMISSION ===');
        console.log('Request body:', req.body);
        console.log('User from token:', req.user);

        const { itemsToTrade, totalItems } = req.body;
        const team = await Team.findById(req.user.teamId);

        if (!team) {
            console.log('Team not found for ID:', req.user.teamId);
            return res.status(404).json({ message: 'Team not found' });
        }

        console.log('Team found:', team.teamCode, team.teamName);
        console.log('Team resources:', Object.fromEntries(team.resources || new Map()));

        // Get existing wishlist first to check current commitments
        let existingWishlist = await TradeWishlist.findOne({ 
            teamCode: team.teamCode, 
            round: 3,
            status: 'active'
        });

        // Calculate current commitments for each resource
        const currentCommitments = new Map();
        if (existingWishlist) {
            existingWishlist.itemsToTrade.forEach(item => {
                currentCommitments.set(item.name, item.count);
            });
        }

        console.log('Current wishlist commitments:', Object.fromEntries(currentCommitments));

        // Validate that team has enough resources for total commitment (existing + new)
        for (const item of itemsToTrade) {
            const available = team.resources.get(item.name) || 0;
            const currentlyCommitted = currentCommitments.get(item.name) || 0;
            const newCommitment = item.count;
            const totalCommitment = currentlyCommitted + newCommitment;

            console.log(`Checking ${item.name}: available=${available}, currently_committed=${currentlyCommitted}, new=${newCommitment}, total_needed=${totalCommitment}`);
            
            if (totalCommitment > available) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient ${item.name}. Available: ${available}, Already committed: ${currentlyCommitted}, Requesting: ${newCommitment}, Total needed: ${totalCommitment}`,
                    error: 'INSUFFICIENT_RESOURCES',
                    details: {
                        resource: item.name,
                        available,
                        currentlyCommitted,
                        requested: newCommitment,
                        totalNeeded: totalCommitment
                    }
                });
            }
        }

        // Create or update trade wishlist using findOneAndUpdate for better reliability
        const tradeWishlistData = {
            teamCode: team.teamCode,
            teamName: team.teamName,
            teamId: team._id,
            itemsToTrade,
            totalItems: totalItems || itemsToTrade.reduce((sum, item) => sum + item.count, 0),
            round: 3,
            status: 'active',
            submittedAt: new Date()
        };

        console.log('Trade wishlist data prepared:', tradeWishlistData);

        let wishlistRecord;

        // Use findOneAndUpdate with upsert to handle both create and update cases
        const filter = { 
            teamCode: team.teamCode, 
            round: 3,
            status: 'active'
        };

        if (existingWishlist) {
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
            
            console.log('Updated existing trade wishlist record - items accumulated');
        } else {
            // Team has no existing wishlist - create new one using upsert
            wishlistRecord = await TradeWishlist.findOneAndUpdate(
                filter,
                {
                    $setOnInsert: {
                        teamCode: team.teamCode,
                        teamName: team.teamName,
                        teamId: team._id,
                        round: 3,
                        status: 'active',
                        createdAt: new Date()
                    },
                    $set: {
                        itemsToTrade: tradeWishlistData.itemsToTrade,
                        totalItems: tradeWishlistData.totalItems,
                        submittedAt: new Date()
                    }
                },
                { 
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );
            
            console.log('Created new trade wishlist record using upsert');
        }

        if (!wishlistRecord) {
            throw new Error('Failed to create or update wishlist record');
        }

        console.log('Trade wishlist saved successfully with ID:', wishlistRecord._id);

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            console.log('Emitting socket event for trade wishlist submission');
            io.emit('tradeWishlistSubmitted', {
                teamCode: team.teamCode,
                teamName: team.teamName,
                itemsToTrade: wishlistRecord.itemsToTrade,
                totalItems: wishlistRecord.totalItems,
                submittedAt: wishlistRecord.submittedAt
            });
        } else {
            console.log('Socket.io not available');
        }

        res.status(200).json({
            success: true,
            message: 'Trade wishlist submitted successfully',
            data: {
                teamCode: team.teamCode,
                teamName: team.teamName,
                itemsToTrade: wishlistRecord.itemsToTrade,
                totalItems: wishlistRecord.totalItems,
                submittedAt: wishlistRecord.submittedAt
            }
        });

    } catch (error) {
        console.error("Error submitting trade wishlist:", error);
        
        // Log more detailed error information
        if (error.name === 'ValidationError') {
            console.error("Validation errors:", error.errors);
            return res.status(400).json({ 
                success: false,
                message: 'Validation error while submitting trade wishlist',
                errors: error.errors
            });
        }
        
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            console.error("MongoDB error:", error.message);
            return res.status(500).json({ 
                success: false,
                message: 'Database error while submitting trade wishlist'
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Server error while submitting trade wishlist.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Gets the team's current trade wishlist
 */
exports.getTradeWishlist = async (req, res) => {
    try {
        const teamCode = req.user.teamCode;

        // Find the latest trade wishlist for this team using the TradeWishlist model
        const wishlist = await TradeWishlist.findOne({
            teamCode: teamCode,
            round: 3,
            status: 'active'
        }).sort({ createdAt: -1 });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No trade wishlist found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                itemsToTrade: wishlist.itemsToTrade,
                totalItems: wishlist.totalItems,
                submittedAt: wishlist.submittedAt
            }
        });

    } catch (error) {
        console.error("Error fetching trade wishlist:", error);
        res.status(500).json({ message: 'Server error while fetching trade wishlist.' });
    }
};

/**
 * Gets all teams with their resources and trade wishlists for the trading market view
 */
exports.getAllTeamsTradeOffers = async (req, res) => {
    try {
        console.log('=== FETCHING ALL TEAMS TRADE OFFERS ===');
        
        // Get all teams with their resources
        const teams = await Team.find({}).select('-password').lean();
        console.log(`Found ${teams.length} teams`);

        // Get all active trade wishlists from TradeWishlist model
        const tradeWishlists = await TradeWishlist.find({
            round: 3,
            status: 'active'
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${tradeWishlists.length} trade wishlists:`, tradeWishlists.map(w => ({
            teamCode: w.teamCode,
            items: w.itemsToTrade,
            createdAt: w.createdAt
        })));

        // Create a map of team codes to their latest trade wishlist
        const wishlistMap = new Map();
        tradeWishlists.forEach(wishlist => {
            const teamCode = wishlist.teamCode;
            if (!wishlistMap.has(teamCode)) {
                console.log(`Adding wishlist for ${teamCode}:`, wishlist.itemsToTrade);
                wishlistMap.set(teamCode, wishlist.itemsToTrade.map(item => ({
                    name: item.name,
                    count: item.count
                })));
            }
        });

        console.log('Wishlist map:', Object.fromEntries(wishlistMap));

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
                console.warn(`Warning: Could not convert resources for team ${team.teamCode}:`, error);
                resources = {};
            }

            return {
                ...team,
                resources,
                tradeWishlist: wishlistMap.get(team.teamCode) || []
            };
        });

        console.log('Teams with wishlists prepared:', teamsWithWishlists.map(t => ({
            teamCode: t.teamCode,
            teamName: t.teamName,
            resources: Object.keys(t.resources),
            tradeWishlist: t.tradeWishlist
        })));

        res.status(200).json({
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
        
        console.log(`🔄 Updating wishlist for team ${teamCode}`);
        console.log('Items to remove:', itemsToRemove);
        
        // Find the active wishlist for this team
        const wishlist = await TradeWishlist.findOne({
            teamCode: teamCode,
            status: 'active',
            round: 3
        });
        
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'No active wishlist found for this team'
            });
        }
        
        // Remove items from wishlist
        for (const item of itemsToRemove) {
            const wishlistItemIndex = wishlist.itemsToTrade.findIndex(
                wItem => wItem.name === item.name
            );
            
            if (wishlistItemIndex !== -1) {
                // Reduce the count
                wishlist.itemsToTrade[wishlistItemIndex].count -= item.quantity;
                console.log(`Reduced ${item.name} by ${item.quantity}, new count: ${wishlist.itemsToTrade[wishlistItemIndex].count}`);
                
                // Remove if count is 0 or less
                if (wishlist.itemsToTrade[wishlistItemIndex].count <= 0) {
                    wishlist.itemsToTrade.splice(wishlistItemIndex, 1);
                    console.log(`Removed ${item.name} from wishlist (count reached 0)`);
                }
            }
        }
        
        // Recalculate total items
        wishlist.totalItems = wishlist.itemsToTrade.reduce((sum, item) => sum + item.count, 0);
        
        // Save updated wishlist
        await wishlist.save();
        
        console.log(`✅ Wishlist updated for ${teamCode}, new total: ${wishlist.totalItems}`);
        
        res.status(200).json({
            success: true,
            message: 'Wishlist updated successfully',
            updatedWishlist: wishlist.itemsToTrade
        });
        
    } catch (error) {
        console.error("Error updating wishlist:", error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while updating wishlist.' 
        });
    }
};
