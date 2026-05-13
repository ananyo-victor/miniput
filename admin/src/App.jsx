import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminPrivateRoute from "./pages/admin/AdminPrivateRoute";
import AdminInventoryPage from "./pages/admin/AdminInventoryPage";
import Footer from "./components/layout/Footer";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";

const Layout = () => {
  const layoutHeights = {
    "--layout-navbar-h": "69px",
    "--layout-footer-h": "62px",
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f5f5]" style={layoutHeights}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Navbar />
        <main className="flex-1 min-h-[calc(100vh-var(--lay out-navbar-h)-var(--layout-footer-h))] lg:min-h-[calc(100vh-68px)]">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route path="/admin" element={<AdminAuth />} />
        <Route path="/admin/auth" element={<Navigate to="/admin" replace />} />

        <Route element={<AdminPrivateRoute />}>
            <Route path="/admin/inventory" element={<AdminInventoryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}