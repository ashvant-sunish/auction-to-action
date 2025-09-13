// controllers/tradeController.js

const TradeHistory = require('../models/TradeHistory');
const Team = require('../models/Team');

// Execute a trade between two teams
const executeTrade = async (req, res) => {
  try {
    console.log('Trade execution request body:', JSON.stringify(req.body, null, 2)); // Debug log
    
    const {
      tradeId,
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

    console.log('Teams found:', { team1Name: team1.teamName, team2Name: team2.teamName });

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
      tradeDetails: {
        teamOneGives,
        teamTwoGives
      },
      executedBy
    });

    await tradeRecord.save();

    // Broadcast real-time update
    const io = req.app.get('socketio');
    if (io) {
      const tradeUpdate = {
        tradeId,
        teams: [team1.teamNumber || team1._id, team2.teamNumber || team2._id],
        teamCodes: [team1.teamCode, team2.teamCode],
        timestamp: new Date().toISOString()
      };
      
      // Notify specific teams using team numbers/IDs
      io.to(`team_${team1.teamNumber || team1._id}`).emit('tradeExecuted', tradeUpdate);
      io.to(`team_${team2.teamNumber || team2._id}`).emit('tradeExecuted', tradeUpdate);
      
      // Notify all admins
      io.emit('adminTradeUpdate', tradeRecord);
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

module.exports = {
  executeTrade,
  getAllTrades,
  getTeamTrades,
  getTradeStats
};