const bcrypt = require('bcryptjs');
const Team = require('../models/Team');
const GameItem = require('../models/GameItem');
const BidHistory = require('../models/BidHistory');
const TradeHistory = require('../models/TradeHistory');
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
<<<<<<< HEAD
    try {
        const { teamCode } = req.query;
        
        let query = {};
        if (teamCode) {
            // Exact match for team code (case-insensitive)
            query.teamCode = { $regex: new RegExp(`^${teamCode}$`, 'i') };
        }
        
        const teams = await Team.find(query).select('-password');
        
        // Debug log
        console.log(`Team lookup for code: ${teamCode}, found ${teams.length} teams`);
        if (teams.length > 0) {
            console.log('Found teams:', teams.map(t => ({ code: t.teamCode, name: t.teamName })));
        }
        
        res.status(200).json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ message: 'Server error fetching teams.' });
=======
  try {
    const { teamCode } = req.query;

    let query = {};
    if (teamCode) {
      // Exact match for team code (case-insensitive)
      query.teamCode = { $regex: new RegExp(`^${teamCode}$`, 'i') };
>>>>>>> dcad12332d45d9b295c4d27e644b1fdb75a16b4f
    }

    const teams = await Team.find(query).select('-password');

    // Debug log
    console.log(`Team lookup for code: ${teamCode}, found ${teams.length} teams`);
    if (teams.length > 0) {
      console.log('Found teams:', teams.map(t => ({ code: t.teamCode, name: t.teamName })));
    }

    res.status(200).json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error fetching teams.' });
  }
};

exports.addTeam = async (req, res) => {
  try {
    const { teamCode, teamName, password, initialBalance } = req.body;
    if (!teamCode || !teamName || !password) {
      return res.status(400).json({ message: 'Team Code, Name, and Password are required.' });
    }
    const existingTeam = await Team.findOne({ teamCode });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team Code already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeam = new Team({
      teamCode,
      teamName,
      password: hashedPassword,
      credit: initialBalance || 20000
    });
    await newTeam.save();
    res.status(201).json({ message: 'Team created successfully.', team: newTeam });
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating team.', error: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, password, credit, debit } = req.body;
    const updateData = {};
    if (teamName) updateData.teamName = teamName;
    if (credit) updateData.credit = credit;
    if (debit) updateData.debit = debit;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const updatedTeam = await Team.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    res.status(200).json({ message: 'Team updated successfully.', team: updatedTeam });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating team.', error: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTeam = await Team.findByIdAndDelete(id);
    if (!deletedTeam) {
      return res.status(404).json({ message: 'Team not found.' });
    }
    res.status(200).json({ message: 'Team deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting team.', error: error.message });
  }
};

// --- GAME LOGIC ---

exports.awardBid = async (req, res) => {
  try {
    const { teamCode, itemCode, bidAmount } = req.body;
    const team = await Team.findOne({ teamCode });
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

    console.log('🔍 getBidHistory called with query:', req.query);
    console.log('🔍 Round parameter:', round, 'Type:', typeof round);

    let filter = {};
    if (round) {
      filter.round = parseInt(round);
      console.log('🔍 Filter object:', filter);
    }

    console.log('🔍 Searching BidHistory with filter:', filter);
    const history = await BidHistory.find(filter).sort({ createdAt: -1 });
    console.log('🔍 Found history items:', history.length);

    history.forEach((item, index) => {
      console.log(`Item ${index + 1}: Round ${item.round}, Item: ${item.itemName}`);
    });

    res.status(200).json(history);
  } catch (error) {
    console.error('❌ Error in getBidHistory:', error);
    res.status(500).json({ message: 'Error fetching bid history' });
  }
};

exports.updateBidHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, bidAmount, teamName, teamCode } = req.body;

    const updateData = {};
    if (itemName) updateData.itemName = itemName;
    if (bidAmount) updateData.bidAmount = Number(bidAmount);
    if (teamName) updateData.teamName = teamName;
    if (teamCode) updateData.teamCode = teamCode;

    const updatedBid = await BidHistory.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBid) {
      return res.status(404).json({ message: 'Bid history not found.' });
    }

    res.status(200).json({ message: 'Bid history updated successfully.', bid: updatedBid });
  } catch (error) {
    console.error('❌ Error updating bid history:', error);
    res.status(500).json({ message: 'Error updating bid history', error: error.message });
  }
};

