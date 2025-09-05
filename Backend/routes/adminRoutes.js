const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const adminController = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

// --- Admin Authentication Routes ---

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }
        const existingAdmin = await AdminUser.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new AdminUser({ username, password: hashedPassword });
        await admin.save();
        res.status(201).json({ message: 'Admin user created successfully.' });
    } catch (error) {
        // ✅ CORRECT PLACEMENT: Inside the catch block
        console.error("ERROR CREATING ADMIN:", error); 
        res.status(500).json({ message: 'Server error while creating admin.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await AdminUser.findOne({ username });

        if (admin && (await bcrypt.compare(password, admin.password))) {
            const token = jwt.sign(
                { userId: admin._id, role: admin.role },
                process.env.ADMIN_JWT_SECRET,
                { expiresIn: '8h' }
            );
            res.json({ message: 'Admin login successful!', token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("ERROR LOGGING IN ADMIN:", error); // Also added here for good measure
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Admin User Management Routes (CRUD) ---
router.get('/admins', protectAdmin, adminController.getAllAdmins);
router.post('/admins', protectAdmin, adminController.addAdmin);
router.put('/admins/:id', protectAdmin, adminController.updateAdmin);
router.delete('/admins/:id', protectAdmin, adminController.deleteAdmin);

// --- Team Data Route for Admin ---
router.get('/teams', protectAdmin, adminController.getAllTeams);

// --- Game Management Routes ---
router.post('/award-bid', protectAdmin, adminController.awardBid);
router.post('/execute-trade', protectAdmin, adminController.executeTrade);

// --- Transaction History Route ---
router.get('/transactions', protectAdmin, adminController.getFullTransactionHistory);
router.put('/transactions/:id', protectAdmin, adminController.updateTransaction);
router.delete('/transactions/:id', protectAdmin, adminController.deleteTransaction);

module.exports = router;