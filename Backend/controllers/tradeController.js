// controllers/tradeController.js

const TradeHistory = require('../models/TradeHistory');
const Team = require('../models/Team');
const BidHistory = require('../models/BidHistory');
const TradeWishlist = require('../models/TradeWishlist');

// CORRECT APPROACH - Remove traded items from the GIVING team's wishlist
const updateTradeWishlists = async (team1, team2, team1GaveItems, team2GaveItems) => {
  try {
    console.log('🚀 STARTING WISHLIST UPDATE AFTER TRADE 🚀');
    console.log('Team1:', team1.teamName, '(', team1.teamCode, ') gave:', team1GaveItems);
    console.log('Team2:', team2.teamName, '(', team2.teamCode, ') gave:', team2GaveItems);

    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collection = db.collection('tradelistings');

    // Remove items from team1's wishlist that they GAVE AWAY
    if (team1GaveItems && team1GaveItems.length > 0) {
      console.log(`🔍 Removing items from ${team1.teamName}'s wishlist that they gave away`);
      
      for (const gaveItem of team1GaveItems) {
        console.log(`⚡ Removing ${gaveItem.name} (quantity: ${gaveItem.quantity}) from ${team1.teamName}'s wishlist`);
        
        // Find and update the wishlist directly in MongoDB
        const updateResult = await collection.updateOne(
          {
            teamCode: team1.teamCode,
            status: 'active',
            round: 3,
            'itemsToTrade.name': gaveItem.name
          },
          {
            $inc: { 'itemsToTrade.$.count': -gaveItem.quantity }
          }
        );

        console.log(`📊 Update result for ${gaveItem.name} in ${team1.teamName}'s wishlist:`, updateResult);

        if (updateResult.matchedCount > 0 && updateResult.modifiedCount > 0) {
          console.log(`✅ Successfully reduced ${gaveItem.name} by ${gaveItem.quantity} in ${team1.teamName}'s wishlist`);
          
          // Remove items with count <= 0
          const removeResult = await collection.updateOne(
            {
              teamCode: team1.teamCode,
              status: 'active',
              round: 3
            },
            {
              $pull: { 'itemsToTrade': { 'count': { $lte: 0 } } }
            }
          );
          
          console.log(`🗑️ Removed zero/negative count items result:`, removeResult);
          
          // Recalculate total items
          const wishlist = await collection.findOne({
            teamCode: team1.teamCode,
            status: 'active',
            round: 3
          });
          
          if (wishlist) {
            const newTotal = wishlist.itemsToTrade.reduce((sum, item) => sum + (item.count || 0), 0);
            await collection.updateOne(
              {
                teamCode: team1.teamCode,
                status: 'active',
                round: 3
              },
              {
                $set: { totalItems: newTotal }
              }
            );
            console.log(`📊 Updated total items for ${team1.teamName} to: ${newTotal}`);
          }
        } else {
          console.log(`⚠️ Item ${gaveItem.name} not found in ${team1.teamName}'s wishlist or already at zero`);
        }
      }
    }

    // Remove items from team2's wishlist that they GAVE AWAY
    if (team2GaveItems && team2GaveItems.length > 0) {
      console.log(`🔍 Removing items from ${team2.teamName}'s wishlist that they gave away`);
      
      for (const gaveItem of team2GaveItems) {
        console.log(`⚡ Removing ${gaveItem.name} (quantity: ${gaveItem.quantity}) from ${team2.teamName}'s wishlist`);
        
        // Find and update the wishlist directly in MongoDB
        const updateResult = await collection.updateOne(
          {
            teamCode: team2.teamCode,
            status: 'active',
            round: 3,
            'itemsToTrade.name': gaveItem.name
          },
          {
            $inc: { 'itemsToTrade.$.count': -gaveItem.quantity }
          }
        );

        console.log(`📊 Update result for ${gaveItem.name} in ${team2.teamName}'s wishlist:`, updateResult);

        if (updateResult.matchedCount > 0 && updateResult.modifiedCount > 0) {
          console.log(`✅ Successfully reduced ${gaveItem.name} by ${gaveItem.quantity} in ${team2.teamName}'s wishlist`);
          
          // Remove items with count <= 0
          const removeResult = await collection.updateOne(
            {
              teamCode: team2.teamCode,
              status: 'active',
              round: 3
            },
            {
              $pull: { 'itemsToTrade': { 'count': { $lte: 0 } } }
            }
          );
          
          console.log(`🗑️ Removed zero/negative count items result:`, removeResult);
          
          // Recalculate total items
          const wishlist = await collection.findOne({
            teamCode: team2.teamCode,
            status: 'active',
            round: 3
          });
          
          if (wishlist) {
            const newTotal = wishlist.itemsToTrade.reduce((sum, item) => sum + (item.count || 0), 0);
            await collection.updateOne(
              {
                teamCode: team2.teamCode,
                status: 'active',
                round: 3
              },
              {
                $set: { totalItems: newTotal }
              }
            );
            console.log(`📊 Updated total items for ${team2.teamName} to: ${newTotal}`);
          }
        } else {
          console.log(`⚠️ Item ${gaveItem.name} not found in ${team2.teamName}'s wishlist or already at zero`);
        }
      }
    }

    // Final verification - show updated wishlists
    const team1UpdatedWishlist = await collection.findOne({
      teamCode: team1.teamCode,
      status: 'active',
      round: 3
    });
    
    const team2UpdatedWishlist = await collection.findOne({
      teamCode: team2.teamCode,
      status: 'active',
      round: 3
    });

    console.log(`🎯 ${team1.teamName} updated wishlist:`, team1UpdatedWishlist ? team1UpdatedWishlist.itemsToTrade.map(item => `${item.name} (${item.count})`) : 'No wishlist found');
    console.log(`🎯 ${team2.teamName} updated wishlist:`, team2UpdatedWishlist ? team2UpdatedWishlist.itemsToTrade.map(item => `${item.name} (${item.count})`) : 'No wishlist found');

    console.log('🚀 DIRECT WISHLIST UPDATE COMPLETED SUCCESSFULLY 🚀');
  } catch (error) {
    console.error('❌ CRITICAL ERROR updating trade wishlists:', error);
    console.error('❌ Stack trace:', error.stack);
    // Don't throw error - trade should still succeed even if wishlist update fails
  }
};

