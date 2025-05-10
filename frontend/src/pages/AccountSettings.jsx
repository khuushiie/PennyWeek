import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import "../styles/AccountSettings.css";

function AccountSettings() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Handle account deletion
  const handleDeleteAccount = () => {
    logout();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setShowDeleteModal(false);
  };

  return (
    <div className="account-settings-page">
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
                Account
              </li>
            </ol>
          </nav>
          <h2 className="section-heading mb-5">Account Settings</h2>
          <div className="mb-4">
            <h4 className="account-heading">Logout</h4>
            <p>Sign out of your PennyWeek account.</p>
            <motion.button
              className="btn btn-outline-danger-modern"
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
          <hr className="my-5" />
          <div className="mb-4 danger-zone">
            <h4 className="account-heading">Delete Account</h4>
            <p>
              Permanently delete your account and all data. This action cannot be undone.
            </p>
            <motion.button
              className="btn btn-danger-modern"
              onClick={() => setShowDeleteModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Delete Account
            </motion.button>
          </div>
          <div className="text-end">
            <Link to="/settings" className="btn btn-outline-modern">
              Back
            </Link>
          </div>
        </motion.div>
      </div>

      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Confirm Account Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete your account? This action cannot
                  be undone.
                </p>
              </div>
              <div className="modal-footer">
                <motion.button
                  type="button"
                  className="btn btn-outline-modern"
                  onClick={() => setShowDeleteModal(false)}
                  whileHover={{ scale: 1.05 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  className="btn btn-danger-modern"
                  onClick={handleDeleteAccount}
                  whileHover={{ scale: 1.05 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <div
        className={`toast align-items-center text-dark border-0 position-fixed top-0 end-0 m-3 ${
          showToast ? "show" : ""
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">Account deleted successfully!</div>
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

export default AccountSettings;