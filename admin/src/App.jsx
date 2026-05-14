import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import AuthPage from "./pages/AuthPage";
import PrivateRoute from "./pages/PrivateRoute";
import InventoryPage from "./pages/InventoryPage";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route element={<PrivateRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
