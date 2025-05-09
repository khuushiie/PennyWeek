import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url("../")', padding: '80px 0', color: 'white' }}>
        <div className="container text-center">
          <h1>Welcome to PennyWeek</h1>
          <p>Track your finances, save more, and live smarter.</p>
          <Link className="btn btn-light btn-lg" to="/register">Get Started</Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="features text-center my-5">
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <div className="feature-card p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                <h4>Track Expenses</h4>
                <p>Easily monitor your spending.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                <h4>Set Budgets</h4>
                <p>Create budgets to save more.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                <h4>Analyze Insights</h4>
                <p>Get detailed financial insights.</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                <h4>Easy Reporting</h4>
                <p>Generate financial reports in seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="dashboard-preview text-center my-5">
        <div className="container">
          <h2>Preview Your Dashboard</h2>
          <p>Get a sneak peek at your personal finance dashboard.</p>
          <img src="dashboard-preview.jpg" alt="Dashboard Preview" className="img-fluid rounded" />
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="cta text-center py-5" style={{ background: '#16425b', color: 'white' }}>
        <div className="container">
          <h2>Start Managing Your Finances Today!</h2>
          <Link to="/register" className="btn btn-light btn-lg">Join Now</Link>
        </div>
      </section>

    </div>
  );
}

export default Home;
