import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useAuth } from "../AuthContext";
import "../styles/Login.css";

function Login() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setValidated(true);

    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }

    try {
      await login(formData.email, formData.password);
      setToastMessage("Login successful!");
      setShowToast(true);
      setFormData({ email: "", password: "" });
      setValidated(false);
      setTimeout(() => {
        setShowToast(false);
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      setToastMessage(err.message || "Login failed");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="login-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          className="login-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-4 text-center">Log In to PennyWeek</h2>
          <form className="needs-validation" noValidate onSubmit={handleSubmit}>
            <div className="mb-3 position-relative">
              <div className="input-group">
                <span className="input-group-text">
                  <FaEnvelope color="#00A3E0" />
                </span>
                <input
                  type="email"
                  className={`form-control ${
                    validated && !formData.email ? "is-invalid" : ""
                  }`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  aria-label="Email"
                />
                <div className="invalid-feedback">Please enter a valid email.</div>
              </div>
            </div>
            <div className="mb-3 position-relative">
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock color="#00A3E0" />
                </span>
                <input
                  type="password"
                  className={`form-control ${
                    validated && !formData.password ? "is-invalid" : ""
                  }`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  aria-label="Password"
                />
                <div className="invalid-feedback">Please enter your password.</div>
              </div>
            </div>
            <div className="text-center mb-3">
              <motion.button
                type="submit"
                className="btn btn-primary w-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log In
              </motion.button>
            </div>
            <div className="text-center">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="link-primary">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Toast Notification */}
      <div
        className={`toast align-items-center text-dark border-0 position-fixed top-0 end-0 m-3 ${
          showToast ? "show" : ""
        }`}
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

export default Login;