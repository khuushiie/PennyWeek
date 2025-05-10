const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    console.error('GET /api/transactions error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { amount, category, type, date, note, currency = 'INR' } = req.body;
  try {
    const transaction = new Transaction({
      userId: req.user.id,
      amount,
      category,
      type,
      date: date || Date.now(),
      note,
      currency,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error('POST /api/transactions error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { amount, category, type, date, note, currency = 'INR' } = req.body;
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    transaction.amount = amount;
    transaction.category = category;
    transaction.type = type;
    transaction.date = date || transaction.date;
    transaction.note = note;
    transaction.currency = currency;
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error('PUT /api/transactions/:id error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    await transaction.remove();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('DELETE /api/transactions/:id error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;