import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    console.log('TransactionContext: Fetching transactions');

    const fetchTransactions = async () => {
      if (!isLoggedIn) {
        if (isMounted) {
          setTransactions([]);
          setLoading(false);
        }
        console.log('TransactionContext: Not logged in, skipping fetch');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const response = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          console.log('TransactionContext: Transactions fetched:', response.data);
          setTransactions(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('TransactionContext: Error fetching transactions:', err.response?.data || err.message);
        setError(err.response?.data.message || 'Failed to fetch transactions');
      } finally {
        if (isMounted) {
          console.log('TransactionContext: Setting loading to false');
          setLoading(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const saveTransaction = async (transaction) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      console.log('TransactionContext: Saving transaction:', transaction);
      const payload = {
        amount: parseFloat(transaction.amount),
        category: transaction.category,
        date: transaction.date,
        description: transaction.description || '',
        type: transaction.type,
        currency: transaction.currency,
        notes: transaction.notes || '',
      };

      let response;
      if (transaction._id) {
        response = await axios.put(
          `http://localhost:5000/api/transactions/${transaction._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTransactions(transactions.map((t) => (t._id === transaction._id ? response.data : t)));
      } else {
        response = await axios.post('http://localhost:5000/api/transactions', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions([response.data, ...transactions]);
      }
      console.log('TransactionContext: Transaction saved:', response.data);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('TransactionContext: Error saving transaction:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to save transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      console.log('TransactionContext: Deleting transaction:', id);
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t._id !== id));
      setError(null);
    } catch (err) {
      console.error('TransactionContext: Error deleting transaction:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to delete transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, saveTransaction, deleteTransaction, loading, error }}>
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
