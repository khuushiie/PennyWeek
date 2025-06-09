import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from './api';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const { user, isLoggedIn } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', isError: false, show: false });
  const [recommendations, setRecommendations] = useState({});
  const [insights, setInsights] = useState(null);

  const fetchInsights = async () => {
    const token = localStorage.getItem('token');
    if (!token || !isLoggedIn) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInsights(response.data);
      console.log('TransactionContext: Fetched insights:', response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Fetch insights error:', err.message);
      setError(err.response?.data?.message || 'Failed to fetch insights');
      showToast(err.response?.data?.message || 'Failed to fetch insights', true);
    }
  };

  const fetchRecommendations = async () => {
    const token = localStorage.getItem('token');
    if (!token || !isLoggedIn) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions/budget/recommend`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('TransactionContext: Fetched recommendations:', response.data);
      setRecommendations(response.data);
      setError(null);
    } catch (err) {
      console.error('TransactionContext: Fetch recommendations error:', err.message);
      setError(err.response?.data?.message || 'Failed to fetch recommendations');
      showToast(err.response?.data?.message || 'Failed to fetch recommendations', true);
    }
  };

  const showToast = (message, isError = false) => {
    console.log('TransactionContext: Showing toast:', { message, isError });
    setToast({ message, isError, show: true });
    setTimeout(() => {
      console.log('TransactionContext: Clearing toast');
      setToast({ message: '', isError: false, show: false });
    }, 3000);
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token');
    if (!token || !isLoggedIn) return;
    try {
      setLoading(true);
      const [transRes, recurRes, budgetRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/transactions/recurring`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get( `${API_BASE_URL}/api/budgets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTransactions(transRes.data);
      setRecurringTransactions(recurRes.data);
      setBudgets(budgetRes.data);
      setError(null);
    } catch (err) {
      console.error('TransactionContext: Fetch error:', err.message);
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      showToast(err.response?.data?.message || 'Failed to fetch transactions', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('TransactionContext: useEffect triggered, isLoggedIn:', isLoggedIn);
    if (isLoggedIn && user) {
      fetchTransactions();
      fetchRecommendations();
      fetchInsights(); // Fetch insights on initial load
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  const addTransaction = async (transaction) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token available');
    try {
      console.log('TransactionContext: Adding transaction:', transaction);
      const response = await axios.post(`${API_BASE_URL}/api/transactions`, transaction, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions([...transactions, response.data]);
      await fetchRecommendations();
      await fetchInsights(); // Refresh insights
      showToast('Transaction added successfully');
      return response.data;
    } catch (err) {
      console.error('TransactionContext: Add transaction error:', err.message);
      showToast(err.response?.data?.message || 'Failed to add transaction', true);
      throw new Error(err.response?.data?.message || 'Failed to add transaction');
    }
  };

  const updateTransaction = async (id, transaction) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token available');
    try {
      const response = await axios.put(`${API_BASE_URL}/api/transactions/${id}`, transaction, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.map((t) => (t._id === id ? response.data : t)));
      await fetchRecommendations();
      await fetchInsights(); // Refresh insights
      showToast('Transaction updated successfully');
      return response.data;
    } catch (err) {
      console.error('TransactionContext: Update transaction error:', err.message);
      showToast(err.response?.data?.message || 'Failed to update transaction', true);
      throw new Error(err.response?.data?.message || 'Failed to update transaction');
    }
  };

  const deleteTransaction = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token available');
    try {
      await axios.delete(`${API_BASE_URL}/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t._id !== id));
      await fetchRecommendations();
      await fetchInsights(); // Refresh insights
      showToast('Transaction deleted successfully');
    } catch (err) {
      console.error('TransactionContext: Delete transaction error:', err.message);
      showToast(err.response?.data?.message || 'Failed to delete transaction', true);
      throw new Error(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const addRecurringTransaction = async (transaction) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token available');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/transactions/recurring`, transaction, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecurringTransactions([...recurringTransactions, response.data]);
      await fetchTransactions(); // Refresh transactions
      showToast('Recurring transaction added successfully');
      return response.data;
    } catch (err) {
      console.error('TransactionContext: Add recurring error:', err.message);
      showToast(err.response?.data?.message || 'Failed to add recurring transaction', true);
      throw new Error(err.response?.data?.message || 'Failed to add recurring transaction');
    }
  };

  const updateRecurringTransaction = async (id, transaction) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token available');
    try {
      const response = await axios.put(`${API_BASE_URL}/api/transactions/recurring/${id}`, transaction, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecurringTransactions(recurringTransactions.map((rt) => (rt._id === id ? response.data : rt)));
      await fetchTransactions(); // Refresh transactions
      showToast('Recurring transaction updated successfully');
      return response.data;
    } catch (err) {
      console.error('TransactionContext: Update recurring error:', err.message);
      showToast(err.response?.data?.message || 'Failed to update recurring transaction', true);
      throw new Error(err.response?.data?.message || 'Failed to update recurring transaction');
    }
  };

  const deleteRecurringTransaction = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token available');
    try {
      console.log('TransactionContext: Deleting recurring transaction ID:', id);
      await axios.delete(`${API_BASE_URL}/api/transactions/recurring/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecurringTransactions(recurringTransactions.filter((rt) => rt._id !== id));
      await fetchTransactions(); // Refresh transactions
      showToast('Recurring transaction deleted successfully');
    } catch (err) {
      console.error('TransactionContext: Delete recurring error:', err.message);
      showToast(err.response?.data?.message || 'Failed to delete recurring transaction', true);
      throw new Error(err.response?.data?.message || 'Failed to delete recurring transaction');
    }
  };

  const addBudget = async (budget) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token available');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/budgets`, budget, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets([...budgets, response.data]);
      showToast('Budget added successfully');
      return response.data;
    } catch (err) {
      console.error('TransactionContext: Add budget error:', err.message);
      showToast(err.response?.data?.message || 'Failed to add budget', true);
      throw new Error(err.response?.data?.message || 'Failed to add budget');
    }
  };

  console.log('TransactionContext: Rendering, state:', { toast, insights, transactions, recommendations });

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        recurringTransactions,
        budgets,
        recommendations,
        insights, // Added
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        addBudget,
        fetchRecommendations,
        fetchInsights, // Added
        toast,
        setToast,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}