// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireRole }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // User not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User authorized, render the children components
  return children;
};

export default ProtectedRoute;
