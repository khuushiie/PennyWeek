import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import { useUser } from "../UserContext";
import "../styles/PreferencesSettings.css";

function PreferencesSettings() {
  const { isLoggedIn } = useAuth();
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(
    user?.preferences || {
      theme: "light",
      defaultCurrency: "USD",
      notifications: true,
    }
  );
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      console.log("User not logged in, redirecting to /login");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      updateUser({ preferences: formData });
      console.log("Preferences updated successfully");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setError("");
    } catch (err) {
      console.error("Update preferences error:", err);
      setError("Failed to update preferences.");
      setShowToast(true);
    }
  };

  if (!user) {
    console.log("User context is undefined");
    return <div>Loading...</div>;
  }

  return (
    <div className="preferences-settings-page">
      <div className="container py-5">
        <motion.div
          className="settings-card p-5"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/settings">Settings</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Preferences
              </li>
            </ol>
          </nav>
          <h2 className="section-heading mb-5">Preferences</h2>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Theme</label>
              <div className="theme-preview mb-3">
                <div className="form-check form-check-inline theme-option-wrapper">
                  <input
                    className="form-check-input custom-radio"
                    type="radio"
                    name="theme"
                    id="light"
                    value="light"
                    checked={formData.theme === "light"}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label theme-option light" htmlFor="light">
                    Light
                  </label>
                </div>
                <div className="form-check form-check-inline theme-option-wrapper">
                  <input
                    className="form-check-input custom-radio"
                    type="radio"
                    name="theme"
                    id="dark"
                    value="dark"
                    checked={formData.theme === "dark"}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label theme-option dark" htmlFor="dark">
                    Dark
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="defaultCurrency" className="form-label">
                Default Currency
              </label>
              <select
                className="form-select modern-input"
                id="defaultCurrency"
                name="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={handleInputChange}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label">Notifications</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="notifications">
                  Receive email notifications
                </label>
              </div>
            </div>
            <div className="text-end">
              <Link to="/settings" className="btn btn-outline-modern me-2">
                Back
              </Link>
              <motion.button
                type="submit"
                className="btn btn-primary-modern"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Preferences
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

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
            {error ? error : "Preferences updated successfully!"}
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

export default PreferencesSettings;