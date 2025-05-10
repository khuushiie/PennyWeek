import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    setValidated(true);

    if (form.checkValidity()) {
      // Call login from AuthContext
      login(formData.email, formData.password);
      setToastMessage("Login successful!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setFormData({ email: "", password: "" });
      setValidated(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container py-5">
        <motion.div
          className="login-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading text-center mb-4">Login</h2>
          <form
            className="needs-validation"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className={`form-control ${
                  validated && !formData.email ? "is-invalid" : ""
                }`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">
                Please enter a valid email.
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className={`form-control ${
                  validated && !formData.password ? "is-invalid" : ""
                }`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <div className="invalid-feedback">
                Please enter your password.
              </div>
            </div>
            <div className="text-center mb-3">
              <button type="submit" className="btn btn-primary">
                Login
              </button>
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