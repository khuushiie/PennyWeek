import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import { FaUser, FaLock, FaCog, FaUserShield } from "react-icons/fa";
import "../styles/Settings.css";

function Settings() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const settingsOptions = [
    {
      title: "Profile",
      description: "Update your name, email, and profile photo.",
      icon: <FaUser size={32} />,
      path: "/settings/profile",
    },
    {
      title: "Privacy & Security",
      description: "Manage password and data privacy.",
      icon: <FaLock size={32} />,
      path: "/settings/privacy",
    },
    {
      title: "Account",
      description: "Logout or delete your account.",
      icon: <FaUserShield size={32} />,
      path: "/settings/account",
    },
  ];

  return (
    <div className="settings-page">
      <div className="container py-5">
        <motion.div
          className="settings-card p-5"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading text-center mb-5">Settings</h2>
          <div className="row g-4">
            {settingsOptions.map((option, index) => (
              <div className="col-md-6 col-lg-4" key={option.title}>
                <Link to={option.path} className="text-decoration-none">
                  <motion.div
                    className="settings-option-card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0, 163, 224, 0.3)" }}
                  >
                    <div className="option-icon mb-3">{option.icon}</div>
                    <h3 className="option-title">{option.title}</h3>
                    <p className="option-description">{option.description}</p>
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;