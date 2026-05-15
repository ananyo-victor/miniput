import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import AuthPage from "./pages/AuthPage";
import PrivateRoute from "./pages/PrivateRoute";
import InventoryPage from "./pages/InventoryPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductDetailPage from "./pages/ProductDetailPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Navigate to="/home/miniput" replace />} />
          <Route path="/home/:brand" element={<HomePage />} />
          <Route path="/miniput" element={<HomePage />} />
          <Route path="/kwink" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
