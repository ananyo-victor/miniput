import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import OrderFormPage from "./pages/OrderFormPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
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
        <Route path="/" element={<Navigate to="/customer/shop" replace />} />

        <Route element={<Layout />}>
          <Route path="/customer/shop" element={<HomePage />} />
          <Route path="/customer/product/:productId" element={<ProductDetailPage />} />
          <Route path="/customer/cart" element={<CartPage />} />
          <Route path="/customer/order" element={<OrderFormPage />} />
          <Route path="/customer/about" element={<AboutPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/customer/shop" replace />} />
      </Routes>
    </Router>
  );
}
