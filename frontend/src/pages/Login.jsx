import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import "../styles/Login.css";

function Login() {
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    setValidated(true);

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Hide toast after 3s
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign In clicked"); // Replace with OAuth logic
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
          <motion.p
            className="text-center mb-3 tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Log In to Manage Your Finances!
          </motion.p>
          <h2 className="mb-4 text-center">Login</h2>

          <button
            className="btn btn-outline-primary w-100 mb-3"
            onClick={handleGoogleSignIn}
          >
            <FaGoogle className="me-2" /> Sign in with Google
          </button>

          <div className="text-center mb-3">
            <span className="or-divider">or</span>
          </div>

          <form
            className="needs-validation"
            noValidate
            onSubmit={handleSubmit}
            validated={validated}
          >
            <div className="mb-3 position-relative">
              <label htmlFor="email" className="form-label login-heading">
                Email address
              </label>
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
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  aria-label="Email"
                />
                <div className="invalid-feedback">
                  Please provide a valid email address.
                </div>
              </div>
            </div>

            <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label login-heading">
                Password
              </label>
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                  aria-label="Password"
                />
                <div className="invalid-feedback">
                  Password must be at least 6 characters.
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary login w-100">
              Login
            </button>
          </form>

          <div className="mt-3 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="register-link">
              Register here
            </Link>
          </div>
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
          <div className="toast-body">Login successful!</div>
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
