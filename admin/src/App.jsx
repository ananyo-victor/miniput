import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AuthPage from "./pages/AuthPage";
import PrivateRoute from "./pages/PrivateRoute";
import InventoryPage from "./pages/InventoryPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { setupAxiosInterceptors } from "./utils/axiosInterceptor";
import { fetchWorkspaces } from "./store/workspaceSlice";

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
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
