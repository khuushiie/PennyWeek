import React from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaArrowUp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "../styles/Footer.css";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const iconVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="footer">
      <div className="container text-center">
        <motion.div
          className="footer-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="social-links mb-2">
            <motion.a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon mx-2"
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              aria-label="X (Twitter)"
            >
              <FaXTwitter />
            </motion.a>

            <motion.a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon mx-2"
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </motion.a>
          </div>

          <p className="copyright mb-0">© 2025 PennyWeek. All rights reserved.</p>
        </motion.div>
      </div>

      <button
        className="back-to-top"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <FaArrowUp />
      </button>
    </footer>
  );
}

export default Footer;
