const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  category: { type: String, required: true },
  note: { type: String },
  frequency: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  nextOccurrence: { type: Date, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
});

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);