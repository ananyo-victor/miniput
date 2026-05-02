import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

export default function AdminPrivateRoute({ children }) {
  const admin = useSelector((s) => s.admin);

  if (!admin.authed) {
    return <Navigate to="/admin/auth" replace />;
  }

  return children;
}
