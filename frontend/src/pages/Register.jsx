import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "../styles/Register.css";
import { API_BASE_URL } from "../api.js";

function Register() {
  const [validated, setValidated] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", isError: false });
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsSignedUp(false);
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { text: "Weak", width: "33%", color: "#DC3545" };
    if (password.length < 10) return { text: "Moderate", width: "66%", color: "#FFC107" };
    return { text: "Strong", width: "100%", color: "#28A745" };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    setValidated(true);
    setToast({ show: false, message: "", isError: false });

    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ show: true, message: "Passwords do not match", isError: true });
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setToast({ show: true, message: "Please fill all required fields", isError: true });
      return;
    }

    try {
      const { name, email, password } = formData;

      // Step 1: Register user
      const registerRes = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // Step 2: Login user
      const loginRes = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, user } = loginRes.data;
      await login(token, user);

      // Success toast and redirect
      setToast({
        show: true,
        message: "Registration successful! Redirecting to dashboard...",
        isError: false,
      });

      setIsSignedUp(true);
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setValidated(false);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setToast({ show: true, message, isError: true });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="register-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          className="register-card p-4"
          initial={{ opacity: 0.3, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-4 text-center">Join PennyWeek and Master Your Money!</h2>

          {isSignedUp ? (
            <div className="text-center">
              <p className="already-signed-up">
                You’re already signed up!{" "}
                <Link to="/login" className="login-link">Log In here</Link>
              </p>
            </div>
          ) : (
            <>
              <form className="needs-validation" noValidate onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3 position-relative">
                  <div className="input-group">
                    <span className="input-group-text"><FaUser color="#00A3E0" /></span>
                    <input
                      type="text"
                      className={`form-control ${validated && !formData.name ? "is-invalid" : ""}`}
                      id="name"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="invalid-feedback">Please provide a valid name.</div>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3 position-relative">
                  <div className="input-group">
                    <span className="input-group-text"><FaEnvelope color="#00A3E0" /></span>
                    <input
                      type="email"
                      className={`form-control ${validated && !formData.email ? "is-invalid" : ""}`}
                      id="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="invalid-feedback">Please provide a valid email address.</div>
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3 position-relative">
                  <div className="input-group">
                    <span className="input-group-text"><FaLock color="#00A3E0" /></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${validated && !formData.password ? "is-invalid" : ""}`}
                      id="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength="6"
                    />
                    <span className="input-group-text password-toggle">
                      <i
                        className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                        onClick={togglePasswordVisibility}
                        style={{ cursor: "pointer", color: "#00A3E0" }}
                      ></i>
                    </span>
                    <div className="invalid-feedback">Password must be at least 6 characters.</div>
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

                {/* Confirm Password */}
                <div className="mb-3 position-relative">
                  <div className="input-group">
                    <span className="input-group-text"><FaLock color="#00A3E0" /></span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${
                        validated && formData.confirmPassword !== formData.password ? "is-invalid" : ""
                      }`}
                      id="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="input-group-text password-toggle">
                      <i
                        className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                        onClick={toggleConfirmPasswordVisibility}
                        style={{ cursor: "pointer", color: "#00A3E0" }}
                      ></i>
                    </span>
                    <div className="invalid-feedback">Passwords must match.</div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-primary register w-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Register
                </motion.button>
              </form>

              <div className="mt-3 text-center">
                Already have an account?{" "}
                <Link to="/login" className="login-link">Login here</Link>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {toast.show && (
        <motion.div
          className={`toast align-items-center border-0 position-fixed top-0 end-0 m-3 ${
            toast.isError ? "text-bg-danger" : "text-bg-success"
          }`}
          role="alert"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="d-flex">
            <div className="toast-body">
              {toast.message}
              {toast.message === "Email already registered" && (
                <>
                  {" "}
                  <Link to="/login" className="text-white text-decoration-underline">
                    Log in instead
                  </Link>
                </>
              )}
            </div>
            <button
              type="button"
              className="btn-close me-2 m-auto"
              onClick={() => setToast({ show: false, message: "", isError: false })}
              aria-label="Close"
            ></button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Register;