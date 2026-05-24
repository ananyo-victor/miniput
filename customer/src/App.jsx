import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import OrderFormPage from "./pages/OrderFormPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import Navbar from "./components/layout/Navbar";
import { setupAxiosInterceptors } from "./utils/axiosInterceptor";

const Layout = () => {
  const layoutHeights = {
    "--layout-navbar-h": "69px",
    "--layout-footer-h": "62px",
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f5f5]" style={layoutHeights}>
      <div className="flex-1 flex flex-col min-h-0">
        <Navbar />
        <main className="flex-1 min-h-[calc(100vh-var(--lay out-navbar-h)-var(--layout-footer-h))] lg:min-h-[calc(100vh-68px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize axios interceptors for automatic token refresh on 401
    setupAxiosInterceptors(dispatch);
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/home" element={<Navigate to="/home/miniput" replace />} />
          <Route path="/home/:brand" element={<HomePage />} />
          <Route path="/miniput" element={<HomePage />} />
          <Route path="/kwink" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order" element={<OrderFormPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}
 