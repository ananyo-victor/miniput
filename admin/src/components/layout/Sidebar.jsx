import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, X, ChevronDown } from "lucide-react";
import Navbar from "./Navbar";
import { clearAdminToken } from "../../utils/adminToken";
import { setAdminField } from "../../store/authSlice";
import { toggleSidebar } from "../../store/userSlice";

const Sidebar = ({ isMobileMenuOpen, closeMobileMenu, onWorkspaceSwitch }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state) => state.user.activeWorkspace);
  const workspaces = useSelector((state) => state.workspace.items);
  const isCollapsed = useSelector((state) => state.user.preferences.sidebarCollapsed);

  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

  const handleWorkspaceSelect = (workspace) => {
    if (onWorkspaceSwitch) {
      onWorkspaceSwitch(workspace);
    }
    setShowWorkspaceDropdown(false);
  };

  const handleLogout = () => {
    clearAdminToken();
    dispatch(setAdminField({ key: "authed", value: false }));
    navigate("/");
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 transition-opacity lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-[70] flex h-full lg:h-[calc(100vh-72px)] flex-col bg-white transition-all duration-300 lg:top-[72px] lg:z-40 lg:translate-x-0 lg:border-r lg:border-gray-200 ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
          } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-5 lg:hidden">
          <span className="text-xl font-black tracking-wider text-[#0E2A4A] uppercase">Menu</span>
          <button
            type="button"
            onClick={closeMobileMenu}
            className="rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* UPDATED DESKTOP HEADER: "Menu" text, dynamic alignment, and Close Button */}
        <div className={`hidden items-center border-b border-gray-100 py-4 lg:flex ${isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}>
          <span className={`font-bold tracking-widest text-gray-400 uppercase ${isCollapsed ? "text-[10px]" : "text-xs"
            }`}>
            Menu
          </span>

          {/* Close button - only visible when sidebar is open */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className="rounded-lg bg-gray-50 p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-[#0E2A4A]"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="border-b border-gray-100 px-4 py-4 lg:hidden">
          <label className="mb-2 block text-[11px] font-bold tracking-wide text-gray-500 uppercase">
            Workspace
          </label>
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setShowWorkspaceDropdown((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#0E2A4A] outline-none transition-colors hover:border-[#0E2A4A]"
            >
              <span>{activeWorkspace?.name || "Select Workspace"}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${showWorkspaceDropdown ? "rotate-180 text-[#0E2A4A]" : ""
                  }`}
              />
            </button>

            {showWorkspaceDropdown && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                {workspaces.map((workspace) => {
                  const isActive = activeWorkspace?.id === workspace.id;
                  return (
                    <button
                      type="button"
                      key={workspace.id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-sm font-bold transition-all ${isActive
                        ? "bg-[#f0f7f8] text-[#0E2A4A]"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {workspace.name}
                      {isActive && <div className="h-2 w-2 rounded-full bg-[#0E2A4A]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Navbar onNavigate={closeMobileMenu} isCollapsed={isCollapsed} />
        </div>

        <div className="border-t border-gray-100 p-4 shrink-0 mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : ""}
            className={`flex w-full items-center ${isCollapsed ? "justify-center px-0" : "justify-start px-5"
              } rounded-xl py-3.5 text-sm font-bold tracking-wide text-[#D63031] transition-all duration-200 hover:bg-red-50`}
          >
            <LogOut size={20} className={isCollapsed ? "mx-auto" : "mr-4"} strokeWidth={2.5} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
