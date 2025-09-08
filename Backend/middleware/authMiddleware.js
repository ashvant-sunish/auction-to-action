const jwt = require('jsonwebtoken');

/**
 * Middleware to protect admin-only routes.
 */
exports.protectAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('🔐 Auth Debug - Token received:', token ? 'Present' : 'Missing');
    
    if (!token) {
        console.log('❌ Auth Debug - No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        console.log('✅ Auth Debug - Token decoded successfully:', decoded);
        
        if (decoded.role !== 'admin') {
            console.log('❌ Auth Debug - User role is not admin:', decoded.role);
            return res.status(403).json({ message: 'Forbidden, not an admin' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.log('❌ Auth Debug - Token verification failed:', error.message);
        res.status(401).json({ message: 'Token is invalid' });
    }
};

/**
 * Middleware to protect team-only routes.
 */
exports.protectTeam = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'participant') {
            return res.status(403).json({ message: 'Forbidden, not a participant' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid' });
    }
};