exports.deleteBidHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBid = await BidHistory.findByIdAndDelete(id);

    if (!deletedBid) {
      return res.status(404).json({ message: 'Bid history not found.' });
    }

    res.status(200).json({ message: 'Bid history deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting bid history:', error);
    res.status(500).json({ message: 'Error deleting bid history', error: error.message });
  }
};

exports.getTradeHistory = async (req, res) => {
  try {
    const history = await TradeHistory.find({}).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trade history' });
  }
};

exports.updateTradeHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTrade = await TradeHistory.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedTrade) {
      return res.status(404).json({ message: 'Trade history not found' });
    }
    res.status(200).json(updatedTrade);
  } catch (error) {
    res.status(500).json({ message: 'Error updating trade history' });
  }
};

exports.deleteTradeHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTrade = await TradeHistory.findByIdAndDelete(id);
    if (!deletedTrade) {
      return res.status(404).json({ message: 'Trade history not found' });
    }
    res.status(200).json({ message: 'Trade history deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting trade history' });
  }
};
<<<<<<< HEAD

// --- ROUND 1 SPINNING WHEEL INTEGRATION ---

/**
 * Get game items by round for spinning wheel
 */
exports.getGameItemsByRound = async (req, res) => {
    try {
        const { round } = req.params;
        const roundNumber = parseInt(round);
        
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
            
            console.log('📊 Round 1 Data loaded:');
            console.log(`Available items: ${availableItems.length}`);
            console.log(`Selected items: ${selectedItems.length}`);
            
            return res.status(200).json({
                availableItems,
                selectedItems
            });
        }
        
        // For Round 2, still use GameItem model (if needed)
        const availableItems = await GameItem.find({ 
            round: roundNumber, 
            isBidOn: false 
        }).sort({ itemCode: 1 });
        
        const selectedItems = await GameItem.find({ 
            round: roundNumber, 
            isBidOn: true 
        }).sort({ itemCode: 1 });
        
        res.status(200).json({
            availableItems: availableItems.map(item => ({
                id: item._id,
                bidNo: item.itemCode,
                title: item.name,
                details: item.description || `Base Price: ₹${item.basePrice}`,
                category: `Round ${item.round}`,
                itemCode: item.itemCode,
                basePrice: item.basePrice,
                resources: item.resources
            })),
            selectedItems: selectedItems.map(item => ({
                id: item._id,
                bidNo: item.itemCode,
                title: item.name,
                details: item.description || `Base Price: ₹${item.basePrice}`,
                category: `Round ${item.round}`,
                itemCode: item.itemCode,
                basePrice: item.basePrice,
                resources: item.resources
            }))
        });
    } catch (error) {
        console.error('Error fetching game items:', error);
        res.status(500).json({ message: 'Error fetching game items' });
    }
};

/**
 * Select a game item from spinning wheel and update live state
 */
