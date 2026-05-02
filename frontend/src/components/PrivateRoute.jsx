import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

export default function PrivateRoute({ children, authType }) {
  const admin = useSelector((s) => s.admin);
  const customer = useSelector((s) => s.customer);

  const isAuthed = authType === "admin" ? admin.authed : customer.authed;

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
