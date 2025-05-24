import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTransactions } from '../TransactionContext';
import '../styles/EditTransaction.css';

const EditTransaction = () => {
  const { user } = useAuth();
  const { transactions, saveTransaction } = useTransactions();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    type: 'expense',
    date: '',
    currency: 'INR',
    note: ''
  });
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Transport', 'Utilities', 'Salary', 'Freelance', 'Entertainment', 'Uncategorized'];

  // Fetch transaction data
  useEffect(() => {
    const transaction = transactions.find(t => t._id === id);
    if (transaction) {
      console.log('EditTransaction: Loaded transaction:', transaction);
      setFormData({
        amount: transaction.amount.toString(),
        category: transaction.category,
        type: transaction.type,
        date: new Date(transaction.date).toISOString().split('T')[0],
        currency: transaction.currency || 'INR',
        note: transaction.note || ''
      });
    } else {
      console.error('EditTransaction: Transaction not found:', id);
      setError('Transaction not found');
    }
  }, [id, transactions]);

  // Fetch suggested category when note changes
  useEffect(() => {
    if (formData.note) {
      console.log('EditTransaction: Fetching suggestion for note:', formData.note);
      fetch('http://localhost:5000/api/transactions/suggest-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ note: formData.note })
      })
        .then(response => response.json())
        .then(data => {
          console.log('EditTransaction: Suggested category:', data.category);
          setSuggestedCategory(data.category);
          setFormData(prev => ({ ...prev, category: data.category }));
        })
        .catch(err => {
          console.error('EditTransaction: Suggestion error:', err);
          setSuggestedCategory('Uncategorized');
          setFormData(prev => ({ ...prev, category: 'Uncategorized' }));
        });
    } else {
      console.log('EditTransaction: No note, resetting category');
      setSuggestedCategory('');
      setFormData(prev => ({ ...prev, category: '' }));
    }
  }, [formData.note]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`EditTransaction: Updating ${name}:`, value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setError('Amount must be positive');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.date) {
      setError('Please select a date');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('EditTransaction: Saving transaction:', formData);
      await saveTransaction({
        _id: id,
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        date: formData.date,
        currency: formData.currency,
        note: formData.note
      });
      setSuccess('Transaction updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('EditTransaction: Save error:', err);
      setError(err.message || 'Failed to update transaction');
      setLoading(false);
    }
  };

  if (!user) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Loading...</motion.div>;

  return (
    <motion.div
      className="edit-transaction-page container py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="section-heading text-center mb-4">Edit Transaction</h2>
      {error && (
        <motion.div className="alert alert-danger" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div className="alert alert-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {success}
        </motion.div>
      )}
      <form onSubmit={handleSubmit} className="edit-transaction-form">
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="amount" className="form-label">Amount</label>
            <input
              type="number"
              className="form-control"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="type" className="form-label">Type</label>
            <select
              className="form-select"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="category" className="form-label">
              Category {suggestedCategory && `(Suggested: ${suggestedCategory})`}
            </label>
            <select
              className="form-select"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option
                  key={cat}
                  value={cat}
                  className={cat === suggestedCategory ? 'suggested-category' : ''}
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="date" className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="currency" className="form-label">Currency</label>
            <select
              className="form-select"
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="note" className="form-label">Note</label>
            <input
              type="text"
              className="form-control"
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="e.g., Restaurant bill"
              disabled={loading}
            />
          </div>
          <div className="col-12 text-center">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Transaction'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default EditTransaction;