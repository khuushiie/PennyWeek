import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import { useTransactions } from "../TransactionContext";
import "../styles/AddTransaction.css";

function AddTransaction() {
  const { isLoggedIn } = useAuth();
  const { transactions, setTransactions } = useTransactions();
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [filterType, setFilterType] = useState("all");
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: "",
    description: "",
    type: "expense",
    currency: "USD",
    notes: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Currency options
  const currencies = [
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "INR", symbol: "₹" },
    { code: "GBP", symbol: "£" },
  ];

  // Category options
  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Bills",
    "Salary",
    "Other",
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    setValidated(true);

    if (form.checkValidity() === false || formData.amount <= 0) {
      event.stopPropagation();
    } else {
      const transaction = {
        id: editId || Date.now(),
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editId) {
        setTransactions(
          transactions.map((t) => (t.id === editId ? transaction : t))
        );
        setEditId(null);
      } else {
        setTransactions([transaction, ...transactions]);
      }

      console.log("Transaction Submitted:", transaction);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        resetForm();
      }, 3000);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      amount: "",
      category: "",
      date: "",
      description: "",
      type: "expense",
      currency: "USD",
      notes: "",
    });
    setValidated(false);
    setEditId(null);
  };

  // Edit transaction
  const handleEdit = (transaction) => {
    setFormData(transaction);
    setEditId(transaction.id);
  };

  // Delete transaction
  const handleDelete = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

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

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    navigate("/dashboard");
  };

  return (
    <div className="add-transaction-page">
      <div className="container py-5">
        {/* Form Card */}
        <motion.div
          className="transaction-card p-4 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading text-center mb-4">
            {editId ? "Edit Transaction" : "Add New Transaction"}
          </h2>
          <form
            className="needs-validation"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="mb-3">
              <label htmlFor="currency" className="form-label">
                Currency
              </label>
              <select
                className="form-select"
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              >
                {currencies.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.code} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="amount" className="form-label">
                Amount
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  {currencies.find((c) => c.code === formData.currency)?.symbol}
                </span>
                <input
                  type="number"
                  className={`form-control ${
                    validated && (!formData.amount || formData.amount <= 0)
                      ? "is-invalid"
                      : ""
                  }`}
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                />
                <div className="invalid-feedback">
                  Please enter a valid amount greater than 0.
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                className={`form-select ${
                  validated && !formData.category ? "is-invalid" : ""
                }`}
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">
                Please select a category.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Date
              </label>
              <input
                type="date"
                className={`form-control ${
                  validated && !formData.date ? "is-invalid" : ""
                }`}
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">
                Please select a date.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Optional description"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                className="form-control"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                placeholder="Additional notes (optional)"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Type</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="expense"
                  value="expense"
                  checked={formData.type === "expense"}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="expense">
                  Expense
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="income"
                  value="income"
                  checked={formData.type === "income"}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="income">
                  Income
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <div>
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={resetForm}
                >
                  Reset
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "Update Transaction" : "Add Transaction"}
                </button>
              </div>
            </div>
          </form>
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
                    <th>Actions</th>
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
                      <td className="actions-cell">
                        <button
                          className="btn btn-outline-warning me-3"
                          onClick={() => handleEdit(transaction)}
                          aria-label={`Edit transaction ${transaction.id}`}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger table-btn"
                          onClick={() => handleDelete(transaction.id)}
                          aria-label={`Delete transaction ${transaction.id}`}
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Toast Notification */}
      <div
        className={`toast align-items-center text-dark border-0 position-fixed top-0 end-0 m-3 ${
          showToast ? "show" : ""
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">
            Transaction {editId ? "updated" : "added"} successfully!
          </div>
          <button
            type="button"
            className="btn-close me-2 m-auto"
            onClick={() => setShowToast(false)}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
}

export default AddTransaction;