// Execute a trade between two teams
const executeTrade = async (req, res) => {
  try {
    console.log('🚨🚨🚨 TRADE EXECUTION ENDPOINT HIT!!! 🚨🚨🚨');
    console.log('🚨 Request method:', req.method);
    console.log('🚨 Request path:', req.path);
    console.log('🚨 Request URL:', req.url);
    console.log('🚨 Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('🚨 Trade execution request body:', JSON.stringify(req.body, null, 2));
    
    const {
      tradeId,
      round = 3, // Default to round 3 if not specified
      teamOne,
      teamTwo,
      teamOneGives,
      teamTwoGives,
      executedBy
    } = req.body;

    // Validate required fields
    if (!tradeId || !teamOne || !teamTwo || !teamOneGives || !teamTwoGives) {
      console.log('Missing required fields:', { tradeId, teamOne, teamTwo, teamOneGives, teamTwoGives });
      return res.status(400).json({
        success: false,
        message: 'Missing required trade information'
      });
    }

    // Validate team codes
    if (!teamOne.teamCode || !teamTwo.teamCode) {
      console.log('Missing team codes:', { teamOneCode: teamOne.teamCode, teamTwoCode: teamTwo.teamCode });
      return res.status(400).json({
        success: false,
        message: 'Team codes are required'
      });
    }

    // Fetch both teams from database using team codes
    const team1 = await Team.findOne({ teamCode: teamOne.teamCode });
    const team2 = await Team.findOne({ teamCode: teamTwo.teamCode });

    if (!team1 || !team2) {
      console.log('Teams not found:', { team1Found: !!team1, team2Found: !!team2 });
      return res.status(404).json({
        success: false,
        message: `Team(s) not found: ${!team1 ? teamOne.teamCode : ''} ${!team2 ? teamTwo.teamCode : ''}`
      });
    }

    console.log('Team 1 found:', team1.teamName);
    console.log('Team 2 found:', team2.teamName);
    console.log('TeamOneGives from request:', JSON.stringify(teamOneGives, null, 2));
    console.log('TeamTwoGives from request:', JSON.stringify(teamTwoGives, null, 2));

    // Validate team1 has sufficient resources
    if (teamOneGives.items) {
      for (const item of teamOneGives.items) {
        const currentQuantity = team1.resources.get(item.name) || 0;
        if (currentQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `${team1.teamName} doesn't have enough ${item.name}. Required: ${item.quantity}, Available: ${currentQuantity}`
          });
        }
      }
    }

    // Validate team1 has sufficient money
    if (teamOneGives.money > 0 && team1.balance < teamOneGives.money) {
      return res.status(400).json({
        success: false,
        message: `${team1.teamName} doesn't have enough money. Required: ${teamOneGives.money}, Available: ${team1.balance}`
      });
    }

    // Validate team2 has sufficient resources
    if (teamTwoGives.items) {
      for (const item of teamTwoGives.items) {
        const currentQuantity = team2.resources.get(item.name) || 0;
        if (currentQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `${team2.teamName} doesn't have enough ${item.name}. Required: ${item.quantity}, Available: ${currentQuantity}`
          });
        }
      }
    }

    // Validate team2 has sufficient money
    if (teamTwoGives.money > 0 && team2.balance < teamTwoGives.money) {
      return res.status(400).json({
        success: false,
        message: `${team2.teamName} doesn't have enough money. Required: ${teamTwoGives.money}, Available: ${team2.balance}`
      });
    }

    // Execute the trade - Update team1 inventory
    if (teamOneGives.items) {
      for (const item of teamOneGives.items) {
        const currentQuantity = team1.resources.get(item.name) || 0;
        team1.resources.set(item.name, currentQuantity - item.quantity);
      }
    }
    if (teamOneGives.money > 0) {
      team1.credit -= teamOneGives.money;
    }

    // Give team1 what team2 is offering
    if (teamTwoGives.items) {
      for (const item of teamTwoGives.items) {
        const currentQuantity = team1.resources.get(item.name) || 0;
        team1.resources.set(item.name, currentQuantity + item.quantity);
      }
    }
    if (teamTwoGives.money > 0) {
      team1.credit += teamTwoGives.money;
    }

    // Execute the trade - Update team2 inventory
    if (teamTwoGives.items) {
      for (const item of teamTwoGives.items) {
        const currentQuantity = team2.resources.get(item.name) || 0;
        team2.resources.set(item.name, currentQuantity - item.quantity);
      }
    }
    if (teamTwoGives.money > 0) {
      team2.credit -= teamTwoGives.money;
    }

    // Give team2 what team1 is offering
    if (teamOneGives.items) {
      for (const item of teamOneGives.items) {
        const currentQuantity = team2.resources.get(item.name) || 0;
        team2.resources.set(item.name, currentQuantity + item.quantity);
      }
    }
    if (teamOneGives.money > 0) {
      team2.credit += teamOneGives.money;
    }

    // Save updated teams
    await team1.save();
    await team2.save();

    // Create trade record
    console.log('Creating trade record with data:', {
      tradeId,
      teamOneGives: JSON.stringify(teamOneGives, null, 2),
      teamTwoGives: JSON.stringify(teamTwoGives, null, 2)
    });
    
    const tradeRecord = new TradeHistory({
      tradeId,
      round,
      teamOne: {
        teamId: team1._id, // Use ObjectId
        teamName: team1.teamName,
        teamCode: team1.teamCode
      },
      teamTwo: {
        teamId: team2._id, // Use ObjectId
        teamName: team2.teamName,
        teamCode: team2.teamCode
      },
      teamOneGives,
      teamTwoGives,
      executedBy
    });

    await tradeRecord.save();

    // Update trade wishlists - remove traded items
    console.log('🎯 About to update trade wishlists...');
    console.log('🎯 Team1 (', team1.teamName, ') gave:', teamOneGives.items);
    console.log('🎯 Team2 (', team2.teamName, ') gave:', teamTwoGives.items);
    await updateTradeWishlists(team1, team2, teamOneGives.items, teamTwoGives.items);

    // Broadcast real-time update with AGGRESSIVE SOCKET BROADCASTING
    const io = req.app.get('socketio');
    if (io) {
      console.log('📡 Socket.IO found, broadcasting MULTIPLE trade update events...');
      
      const tradeUpdate = {
        tradeId,
        teams: [team1.teamNumber || team1._id, team2.teamNumber || team2._id],
        teamCodes: [team1.teamCode, team2.teamCode],
        timestamp: new Date().toISOString()
      };
      
      // Broadcast to ALL clients with multiple event types
      console.log('📡 Broadcasting to ALL clients...');
      io.emit('tradeExecuted', tradeUpdate);
      io.emit('tradeWishlistUpdated', {
        message: 'Trade wishlists updated after trade execution',
        affectedTeams: [team1.teamCode, team2.teamCode],
        timestamp: new Date().toISOString()
      });
      io.emit('wishlistRefresh', {
        affectedTeams: [team1.teamCode, team2.teamCode],
        timestamp: new Date().toISOString()
      });
      io.emit('teamDataUpdated', {
        updatedTeams: [team1.teamCode, team2.teamCode],
        timestamp: new Date().toISOString()
      });
      io.emit('forceWishlistReload', {
        teams: [team1.teamCode, team2.teamCode]
      });
      
      // Also notify specific team rooms if they exist
      io.to(`team_${team1.teamNumber || team1._id}`).emit('tradeExecuted', tradeUpdate);
      io.to(`team_${team2.teamNumber || team2._id}`).emit('tradeExecuted', tradeUpdate);
      
      // Notify all admins
      io.emit('adminTradeUpdate', tradeRecord);
      
      console.log('📡 ALL socket events emitted successfully - wishlists should refresh now!');
    } else {
      console.log('❌ Socket.IO not found - real-time updates unavailable');
    }

    res.json({
      success: true,
      message: 'Trade executed successfully',
      trade: tradeRecord,
      updatedTeams: {
        team1: { 
          teamName: team1.teamName, 
          balance: team1.balance, 
          resources: Object.fromEntries(team1.resources)
        },
        team2: { 
          teamName: team2.teamName, 
          balance: team2.balance, 
          resources: Object.fromEntries(team2.resources)
        }
      }
    });

  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({
      success: false,
      message: 'Server error executing trade',
      error: error.message
    });
  }
};

