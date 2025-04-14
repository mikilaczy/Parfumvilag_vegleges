import React, { useState, useEffect, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "../style.css";

const Navbar = () => {
  // Get state and functions from context
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Handle window resize for mobile menu
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Logout handler
  const handleLogout = () => {
    if (window.confirm("Biztosan ki szeretne lépni?")) {
      logout(); // Use context logout function
      navigate("/"); // Redirect home
      setIsOpen(false); // Close menu if open
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  // Function to close menu, typically used on link clicks in mobile view
  const closeMenu = () => {
    if (windowWidth <= 991) {
      // Only close if on mobile
      setIsOpen(false);
    }
  };

  // Determine profile image URL, fallback to placeholder or icon
  const profileImageUrl = user?.profile_picture_url;
  const showProfileImage = isLoggedIn && profileImageUrl;
  const showProfileIcon = isLoggedIn && !profileImageUrl;

  return (
    <nav className="navbar navbar-dark">
      <div className="container">
        <div className="navbar-content">
          {/* Hamburger Menu Toggle (Mobile) */}
          {windowWidth <= 991 && (
            <button className="navbar-toggler" onClick={toggleMenu}>
              <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>{" "}
              {/* Toggle icon */}
            </button>
          )}

          {/* Brand */}
          <Link className="navbar-brand" to="/" onClick={closeMenu}>
            Parfümvilág
          </Link>

          {/* Navigation Links (Collapsible) */}
          {/* Use `show` class from Bootstrap for collapse, controlled by `isOpen` state */}
          <div
            className={`nav-links ${
              windowWidth <= 991 ? (isOpen ? "active" : "") : "d-flex"
            }`}
            id="navbarNav"
          >
            {" "}
            {/* Ensure ID matches toggler target if using Bootstrap JS */}
            <ul className="navbar-nav navbar-left">
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  to="/katalogus"
                  onClick={closeMenu}
                >
                  Hírek
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  to="/kereses"
                  onClick={closeMenu}
                >
                  Keresés
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  to="/rolunk"
                  onClick={closeMenu}
                >
                  Rólunk
                </NavLink>
              </li>
              {isLoggedIn && (
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    to="/kedvencek"
                    onClick={closeMenu}
                  >
                    Kedvencek
                  </NavLink>
                </li>
              )}
            </ul>
            {/* Right Aligned Items (Login/Profile) */}
            <ul className="navbar-nav navbar-right">
              {isLoggedIn && user ? ( // Check user object exists
                <>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link profile-link d-flex align-items-center ${
                          isActive ? "active" : ""
                        }`
                      }
                      to="/profil"
                      onClick={closeMenu}
                    >
                      {/* Conditionally render image or icon */}
                      {showProfileImage ? (
                        <img
                          src={profileImageUrl}
                          alt="Profil"
                          className="navbar-profile-img me-2"
                          // Simple fallback to hide broken images
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <i className="fas fa-user-circle fa-lg me-2"></i> // Slightly larger icon
                      )}
                      {user.name || "Profil"}
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-outline-light logout-btn"
                      onClick={handleLogout} // Use the correct handler
                    >
                      Kilépés
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      to="/bejelentkezes"
                      onClick={closeMenu}
                    >
                      Bejelentkezés
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      to="/regisztracio"
                      onClick={closeMenu}
                    >
                      Regisztráció
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
