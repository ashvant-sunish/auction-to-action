const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AdminUser = require('../models/AdminUser');
const adminController = require('../controllers/adminController'); // Import game logic controller

/**
 * Middleware to protect admin-only routes.
 * It checks for a valid JWT with an 'admin' role.
 */
const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden, not an admin' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid' });
    }
};


// --- Admin Authentication Routes ---

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingAdmin = await AdminUser.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new AdminUser({ username, password: hashedPassword });
        await admin.save();
        res.status(201).json({ message: 'Admin user created.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await AdminUser.findOne({ username });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = jwt.sign({ userId: admin._id, role: admin.role }, process.env.ADMIN_JWT_SECRET, { expiresIn: '8h' });
      res.json({ message: 'Admin login successful!', token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard', protectAdmin, (req, res) => {
    const dashboardData = {
      message: 'Welcome to the Admin Dashboard!',
      adminUserId: req.user.userId,
    };
    res.json(dashboardData);
});


// --- Game Management Routes ---

router.post('/award-bid', protectAdmin, adminController.awardBid);
// Add this new route inside the "Game Management Routes" section

router.post('/manual-adjust', protectAdmin, adminController.manualAdjustTeam);
router.get('/transactions', protectAdmin, adminController.getFullTransactionHistory);
module.exports = router;