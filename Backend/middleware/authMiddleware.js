const jwt = require('jsonwebtoken');

/**
 * Middleware to protect admin-only routes.
 * It checks for a valid JWT in the Authorization header.
 */
exports.protectAdmin = (req, res, next) => {
    [1];
    
    if (!token) {
        .json({ message: 'Not authorized, no token provided.' });
    }
    
    
        
        