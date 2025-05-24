const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Transaction = require('../models/Transaction');
const RecurringTransaction = require('../models/RecurringTransaction');
const auth = require('../middleware/auth');

let categorizeTransaction;
try {
  categorizeTransaction = require('../utils/categorizeTransaction');
  if (typeof categorizeTransaction !== 'function') {
    throw new Error('categorizeTransaction is not a function');
  }
  console.log('Successfully imported categorizeTransaction');
} catch (err) {
  console.error('Failed to import categorizeTransaction:', err.message, 'Stack:', err.stack);
  categorizeTransaction = (note) => 'Uncategorized'; // Fallback
}

console.log('Loading transactions routes');

// Helper to generate transactions from recurring schedules
const generateRecurringTransactions = async (userId, upToDate = new Date()) => {
  const recurringTransactions = await RecurringTransaction.find({ userId });
  const generatedTransactions = [];

  for (const rt of recurringTransactions) {
    let currentDate = new Date(rt.nextOccurrence);
    while (currentDate <= upToDate && (!rt.endDate || currentDate <= rt.endDate)) {
      generatedTransactions.push({
        userId: rt.userId,
        amount: rt.amount,
        currency: rt.currency,
        type: rt.type,
        category: rt.category,
        note: rt.note,
        date: new Date(currentDate),
        isRecurring: true,
        recurringId: rt._id,
      });

      // Update nextOccurrence
      if (rt.frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (rt.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (rt.frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      rt.nextOccurrence = currentDate;
      await rt.save();
    }
  }

  // Save generated transactions
  if (generatedTransactions.length > 0) {
    await Transaction.insertMany(generatedTransactions);
  }
};

// POST /api/transactions/suggest-category
router.post('/suggest-category', auth, async (req, res) => {
  console.log('Handling POST /api/transactions/suggest-category, req.body:', req.body, 'user:', req.user);
  const { note } = req.body;
  try {
    if (!req.user) {
      console.error('Auth middleware failed: No user in request');
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
    if (!note || typeof note !== 'string') {
      console.log('Invalid note, returning Uncategorized');
      return res.json({ category: 'Uncategorized' });
    }
    console.log('Calling categorizeTransaction with note:', note);
    const category = categorizeTransaction(note);
    console.log('Suggested category for note:', note, 'is', category);
    res.json({ category });
  } catch (err) {
    console.error('Suggest category error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Add a new transaction
router.post('/', auth, async (req, res) => {
  const { amount, currency, type, note, date, category: providedCategory } = req.body;
  try {
    console.log('Handling POST /api/transactions, req.body:', req.body, 'user:', req.user);
    if (!req.user) {
      console.error('Auth middleware failed: No user in request');
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
    let category = providedCategory || 'Uncategorized';
    if (!providedCategory || providedCategory === 'Uncategorized') {
      category = categorizeTransaction(note);
    }
    const newTransaction = new Transaction({
      userId: req.user.id,
      amount,
      currency: currency || 'INR',
      type,
      category,
      note: note || '',
      date: date || new Date(),
    });
    console.log('Adding transaction:', newTransaction);
    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    console.error('Add transaction error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update a transaction
router.put('/:id', auth, async (req, res) => {
  const { amount, currency, type, category, note, date } = req.body;
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    transaction.amount = amount || transaction.amount;
    transaction.currency = currency || transaction.currency;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.note = note || transaction.note;
    transaction.date = date || transaction.date;
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error('Update transaction error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Delete a transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (err) {
    console.error('Delete transaction error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// GET /api/transactions/budget/recommend
router.get('/budget/recommend', auth, async (req, res) => {
  try {
    console.log('Handling GET /api/transactions/budget/recommend, user:', req.user?.id);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const transactions = await Transaction.find({
      userId: req.user.id,
      type: 'expense',
      date: { $gte: oneMonthAgo },
    });
    console.log('Recommendations: Filtered transactions:', transactions);
    const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Uncategorized'];
    const recommendations = categories.reduce((acc, category) => {
      const categoryExpenses = transactions
        .filter((t) => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
      const count = transactions.filter((t) => t.category === category).length;
      const avgExpense = count > 0 ? categoryExpenses / count : 0;
      const recommendedBudget = count > 0 ? avgExpense * 1.2 * 4 : 1000;
      acc[category] = Math.round(recommendedBudget);
      return acc;
    }, {});
    res.json(recommendations);
  } catch (err) {
    console.error('Recommendations error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Add a recurring transaction
router.post('/recurring', auth, async (req, res) => {
  const { amount, currency, type, note, category, frequency, startDate, endDate } = req.body;
  try {
    const newRecurringTransaction = new RecurringTransaction({
      userId: req.user.id,
      amount,
      currency: currency || 'INR',
      type,
      category: category || 'Uncategorized',
      note: note || '',
      frequency,
      startDate,
      endDate: endDate || null,
      nextOccurrence: new Date(startDate),
    });
    const recurringTransaction = await newRecurringTransaction.save();
    res.json(recurringTransaction);
  } catch (err) {
    console.error('Add recurring transaction error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get all recurring transactions
router.get('/recurring', auth, async (req, res) => {
  try {
    const recurringTransactions = await RecurringTransaction.find({ userId: req.user.id });
    res.json(recurringTransactions);
  } catch (err) {
    console.error('Fetch recurring transactions error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update a recurring transaction
router.put('/recurring/:id', auth, async (req, res) => {
  const { amount, currency, type, category, note, frequency, startDate, endDate } = req.body;
  try {
    let recurringTransaction = await RecurringTransaction.findById(req.params.id);
    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }
    if (recurringTransaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    recurringTransaction.amount = amount || recurringTransaction.amount;
    recurringTransaction.currency = currency || recurringTransaction.currency;
    recurringTransaction.type = type || recurringTransaction.type;
    recurringTransaction.category = category || recurringTransaction.category;
    recurringTransaction.note = note || recurringTransaction.note;
    recurringTransaction.frequency = frequency || recurringTransaction.frequency;
    recurringTransaction.startDate = startDate || recurringTransaction.startDate;
    recurringTransaction.endDate = endDate || recurringTransaction.endDate;
    recurringTransaction.nextOccurrence = new Date(startDate || recurringTransaction.startDate);
    await recurringTransaction.save();
    res.json(recurringTransaction);
  } catch (err) {
    console.error('Update recurring transaction error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Delete a recurring transaction
router.delete('/recurring/:id', auth, async (req, res) => {
  try {
    const transaction = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }
    await transaction.deleteOne();
    res.json({ message: 'Recurring transaction deleted' });
  } catch (err) {
    console.error('Delete recurring transaction error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get all transactions (including recurring)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Handling GET /api/transactions, user:', req.user?.id);
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    console.error('Get transactions error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

router.get('/insights', auth, async (req, res) => {
  try {
    console.log('Handling GET /api/transactions/insights, user:', req.user?.id);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const categoryTotals = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          type: 'expense',
          date: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
          currency: req.user.preferences?.defaultCurrency || 'INR',
        },
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { category: '$_id', total: 1, _id: 0 } },
    ]);
    const monthlyTotals = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          type: 'expense',
          date: { $gte: sixMonthsAgo },
          currency: req.user.preferences?.defaultCurrency || 'INR',
        },
      },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, '0', ''] },
              { $toString: '$_id.month' },
            ],
          },
          total: 1,
          _id: 0,
        },
      },
    ]);
    const insights = {
      categoryTotals: categoryTotals.reduce((acc, { category, total }) => {
        acc[category] = total;
        return acc;
      }, {}),
      monthlyTotals: monthlyTotals.reduce((acc, { period, total }) => {
        acc[period] = total;
        return acc;
      }, {}),
    };
    res.json(insights);
  } catch (err) {
    console.error('Insights error:', err.message, 'Stack:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;