// Get all trades
const getAllTrades = async (req, res) => {
  try {
    const trades = await TradeHistory.find()
      .sort({ createdAt: -1 })
      .limit(100); // Limit to recent 100 trades

    res.json({
      success: true,
      trades
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trades',
      error: error.message
    });
  }
};

// Get trades for a specific team
const getTeamTrades = async (req, res) => {
  try {
    const { teamNumber } = req.params;
    
    const trades = await TradeHistory.find({
      $or: [
        { 'teamOne.teamNumber': parseInt(teamNumber) },
        { 'teamTwo.teamNumber': parseInt(teamNumber) }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      trades
    });
  } catch (error) {
    console.error('Error fetching team trades:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team trades',
      error: error.message
    });
  }
};

// Get trade statistics
const getTradeStats = async (req, res) => {
  try {
    const totalTrades = await TradeHistory.countDocuments();
    const completedTrades = await TradeHistory.countDocuments({ status: 'completed' });
    
    // Get most active teams
    const teamActivity = await TradeHistory.aggregate([
      {
        $facet: {
          teamOne: [
            { $group: { _id: '$teamOne.teamNumber', count: { $sum: 1 }, teamName: { $first: '$teamOne.teamName' } } }
          ],
          teamTwo: [
            { $group: { _id: '$teamTwo.teamNumber', count: { $sum: 1 }, teamName: { $first: '$teamTwo.teamName' } } }
          ]
        }
      },
      {
        $project: {
          combined: { $concatArrays: ['$teamOne', '$teamTwo'] }
        }
      },
      { $unwind: '$combined' },
      {
        $group: {
          _id: '$combined._id',
          totalTrades: { $sum: '$combined.count' },
          teamName: { $first: '$combined.teamName' }
        }
      },
      { $sort: { totalTrades: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        totalTrades,
        completedTrades,
        mostActiveTeams: teamActivity
      }
    });
  } catch (error) {
    console.error('Error fetching trade stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trade statistics',
      error: error.message
    });
  }
};

