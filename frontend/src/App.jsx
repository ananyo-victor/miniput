import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";
import { useDispatch } from "react-redux";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminPrivateRoute from "./pages/admin/AdminPrivateRoute";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminInventory from "./pages/admin/AdminInventory";
import CustomerPage from "./pages/customer/CustomerPage";
import CustomerCartPage from "./pages/customer/CustomerCartPage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import AboutPage from "./pages/customer/AboutPage";
import Footer from "./components/layout/Footer";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import { setAdminField } from "./store/adminSlice";

const Layout = () => {
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

export default function App() {
  const dispatch = useDispatch();

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
          <Route path="/customer/cart" element={<CustomerCartPage />} />
          <Route path="/customer/about" element={<AboutPage />} />
        </Route>

        <Route path="/customer/product/:productId" element={<ProductDetailPage />} />

        <Route path="/admin" element={<AdminAuth />} />
        <Route path="/admin/auth" element={<Navigate to="/admin" replace />} />

        <Route element={<AdminPrivateRoute />}>
          <Route path="/admin/shop" element={<CustomerPage />} />
          <Route path="/admin/cart" element={<CustomerCartPage />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/about" element={<AboutPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/customer/shop" replace />} />
      </Routes>
    </Router>
  );
}
