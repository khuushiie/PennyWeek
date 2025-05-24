import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTransactions } from '../TransactionContext';
import '../styles/AddTransaction.css';

const AddTransaction = () => {
  const { user } = useAuth();
  const { addTransaction } = useTransactions();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    currency: 'INR',
    note: ''
  });
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Transport', 'Utilities', 'Salary', 'Freelance', 'Entertainment', 'Uncategorized'];

  useEffect(() => {
    if (formData.note) {
      console.log('Fetching suggestion for note:', formData.note);
      axios
        .post('http://localhost:5000/api/transactions/suggest-category', { note: formData.note }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
          console.log('Suggested category:', response.data.category);
          setSuggestedCategory(response.data.category);
          setFormData(prev => ({ ...prev, category: response.data.category }));
        })
        .catch(err => {
          console.error('Suggestion error:', err.message, 'Status:', err.response?.status, 'Response:', err.response?.data);
          setSuggestedCategory('Uncategorized');
          setFormData(prev => ({ ...prev, category: 'Uncategorized' }));
          // Suppress toast for suggestion errors to avoid UX clutter
        });
    } else {
      console.log('No note, resetting category');
      setSuggestedCategory('');
      setFormData(prev => ({ ...prev, category: '' }));
    }
  }, [formData.note]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name}:`, value);
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
      console.log('Submitting transaction:', formData);
      await addTransaction({
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        date: formData.date,
        currency: formData.currency,
        note: formData.note
      });
      setSuccess('Transaction added successfully!');
      setFormData({
        amount: '',
        category: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        currency: 'INR',
        note: ''
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to add transaction');
      setLoading(false);
    }
  };

  if (!user) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Loading...</motion.div>;

  return (
    <motion.div
      className="add-transaction-page container py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="section-heading text-center mb-4">Add Transaction</h2>
      {error && (
        <motion.div
          className="alert alert-danger"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          className="alert alert-success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {success}
        </motion.div>
      )}
      <form onSubmit={handleSubmit} className="add-transaction-form">
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
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AddTransaction;