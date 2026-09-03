const bcrypt = require('bcryptjs');
const Team = require('../models/Team');
const GameItem = require('../models/GameItem');
const BidHistory = require('../models/BidHistory');
const TradeHistory = require('../models/TradeHistory');
const TradeWishlist = require('../models/TradeWishlist');
const AdminUser = require('../models/AdminUser');
const GameState = require('../models/GameState');
const Round1Bids = require('../models/Round1Bids');

// --- ADMIN MANAGEMENT (CRUD for other admins) ---

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminUser.find({}).select('-password');
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching admins.' });
  }
};

exports.addAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingAdmin = await AdminUser.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new AdminUser({ username, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: 'Admin user created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating admin.' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const admin = await AdminUser.findByIdAndUpdate(id, updateData, { new: true });
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });
    res.status(200).json({ message: 'Admin updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating admin.' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminUser.findByIdAndDelete(id);
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });
    res.status(200).json({ message: 'Admin deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting admin.' });
  }
};

// --- TEAM MANAGEMENT (CRUD by Admin) ---

exports.getAllTeams = async (req, res) => {
  try {
    const { teamCode } = req.query;

    let query = {};
    if (teamCode) {
      // Exact match for team code (case-insensitive)
      query.teamCode = { $regex: new RegExp(`^${teamCode}$`, 'i') };
    }

    const teams = await Team.find(query).select('-password');

    // Debug log
    
    const item = await GameItem.findOne({ itemCode });

    if (!team || !item) {
      return res.status(404).json({ message: 'Team or Item not found.' });
    }
    if (item.isBidOn) {
      return res.status(400).json({ message: 'This item has already been won.' });
    }
    if (team.balance < bidAmount) {
      return res.status(400).json({ message: 'Team balance is too low.' });
    }

    team.debit += Number(bidAmount);
    team.inventory.push(item.itemCode);

    item.resources.forEach((quantity, resourceName) => {
      const currentQuantity = team.resources.get(resourceName) || 0;
      team.resources.set(resourceName, currentQuantity + quantity);
    });
    await team.save();

    item.isBidOn = true;
    await item.save();

    const history = new BidHistory({
      round: item.round,
      itemCode: item.itemCode,
      itemName: item.name,
      teamCode: team.teamCode,
      teamName: team.teamName,
      bidAmount: bidAmount
    });
    await history.save();

    res.status(200).json({ message: 'Bid awarded successfully.', team, history });
  } catch (error) {
    res.status(500).json({ message: 'Server error awarding bid.', error: error.message });
  }
};

exports.executeTrade = async (req, res) => {
  try {
    const { teamOneCode, teamTwoCode, tradeDetails } = req.body;
    const teamA = await Team.findOne({ teamCode: teamOneCode });
    const teamB = await Team.findOne({ teamCode: teamTwoCode });

    if (!teamA || !teamB) {
      return res.status(404).json({ message: 'One or both teams not found.' });
    }

    const { teamOneGivesItems, teamOneGivesMoney, teamTwoGivesItems, teamTwoGivesMoney } = tradeDetails;

    if (teamA.balance < teamOneGivesMoney)
      return res.status(400).json({ message: `${teamA.teamName} does not have enough money.` });
    for (const item of teamOneGivesItems) {
      if ((teamA.resources.get(item) || 0) < 1)
        return res.status(400).json({ message: `${teamA.teamName} does not have ${item}.` });
    }
    if (teamB.balance < teamTwoGivesMoney)
      return res.status(400).json({ message: `${teamB.teamName} does not have enough money.` });
    for (const item of teamTwoGivesItems) {
      if ((teamB.resources.get(item) || 0) < 1)
        return res.status(400).json({ message: `${teamB.teamName} does not have ${item}.` });
    }

    teamA.debit += teamOneGivesMoney;
    teamB.credit += teamOneGivesMoney;
    teamB.debit += teamTwoGivesMoney;
    teamA.credit += teamTwoGivesMoney;

    teamOneGivesItems.forEach(item => {
      teamA.resources.set(item, teamA.resources.get(item) - 1);
      teamB.resources.set(item, (teamB.resources.get(item) || 0) + 1);
    });
    teamTwoGivesItems.forEach(item => {
      teamB.resources.set(item, teamB.resources.get(item) - 1);
      teamA.resources.set(item, (teamA.resources.get(item) || 0) + 1);
    });
    await teamA.save();
    await teamB.save();

    const history = new TradeHistory({
      teamOne: { name: teamA.teamName, code: teamA.teamCode },
      teamTwo: { name: teamB.teamName, code: teamB.teamCode },
      tradeDetails: tradeDetails
    });
    await history.save();

    res.status(200).json({ message: 'Trade executed successfully!', history });
  } catch (error) {
    res.status(500).json({ message: 'Server error during trade.', error: error.message });
  }
};

// --- HISTORY FETCHING ---

