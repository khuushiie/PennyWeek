import React from 'react';

function Settings () {
  return (
    <div className="container">
      <h2 className="mb-4">Settings</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="currency" className="form-label">Default Currency</label>
          <select className="form-select" id="currency">
            <option value="USD">USD</option>
            <option value="INR">INR</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="notification" className="form-label">Notifications</label>
          <select className="form-select" id="notification">
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="theme" className="form-label">Theme</label>
          <select className="form-select" id="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;
