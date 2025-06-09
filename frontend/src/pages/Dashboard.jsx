import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTransactions } from '../TransactionContext';
import { Line, Pie, Bar } from 'react-chartjs-2';
import BudgetAlerts from '../components/BudgetAlerts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement
);

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { transactions, recurringTransactions, budgets, loading, error, deleteTransaction, recommendations, deleteRecurringTransaction, addBudget, toast, setToast, insights, fetchInsights } = useTransactions();
  const [budgetForm, setBudgetForm] = useState({ category: 'Utilities', amount: '' });
  const [budgetError, setBudgetError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isRecurringDelete, setIsRecurringDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  });
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'INR', symbol: '₹' },
  ];

  const categories = [
    'Food',
    'Transport',
    'Utilities',
    'Salary',
    'Freelance',
    'Entertainment',
    'Uncategorized',
  ];

  // Financial Summary
  const summary = useMemo(() => {
    const summaries = currencies.reduce((acc, cur) => {
      const income = transactions
        .filter(
          (t) => t.type === 'income' && (t.currency || 'INR') === cur.code
        )
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter(
          (t) => t.type === 'expense' && (t.currency || 'INR') === cur.code
        )
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = income - expenses;
      acc[cur.code] = { income, expenses, balance };
      return acc;
    }, {});
    return summaries;
  }, [transactions]);

  // Total Spent and Saved
  const totalSummary = useMemo(() => {
    const totalSpent = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSaved = totalIncome - totalSpent;
    return { totalSpent, totalSaved };
  }, [transactions]);

  // Chart Data (last 30 days)
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const dateLabels = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateLabels.push(new Date(d).toISOString().split('T')[0]);
    }

    const incomeData = new Array(dateLabels.length).fill(0);
    const expenseData = new Array(dateLabels.length).fill(0);

    transactions.forEach((t) => {
      const tDate = new Date(t.date).toISOString().split('T')[0];
      const index = dateLabels.indexOf(tDate);
      if (index !== -1 && (t.currency || 'INR') === (user?.preferences?.defaultCurrency || 'INR')) {
        if (t.type === 'income') {
          incomeData[index] += t.amount;
        } else if (t.type === 'expense') {
          expenseData[index] += t.amount;
        }
      }
    });

    return {
      labels: dateLabels.map((d) => new Date(d).toLocaleDateString()),
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#00A3E0',
          backgroundColor: 'rgba(0, 163, 224, 0.2)',
          fill: true,
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          fill: true,
        },
      ],
    };
  }, [transactions, user?.preferences?.defaultCurrency]);

  // Insights Chart Data
  const pieChartData = useMemo(() => {
    return {
      labels: insights?.categoryTotals ? Object.keys(insights.categoryTotals) : [],
      datasets: [{
        data: insights?.categoryTotals ? Object.values(insights.categoryTotals) : [],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
      }],
    };
  }, [insights]);

  const barChartData = useMemo(() => {
    return {
      labels: insights?.monthlyTotals ? Object.keys(insights.monthlyTotals) : [],
      datasets: [{
        label: 'Monthly Expenses',
        data: insights?.monthlyTotals ? Object.values(insights.monthlyTotals) : [],
        backgroundColor: '#36A2EB',
      }],
    };
  }, [insights]);

  const topCategories = useMemo(() => {
    return insights?.categoryTotals
      ? Object.entries(insights.categoryTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([category, amount]) => `${category}: ${currencies.find((c) => c.code === (user?.preferences?.defaultCurrency || 'INR'))?.symbol}${amount.toFixed(2)}`)
      : [];
  }, [insights, user?.preferences?.defaultCurrency]);

  // PDF Generation
  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().split('T')[0];

    doc.setFontSize(18);
    doc.setTextColor('#1A3C5A');
    doc.text('PennyWeek Transaction Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    doc.setFontSize(14);
    doc.text('Financial Summary', 14, 45);
    doc.setFontSize(10);
    let yPos = 55;
    Object.entries(summary).forEach(([currency, data]) => {
      const symbol = currencies.find((c) => c.code === currency)?.symbol;
      doc.text(
        `${currency}: Income: ${symbol}${data.income.toFixed(2)}, Expenses: ${symbol}${data.expenses.toFixed(2)}, Balance: ${symbol}${data.balance.toFixed(2)}`,
        14,
        yPos
      );
      yPos += 8;
    });
    doc.text(`Total Spent (All Currencies): ₹${totalSummary.totalSpent.toFixed(2)}`, 14, yPos);
    yPos += 8;
    doc.text(`Total Saved (All Currencies): ₹${totalSummary.totalSaved.toFixed(2)}`, 14, yPos);
    yPos += 15;

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Amount', 'Currency', 'Category', 'Type', 'Notes', 'Recurring']],
      body: sortedTransactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        `${currencies.find((c) => c.code === (t.currency || 'INR'))?.symbol}${t.amount.toFixed(2)}`,
        t.currency || 'INR',
        t.category,
        t.type,
        t.note || '-',
        t.isRecurring ? 'Yes' : 'No',
      ]),
      theme: 'grid',
      headStyles: { fillColor: '#1A3C5A', textColor: '#F4F9FC', fontSize: 10 },
      bodyStyles: { textColor: '#1A3C5A', fontSize: 9, cellPadding: 4 },
      styles: { font: 'helvetica', lineColor: '#1A3C5A', lineWidth: 0.1 },
      margin: { top: 40, left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 15 },
      },
    });

    doc.save(`pennyweek_report_${dateStr}.pdf`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Amount', 'Currency', 'Category', 'Type', 'Note', 'Recurring'];
    const rows = sortedTransactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.amount.toFixed(2),
      t.currency || 'INR',
      t.category,
      t.type,
      `"${t.note || '-'}"`,
      t.isRecurring ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `pennyweek_transactions_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting and Filtering
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const sortedTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.note?.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.amount.toString().includes(query)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (filterCategory) {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    if (filterDateStart || filterDateEnd) {
      filtered = filtered.filter((t) => {
        const tDate = new Date(t.date);
        const start = filterDateStart ? new Date(filterDateStart) : null;
        const end = filterDateEnd ? new Date(filterDateEnd) : null;
        return (!start || tDate >= start) && (!end || tDate <= end);
      });
    }

    return [...filtered].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [transactions, sortConfig, filterType, searchQuery, filterCategory, filterDateStart, filterDateEnd]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteClick = (transaction, isRecurring = false) => {
    setTransactionToDelete(transaction);
    setIsRecurringDelete(isRecurring);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        if (isRecurringDelete) {
          await deleteRecurringTransaction(transactionToDelete._id);
        } else {
          await deleteTransaction(transactionToDelete._id);
        }
        setShowDeleteModal(false);
        setTransactionToDelete(null);
        setIsRecurringDelete(false);
        setDeleteError(null);
      } catch (err) {
        console.error('Dashboard: Delete error:', err.message);
        setDeleteError(err.message || 'Failed to delete transaction');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
    setIsRecurringDelete(false);
    setDeleteError(null);
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setBudgetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!budgetForm.amount || budgetForm.amount <= 0) {
      setBudgetError('Please enter a valid budget amount');
      return;
    }
    try {
      await addBudget(budgetForm);
      setBudgetForm({ category: 'Utilities', amount: '' });
      setBudgetError(null);
    } catch (err) {
      console.error('Dashboard: Add budget error:', err.message);
      setBudgetError(err.message || 'Failed to set budget');
    }
  };

  console.log('Dashboard: useTransactions context:', { transactions, toast, setToast, insights });

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Loading user...</div>;

  return (
    <div className="dashboard-page">
      <motion.div
        className="container py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Budget Alerts */}
        <BudgetAlerts />

        {/* Toast Notifications */}
        {toast?.show && (
          <motion.div
            className={`toast align-items-center border-0 position-fixed top-0 end-0 m-3 ${toast.isError ? 'text-bg-danger' : 'text-bg-success'}`}
            role="alert"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                type="button"
                className="btn-close me-2 m-auto"
                onClick={() => setToast({ message: '', isError: false, show: false })}
                aria-label="Close"
              ></button>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="tabs mb-4">
          <button
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            Budget
          </button>
          <button
            className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            Charts
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => { setActiveTab('insights'); fetchInsights(); }}
          >
            Insights
          </button>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <motion.div
            className="summary-card p-4 mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-heading text-center mb-4">Financial Summary</h2>
            <h3 className="text-center mb-4">Welcome, {user.name}!</h3>
            {transactions.length === 0 ? (
              <p className="text-center">No transactions available. Add a transaction to see your summary.</p>
            ) : (
              <>
                <motion.table
                  className="summary-table"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <thead>
                    <tr>
                      <th>Currency</th>
                      <th>Income</th>
                      <th>Expenses</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary).map(([currency, data]) => (
                      <tr key={currency}>
                        <td>{currency}</td>
                        <td className="summary-value income">
                          {currencies.find((c) => c.code === currency)?.symbol}
                          {data.income.toFixed(2)}
                        </td>
                        <td className="summary-value expense">
                          {currencies.find((c) => c.code === currency)?.symbol}
                          {data.expenses.toFixed(2)}
                        </td>
                        <td className={`summary-value ${data.balance >= 0 ? 'income' : 'expense'}`}>
                          {currencies.find((c) => c.code === currency)?.symbol}
                          {data.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2">Total Spent (All Currencies)</td>
                      <td className="summary-value expense">
                        ₹{totalSummary.totalSpent.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="2">Total Saved (All Currencies)</td>
                      <td className={`summary-value ${totalSummary.totalSaved >= 0 ? 'income' : 'expense'}`}>
                        ₹{totalSummary.totalSaved.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </motion.table>
                <div className="action-buttons mt-4 d-flex justify-content-center flex-wrap gap-2">
                  <Link to="/add-transaction" className="btn btn-primary">Add Transaction</Link>
                  <Link to="/recurring-transaction" className="btn btn-primary">Add Recurring</Link>
                  <button className="btn btn-success" onClick={generatePDF}>Generate Report</button>
                  <button className="btn btn-danger" onClick={handleLogout}>Log Out</button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <motion.div
            className="budget-form p-4 mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-heading text-center mb-4">Set Budget</h2>
            {budgetError && (
              <motion.div
                className="alert alert-danger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {budgetError}
              </motion.div>
            )}
            <motion.form
              onSubmit={handleBudgetSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="form-group mb-4" whileHover={{ scale: 1.02 }}>
                <label htmlFor="category" className="form-label">Category</label>
                <motion.select
                  id="category"
                  name="category"
                  value={budgetForm.category}
                  onChange={handleBudgetChange}
                  className="form-control"
                  whileFocus={{ borderColor: '#00A3E0' }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </motion.select>
              </motion.div>
              <motion.div className="form-group mb-4" whileHover={{ scale: 1.02 }}>
                <label htmlFor="amount" className="form-label">
                  Amount ({user?.preferences?.defaultCurrency || 'INR'})
                </label>
                <motion.input
                  type="number"
                  id="amount"
                  name="amount"
                  value={budgetForm.amount}
                  onChange={handleBudgetChange}
                  className="form-control"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  whileFocus={{ borderColor: '#00A3E0' }}
                />
              </motion.div>
              <motion.button
                type="submit"
                className="btn btn-primary w-100"
                style={{ backgroundColor: '#00A3E0', borderColor: '#00A3E0' }}
                whileHover={{ scale: 1.05, backgroundColor: '#0087B8' }}
                whileTap={{ scale: 0.95 }}
              >
                Set Budget
              </motion.button>
            </motion.form>
            {Object.keys(recommendations).length > 0 && (
              <motion.div
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="section-heading mb-3">Budget Recommendations</h3>
                <div className="recommendation-list">
                  {Object.entries(recommendations).map(([category, amount]) => (
                    <motion.div
                      key={category}
                      className="recommendation-item p-3 mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span>
                        {category}: {currencies.find((c) => c.code === (user?.preferences?.defaultCurrency || 'INR'))?.symbol}
                        {amount.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {budgets.length > 0 && (
              <motion.div
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="section-heading mb-3">Your Budgets</h3>
                <div className="budget-list">
                  {budgets.map((budget) => (
                    <motion.div
                      key={budget._id}
                      className="budget-item p-3 mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span>
                        {budget.category}: {currencies.find((c) => c.code === (user?.preferences?.defaultCurrency || 'INR'))?.symbol}
                        {budget.amount.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <motion.div
            className="transaction-table-card p-4 mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-heading text-center mb-4">Transaction Graph</h2>
            {transactions.length === 0 ||
            transactions.every(
              (t) =>
                (t.currency || 'INR') !== (user?.preferences?.defaultCurrency || 'INR') ||
                new Date(t.date) < new Date(new Date().setDate(new Date().getDate() - 30))
            ) ? (
              <p className="text-center">
                No transactions in {user?.preferences?.defaultCurrency || 'INR'} in the last 30 days to display in the graph.
              </p>
            ) : (
              <div className="chart-container">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: {
                        display: true,
                        text: `Transactions Over Last 30 Days (${user?.preferences?.defaultCurrency || 'INR'})`,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: `Amount (${currencies.find((c) => c.code === (user?.preferences?.defaultCurrency || 'INR'))?.symbol})`,
                        },
                      },
                      x: { title: { display: true, text: 'Date' } },
                    },
                  }}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <motion.div
            className="transaction-table-card p-4 mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-heading text-center mb-4">Spending Insights</h2>
            {!insights || Object.keys(insights.categoryTotals || {}).length === 0 ? (
              <p className="text-center">
                No expense transactions in the last 30 days to display insights.
              </p>
            ) : (
              <div className="row">
                <div className="col-md-6 mb-4">
                  <h4 className="text-center mb-3">Expenses by Category</h4>
                  <div className="chart-container">
                    <Pie
                      data={pieChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          title: {
                            display: true,
                            text: `Category Distribution (Last 30 Days, ${user?.preferences?.defaultCurrency || 'INR'})`,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <h4 className="text-center mb-3">Monthly Spending Trends</h4>
                  <div className="chart-container">
                    <Bar
                      data={barChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                          title: {
                            display: true,
                            text: `Monthly Expenses (Last 6 Months, ${user?.preferences?.defaultCurrency || 'INR'})`,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: `Amount (${currencies.find((c) => c.code === (user?.preferences?.defaultCurrency || 'INR'))?.symbol})`,
                            },
                          },
                          x: { title: { display: true, text: 'Month' } },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="col-12 mt-4">
                  <h4 className="section-heading mb-3">Top Spending Categories</h4>
                  {topCategories.length === 0 ? (
                    <p className="text-muted">No categories to display.</p>
                  ) : (
                    <ul className="list-group">
                      {topCategories.map((cat, index) => (
                        <li key={index} className="list-group-item">{cat}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            className="tab-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="section-heading mb-4">Transaction History</h3>
            {deleteError && (
              <motion.div
                className="alert alert-danger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {deleteError}
              </motion.div>
            )}
            <motion.div
              className="search-filter-container mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="row align-items-center g-2">
                <div className="col-md-4 col-sm-12 mb-2">
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search by note, category, or amount..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="col-md-2 col-sm-6 mb-2">
                  <select
                    className="form-control filter-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="col-md-2 col-sm-6 mb-2">
                  <select
                    className="form-control filter-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 col-sm-6 mb-2">
                  <input
                    type="date"
                    className="form-control filter-date"
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                  />
                </div>
                <div className="col-md-2 col-sm-6 mb-2">
                  <input
                    type="date"
                    className="form-control filter-date"
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="row align-items-center mt-2">
                <div className="col-md-6 col-sm-12 mb-2 text-start">
                  <motion.button
                    className="btn btn-primary"
                    style={{ backgroundColor: '#00A3E0', borderColor: '#00A3E0' }}
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                      setFilterCategory('');
                      setFilterDateStart('');
                      setFilterDateEnd('');
                    }}
                    whileHover={{ scale: 1.05, backgroundColor: '#0087B8' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear Filters
                  </motion.button>
                </div>
                <div className="col-md-6 col-sm-12 mb-2 text-end">
                  <motion.button
                    className="btn btn-success"
                    onClick={exportToCSV}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Export to CSV
                  </motion.button>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="summary-card p-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className="section-heading mb-3">Recurring Transactions</h4>
              {recurringTransactions.length === 0 ? (
                <p className="text-muted">No recurring transactions. Add one in the Summary tab.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped recurring-table">
                    <thead>
                      <tr>
                        <th>Note</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Frequency</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recurringTransactions.map((rt) => (
                        <tr key={rt._id}>
                          <td>{rt.note || '-'}</td>
                          <td>
                            {currencies.find((c) => c.code === (rt.currency || user?.preferences?.defaultCurrency || 'INR'))?.symbol}
                            {rt.amount.toFixed(2)}
                          </td>
                          <td>{rt.category}</td>
                          <td>{rt.frequency}</td>
                          <td>{new Date(rt.startDate).toLocaleDateString()}</td>
                          <td>{rt.endDate ? new Date(rt.endDate).toLocaleDateString() : '-'}</td>
                          <td>
                            <motion.button
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => navigate(`/recurring-transaction/${rt._id}`)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteClick(rt, true)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Delete
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
            <h4 className="section-heading mb-3">All Transactions</h4>
            {sortedTransactions.length === 0 ? (
              <p className="text-muted">No transactions match the current filters.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('date')}>
                        Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('note')}>
                        Note {sortConfig.key === 'note' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('category')}>
                        Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('amount')}>
                        Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('type')}>
                        Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Recurring</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{transaction.note || '-'}</td>
                        <td>{transaction.category}</td>
                        <td>
                          {currencies.find((c) => c.code === (transaction.currency || user?.preferences?.defaultCurrency || 'INR'))?.symbol}
                          {transaction.amount.toFixed(2)}
                        </td>
                        <td>{transaction.type}</td>
                        <td>
                          {transaction.isRecurring ? (
                            <span className="badge recurring-badge">Recurring</span>
                          ) : ('-')}
                        </td>
                        <td>
                          <motion.button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteClick(transaction, false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Delete
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <motion.div
            className="modal"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="modal-content"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 163, 224, 0.2)',
                padding: '20px',
                maxWidth: '400px',
                margin: 'auto',
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h4 style={{ color: '#1A3C5A' }}>Confirm Deletion</h4>
              <p style={{ color: '#6C757D' }}>
                Are you sure you want to delete {isRecurringDelete ? 'the recurring transaction' : 'the transaction'} "
                {transactionToDelete?.note || 'Untitled'}" for{' '}
                {currencies.find((c) => c.code === (transactionToDelete?.currency || user?.preferences?.defaultCurrency || 'INR'))?.symbol}
                {transactionToDelete?.amount.toFixed(2)}?
              </p>
              {deleteError && (
                <div className="alert alert-danger" style={{ fontSize: '0.9rem' }}>{deleteError}</div>
              )}
              <div className="modal-actions d-flex justify-content-end">
                <motion.button
                  className="btn btn-danger me-2"
                  style={{ backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }}
                  onClick={confirmDelete}
                  whileHover={{ scale: 1.05, backgroundColor: '#E55A5A' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
                <motion.button
                  className="btn btn-secondary"
                  style={{ backgroundColor: '#6C757D', borderColor: '#6C757D' }}
                  onClick={cancelDelete}
                  whileHover={{ scale: 1.05, backgroundColor: '#5A6268' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Dashboard;