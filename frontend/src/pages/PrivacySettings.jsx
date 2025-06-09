import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import axios from "axios";
import "../styles/PrivacySettings.css";

function PrivacySettings() {
  const { isLoggedIn, user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [dataSharing, setDataSharing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      console.log('PrivacySettings: useEffect - Updating preferences', {
        dataSharing: user.preferences.dataSharing,
      });
      setDataSharing(user.preferences.dataSharing || false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9#?!@$%^&*-]/g, '');
    console.log(`PrivacySettings: Input change - ${name}:`, sanitizedValue);
    setPasswordForm((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setError(null);
    setSuccess(null);
    setLoading(true);
    console.log('PrivacySettings: Submitting password change', {
      oldPassword: passwordForm.oldPassword ? '[filled]' : '[empty]',
      newPassword: passwordForm.newPassword ? '[filled]' : '[empty]',
      confirmPassword: passwordForm.confirmPassword ? '[filled]' : '[empty]',
    });

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("All password fields are required");
      setLoading(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords must match");
      setLoading(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      setLoading(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/users/change-password',
        { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess("Password changed successfully!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setValidated(false);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to change password";
      setError(errorMsg);
      console.error('PrivacySettings: Password change error:', errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async (e, field) => {
    const { checked } = e.target;
    console.log('PrivacySettings: Toggling', field, checked);
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (field === "dataSharing") {
        setDataSharing(checked);
        await updateUser({
          preferences: { ...user.preferences, dataSharing: checked },
        });
        setSuccess("Data sharing settings updated!");
        console.log('PrivacySettings: Data sharing updated');
      }
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Failed to ${checked ? 'enable' : 'disable'} ${field}`;
      setError(errorMsg);
      console.error('PrivacySettings: Toggle error', field, errorMsg);
      if (field === "dataSharing") {
        setDataSharing(!checked);
      }
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    console.log('PrivacySettings: Deleting account');

    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/users/delete', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Account deleted successfully!");
      logout();
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete account";
      setError(errorMsg);
      console.error('PrivacySettings: Delete account error:', errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const alertStyle = {
    position: 'relative',
    zIndex: 1000,
    marginBottom: '1rem',
    padding: '1rem',
    borderRadius: '0.25rem',
    fontSize: '1rem',
  };

  const alertSuccessStyle = {
    ...alertStyle,
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  };

  const alertDangerStyle = {
    ...alertStyle,
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="privacy-settings-page">
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
                Privacy & Security
              </li>
            </ol>
          </nav>
          <h2 className="section-heading mb-5">Privacy & Security</h2>
          {error && (
            <motion.div
              style={alertDangerStyle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              style={alertSuccessStyle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {success}
            </motion.div>
          )}
          <form className="needs-validation" noValidate onSubmit={handlePasswordSubmit}>
            <div className="mb-4 position-relative">
              <label htmlFor="oldPassword" className="form-label">Old Password</label>
              <div className="input-group">
                <input
                  type={showOldPassword ? "text" : "password"}
                  className={`form-control modern-input ${validated && !passwordForm.oldPassword ? "is-invalid" : ""}`}
                  id="oldPassword"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordInput}
                  required
                  disabled={loading}
                />
                <span className="input-group-text password-toggle">
                  <i
                    className={showOldPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                    onClick={toggleOldPasswordVisibility}
                    style={{ cursor: "pointer", color: "#00A3E0" }}
                  ></i>
                </span>
                <div className="invalid-feedback">Please enter your old password.</div>
              </div>
            </div>
            <div className="mb-4 position-relative">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <div className="input-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className={`form-control modern-input ${validated && !passwordForm.newPassword ? "is-invalid" : ""}`}
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInput}
                  required
                  disabled={loading}
                />
                <span className="input-group-text password-toggle">
                  <i
                    className={showNewPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                    onClick={toggleNewPasswordVisibility}
                    style={{ cursor: "pointer", color: "#00A3E0" }}
                  ></i>
                </span>
                <div className="invalid-feedback">Please enter a new password.</div>
              </div>
            </div>
            <div className="mb-4 position-relative">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control modern-input ${validated && !passwordForm.confirmPassword ? "is-invalid" : ""}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInput}
                  required
                  disabled={loading}
                />
                <span className="input-group-text password-toggle">
                  <i
                    className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                    onClick={toggleConfirmPasswordVisibility}
                    style={{ cursor: "pointer", color: "#00A3E0" }}
                  ></i>
                </span>
                <div className="invalid-feedback">Please confirm your new password.</div>
              </div>
            </div>
            <div className="text-end">
              <motion.button
                type="submit"
                className="btn btn-primary-modern"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </motion.button>
            </div>
          </form>
          <hr className="my-5" />
          <div className="mb-4">
            <h4 className="privacy-heading">Privacy Settings</h4>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="dataSharing"
                checked={dataSharing}
                onChange={(e) => handleToggleChange(e, "dataSharing")}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="dataSharing">
                Allow data sharing for analytics
              </label>
            </div>
          </div>
          <hr className="my-5" />
          <div className="mb-4">
            <h4 className="privacy-heading">Delete Account</h4>
            <p className="text-danger">This action is permanent and cannot be undone.</p>
            <motion.button
              className="btn btn-danger-modern"
              onClick={handleDeleteAccount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              Delete Account
            </motion.button>
          </div>
          <div className="text-end">
            <Link to="/settings" className="btn btn-outline-modern">Back</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PrivacySettings;