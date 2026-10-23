import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/shared/context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  // case1: logged in，user's value hasn't been loaded
  if (token && user === null) {
    return <div>Loading...</div>;
  }

  // case2: not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // case3: logged in，check user's role
  return user && user.role === "admin" ? children : <Navigate to="/" replace />;
};

export default AdminRoute;
