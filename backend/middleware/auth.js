const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('Auth middleware: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error('Auth middleware: JWT_SECRET is not defined');
    return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing' });
  }

  try {
    console.log('Auth middleware: Verifying token');
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.id) {
      console.error('Auth middleware: No id in token, decoded:', decoded);
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    console.log('Auth middleware: Fetching user with ID:', decoded.id);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.error('Auth middleware: User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { id: user._id.toString() };
    console.log('Auth middleware: User authenticated, ID:', decoded.id);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
};