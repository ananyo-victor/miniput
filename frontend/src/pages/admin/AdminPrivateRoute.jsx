import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { clearAdminToken, getAdminAuthFromStorage } from "../../utils/adminToken";

const AdminPrivateRoute = () => {
  const location = useLocation();
  const { token, isAdmin } = getAdminAuthFromStorage();

  if (!token || !isAdmin) {
    clearAdminToken();
    return <Navigate to="/admin/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f5f5]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AdminPrivateRoute;
