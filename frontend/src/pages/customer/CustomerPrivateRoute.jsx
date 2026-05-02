import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

export default function CustomerPrivateRoute({ children }) {
  const customer = useSelector((s) => s.customer);

  if (!customer.authed) {
    return <Navigate to="/customer/auth" replace />;
  }

  return children;
}
