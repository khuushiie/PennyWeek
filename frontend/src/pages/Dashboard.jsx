import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import { useTransactions } from "../TransactionContext";
import "../styles/Dashboard.css";

function Dashboard() {
  const { isLoggedIn } = useAuth();
  const { transactions } = useTransactions();
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [filterType, setFilterType] = useState("all");

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Currency options (consistent with AddTransaction.js)
  const currencies = [
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "INR", symbol: "₹" },
    { code: "GBP", symbol: "£" },
  ];

  // Calculate summary (assuming USD for simplicity; extend for multi-currency later)
  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income" && t.currency === "USD")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense" && t.currency === "USD")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    return { income, expenses, balance };
  }, [transactions]);

  // Sort transactions
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Sorted and filtered transactions
  const sortedTransactions = useMemo(() => {
    let filtered = transactions;
    if (filterType !== "all") {
      filtered = transactions.filter((t) => t.type === filterType);
    }
    return [...filtered].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [transactions, sortConfig, filterType]);

  return (
    <div className="dashboard-page">
      <div className="container py-5">
        {/* Summary Card */}
        <motion.div
          className="summary-card p-4 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading text-center mb-4">Financial Summary</h2>
          <div className="row text-center">
            <div className="col-md-4 mb-3">
              <div className="summary-item">
                <h3 className="summary-label">Total Income</h3>
                <p className="summary-value income">
                  ${summary.income.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="summary-item">
                <h3 className="summary-label">Total Expenses</h3>
                <p className="summary-value expense">
                  ${summary.expenses.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="summary-item">
                <h3 className="summary-label">Balance</h3>
                <p
                  className={`summary-value ${
                    summary.balance >= 0 ? "income" : "expense"
                  }`}
                >
                  ${summary.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <Link to="/add-transaction" className="btn btn-primary">
              Add New Transaction
            </Link>
          </div>
        </motion.div>

        {/* Transaction History Table */}
        {transactions.length > 0 && (
          <motion.div
            className="transaction-table-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-heading text-center mb-4">
              Transaction History
            </h2>
            <div className="mb-3">
              <label htmlFor="filterType" className="form-label">
                Filter by Type
              </label>
              <select
                className="form-select"
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="table-responsive">
              <table className="table table-hover transaction-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("date")} className="sortable">
                      Date{" "}
                      {sortConfig.key === "date" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => handleSort("amount")} className="sortable">
                      Amount{" "}
                      {sortConfig.key === "amount" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td>{transaction.date}</td>
                      <td>
                        {currencies.find((c) => c.code === transaction.currency)
                          ?.symbol}
                        {transaction.amount.toFixed(2)}
                      </td>
                      <td>{transaction.category}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.description || "-"}</td>
                      <td>{transaction.notes || "-"}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

