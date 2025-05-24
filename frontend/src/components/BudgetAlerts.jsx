import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTransactions } from "../TransactionContext";
import "../styles/BudgetAlerts.css";

function BudgetAlerts() {
  const { budgets, transactions, recurringTransactions } = useTransactions();
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  // Calculate total spending per category
  const getCategorySpending = (category) => {
    const regularSpending = transactions
      .filter(
        (t) =>
          t.category === category &&
          t.type === "expense" &&
          (t.currency || "INR") === "INR"
      )
      .reduce((sum, t) => sum + t.amount, 0);
    const recurringSpending = recurringTransactions
      .filter(
        (rt) =>
          rt.category === category &&
          rt.type === "expense" &&
          (rt.currency || "INR") === "INR"
      )
      .reduce((sum, rt) => {
        // Assume monthly recurring for May 2025
        const startDate = new Date(rt.startDate);
        const endDate = rt.endDate
          ? new Date(rt.endDate)
          : new Date("2025-05-31");
        const today = new Date("2025-05-17");
        if (startDate <= today && (!rt.endDate || endDate >= today)) {
          return sum + rt.amount; // Count for current month
        }
        return sum;
      }, 0);
    return regularSpending + recurringSpending;
  };

  // Find exceeded budgets
  const alerts = budgets
    .map((budget) => {
      const spending = getCategorySpending(budget.category);
      if (
        spending > budget.amount &&
        !dismissedAlerts.includes(budget.category)
      ) {
        return {
          category: budget.category,
          spending,
          budget: budget.amount,
        };
      }
      return null;
    })
    .filter((alert) => alert !== null);

  const handleDismiss = (category) => {
    setDismissedAlerts((prev) => [...prev, category]);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="budget-alerts-container">
      {alerts.map((alert) => (
        <motion.div
          key={alert.category}
          className="budget-alert"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Budget Alert: {alert.category}</h3>
          <p>
            You’ve spent ₹{alert.spending.toFixed(2)} in {alert.category},
            exceeding your budget of ₹{alert.budget.toFixed(2)}.
          </p>
          <motion.button
            className="dismiss-button"
            onClick={() => handleDismiss(alert.category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Dismiss
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}

export default BudgetAlerts;
