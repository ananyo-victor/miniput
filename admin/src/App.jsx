import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AuthPage from "./pages/AuthPage";
import PrivateRoute from "./pages/PrivateRoute";
import InventoryPage from "./pages/InventoryPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import { setupAxiosInterceptors } from "./utils/axiosInterceptor";
import { fetchWorkspaces } from "./store/workspaceSlice";
import OrdersPage from "./pages/OrdersPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    setupAxiosInterceptors(dispatch);
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Navigate to="/home/miniput" replace />} />
          <Route path="/home/:workspaceSlug" element={<HomePage />} />
          <Route path="/miniput" element={<Navigate to="/home/miniput" replace />} />
          <Route path="/kwink" element={<Navigate to="/home/kwink" replace />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}