exports.getBidHistory = async (req, res) => {
  try {
    const { round } = req.query;

    
        
        if (![1, 2].includes(roundNumber)) {
            return res.status(400).json({ message: 'Invalid round number. Must be 1 or 2.' });
        }
        
        // For Round 1, use the round1bids collection
        if (roundNumber === 1) {
            const roundData = await Round1Bids.findOne();
            
            if (!roundData) {
                return res.status(404).json({ message: 'Round 1 data not found' });
            }
            
            // Map item_list to availableItems format
            const availableItems = (roundData.item_list || []).map(item => ({
                id: item._id || `${item.itemCode}_${Date.now()}`,
                bidNo: item.bidNumber, // Use bidNumber field from model
                title: item.name,
                details: `Base Price: ₹${item.basePrice}`,
                category: `Round 1`,
                itemCode: item.itemCode,
                bidNumber: item.bidNumber, // Include bidNumber explicitly
                basePrice: item.basePrice,
                resources: item.resources || {},
                image: item.image
            }));
            
            // Map item_list_2 to selectedItems format
            const selectedItems = (roundData.item_list_2 || []).map(item => ({
                id: item._id || `${item.itemCode}_selected_${Date.now()}`,
                bidNo: item.bidNumber, // Use bidNumber field from model
                title: item.name,
                details: `Base Price: ₹${item.basePrice}`,
                category: `Round 1`,
                itemCode: item.itemCode,
                bidNumber: item.bidNumber, // Include bidNumber explicitly
                basePrice: item.basePrice,
                resources: item.resources || {},
                image: item.image,
                teamCode: item.teamCode,
                teamName: item.teamName,
                bidAmount: item.bidAmount
            }));
            
            
        
        // Validation - accept either bidNo or bidNumber
        const finalBidNo = bidNo || bidNumber;
        if (!itemId && !itemCode && !finalBidNo) {
            return res.status(400).json({ 
                message: 'Missing required fields: need itemId, itemCode, or bidNo/bidNumber to identify the item' 
            });
        }
        
        // For Round 1, handle Round1Bids collection
        const roundData = await Round1Bids.findOne();
        if (!roundData) {
            return res.status(404).json({ message: 'Round 1 data not found' });
        }
        
        
            }
            return matches;
        });
        
        if (itemIndex === -1) {
            
            });
            return res.status(404).json({ message: 'Game item not found in available items' });
        }
        
        // Get the item and remove it from item_list
        const selectedItem = roundData.item_list[itemIndex];
        roundData.item_list.splice(itemIndex, 1);
        
        // Add it to item_list_2 (without team info since form is on another page)
        const itemForList2 = {
            ...selectedItem.toObject(),
            selectedAt: new Date()
        };
        roundData.item_list_2.push(itemForList2);
        
        // Save the updated document
        await roundData.save();
        
        has been selected from the wheel!`;
        await gameState.save();
        
        // Emit socket event for real-time updates to ALL connected clients
        if (req.app && req.app.get('io')) {
            const updateData = {
                round: 1,
                action: 'itemSelected',
                selectedItem: {
                    itemCode: selectedItem.itemCode,
                    name: selectedItem.name,
                    basePrice: selectedItem.basePrice,
                    resources: selectedItem.resources
                },
                availableCount: roundData.item_list.length,
                selectedCount: roundData.item_list_2.length,
                timestamp: new Date()
            };
            
            // Broadcast to all admin and user clients
            req.app.get('io').emit('roundItemUpdate', updateData);
            req.app.get('io').emit('wheelUpdate', updateData);
            
            

        // Find the team
        const team = await Team.findOne({ teamCode });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if team has sufficient funds (using credit-debit balance)
        const teamBalance = team.credit - team.debit;
        if (updateAccount && teamBalance < bidAmount) {
            return res.status(400).json({ 
                message: `Insufficient funds. Team has ₹${teamBalance}, needs ₹${bidAmount}` 
            });
        }

        // For auction purchases, we'll skip TradeHistory (which is for team-to-team trades)
        // and instead focus on updating team resources and creating bid history

        // Get the GameItem to access its resources
        const gameItem = await GameItem.findOne({ itemCode });
        
        // Update team inventory (add item code to existing string array)
        if (updateInventory) {
            if (!team.inventory) {
                team.inventory = [];
            }
            
            team.inventory.push(itemCode);  // Just add the item code as string
            
        }

        // Save bid history
        const bidHistory = new BidHistory(bidHistoryRecord);
        await bidHistory.save();
        .' });
    }

    const team = await Team.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    res.status(200).json({ 
      message: `Team ${isActive ? 'activated' : 'deactivated'} successfully.`,
      team 
    });
  } catch (error) {
    console.error("❌ Error updating team active status:", error);
    res.status(500).json({ message: 'Server error updating team status.' });
  }
};

// Get live auction status for dashboard
exports.getLiveAuctionStatus = async (req, res) => {
  try {
    // Get the latest wheel selection from wheelselections collection
    const WheelSelection = require('../models/WheelSelection');
    const latestSelection = await WheelSelection.findOne({ 
      eventType: 'RANDOM_SELECTED',
      isLive: true 
    }).sort({ timestamp: -1 });
    
    let selectedNumber = "0";
    if (latestSelection && latestSelection.itemDetails && latestSelection.itemDetails.bidNumber) {
      selectedNumber = latestSelection.itemDetails.bidNumber.toString();
    }
    
    `);
      
      const wishlistItemIndex = wishlist.itemsToTrade.findIndex(
        wItem => wItem.name === item.name
      );
      
      if (wishlistItemIndex !== -1) {
        // Reduce the count but keep it at minimum 0
        const currentCount = wishlist.itemsToTrade[wishlistItemIndex].count;
        const newCount = Math.max(0, currentCount - item.quantity);
        
        wishlist.itemsToTrade[wishlistItemIndex].count = newCount;
        