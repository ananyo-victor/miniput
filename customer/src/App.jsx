import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import OrderFormPage from "./pages/OrderFormPage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import DiscoverPage from "./pages/DiscoverPage";
import Navbar from "./components/layout/Navbar";
import Topbar from "./components/layout/Topbar";
import Sidebar from "./components/layout/Sidebar";
import AuthModal from "./components/auth/AuthModal";
import { fetchWorkspaces } from "./store/workspaceSlice";
import { fetchCart } from "./store/cartSlice";
import TermsPage from "./pages/TermsPage";
import ProfilePage from "./pages/ProfilePage";
import { setupCustomerAxiosInterceptors } from "./utils/axiosInterceptor";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { store } from "./store/store";

setupCustomerAxiosInterceptors(store.dispatch);

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const layoutHeights = {
    "--layout-navbar-h": "69px",
    "--layout-footer-h": "62px",
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f5f5]" style={layoutHeights}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <AuthModal />

      <div className="flex-1 flex flex-col min-h-0">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 min-h-[calc(100vh-var(--layout-navbar-h)-var(--layout-footer-h))] lg:min-h-[calc(100vh-140px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const dispatch = useDispatch();
  const authed = useSelector((state) => state.auth.authed);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (authed) {
      dispatch(fetchCart());
    }
  }, [authed, dispatch]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/home" element={<Navigate to="/home/miniput" replace />} />
            <Route path="/home/:brand" element={<HomePage />} />
            <Route path="/miniput" element={<HomePage />} />
            <Route path="/kwink" element={<HomePage />} />
            <Route path="/discover" element={<Navigate to="/discover/trending" replace />} />
            <Route path="/discover/:tab" element={<DiscoverPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/order" element={<OrderFormPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}