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
  const [toast, setToast] = useState({ show: false, message: "", isError: false });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      console.log("Login: User already logged in, redirecting to /dashboard");
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setValidated(true);
    setToast({ show: false, message: "", isError: false });

    if (!form.checkValidity()) {
      console.log("Login: Form validation failed");
      e.stopPropagation();
      return;
    }

    if (!formData.email || !formData.password) {
      setToast({ show: true, message: "Email and password are required", isError: true });
      return;
    }

    try {
      console.log("Login: Submitting form data:", formData);
      await login(formData.email, formData.password);
      setToast({ show: true, message: "Login successful", isError: false });
      setFormData({ email: "", password: "" });
      setValidated(false);
      setTimeout(() => {
        setToast({ show: false, message: "", isError: false });
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Login: Error:", err.response?.data || err.message);
      setToast({ show: true, message: err.message || "Invalid credentials", isError: true });
      setTimeout(() => setToast({ show: false, message: "", isError: false }), 3000);
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
          {toast.show && (
            <motion.div
              className={`toast align-items-center border-0 position-fixed top-0 end-0 m-3 ${
                toast.isError ? 'text-bg-danger' : 'text-bg-success'
              }`}
              role="alert"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="d-flex">
                <div className="toast-body">{toast.message}</div>
                <button
                  type="button"
                  className="btn-close me-2 m-auto"
                  onClick={() => setToast({ show: false, message: "", isError: false })}
                  aria-label="Close"
                ></button>
              </div>
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
                  type={showPassword ? "text" : "password"}
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