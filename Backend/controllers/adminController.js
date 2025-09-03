const Team = require('../models/Team');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const AdminUser = require('../models/AdminUser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // Needed for tradeId and aggregation

// --- ⚠️ SECURITY NOTE ---
// Passwords are one-way hashed. We will NEVER send them back to the frontend.
// The frontend should show '********' or simply not have a password column.

// --- ADMIN MANAGEMENT (CRUD) ---

exports.getAllAdmins = async (req, res) => {
  try {
    // .select('-password') explicitly removes the password field from the response
    const admins = await AdminUser.find({}).select('-password');
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching admins.' });
  }
};

exports.addAdmin = async (req, res) => {
  try {
    const { username, password } = req.body; // Frontend sends 'name', let's use it as username
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


// --- TEAM MANAGEMENT (CRUD) ---

exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find({}).populate('inventory', 'name');
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching teams.' });
    }
};

// ... add/update/delete functions for Teams can be added here following the admin pattern if needed...


// --- GAME LOGIC ---

exports.awardBid = async (req, res) => {
  try {
    const { teamNumber, itemId, price, round } = req.body;
    if (!teamNumber || !itemId || price == null || !round) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const team = await Team.findOne({ teamNumber });
    const item = await Item.findById(itemId);
    if (!team || !item) return res.status(404).json({ message: 'Team or Item not found.' });
    
    if (team.balance < price) {
      return res.status(400).json({ message: `Team's balance of ${team.balance} is too low.` });
    }

    team.debit += Number(price);
    team.inventory.push(itemId);
    await team.save();
    
    item.highestBidAmount = price;
    await item.save();

    const newTransaction = new Transaction({
      type: 'Bid',
      teamId: team._id,
      itemId: item._id,
      amount: price,
      round: round,
      notes: `Team #${teamNumber} won ${item.name} for ${price} in round ${round}`
    });
    await newTransaction.save();
    
    res.status(200).json({ message: `Successfully awarded item.`, updatedBalance: team.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error while awarding bid.', error: error.message });
  }
};

exports.executeTrade = async (req, res) => {
    try {
        const { teamOne, teamTwo } = req.body;

        const teamA = await Team.findOne({ teamNumber: teamOne.teamNumber });
        const teamB = await Team.findOne({ teamNumber: teamTwo.teamNumber });

        if (!teamA || !teamB) {
            return res.status(404).json({ message: 'One or both teams not found.' });
        }

        const teamA_itemsToSend = teamOne.itemsToSend || [];
        const teamA_moneyToSend = Number(teamOne.moneyToSend) || 0;
        const teamB_itemsToSend = teamTwo.itemsToSend || [];
        const teamB_moneyToSend = Number(teamTwo.moneyToSend) || 0;

        // Validation... (Ensure teams have items and balance)
        
        // --- Execute Trade ---
        teamA.debit += teamA_moneyToSend;
        teamB.credit += teamA_moneyToSend;
        teamB.debit += teamB_moneyToSend;
        teamA.credit += teamB_moneyToSend;

        teamA.inventory = teamA.inventory.filter(item => !teamA_itemsToSend.includes(item.toString()));
        teamB.inventory = teamB.inventory.filter(item => !teamB_itemsToSend.includes(item.toString()));
        teamA.inventory.push(...teamB_itemsToSend);
        teamB.inventory.push(...teamA_itemsToSend);

        await teamA.save();
        await teamB.save();

        // --- MODIFIED: Link transactions with a common tradeId ---
        const newTradeId = new mongoose.Types.ObjectId();
        const notesA = `Sent ${teamA_itemsToSend.length} items and ${teamA_moneyToSend} currency to Team ${teamB.teamNumber}. Received ${teamB_itemsToSend.length} items and ${teamB_moneyToSend} currency.`;
        const notesB = `Sent ${teamB_itemsToSend.length} items and ${teamB_moneyToSend} currency to Team ${teamA.teamNumber}. Received ${teamA_itemsToSend.length} items and ${teamA_moneyToSend} currency.`;

        const transactionA = new Transaction({ type: 'Trade', teamId: teamA._id, amount: teamA_moneyToSend, round: 3, notes: notesA, tradeId: newTradeId });
        const transactionB = new Transaction({ type: 'Trade', teamId: teamB._id, amount: teamB_moneyToSend, round: 3, notes: notesB, tradeId: newTradeId });
        await Transaction.insertMany([transactionA, transactionB]);

        res.status(200).json({ message: 'Trade executed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during trade.', error: error.message });
    }
};

// --- MODIFIED: Now handles all rounds and formats Round 3 data for your UI ---
exports.getFullTransactionHistory = async (req, res) => {
  try {
    const { round } = req.query;
    if (!round) return res.status(400).json({ message: 'Round query parameter is required.' });

    let transactions;

    if (round === '3') {
        // For Round 3, we use aggregation to group trades together for the UI
        transactions = await Transaction.aggregate([
            { $match: { round: 3, type: 'Trade' } },
            { $sort: { timestamp: 1 } },
            { $group: {
                _id: "$tradeId",
                transactions: { $push: "$$ROOT" },
                timestamp: { $first: "$timestamp" }
            }},
            { $sort: { timestamp: -1 } },
        ]);

        // Now, populate the references manually since aggregate doesn't do it
        const populatedTransactions = await Transaction.populate(transactions, {
            path: 'transactions.teamId',
            select: 'teamNumber'
        });

        // Format the data exactly as the RoundThree.BidHistory.jsx component expects
        const formattedTrades = populatedTransactions.map(tradeGroup => {
            const t1 = tradeGroup.transactions[0];
            const t2 = tradeGroup.transactions[1];
            return {
                _id: tradeGroup._id, // This is the tradeId
                team_one: t1.teamId.teamNumber,
                team_two: t2.teamId.teamNumber,
                notes: `Trade between Team ${t1.teamId.teamNumber} and ${t2.teamId.teamNumber}`, // A summary note
                timestamp: tradeGroup.timestamp
            };
        });
        return res.status(200).json(formattedTrades);
        
    } else {
        // For Rounds 1 and 2, a simple find is enough
        transactions = await Transaction.find({ round: Number(round) })
            .sort({ timestamp: -1 })
            .populate('teamId', 'teamNumber')
            .populate('itemId', 'name');
        return res.status(200).json(transactions);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching history.', error: error.message });
  }
};

exports.updateTransaction = async (req, res) => { /* ... logic ... */ };
exports.deleteTransaction = async (req, res) => { /* ... logic ... */ };