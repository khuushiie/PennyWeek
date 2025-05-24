import React, { useEffect } from 'react';
import { useTransactions } from '../TransactionContext';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import '../styles/InsightsTab.css'; // Create this for styling

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const InsightsTab = () => {
  const { insights, fetchInsights } = useTransactions();

  useEffect(() => {
    fetchInsights();
  }, []);

  // Pie chart for category distribution
  const pieData = {
    labels: insights?.categoryTotals ? Object.keys(insights.categoryTotals) : [],
    datasets: [{
      data: insights?.categoryTotals ? Object.values(insights.categoryTotals) : [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }],
  };

  // Bar chart for monthly trends
  const barData = {
    labels: insights?.monthlyTotals ? Object.keys(insights.monthlyTotals) : [],
    datasets: [{
      label: 'Monthly Expenses',
      data: insights?.monthlyTotals ? Object.values(insights.monthlyTotals) : [],
      backgroundColor: '#36A2EB',
    }],
  };

  // Top categories
  const topCategories = insights?.categoryTotals
    ? Object.entries(insights.categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, amount]) => `${category}: ₹${amount}`)
    : [];

  return (
    <div className="insights-tab container py-4">
      <h2 className="text-center mb-4">Spending Insights</h2>
      <div className="row">
        <div className="col-md-6">
          <h4>Expenses by Category</h4>
          <Pie
            data={pieData}
            options={{
              plugins: { legend: { position: 'top' }, title: { display: true, text: 'Category Distribution' } },
            }}
          />
        </div>
        <div className="col-md-6">
          <h4>Monthly Spending Trends</h4>
          <Bar
            data={barData}
            options={{
              plugins: { legend: { display: false }, title: { display: true, text: 'Monthly Expenses' } },
              scales: { y: { beginAtZero: true, title: { display: true, text: 'Amount (₹)' } } },
            }}
          />
        </div>
      </div>
      <div className="mt-4">
        <h4>Top Spending Categories</h4>
        <ul>
          {topCategories.map((cat, index) => (
            <li key={index}>{cat}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InsightsTab;