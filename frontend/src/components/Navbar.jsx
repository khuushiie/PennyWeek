import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../styles/Navbar.css"; 

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Update this based on your auth logic

  return (
    <nav className="navbar navbar-expand-lg navbar-light " style={{ backgroundColor: 'white', borderBottom: '1px solid #ccc' }}>
      <div className="container-fluid">
        <Link className="navbar-brand logo" to="/" >
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
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard" >
                  Dashboard
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link" to="/add-transaction" >
                Add Transaction
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about" >
                About Us
              </Link>
            </li>

            {isLoggedIn ? (
              <li className="nav-item">
                <Link className="nav-link" to="/login" >
                  Logout
                </Link>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/register" >
                  Register
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link navbar-setting" to="/settings" >
                <i class="fa-solid fa-bars"></i>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;



