import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/AboutUs.css";

function AboutUs() {
  const features = [
    {
      title: "Track Your Spending",
      description: "Monitor every penny with our intuitive budgeting tools.",
      image: "/assets/img5.jpeg",
    },
    {
      title: "Set Financial Goals",
      description: "Plan for the future with personalized savings targets.",
      image: "/assets/img2.webp",
    },
    {
      title: "Secure & Private",
      description: "Your data is protected with top-tier encryption.",
      image: "/assets/img4.avif",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="hero-section-about text-center ">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="hero-heading">
            Empower Your Finances with <span className="highlight">PennyWeek</span>
          </h1>
          <p className="hero-subheading">
            Simple, secure, and stylish budgeting for everyone.
          </p>
          <Link to="/register" className="btn btn-primary cta-button">
            Join Now
          </Link>
        </motion.div>
      </div>

      <div className="container py-5">
        {/* Mission Section */}
        <motion.div
          className="about-card p-4 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-heading text-center mb-4">Our Mission</h2>
          <p className="lead text-center mb-4">
            At PennyWeek, we believe financial freedom starts with smart budgeting. Our mission is to provide tools that make tracking and planning your finances effortless and enjoyable.
          </p>
        </motion.div>

        {/* Features Section */}
        <h2 className="section-heading text-center mb-5">Why Choose PennyWeek?</h2>
        <div className="row g-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="col-md-4"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.2 }}
            >
              <div className="feature-card text-center p-3 h-100">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="feature-image mb-3"
                  onError={(e) => (e.target.src = "/assets/hero.jpg")} // Fallback
                />
                <h3 className="feature-title mb-2">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AboutUs;