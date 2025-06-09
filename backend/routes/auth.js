const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
console.log('auth.js: User model imported:', User ? 'Yes' : 'No');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('auth.js: JWT_SECRET is not defined');
  throw new Error('JWT_SECRET is required');
}

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Auth: Register attempt:', { name, email, password: password ? '[provided]' : '[missing]' });
    if (!name || !email || !password) {
      console.log('Auth: Missing required fields:', { name, email, password: !!password });
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('Auth: Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 6) {
      console.log('Auth: Password too short:', password.length);
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    console.log('Auth: Checking for existing user with email:', trimmedEmail);
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      console.log('Auth: Email already registered:', { email: trimmedEmail, existingUser: { _id: existingUser._id, email: existingUser.email } });
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      name,
      email: trimmedEmail,
      password, // Rely on User.js pre-save middleware for hashing
      preferences: {
        theme: 'light',
        defaultCurrency: 'USD',
        notifications: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: false,
        notificationFrequency: 'immediate',
        dataSharing: false,
        twoFactor: false,
        twoFactorSecret: null,
      },
    });
    console.log('Auth: Saving user:', trimmedEmail);
    await user.save();
    console.log('Auth: User saved successfully:', trimmedEmail);

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Auth: Login attempt:', { email, password: password ? '[provided]' : '[missing]' });
    if (!email || !password) {
      console.log('Auth: Missing email or password:', { email, password: !!password });
      return res.status(401).json({ message: 'Email and password are required' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    console.log('Auth: Querying user with email:', trimmedEmail);
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log('Auth: User not found:', trimmedEmail);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Auth: Comparing password for:', trimmedEmail);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Auth: Invalid password for:', trimmedEmail);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Auth: Login successful for:', trimmedEmail);
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;