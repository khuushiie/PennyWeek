// src/pages/Dashboard.jsx
import React from "react";

function Dashboard() {
  return (
    <div className="container">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <h5>Total Income</h5>
            <p>$5000</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <h5>Total Expenses</h5>
            <p>$3000</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <h5>Balance</h5>
            <p>$2000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

