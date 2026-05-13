import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { clearAdminToken, getAdminAuthFromStorage } from "../../utils/adminToken";

const AdminPrivateRoute = () => {
  const location = useLocation();
  const { token, isAdmin } = getAdminAuthFromStorage();
  const layoutHeights = {
    "--layout-navbar-h": "65px",
    "--layout-footer-h": "64px",
  };

  if (!token || !isAdmin) {
    clearAdminToken();
    return <Navigate to="/admin/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f5f5]" style={layoutHeights}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Navbar />
        <main className="flex-1 min-h-[calc(100vh-var(--layout-navbar-h)-var(--layout-footer-h))] lg:min-h-[calc(100vh-var(--layout-navbar-h))]">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPrivateRoute;
