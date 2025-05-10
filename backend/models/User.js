const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String },
  preferences: {
    theme: { type: String, default: 'light' },
    defaultCurrency: { type: String, default: 'USD' },
    notifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: false },
    notificationFrequency: { type: String, default: 'immediate' },
    dataSharing: { type: Boolean, default: false },
    twoFactor: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model('User', userSchema);