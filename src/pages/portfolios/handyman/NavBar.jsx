import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = ({ isLoggedIn, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const logoutAndRedirect = () => {
    onLogout();
    setMenuOpen(false); // Close menu on logout
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">HandyMan</Link>
      </div>

      {/* Main navigation links for desktop */}
      <ul className="navbar-links">
        <li><a href="/#services">Services</a></li>
        <li><a href="/#portfolio">Our Work</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
      
      {/* Standalone Login/Logout Button for desktop view */}
      <div className="navbar-auth-desktop">
        {isLoggedIn ? (
          <button onClick={logoutAndRedirect} className="navbar-button">Logout</button>
        ) : (
          <Link to="/login" className="navbar-button">Login</Link>
        )}
      </div>

      {/* Hamburger Icon for mobile view */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        &#9776;
      </div>

      {/* Dropdown menu for mobile view */}
      {menuOpen && (
        <ul className="mobile-nav-links">
          <li><a href="/#services" onClick={() => setMenuOpen(false)}>Services</a></li>
          <li><a href="/#portfolio" onClick={() => setMenuOpen(false)}>Our Work</a></li>
          <li><a href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
          <li>
            {isLoggedIn ? (
              <button onClick={logoutAndRedirect} className="navbar-button">Logout</button>
            ) : (
              <Link to="/login" className="navbar-button" onClick={() => setMenuOpen(false)}>Login</Link>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
};

export default NavBar;