import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import "../styles/Register.css"; 

function Register() {
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { text: "Weak", width: "33%", color: "#DC3545" };
    if (password.length < 10) return { text: "Moderate", width: "66%", color: "#FFC107" };
    return { text: "Strong", width: "100%", color: "#28A745" };
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

  const handleGoogleSignUp = () => {
    console.log("Google Sign Up clicked"); // Replace with OAuth logic
  };

  return (
    <div className="register-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          className="register-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-4 text-center">
            Join PennyWeek and Master Your Money!
          </h2>

          <button
            className="btn btn-outline-primary w-100 mb-3"
            onClick={handleGoogleSignUp}
          >
            <FaGoogle className="me-2" /> Sign up with Google
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
              {/* <label htmlFor="username" className="form-label register-heading">
                Username
              </label> */}
              <div className="input-group">
                <span className="input-group-text">
                  <FaUser color="#00A3E0" />
                </span>
                <input
                  type="text"
                  className={`form-control ${
                    validated && !formData.username ? "is-invalid" : ""
                  }`}
                  id="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  aria-label="Username"
                />
                <div className="invalid-feedback">
                  Please provide a valid username.
                </div>
              </div>
            </div>

            <div className="mb-3 position-relative">
              {/* <label htmlFor="email" className="form-label register-heading">
                Email
              </label> */}
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
                  placeholder="Enter email"
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
              {/* <label htmlFor="password" className="form-label register-heading">
                Password
              </label> */}
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
                  placeholder="Enter password"
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
              {formData.password && (
                <div className="mt-2">
                  <span className="password-strength-text">
                    Password Strength: {getPasswordStrength(formData.password).text}
                  </span>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: getPasswordStrength(formData.password).width,
                        backgroundColor: getPasswordStrength(formData.password).color,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-3 position-relative">
              {/* <label
                htmlFor="confirmPassword"
                className="form-label register-heading"
              >
                Confirm Password
              </label> */}
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock color="#00A3E0" />
                </span>
                <input
                  type="password"
                  className={`form-control ${
                    validated && formData.confirmPassword !== formData.password
                      ? "is-invalid"
                      : ""
                  }`}
                  id="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  aria-label="Confirm Password"
                />
                <div className="invalid-feedback">Passwords must match.</div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary register w-100">
              Register
            </button>
          </form>

          <div className="mt-3 text-center">
            Already have an account?{" "}
            <Link to="/login" className="login-link" style={{ textDecoration: "none" }}>
              Login here
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
          <div className="toast-body">Registration successful!</div>
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

export default Register;
