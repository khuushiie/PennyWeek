import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import "../styles/NotificationsSettings.css";

function NotificationsSettings() {
  const { isLoggedIn, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: false,
    notificationFrequency: "immediate",
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Initialize formData when user is loaded
  useEffect(() => {
    if (user?.preferences) {
      setFormData({
        emailNotifications: user.preferences.emailNotifications ?? true,
        smsNotifications: user.preferences.smsNotifications ?? false,
        pushNotifications: user.preferences.pushNotifications ?? false,
        notificationFrequency: user.preferences.notificationFrequency || "immediate",
      });
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      console.log("User not logged in, redirecting to /login");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, checked, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fullPreferences = {
        ...user.preferences,
        ...formData,
      };
      await updateUser({ preferences: fullPreferences }, false);
      console.log("Notifications updated successfully");
      setToastMessage("Notifications updated successfully!");
      setIsError(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Update notifications error:", err.message);
      setToastMessage(err.message || "Failed to update notifications");
      setIsError(true);
      setShowToast(true);
    }
  };

  if (!user) {
    console.log("User data is undefined");
    return <div>Loading...</div>;
  }

  return (
    <div className="notifications-settings-page">
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
                Notifications
              </li>
            </ol>
          </nav>
          <h2 className="section-heading mb-5">Notification Settings</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <h4 className="notification-heading">Notification Channels</h4>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="emailNotifications">
                  Email Notifications
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="smsNotifications"
                  name="smsNotifications"
                  checked={formData.smsNotifications}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="smsNotifications">
                  SMS Notifications
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="pushNotifications"
                  name="pushNotifications"
                  checked={formData.pushNotifications}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="pushNotifications">
                  Push Notifications
                </label>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="notification-heading">Notification Frequency</h4>
              <select
                className="form-select modern-input"
                id="notificationFrequency"
                name="notificationFrequency"
                value={formData.notificationFrequency}
                onChange={handleInputChange}
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
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
                Save Notifications
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

export default NotificationsSettings;