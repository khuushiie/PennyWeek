import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCog } from "react-icons/fa";
import { useAuth } from "../AuthContext";
import "../styles/Navbar.css";

function Navbar() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [showToast, setShowToast] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate("/login");
    }, 3000);
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <motion.nav
        className="navbar navbar-expand-lg navbar-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container-fluid">
          <Link className="navbar-brand logo" to="/">
            PennyWeek
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              {isLoggedIn && (
                <motion.li
                  className="nav-item"
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </motion.li>
              )}
              <motion.li
                className="nav-item"
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link className="nav-link" to="/add-transaction">
                  Add Transaction
                </Link>
              </motion.li>
              <motion.li
                className="nav-item"
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link className="nav-link" to="/about">
                  About Us
                </Link>
              </motion.li>
              <motion.li
                className="nav-item"
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  className="nav-link navbar-setting"
                  to="/settings"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Settings"
                  aria-label="Settings"
                >
                  <FaCog />
                </Link>
              </motion.li>
              {isLoggedIn ? (
                <motion.li
                  className="nav-item"
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <button className="nav-link btn btn-link logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </motion.li>
              ) : (
                <motion.li
                  className="nav-item"
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link className="nav-link register-btn" to="/register">
                    Register
                  </Link>
                </motion.li>
              )}
            </ul>
          </div>
        </div>
      </motion.nav>

      <div
        className={`toast align-items-center text-dark border-0 position-fixed top-0 end-0 m-3 ${
          showToast ? "show" : ""
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">Logged out successfully!</div>
          <button
            type="button"
            className="btn-close me-2 m-auto"
            onClick={() => setShowToast(false)}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </>
  );
}

export default Navbar;