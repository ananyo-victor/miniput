import React, { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import Navbar from "../components/layout/Navbar";
import TopBar from "../components/layout/TopBar";
import { clearAdminToken, getAdminAuthFromStorage } from "../utils/adminToken";

const PrivateRoute = () => {
  const location = useLocation();
  const { token, isAdmin } = getAdminAuthFromStorage();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!token || !isAdmin) {
    clearAdminToken();
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      {/* Enterprise Top Navbar */}
      <TopBar />
      
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 relative">
        {/* Navigation Sidebar */}
        <Navbar 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        
        {/* Main Content Area */}
        <div 
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          <main className="flex-1 flex flex-col relative h-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivateRoute;