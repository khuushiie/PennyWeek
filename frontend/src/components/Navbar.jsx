import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { FaUserCircle } from "react-icons/fa";
import "../styles/Navbar.css";

function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Debug user.photo
  console.log("Navbar: User data:", { isLoggedIn, user, photo: user?.photo });

  // Construct full photo URL
  const photoUrl = user?.photo
    ? user.photo.startsWith('http')
      ? user.photo
      : `http://localhost:5000${user.photo}`
    : null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
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
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About Us
              </Link>
            </li>
            {isLoggedIn && user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/add-transaction">
                    Add Transaction
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/settings">
                    Settings
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Profile"
                        className="navbar-profile-photo rounded-circle me-2"
                        onError={(e) => {
                          console.error("Navbar: Failed to load profile photo:", photoUrl);
                          e.target.style.display = 'none'; // Hide broken image
                        }}
                      />
                    ) : (
                      <FaUserCircle className="navbar-profile-icon me-2" />
                    )}
                    {user.name || "User"}
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="userDropdown"
                  >
                    <li>
                      <Link className="dropdown-item" to="/settings">
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;