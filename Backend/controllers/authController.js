const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const Team = require('../models/Team');

// --- ADMIN AUTH ---

/**
 * Registers a new Admin user.
 */
exports.registerAdmin = async (req, res) => {
    try {
        const { username, password, role = 'admin' } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }
        
        // Validate role
        if (role && !['admin', 'superadmin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be either "admin" or "superadmin".' });
        }
        
        const existingAdmin = await AdminUser.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with that username already exists.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new AdminUser({ username, password: hashedPassword, role });
        
        await admin.save();
        
        res.status(201).json({ 
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully.`,
            role: admin.role 
        });
    } catch (error) {
        console.error("ERROR CREATING ADMIN:", error); 
        res.status(500).json({ message: 'Server error while creating admin.' });
    }
};

/**
 * Logs in an Admin user.
 */
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await AdminUser.findOne({ username });

        if (admin && (await bcrypt.compare(password, admin.password))) {
            const token = jwt.sign(
                { userId: admin._id, role: admin.role },
                process.env.ADMIN_JWT_SECRET,
                { expiresIn: '8h' }
            );
            res.json({ 
                message: 'Admin login successful!', 
                token,
                user: {
                    id: admin._id,
                    username: admin.username,
                    role: admin.role
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("ERROR LOGGING IN ADMIN:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
// --- TEAM AUTH ---

/**
 * Logs in a Team.
 */
exports.loginTeam = async (req, res) => {
  try {
    const { teamCode, password } = req.body;
    const team = await Team.findOne({ teamCode });

    if (!team) {
      return res.status(401).json({ message: 'Invalid Team Code or Password.' });
    }

    // 🔹 Check if team is active
    if (team.isActive === false) {
      return res.status(403).json({ message: 'This team is currently deactivated by the Admin.' });
    }

    if (await bcrypt.compare(password, team.password)) {
      const token = jwt.sign(
        { teamId: team._id, teamCode: team.teamCode, role: 'participant' },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.status(200).json({ message: 'Login successful!', token });
    } else {
      res.status(401).json({ message: 'Invalid Team Code or Password.' });
    }
  } catch (error) {
    console.error("❌ Error logging in team:", error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

