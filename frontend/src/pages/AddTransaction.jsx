import React, { useState } from 'react';

function AddTransaction () {
  return (
    <div className="container">
      <h2 className="mb-4">Add Transaction</h2>
      <form className="mb-3">
        <div className="mb-3">
          <label htmlFor="amount" className="form-label">Amount</label>
          <input type="number" className="form-control" id="amount" placeholder="Enter amount" />
        </div>
        <div className="mb-3">
          <label htmlFor="type" className="form-label">Type</label>
          <select className="form-select" id="type">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">Date</label>
          <input type="date" className="form-control" id="date" />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea className="form-control" id="description" placeholder="Enter description"></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Add Transaction</button>
      </form>
    </div>
  );
};

export default AddTransaction;
