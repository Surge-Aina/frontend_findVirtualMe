// src/pages/portfolios/cleaningService/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import Navbar from '../components/cleanNavbar.jsx';
import Services from '../components/cleanServices.jsx';
import Charges from '../components/cleanCharges.jsx';
import About from '../components/cleanAbout.jsx';
import Login from '../components/Login.jsx';
import './index.css';

const BASE = '/portfolios/cleaningService';

const isAuthed = () =>
  Boolean(localStorage.getItem('token') || sessionStorage.getItem('token'));

function Shell() {
  return (
    <div className="cleaning-app">
      <Navbar />
      <Outlet />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

// ABSOLUTE redirect to login to avoid /services/login stacking
function RequireAuth() {
  const location = useLocation();
  if (!isAuthed()) {
    return (
      <Navigate
        to={`${BASE}/login`}
        replace
        state={{ from: location }}
      />
    );
  }
  return <Outlet />;
}

// If already authed, bounce away from login
function PublicOnly() {
  const location = useLocation();
  if (isAuthed()) {
    const to =
      (location.state?.from?.pathname && String(location.state.from.pathname).startsWith(BASE))
        ? location.state.from.pathname
        : `${BASE}/services`;
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}

export default function CleaningRoutes() {
  const t = localStorage.getItem('token');
  if (t) axios.defaults.headers.common.Authorization = `Bearer ${t}`;
  return (
    <Routes>
      <Route element={<Shell />}>
        {/* Default entry -> About (public). Use ABSOLUTE path */}
        <Route index element={<Navigate to={`${BASE}/about`} replace />} />

        {/* Public routes */}
        <Route path="about" element={<About />} />
        <Route element={<PublicOnly />}>
          <Route path="login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          <Route path="services" element={<Services />} />
          <Route path="charges" element={<Charges />} />
        </Route>

        {/* Fallback (ABSOLUTE) */}
        <Route path="*" element={<Navigate to={`${BASE}/about`} replace />} />
      </Route>
    </Routes>
  );
}
