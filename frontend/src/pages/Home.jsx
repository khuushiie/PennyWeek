import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMoneyBillWave, FaChartPie, FaLightbulb, FaFileExport, FaQuestionCircle } from "react-icons/fa";
import "../styles/Home.css";

function Home() {
  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content container text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Simplify Your Finances with PennyWeek
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="lead"
          >
            "Master Your Money, One Week at a Time"
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link className="btn btn-primary btn-lg" to="/register">
              Get Started
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container my-5">
        {/* Feature 1: Image Left, Card Right */}
        <motion.div
          className="row align-items-center mb-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideInRight}
        >
          <div className="col-md-6">
            <img
              src="/assets/hero2.jpg"
              alt="Track expenses easily"
              className="img-fluid feature-img"
            />
          </div>
          <div className="col-md-6">
            <div className="feature-card p-4">
              <FaMoneyBillWave size={40} color="#00A3E0" className="mb-3" />
              <h3>Track Expenses</h3>
              <p>Log and categorize your spending effortlessly, including recurring transactions.</p>
            </div>
          </div>
        </motion.div>

        {/* Feature 2: Card Left, Image Right */}
        <motion.div
          className="row align-items-center mb-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideInLeft}
        >
          <div className="col-md-6 order-md-1 order-2">
            <div className="feature-card p-4">
              <FaChartPie size={40} color="#00A3E0" className="mb-3" />
              <h3>Set Budgets</h3>
              <p>Create custom budgets to stay on track and save more each month.</p>
            </div>
          </div>
          <div className="col-md-6 order-md-2 order-1">
            <img
              src="/assets/financial-budget.jpg"
              alt="Set custom budgets"
              className="img-fluid feature-img"
            />
          </div>
        </motion.div>

        {/* Feature 3: Image Left, Card Right */}
        <motion.div
          className="row align-items-center mb-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideInRight}
        >
          <div className="col-md-6">
            <img
              src="/assets/img3.webp"
              alt="AI-powered insights"
              className="img-fluid feature-img"
            />
          </div>
          <div className="col-md-6">
            <div className="feature-card p-4">
              <FaLightbulb size={40} color="#00A3E0" className="mb-3" />
              <h3>Analyze Insights</h3>
              <p>Get AI-powered financial tips to optimize your spending and savings.</p>
            </div>
          </div>
        </motion.div>

        {/* Feature 4: Card Left, Image Right */}
        <motion.div
          className="row align-items-center mb-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideInLeft}
        >
          <div className="col-md-6 order-md-1 order-2">
            <div className="feature-card p-4">
              <FaFileExport size={40} color="#00A3E0" className="mb-3" />
              <h3>Easy Reporting</h3>
              <p>Generate and export detailed financial reports in seconds.</p>
            </div>
          </div>
          <div className="col-md-6 order-md-2 order-1">
            <img
              src="/assets/img6.jpg"
              alt="Export financial reports"
              className="img-fluid feature-img"
            />
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section container my-5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-center mb-4">Frequently Asked Questions</h2>
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item">
              <h3 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq1"
                  aria-expanded="true"
                  aria-controls="faq1"
                >
                  <FaQuestionCircle className="me-2" color="#00A3E0" /> What is PennyWeek?
                </button>
              </h3>
              <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  PennyWeek is an expense management platform that helps you track spending, set budgets, and gain AI-powered financial insights.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h3 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq2"
                  aria-expanded="false"
                  aria-controls="faq2"
                >
                  <FaQuestionCircle className="me-2" color="#00A3E0" /> How do I track expenses?
                </button>
              </h3>
              <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Simply add expenses manually or set up recurring transactions. Categorize them to see where your money goes.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h3 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq3"
                  aria-expanded="false"
                  aria-controls="faq3"
                >
                  <FaQuestionCircle className="me-2" color="#00A3E0" /> Is my data secure?
                </button>
              </h3>
              <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Yes, we use industry-standard encryption to protect your financial data and ensure privacy.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h3 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#faq4"
                  aria-expanded="false"
                  aria-controls="faq4"
                >
                  <FaQuestionCircle className="me-2" color="#00A3E0" /> Can I export reports?
                </button>
              </h3>
              <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Absolutely! Export your financial reports as CSV or PDF in seconds.
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-5">
            <Link to="/about" className="btn btn-primary btn-lg">
              Learn More About Us
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Register Section */}
      <section className="register-section text-center py-5">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-3">Start Saving Smarter Today!</h2>
            <Link to="/register" className="btn btn-primary btn-lg">
              Register Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;