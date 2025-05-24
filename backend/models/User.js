const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
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

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);