exports.selectGameItem = async (req, res) => {
    try {
        const { itemId, itemCode, bidNo, bidNumber } = req.body;
        
        console.log('📥 Received selection request:', { itemId, itemCode, bidNo, bidNumber });
        
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
        
        console.log('📊 Current available items:', roundData.item_list.length);
        console.log('🔍 Looking for item with:', { itemId, itemCode, finalBidNo });
        
        // Find the item in item_list by matching itemId, itemCode, or bidNo/bidNumber
        const itemIndex = roundData.item_list.findIndex(item => {
            const matches = (itemId && item._id?.toString() === itemId) ||
                           (itemCode && item.itemCode === itemCode) ||
                           (finalBidNo && (item.bidNumber === finalBidNo || item.itemCode === finalBidNo));
            
            if (matches) {
                console.log('✅ Found matching item:', { 
                    itemCode: item.itemCode, 
                    bidNumber: item.bidNumber,
                    name: item.name 
                });
            }
            return matches;
        });
        
        if (itemIndex === -1) {
            console.log('❌ Item not found. Available items:');
            roundData.item_list.forEach((item, index) => {
                console.log(`  ${index}: ${item.itemCode} (bidNumber: ${item.bidNumber})`);
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
        
        console.log(`📦 Item moved: ${selectedItem.itemCode} from item_list to item_list_2`);
        console.log(`📊 Available items: ${roundData.item_list.length}, Selected items: ${roundData.item_list_2.length}`);
        
        // Update game state
        let gameState = await GameState.findOne({ singleton: 'main' });
        if (!gameState) {
            gameState = new GameState({ singleton: 'main' });
        }
        
        gameState.currentRound = 1;
        gameState.isAuctionLive = true;
        gameState.currentItemUpForBidding = {
            itemCode: selectedItem.itemCode,
            name: selectedItem.name,
            description: `Base Price: ₹${selectedItem.basePrice}`,
            basePrice: selectedItem.basePrice,
            round: 1
        };
        gameState.liveMessage = `${selectedItem.name} (${selectedItem.itemCode}) has been selected from the wheel!`;
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
            
            console.log('📡 Broadcasted wheel update to all clients');
        }
        
        res.status(201).json({
            message: 'Game item selected and moved to item_list_2 successfully',
            selectedItem: {
                itemCode: selectedItem.itemCode,
                name: selectedItem.name,
                basePrice: selectedItem.basePrice
            },
            availableCount: roundData.item_list.length,
            selectedCount: roundData.item_list_2.length,
            gameState: {
                currentItem: gameState.currentItemUpForBidding,
                liveMessage: gameState.liveMessage
            }
        });
    } catch (error) {
        console.error('Error selecting game item:', error);
        res.status(500).json({ message: 'Error selecting game item' });
    }
};

/**
 * Complete trade with inventory and account updates
 */
exports.completeTrade = async (req, res) => {
    try {
        const {
            round,
            itemCode,
            itemName,
            teamCode,
            teamName,
            bidAmount,
            tradeType = 'AUCTION_WIN',
            actionType = 'BUY',
            updateInventory = true,
            updateAccount = true
        } = req.body;

        console.log('🔄 Processing complete trade:', {
            teamCode,
            itemName,
            bidAmount,
            updateInventory,
            updateAccount
        });

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
            console.log('📦 Added to inventory:', itemCode);
        }

        // Update team resources (add the actual resources from the GameItem)
        if (gameItem && gameItem.resources) {
            gameItem.resources.forEach((quantity, resourceName) => {
                const currentQuantity = team.resources.get(resourceName) || 0;
                team.resources.set(resourceName, currentQuantity + quantity);
                console.log(`🔧 Added ${quantity} ${resourceName} to team resources`);
            });
        }

        // Update team account balance (increase debit)
        if (updateAccount) {
            team.debit += bidAmount;
            console.log('💰 Updated debit:', `₹${team.debit}`);
        }

        // Save team updates
        await team.save();

        // Create bid history record for tracking
        const bidHistory = new BidHistory({
            round,
            itemCode,
            itemName,
            teamCode,
            teamName,
            bidAmount
        });

        await bidHistory.save();
        console.log('📊 Bid history created:', bidHistory._id);

        res.status(201).json({
            success: true,
            message: 'Trade completed successfully',
            data: {
                bidHistoryId: bidHistory._id,
                teamCode,
                teamName,
                itemName,
                bidAmount,
                newBalance: team.credit - team.debit,
                inventoryCount: team.inventory?.length || 0,
                resources: Object.fromEntries(team.resources || new Map())
            }
        });

    } catch (error) {
        console.error('❌ Error completing trade:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error completing trade',
            error: error.message 
        });
    }
};

/**
 * Get current game state for live updates
 */
exports.getGameState = async (req, res) => {
    try {
        let gameState = await GameState.findOne({ singleton: 'main' });
        if (!gameState) {
            gameState = new GameState({ singleton: 'main' });
            await gameState.save();
        }
        
        res.status(200).json(gameState);
    } catch (error) {
        console.error('Error fetching game state:', error);
        res.status(500).json({ message: 'Error fetching game state' });
    }
};
=======
// --- TEAM STATUS MANAGEMENT (isActive toggle) ---

/**
 * Activate or deactivate a team (set isActive = true/false).
 * Admins can use this to allow or block login access for teams.
 */
exports.setTeamActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean (true/false).' });
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

>>>>>>> dcad12332d45d9b295c4d27e644b1fdb75a16b4f
