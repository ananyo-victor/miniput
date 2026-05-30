import React, { useCallback, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import { clearAdminToken, getAdminAuthFromStorage } from "../utils/adminToken";
import { fetchWorkspaces } from "../store/workspaceSlice";
import { fetchActiveWorkspaceThunk, setActiveWorkspaceLocal, updateActiveWorkspaceThunk } from "../store/userSlice";
import { resolvePathAfterWorkspaceSwitch } from "../utils/workspaceRouting";
import { setActiveCategory, setSearchQuery } from "../store/homeSlice";


const PrivateRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { token, isAdmin, userId: storageUserId } = getAdminAuthFromStorage();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authUserId = auth?.userId || storageUserId || "";

  if (!token || !isAdmin) {
    clearAdminToken();
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  useEffect(() => {
    const initializeWorkspace = async () => {
      if (!authUserId) return;
      await dispatch(fetchWorkspaces());
      await dispatch(fetchActiveWorkspaceThunk(authUserId));
    };

    initializeWorkspace();
  }, [authUserId, dispatch]);

  const handleWorkspaceSwitch = useCallback((workspace) => {
    if (!workspace) {
      return;
    }

    dispatch(setActiveWorkspaceLocal(workspace));
    dispatch(setActiveCategory("all"));
    dispatch(setSearchQuery(""));

    if (authUserId) {
      dispatch(
        updateActiveWorkspaceThunk({
          id: authUserId,
          workspaceId: workspace.id,
        })
      );
    }

    const nextPath = resolvePathAfterWorkspaceSwitch(location.pathname, workspace.slug);
    if (nextPath !== location.pathname) {
      navigate(nextPath);
    }
  }, [authUserId, dispatch, location.pathname, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <TopBar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onWorkspaceSwitch={handleWorkspaceSwitch}
      />

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 relative">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
          onWorkspaceSwitch={handleWorkspaceSwitch}
        />

        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">
          <main className="flex-1 flex flex-col relative h-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivateRoute;
