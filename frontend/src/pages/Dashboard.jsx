import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import { useTransactions } from "../TransactionContext";
import { Line } from "react-chartjs-2";
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
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const { user, logout } = useAuth();
  const { transactions, loading, error } = useTransactions();
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [filterType, setFilterType] = useState("all");

  console.log("Dashboard: Transactions:", transactions); // Debug

  const currencies = [
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "INR", symbol: "₹" },
    { code: "GBP", symbol: "£" },
  ];

  // Financial Summary
  const summary = useMemo(() => {
    const summaries = currencies.reduce((acc, cur) => {
      const income = transactions
        .filter((t) => t.type === "income" && (t.currency || "INR") === cur.code)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter((t) => t.type === "expense" && (t.currency || "INR") === cur.code)
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
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter((t) => t.type === "income")
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
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateLabels.push(new Date(d).toISOString().split("T")[0]);
    }

    const incomeData = new Array(dateLabels.length).fill(0);
    const expenseData = new Array(dateLabels.length).fill(0);

    transactions.forEach((t) => {
      const tDate = new Date(t.date).toISOString().split("T")[0];
      const index = dateLabels.indexOf(tDate);
      if (index !== -1 && (t.currency || "INR") === "INR") {
        if (t.type === "income") {
          incomeData[index] += t.amount;
        } else if (t.type === "expense") {
          expenseData[index] += t.amount;
        }
      }
    });

    console.log("Dashboard: Chart Data:", { labels: dateLabels, incomeData, expenseData }); // Debug

    return {
      labels: dateLabels.map((d) => new Date(d).toLocaleDateString()),
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: "#00A3E0",
          backgroundColor: "rgba(0, 163, 224, 0.2)",
          fill: true,
        },
        {
          label: "Expenses",
          data: expenseData,
          borderColor: "#FF6B6B",
          backgroundColor: "rgba(255, 107, 107, 0.2)",
          fill: true,
        },
      ],
    };
  }, [transactions]);

  // PDF Generation
  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().split("T")[0];

    autoTable(doc, {});

    // Header
    doc.setFontSize(18);
    doc.setTextColor("#1A3C5A");
    doc.text("PennyWeek Transaction Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Financial Summary
    doc.setFontSize(14);
    doc.text("Financial Summary", 14, 45);
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
    doc.text(
      `Total Spent (All Currencies): ₹${totalSummary.totalSpent.toFixed(2)}`,
      14,
      yPos
    );
    yPos += 8;
    doc.text(
      `Total Saved (All Currencies): ₹${totalSummary.totalSaved.toFixed(2)}`,
      14,
      yPos
    );
    yPos += 15;

    // Transaction Table
    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Amount", "Currency", "Category", "Type", "Notes"]],
      body: sortedTransactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        `${currencies.find((c) => c.code === (t.currency || "INR"))?.symbol}${t.amount.toFixed(2)}`,
        t.currency || "INR",
        t.category,
        t.type,
        t.note || "-",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: "#1A3C5A",
        textColor: "#F4F9FC",
        fontSize: 10,
      },
      bodyStyles: {
        textColor: "#1A3C5A",
        fontSize: 9,
        cellPadding: 4,
      },
      styles: {
        font: "helvetica",
        lineColor: "#1A3C5A",
        lineWidth: 0.1,
      },
      margin: { top: 40, left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 30 }, // Date
        1: { cellWidth: 30 }, // Amount
        2: { cellWidth: 25 }, // Currency
        3: { cellWidth: 30 }, // Category
        4: { cellWidth: 25 }, // Type
        5: { cellWidth: 40 }, // Notes
      },
    });

    doc.save(`pennyweek_report_${dateStr}.pdf`);
  };

  // Sorting and Filtering
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

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

  const handleLogout = () => {
    logout();
  };

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Loading user...</div>;

  return (
    <div className="dashboard-page">
      <div className="container py-5">
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
              <div className="row text-center">
                {Object.entries(summary).map(([currency, data]) => (
                  <div key={currency} className="col-md-4 mb-4">
                    <h4>{currency}</h4>
                    <div className="summary-item">
                      <h5 className="summary-label">Income</h5>
                      <p className="summary-value income">
                        {currencies.find((c) => c.code === currency)?.symbol}
                        {data.income.toFixed(2)}
                      </p>
                    </div>
                    <div className="summary-item">
                      <h5 className="summary-label">Expenses</h5>
                      <p className="summary-value expense">
                        {currencies.find((c) => c.code === currency)?.symbol}
                        {data.expenses.toFixed(2)}
                      </p>
                    </div>
                    <div className="summary-item">
                      <h5 className="summary-label">Balance</h5>
                      <p
                        className={`summary-value ${
                          data.balance >= 0 ? "income" : "expense"
                        }`}
                      >
                        {currencies.find((c) => c.code === currency)?.symbol}
                        {data.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="col-md-12 mt-4">
                  <div className="summary-item">
                    <h5 className="summary-label">Total Spent (All Currencies)</h5>
                    <p className="summary-value expense">
                      ₹{totalSummary.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div className="summary-item">
                    <h5 className="summary-label">Total Saved (All Currencies)</h5>
                    <p
                      className={`summary-value ${
                        totalSummary.totalSaved >= 0 ? "income" : "expense"
                      }`}
                    >
                      ₹{totalSummary.totalSaved.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="text-center mt-4">
            <Link to="/add-transaction" className="btn btn-primary me-2">
              Add New Transaction
            </Link>
            <button className="btn btn-success me-2" onClick={generatePDF}>
              Generate Report
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </motion.div>

        <motion.div
          className="transaction-table-card p-4 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading text-center mb-4">Transaction Graph</h2>
          {transactions.length === 0 || transactions.every(t => (t.currency || "INR") !== "INR" || new Date(t.date) < new Date("2025-04-10")) ? (
            <p className="text-center">No INR transactions in the last 30 days to display in the graph.</p>
          ) : (
            <div className="chart-container">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    title: { display: true, text: "Transactions Over Last 30 Days (INR)" },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Amount (₹)" },
                    },
                    x: {
                      title: { display: true, text: "Date" },
                    },
                  },
                }}
              />
            </div>
          )}
        </motion.div>

        <motion.div
          className="transaction-table-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading text-center mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-center">No transactions available.</p>
          ) : (
            <>
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
                      <th>Currency</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>
                          {currencies.find((c) => c.code === (transaction.currency || "INR"))
                            ?.symbol}
                          {transaction.amount.toFixed(2)}
                        </td>
                        <td>{transaction.currency || "INR"}</td>
                        <td>{transaction.category}</td>
                        <td>{transaction.type}</td>
                        <td>{transaction.note || "-"}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;

