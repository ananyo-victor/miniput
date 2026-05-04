import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";

/**
 * A wrapper component to protect admin routes.
 * Requirement #2: Ensure Inventory/Admin sections are only visible to the admin.
 */
const AdminPrivateRoute = ({ children }) => {
  // Access auth state from the adminSlice
  const { authed } = useSelector((state) => state.admin);
  const location = useLocation();

  if (!authed) {
    // If not authenticated, redirect to the Admin login page
    // We save the 'from' location so we can redirect them back after login if needed
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component (e.g., Inventory)
  return children;
};

export default AdminPrivateRoute;