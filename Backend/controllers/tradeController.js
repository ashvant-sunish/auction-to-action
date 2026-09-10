// controllers/tradeController.js

const TradeHistory = require('../models/TradeHistory');
const Team = require('../models/Team');
const BidHistory = require('../models/BidHistory');
const TradeWishlist = require('../models/TradeWishlist');
const { formatResourcesList, formatTradeTransfer, sendTargetedNotification } = require('../utils/notificationHelper');

// CORRECT APPROACH - Remove traded items from the GIVING team's wishlist
const updateTradeWishlists = async (team1, team2, team1GaveItems, team2GaveItems) => {
  try {
    
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collection = db.collection('tradelistings');

    // Remove items from team1's wishlist that they GAVE AWAY
    if (team1GaveItems && team1GaveItems.length > 0) {
      
      for (const gaveItem of team1GaveItems) {
        
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

        
        if (updateResult.matchedCount > 0 && updateResult.modifiedCount > 0) {
          
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
          }
        }
      }
    }

    // Remove items from team2's wishlist that they GAVE AWAY
    if (team2GaveItems && team2GaveItems.length > 0) {
      
      for (const gaveItem of team2GaveItems) {  
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

        if (updateResult.matchedCount > 0 && updateResult.modifiedCount > 0) {          
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
          }
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

  } catch (error) {
    console.error(' CRITICAL ERROR updating trade wishlists:', error);
    console.error(' Stack trace:', error.stack);
    // Don't throw error - trade should still succeed even if wishlist update fails
  }
};

// Execute a trade between two teams
const executeTrade = async (req, res) => {
  try {
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
      return res.status(400).json({
        success: false,
        message: 'Missing required trade information'
      });
    }

    // Validate team codes
    if (!teamOne.teamCode || !teamTwo.teamCode) {
        return res.status(400).json({
        success: false,
        message: 'Team codes are required'
      });
    }

    // Fetch both teams from database using team codes
    const team1 = await Team.findOne({ teamCode: teamOne.teamCode });
    const team2 = await Team.findOne({ teamCode: teamTwo.teamCode });

    if (!team1 || !team2) {
      return res.status(404).json({
        success: false,
        message: `Team(s) not found: ${!team1 ? teamOne.teamCode : ''} ${!team2 ? teamTwo.teamCode : ''}`
      });
    }

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
    await updateTradeWishlists(team1, team2, teamOneGives.items, teamTwoGives.items);

    // Broadcast real-time update with AGGRESSIVE SOCKET BROADCASTING
    const io = req.app.get('socketio');
    if (io) {
      const tradeUpdate = {
        tradeId,
        teams: [team1.teamNumber || team1._id, team2.teamNumber || team2._id],
        teamCodes: [team1.teamCode, team2.teamCode],
        timestamp: new Date().toISOString()
      };
      
      // Broadcast to ALL clients with multiple event types
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
      
      // Also notify specific team rooms
      io.to(`team_${team1.teamCode}`).emit('tradeExecuted', tradeUpdate);
      io.to(`team_${team2.teamCode}`).emit('tradeExecuted', tradeUpdate);
      io.to(`team_${team1.teamCode}`).emit('teamUpdated', team1);
      io.to(`team_${team2.teamCode}`).emit('teamUpdated', team2);
      
      // Notify all admins
      io.emit('adminTradeUpdate', tradeRecord);

      // --- TARGETED NOTIFICATIONS (ROUND 3 TRADES) ---
      const gaveTeam1 = formatTradeTransfer(teamOneGives);
      const receivedTeam1 = formatTradeTransfer(teamTwoGives);

      const notifTeam1 = `Trade Completed\nYour trade with ${team2.teamName} was successful.\nYou gave: ${gaveTeam1}\nYou received: ${receivedTeam1}\nYour inventory and balance have been updated.`;
      const notifTeam2 = `Trade Completed\nYour trade with ${team1.teamName} was successful.\nYou gave: ${receivedTeam1}\nYou received: ${gaveTeam1}\nYour inventory and balance have been updated.`;

      // Target Team 1 strictly
      await sendTargetedNotification(io, {
        teamCode: team1.teamCode,
        teamName: team1.teamName,
        title: 'Trade Completed',
        message: notifTeam1,
        round: 3,
        type: 'TRADE_COMPLETED',
        data: {
          tradeId,
          partnerTeamCode: team2.teamCode,
          partnerTeamName: team2.teamName,
          gave: teamOneGives,
          received: teamTwoGives
        }
      });

      // Target Team 2 strictly
      await sendTargetedNotification(io, {
        teamCode: team2.teamCode,
        teamName: team2.teamName,
        title: 'Trade Completed',
        message: notifTeam2,
        round: 3,
        type: 'TRADE_COMPLETED',
        data: {
          tradeId,
          partnerTeamCode: team1.teamCode,
          partnerTeamName: team1.teamName,
          gave: teamTwoGives,
          received: teamOneGives
        }
      });
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
        }
      });
    }

    // Save team updates
    await team.save();

    // Calculate final balance after transaction
    const finalBalance = team.credit - team.debit;

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
    const io = req.app.get('io') || req.app.get('socketio');
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

      io.to(`team_${team.teamCode}`).emit('teamUpdated', team);

      // --- TARGETED NOTIFICATION (ROUND 2 MYSTERY BOX) ---
      const formattedResources = formatResourcesList(bidHistoryData.resourcesGained);
      const resourceSection = formattedResources 
        ? `\n\nResources acquired:\n${formattedResources}` 
        : '';
      
      let rewardText = mysteryBoxReward ? ` (${mysteryBoxReward})` : '';
      if (cashReward > 0) {
        rewardText += ` [Cash Reward: ₹${Number(cashReward).toLocaleString('en-IN')}]`;
      }

      const notifMessage = `You won Mystery Box${rewardText} for ₹${Number(bidAmount).toLocaleString('en-IN')}.${resourceSection}\n\n(If balance is not updated, kindly refresh the page)`;

      await sendTargetedNotification(io, {
        teamCode: team.teamCode,
        teamName: team.teamName,
        title: 'Mystery Box Won',
        message: notifMessage,
        round: Number(round) || 2,
        type: 'MYSTERY_BOX',
        data: {
          mysteryBoxReward,
          bidAmount,
          cashReward,
          deductionAmount,
          resourcesGained: bidHistoryData.resourcesGained,
          bidHistoryId: bidHistory._id
        }
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