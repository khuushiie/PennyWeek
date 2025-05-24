import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTransactions } from '../TransactionContext';
import '../styles/RecurringTransactionForm.css';

function RecurringTransactionForm() {
    const { addRecurringTransaction, updateRecurringTransaction, recurringTransactions } = useTransactions();
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense',
        category: 'Utilities',
        note: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            const transaction = recurringTransactions.find((t) => t._id === id);
            if (transaction) {
                setFormData({
                    amount: transaction.amount,
                    type: transaction.type,
                    category: transaction.category,
                    note: transaction.note,
                    frequency: transaction.frequency,
                    startDate: new Date(transaction.startDate).toISOString().split('T')[0],
                });
            }
        }
    }, [id, recurringTransactions]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await updateRecurringTransaction(id, formData);
            } else {
                await addRecurringTransaction(formData);
            }
            navigate('/dashboard');
        } catch (err) {
            console.error('RecurringTransactionForm: Submit error:', err.message);
            setError(err.message || 'Failed to save recurring transaction');
        }
    };

    return (
        <motion.div
            className="recurring-form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="recurring-form-box">
                <h2>{id ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="amount">Amount (₹)</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <select id="type" name="type" value={formData.type} onChange={handleChange} required>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                            <option value="Utilities">Utilities</option>
                            <option value="Transport">Transport</option>
                            <option value="Food">Food</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Salary">Salary</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="note">Note</label>
                        <input
                            type="text"
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            maxLength="100"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="frequency">Frequency</label>
                        <select id="frequency" name="frequency" value={formData.frequency} onChange={handleChange} required>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="startDate">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <motion.button
                        type="submit"
                        className="submit-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {id ? 'Update' : 'Add'} Transaction
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
}

export default RecurringTransactionForm;