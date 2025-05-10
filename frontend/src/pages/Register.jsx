import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "../styles/Register.css";

function Register() {
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { login } = useAuth(); // Use login from AuthContext
  const navigate = useNavigate();

  // Reset isSignedUp on mount
  useEffect(() => {
    setIsSignedUp(false);
  }, []);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;

    setValidated(true);

    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToastMessage("Passwords do not match");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      const { name, email, password } = formData;
      console.log("Registering user:", { name, email, password });
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Auto-login after registration
      await login(email, password);
      setToastMessage("Registration successful!");
      setShowToast(true);
      setIsSignedUp(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err.response?.data, err.message);
      setToastMessage(err.response?.data.message || "Registration failed");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Google Sign Up clicked");
    setToastMessage("Google Sign Up not implemented yet");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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

          {isSignedUp ? (
            <div className="text-center">
              <p className="already-signed-up">
                You’re already signed up!{" "}
                <Link to="/login" className="login-link">
                  Log In here
                </Link>
              </p>
            </div>
          ) : (
            <>
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
              >
                <div className="mb-3 position-relative">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaUser color="#00A3E0" />
                    </span>
                    <input
                      type="text"
                      className={`form-control ${
                        validated && !formData.name ? "is-invalid" : ""
                      }`}
                      id="name"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      aria-label="Name"
                    />
                    <div className="invalid-feedback">
                      Please provide a valid name.
                    </div>
                  </div>
                </div>

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
                <Link to="/login" className="login-link">
                  Login here
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>

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

export default Register;