// Submit trade for Round 2 Mystery Box rewards
const submitTrade = async (req, res) => {
  try {
    console.log('Mystery box trade submission:', JSON.stringify(req.body, null, 2));
    
    const {
      teamId,
      teamName,
      bidAmount,
      deductionAmount,
      cashReward,
      cashMultiplier,
      mysteryBoxReward,
      rewardType,
      resources,
      round,
      tradeType
    } = req.body;

    // Validate required fields
    if (!teamId || !teamName || !bidAmount) {
      return res.status(400).json({
        success: false,
        message: 'Team ID, team name, and bid amount are required'
      });
    }

    // Find the team by teamCode (case-insensitive)
    const team = await Team.findOne({ 
      teamCode: { $regex: new RegExp(`^${teamId}$`, 'i') }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: `Team not found with ID: ${teamId}`
      });
    }

    // Check if team has sufficient balance for deduction
    const currentBalance = team.credit - team.debit;
    if (deductionAmount && currentBalance < deductionAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: ₹${deductionAmount.toLocaleString()}, Available: ₹${currentBalance.toLocaleString()}`
      });
    }

    console.log(`Team ${team.teamName} balance before transaction:`, {
      credit: team.credit,
      debit: team.debit,
      balance: currentBalance
    });

    // Update team balance using credit/debit system
    if (deductionAmount) {
      team.debit += deductionAmount; // Increase debit when spending money
    }
    if (cashReward) {
      team.credit += cashReward; // Increase credit when gaining money
    }

    // Update team resources
    if (resources && (rewardType === 'resources' || rewardType === 'challenge')) {
      Object.entries(resources).forEach(([resourceName, amount]) => {
        if (amount > 0) {
          const currentAmount = team.resources.get(resourceName) || 0;
          team.resources.set(resourceName, currentAmount + amount);
          console.log(`Added ${amount} ${resourceName} to team ${team.teamName}. New total: ${currentAmount + amount}`);
        }
      });
    }

    // Save team updates
    await team.save();

    // Calculate final balance after transaction
    const finalBalance = team.credit - team.debit;
    
    console.log(`Team ${team.teamName} balance after transaction:`, {
      credit: team.credit,
      debit: team.debit,
      balance: finalBalance,
      balanceChange: finalBalance - currentBalance
    });

    // Create bid history record
    const bidHistoryData = {
      round: round || 2,
      teamCode: team.teamCode,
      teamName: team.teamName,
      bidAmount: bidAmount,
      mysteryBoxReward: mysteryBoxReward,
      rewardType: rewardType,
      deductionAmount: deductionAmount || 0,
      cashReward: cashReward || 0,
      cashMultiplier: cashMultiplier || 1,
      resourcesGained: {},
      balanceAfter: finalBalance,
      creditAfter: team.credit,
      debitAfter: team.debit,
      tradeType: tradeType || 'mystery_box_reward'
    };

    // Add resources to bid history
    if (resources && (rewardType === 'resources' || rewardType === 'challenge')) {
      Object.entries(resources).forEach(([resourceName, amount]) => {
        if (amount > 0) {
          bidHistoryData.resourcesGained[resourceName] = amount;
        }
      });
    }

    const bidHistory = new BidHistory(bidHistoryData);
    await bidHistory.save();

    // Create trade history record
    const tradeHistoryData = {
      tradeId: `R2_${team.teamCode}_${Date.now()}`,
      round: round || 2,
      teamOne: {
        teamCode: team.teamCode,
        teamName: team.teamName,
        teamNumber: team.teamCode
      },
      teamTwo: {
        teamCode: 'SYSTEM',
        teamName: 'Mystery Box System',
        teamNumber: 'SYS'
      },
      teamOneGives: {
        money: deductionAmount || 0,
        items: []
      },
      teamTwoGives: {
        money: cashReward || 0,
        items: []
      },
      mysteryBoxData: {
        reward: mysteryBoxReward,
        rewardType: rewardType,
        cashMultiplier: cashMultiplier || 1,
        resourcesGained: bidHistoryData.resourcesGained
      },
      status: 'completed',
      executedBy: req.user?.userId || 'admin',
      executedAt: new Date()
    };

    // Add resources to trade history
    if (resources && (rewardType === 'resources' || rewardType === 'challenge')) {
      const resourceItems = Object.entries(resources)
        .filter(([name, amount]) => amount > 0)
        .map(([name, amount]) => ({ name, quantity: amount }));
      tradeHistoryData.teamTwoGives.items = resourceItems;
    }

    const tradeHistory = new TradeHistory(tradeHistoryData);
    await tradeHistory.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('tradeCompleted', {
        teamCode: team.teamCode,
        teamName: team.teamName,
        round: round || 2,
        mysteryBoxReward: mysteryBoxReward,
        rewardType: rewardType,
        balanceChange: finalBalance - currentBalance,
        newBalance: finalBalance,
        newCredit: team.credit,
        newDebit: team.debit,
        resourcesGained: bidHistoryData.resourcesGained
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mystery box reward processed successfully',
      data: {
        teamName: team.teamName,
        balanceChange: finalBalance - currentBalance,
        newBalance: finalBalance,
        newCredit: team.credit,
        newDebit: team.debit,
        resourcesGained: bidHistoryData.resourcesGained,
        bidHistory: bidHistoryData,
        tradeHistory: tradeHistoryData
      }
    });

  } catch (error) {
    console.error('Error submitting mystery box trade:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing mystery box reward',
      error: error.message
    });
  }
};

module.exports = {
  executeTrade,
  getAllTrades,
  getTeamTrades,
  getTradeStats,
  submitTrade
};