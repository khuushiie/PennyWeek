import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import "../styles/PrivacySettings.css";

function PrivacySettings() {
  const { isLoggedIn, user, updateUser, changePassword } = useAuth();
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [dataSharing, setDataSharing] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setDataSharing(user.preferences.dataSharing || false);
      setTwoFactor(user.preferences.twoFactor || false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log("User not logged in, redirecting to /login");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setValidated(true);

    if (
      form.checkValidity() &&
      passwordForm.newPassword === passwordForm.confirmPassword
    ) {
      try {
        await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
        setToastMessage("Password changed successfully!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setValidated(false);
        setError("");
      } catch (err) {
        console.error("Password change error:", err);
        setError(err.message || "Failed to change password.");
        setShowToast(true);
      }
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match.");
      setShowToast(true);
    }
  };

  const handleToggleChange = async (e, field) => {
    const { checked } = e.target;
    try {
      if (field === "dataSharing") {
        setDataSharing(checked);
        await updateUser({
          preferences: { ...user.preferences, dataSharing: checked },
        });
        setToastMessage("Privacy settings updated!");
      } else if (field === "twoFactor") {
        setTwoFactor(checked);
        await updateUser({
          preferences: { ...user.preferences, twoFactor: checked },
        });
        setToastMessage("Two-factor authentication updated!");
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setError("");
    } catch (err) {
      console.error("Toggle update error:", err);
      setError("Failed to update settings.");
      setShowToast(true);
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

  if (!user) {
    console.log("User data is undefined");
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
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form
            className="needs-validation"
            noValidate
            onSubmit={handlePasswordSubmit}
          >
            <div className="mb-4 position-relative">
              <label htmlFor="oldPassword" className="form-label">
                Old Password
              </label>
              <div className="input-group">
                <input
                  type={showOldPassword ? "text" : "password"}
                  className={`form-control modern-input ${validated && !passwordForm.oldPassword ? "is-invalid" : ""
                    }`}
                  id="oldPassword"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordInput}
                  required
                />
                <span className="input-group-text password-toggle">
                  <i
                    className={showOldPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                    onClick={toggleOldPasswordVisibility}
                    style={{ cursor: "pointer", color: "#00A3E0" }}
                  ></i>
                </span>
                <div className="invalid-feedback">
                  Please enter your old password.
                </div>
              </div>
            </div>
            <div className="mb-4 position-relative">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <div className="input-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className={`form-control modern-input ${validated && !passwordForm.newPassword ? "is-invalid" : ""
                    }`}
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInput}
                  required
                />
                <span className="input-group-text password-toggle">
                  <i
                    className={showNewPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                    onClick={toggleNewPasswordVisibility}
                    style={{ cursor: "pointer", color: "#00A3E0" }}
                  ></i>
                </span>
                <div className="invalid-feedback">
                  Please enter a new password.
                </div>
              </div>
            </div>
            <div className="mb-4 position-relative">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control modern-input ${validated && !passwordForm.confirmPassword ? "is-invalid" : ""
                    }`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInput}
                  required
                />
                <span className="input-group-text password-toggle">
                  <i
                    className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                    onClick={toggleConfirmPasswordVisibility}
                    style={{ cursor: "pointer", color: "#00A3E0" }}
                  ></i>
                </span>
                <div className="invalid-feedback">
                  Please confirm your new password.
                </div>
              </div>
            </div>
            <div className="text-end">
              <motion.button
                type="submit"
                className="btn btn-primary-modern"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Change Password
              </motion.button>
            </div>
          </form>
          <hr className="my-5" />
          <div className="mb-4">
            <h4 className="privacy-heading">Security Settings</h4>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="twoFactor"
                checked={twoFactor}
                onChange={(e) => handleToggleChange(e, "twoFactor")}
              />
              <label className="form-check-label" htmlFor="twoFactor">
                Enable Two-Factor Authentication
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="dataSharing"
                checked={dataSharing}
                onChange={(e) => handleToggleChange(e, "dataSharing")}
              />
              <label className="form-check-label" htmlFor="dataSharing">
                Allow data sharing for analytics
              </label>
            </div>
          </div>
          <div className="text-end">
            <Link to="/settings" className="btn btn-outline-modern">
              Back
            </Link>
          </div>
        </motion.div>
      </div>

      <div
        className={`toast align-items-center text-dark border-0 position-fixed top-0 end-0 m-3 ${showToast ? "show" : ""
          }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">{toastMessage || error}</div>
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

export default PrivacySettings;