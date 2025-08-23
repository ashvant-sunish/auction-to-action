const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminusers = require('../models/AdminUser');

const router = express.Router();

const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });
    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid' });
    }
};

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingAdmin = await adminusers.findOne({ username });
        if (existingAdmin) return res.status(400).json({ message: 'Admin already exists.' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new adminusers({ username, password: hashedPassword });
        await admin.save();
        res.status(201).json({ message: 'Admin user created.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log({ username, password });
    const admin = await adminusers.findOne({ username });

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
      adminusersId: req.user.userId,
    };
    res.json(dashboardData);
});

module.exports = router;
