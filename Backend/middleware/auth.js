const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied - no token provided' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}

function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin')
        return res.status(403).json({ message: 'Access denied - admin only' });
    next();
}

module.exports = { authenticateToken, isAdmin };
