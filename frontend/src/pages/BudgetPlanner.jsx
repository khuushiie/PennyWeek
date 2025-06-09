import React, { useState, useEffect } from 'react';
import { useTransactions } from '../TransactionContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../styles/BudgetPlanner.css';
import { API_BASE_URL } from './api.js';

const BudgetPlanner = () => {
  const { transactions } = useTransactions();
  const [budgets, setBudgets] = useState([]);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    month: 5,
    year: 2025
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      try {
        const response = await axios.get( `${API_BASE_URL}/api/budgets`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('Fetched budgets:', response.data); // Debug
        setBudgets(response.data);
      } catch (err) {
        setError('Failed to fetch budgets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  const spentByCategory = transactions.reduce((acc, t) => {
    const tDate = new Date(t.date);
    const tMonth = tDate.getMonth() + 1;
    const tYear = tDate.getFullYear();
    if (t.type === 'expense' && tMonth === newBudget.month && tYear === newBudget.year) {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {});

  const handleAddBudget = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post( `${API_BASE_URL}/api/budgets`, newBudget, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBudgets([...budgets, response.data]);
      setNewBudget({ category: '', amount: '', month: 5, year: 2025 });
      setError(null);
    } catch (err) {
      setError(err.response?.data.message || 'Failed to add budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="budget-card p-4 mb-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="section-heading mb-4">Budget Planner</h2>
      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleAddBudget} className="mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Category"
              value={newBudget.category}
              onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Amount (₹)"
              value={newBudget.amount}
              onChange={e => setNewBudget({ ...newBudget, amount: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              value={newBudget.month}
              onChange={e => setNewBudget({ ...newBudget, month: e.target.value })}
              min="1"
              max="12"
              required
              disabled={loading}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              value={newBudget.year}
              onChange={e => setNewBudget({ ...newBudget, year: e.target.value })}
              min="2025"
              required
              disabled={loading}
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </form>
      {budgets.length === 0 && !loading ? (
        <p className="text-center">No budgets set.</p>
      ) : (
        budgets.map(budget => {
          const spent = spentByCategory[budget.category] || 0;
          const percentage = Math.min((spent / budget.amount) * 100, 100);
          return (
            <div key={budget._id} className="mb-3">
              <h4>{budget.category}: ₹{spent.toFixed(2)} / ₹{budget.amount.toFixed(2)}</h4>
              <div className="progress">
                <div
                  className={`progress-bar ${percentage > 90 ? 'bg-danger' : 'bg-primary'}`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage.toFixed(0)}%
                </div>
              </div>
            </div>
          );
        })
      )}
    </motion.div>
  );
};

export default BudgetPlanner;