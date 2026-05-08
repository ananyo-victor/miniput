import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminPrivateRoute from "./pages/admin/AdminPrivateRoute";
import AdminInventoryPage from "./pages/admin/AdminInventoryPage";
import CustomerPage from "./pages/customer/CustomerPage";
import CustomerCartPage from "./pages/customer/CustomerCartPage";
import OrderFormPage from "./pages/customer/OrderFormPage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import AboutPage from "./pages/customer/AboutPage";
import Footer from "./components/layout/Footer";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import { setAdminField } from "./store/adminSlice";
import { setupAxiosInterceptors } from "./utils/axiosInterceptor";

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
  const dispatch = useDispatch();

  useEffect(() => {
    // Setup axios interceptors for auto token refresh on app mount
    setupAxiosInterceptors(dispatch);
  }, [dispatch]);

  const handleAdminLogout = () => {
    dispatch(setAdminField({ key: "authed", value: false }));
    dispatch(setAdminField({ key: "authStep", value: 1 }));
    dispatch(setAdminField({ key: "userId", value: "" }));
    dispatch(setAdminField({ key: "password", value: "" }));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/customer/shop" replace />} />

        <Route element={<Layout />}>
          <Route path="/customer/shop" element={<CustomerPage />} />
          <Route path="/customer/product/:productId" element={<ProductDetailPage />} />
          <Route path="/customer/cart" element={<CustomerCartPage />} />
          <Route path="/customer/order" element={<OrderFormPage />} />
          <Route path="/customer/about" element={<AboutPage />} />
        </Route>


        <Route path="/admin" element={<AdminAuth />} />
        <Route path="/admin/auth" element={<Navigate to="/admin" replace />} />

        <Route element={<AdminPrivateRoute />}>
          <Route path="/admin/shop" element={<CustomerPage />} />
          <Route path="/admin/product/:productId" element={<ProductDetailPage />} />
          <Route path="/admin/cart" element={<CustomerCartPage />} />
          <Route path="/admin/inventory" element={<AdminInventoryPage />} />
          <Route path="/admin/about" element={<AboutPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/customer/shop" replace />} />
      </Routes>
    </Router>
  );
}
