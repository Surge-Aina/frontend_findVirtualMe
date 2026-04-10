import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import Navbar from "../components/cleanNavbar.jsx";
import Services from "../components/cleanServices.jsx";
import Charges from "../components/cleanCharges.jsx";
import About from "../components/cleanAbout.jsx";
import "./index.css";
import { AuthProvider } from "../context/AuthContext.jsx";

function Shell() {
  return (
    <div className="cleaning-app">
      <Navbar />
      <Outlet />
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
    </div>
  );
}

export default function CleaningRoutes() {
  const t = localStorage.getItem("token");
  if (t) axios.defaults.headers.common.Authorization = `Bearer ${t}`;

  return (
    <AuthProvider>
      <Routes>
        {/* Static demo route - no portfolioId */}
        <Route path="/" element={<Shell />}>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="charges" element={<Charges />} />
        </Route>

        {/* User's actual portfolio - with portfolioId */}
        <Route path=":portfolioId" element={<Shell />}>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="charges" element={<Charges />} />
          <Route path="*" element={<Navigate to="about" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
