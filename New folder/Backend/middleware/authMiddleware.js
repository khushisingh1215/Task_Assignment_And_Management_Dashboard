const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/userController');

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('✗ Token verification error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Check if user is admin
const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required' });
    }

    next();
  } catch (error) {
    console.error('✗ Admin check error:', error.message);
    res.status(403).json({ error: 'Access denied' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin
};
