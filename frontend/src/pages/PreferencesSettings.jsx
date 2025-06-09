import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import "../styles/PreferencesSettings.css";

function PreferencesSettings() {
  const { isLoggedIn, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    defaultCurrency: "USD",
    emailNotifications: true,
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setFormData({
        defaultCurrency: user.preferences.defaultCurrency || "USD",
        emailNotifications: user.preferences.emailNotifications ?? true,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log("User not logged in, redirecting to /login");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ preferences: formData }, false);
      console.log("Preferences updated successfully");
      setToastMessage("Preferences updated successfully!");
      setIsError(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Update preferences error:", err.message);
      setToastMessage(err.message || "Failed to update preferences");
      setIsError(true);
      setShowToast(true);
    }
  };

  if (!user) {
    console.log("User data is undefined");
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
          <form onSubmit={handleSubmit}>
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
                <option value="INR">INR (₹)</option>
              </select>
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
        className={`toast align-items-center border-0 position-fixed top-0 end-0 m-3 ${
          showToast ? "show" : ""
        } ${isError ? "text-bg-danger" : "text-bg-success"}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">{toastMessage}</div>
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