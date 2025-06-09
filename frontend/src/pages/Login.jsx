import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useAuth } from "../AuthContext";
import axios from "axios";
import "../styles/Login.css";
import { API_BASE_URL } from '../api.js';

function Login() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log('Login: useEffect - isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log(`Login: Input change - ${name}:`, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setError(null);
    setSuccess(null);
    console.log('Login: Submitting', { 
      email: formData.email, 
      password: formData.password ? '[filled]' : '[empty]' 
    });

    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      console.log('Login: Missing required fields');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Login: /auth/login response', {
        token: response.data.token ? '[present]' : '[missing]',
        user: response.data.user?.email
      });
      localStorage.setItem('token', response.data.token);
      await login(response.data.token, response.data.user);
      setSuccess("Login successful");
      setFormData({ email: "", password: "" });
      setValidated(false);
      console.log('Login: Success');
      setTimeout(() => {
        setSuccess(null);
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid credentials";
      setError(errorMsg);
      console.error('Login: Error', errorMsg, err.response?.data);
      setTimeout(() => setError(null), 3000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          {error && (
            <motion.div
              className="alert alert-danger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              className="alert alert-success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {success}
            </motion.div>
          )}
          <form className="needs-validation" noValidate onSubmit={handleSubmit}>
            <div className="mb-3 position-relative">
              <div className="input-group">
                <span className="input-group-text">
                  <FaEnvelope color="#00A3E0" />
                </span>
                <input
                  type="email"
                  className={`form-control ${validated && !formData.email ? "is-invalid" : ""}`}
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
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${validated && !formData.password ? "is-invalid" : ""}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  aria-label="Password"
                />
                <span className="input-group-text password-toggle">
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer", color: "#00A3E0" }}
                  ></i>
                </span>
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
    </div>
  );
}

export default Login;