const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user (password hashing handled by pre('save') middleware)
    const user = new User({
      name,
      email: email.toLowerCase(),
      password, // Raw password, middleware will hash it
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
      },
    });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '1h',
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '1h',
    });
    res.send({ token, user: { _id: user._id, name: user.name, email: user.email, photo: user.photo } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;