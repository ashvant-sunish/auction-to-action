const jwt = require('jsonwebtoken');

/**
 * Middleware to protect admin-only routes.
 * It checks for a valid JWT in the Authorization header.
 */
exports.protectAdmin = (req, res, next) => {
    // Token is expected to be sent as "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
    
    try {
        // Verify the token using the admin-specific secret key
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        
        // Check if the user has the 'admin' role
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Access is restricted to admins.' });
        }
        
        // Attach the decoded user payload to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or has expired.' });
    }
};

/**
 * Middleware to protect team-only routes.
 * It checks for a valid JWT in the Authorization header.
 */
exports.protectTeam = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
    
    try {
        // Verify the token using the team-specific secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if the user has the 'participant' role
        if (decoded.role !== 'participant') {
            return res.status(403).json({ message: 'Forbidden: Access is restricted to participants.' });
        }
        
        // Attach the decoded user payload to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or has expired.' });
    }
};
