import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/NotFound.css";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container py-5">
        <motion.div
          className="not-found-card p-5 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="display-1 ">404</h1>
          <h2 className="section-heading mb-4">Page Not Found</h2>
          <p className="lead text-secondary mb-4">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary-modern">
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default NotFound;