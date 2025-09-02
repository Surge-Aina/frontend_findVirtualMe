// src/pages/portfolios/cleaningService/components/cleanNavbar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BASE = '/portfolios/cleaningService';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [initials, setInitials] = useState('DOM');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setInitials(user?.name ? user.name.trim().split(' ').map(n => n[0]).join('').toUpperCase() : 'DOM');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setShowDropdown(false);
    toast.success('Logged out!');
    navigate(`${BASE}/login`, { replace: true });
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <NavLink to={`${BASE}/about`}>About</NavLink>
        <NavLink to={`${BASE}/services`}>Services</NavLink>
        <NavLink to={`${BASE}/charges`}>Charges</NavLink>
      </div>
      <div className="nav-right">
        <div className="initials-circle" onClick={() => setShowDropdown(!showDropdown)} title="Account">
          {initials}
        </div>
        {showDropdown && (
          <div className="dropdown-menu">
            <button className="close-btn" onClick={() => setShowDropdown(false)}>×</button>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        )}
      </div>
    </div>
  );
}
