const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
  destination: './Uploads/',
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Images only!'));
  },
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      preferences: user.preferences,
    });
  } catch (err) {
    console.error('Users route error:', err);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// Update user profile
router.put('/me', auth, upload.single('photo'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = req.body;
    const allowedUpdates = ['name', 'email', 'password', 'preferences'];
    const isValidUpdate = Object.keys(updates).every((key) => allowedUpdates.includes(key));

    if (!isValidUpdate) {
      return res.status(400).json({ message: 'Invalid updates provided' });
    }

    let preferences = updates.preferences;
    if (typeof preferences === 'string') {
      try {
        preferences = JSON.parse(preferences);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid preferences format' });
      }
    }

    if (preferences) {
      const validPreferences = [
        'theme',
        'defaultCurrency',
        'notifications',
        'emailNotifications',
        'smsNotifications',
        'pushNotifications',
        'notificationFrequency',
        'dataSharing',
        'twoFactor',
      ];
      const isValidPrefs = Object.keys(preferences).every((key) => validPreferences.includes(key));
      if (!isValidPrefs) {
        return res.status(400).json({ message: 'Invalid preferences structure' });
      }
    }

    if (updates.name) user.name = updates.name.trim();
    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = updates.email.trim();
    }
    if (updates.password) {
      if (updates.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = updates.password;
    }
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    if (req.file) {
      user.photo = `/Uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    console.error('Update user error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: `Validation error: ${err.message}` });
    }
    if (err.message === 'Images only!') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    console.log('Change-password: Request body:', req.body, 'User ID:', req.user.id);
    if (!oldPassword || !newPassword) {
      console.log('Change-password: Missing oldPassword or newPassword');
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('Change-password: User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log('Change-password: Incorrect old password for user:', req.user.id);
      return res.status(400).json({ message: 'Incorrect old password' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log('Change-password: New password hash:', hashedPassword);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    console.log('Change-password: Password updated for user:', req.user.id);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change-password error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

module.exports = router;