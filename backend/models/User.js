const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('User.js: Defining User schema');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { type: String, required: true },
  photo: { type: String, default: null },
  preferences: {
    type: Object,
    default: {
      theme: 'light',
      defaultCurrency: 'USD',
      dataSharing: false,
    },
  },
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password') && user.password) {
    console.log('UserSchema: Hashing password for', user.email);
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);
console.log('User.js: User model created');
module.exports = User;