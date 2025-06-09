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
    console.log('Users: Fetching user:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('Users: User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      preferences: user.preferences,
    });
  } catch (err) {
    console.error('Users: Get user error:', err);
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

    console.log('Users: Received body:', req.body);
    const { name, email, password, preferences } = req.body;

    if (!name && !email && !password && !preferences && !req.file) {
      return res.status(400).json({ message: 'At least one field required' });
    }

    if (name) user.name = name.trim();
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email.trim();
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = await bcrypt.hash(password, 10);
    }
    if (preferences) {
      let parsedPreferences = preferences;
      if (typeof preferences === 'string') {
        try {
          parsedPreferences = JSON.parse(preferences);
        } catch (err) {
          return res.status(400).json({ message: 'Invalid preferences format' });
        }
      }
      user.preferences = { ...user.preferences, ...parsedPreferences };
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
    console.error('Users: Update user error:', err);
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
    console.log('Users: Change-password: Request body:', req.body, 'User ID:', req.user.id);
    if (!oldPassword || !newPassword) {
      console.log('Users: Change-password: Missing oldPassword or newPassword');
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('Users: Change-password: User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log('Users: Change-password: Incorrect old password for user:', req.user.id);
      return res.status(400).json({ message: 'Incorrect old password' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log('Users: Change-password: New password hash:', hashedPassword);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    console.log('Users: Change-password: Password updated for user:', req.user.id);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Users: Change-password error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Delete user account permanently
router.delete('/delete', auth, async (req, res) => {
  try {
    console.log('Users: Delete account attempt for user:', req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('Users: User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.user.id);
    console.log('Users: Account deleted permanently:', req.user.id);
    res.json({ message: 'Account deleted permanently' });
  } catch (err) {
    console.error('Users: Delete account error:', err.message);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

module.exports = router;