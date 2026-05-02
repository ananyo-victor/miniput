import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useDispatch } from "react-redux";
import HomePage from "./pages/HomePage";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminPrivateRoute from "./pages/admin/AdminPrivateRoute";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CustomerAuth from "./pages/customer/CustomerAuth";
import CustomerPrivateRoute from "./pages/customer/CustomerPrivateRoute";
import CustomerPage from "./pages/customer/CustomerPage";
import { setAdminField } from "./store/adminSlice";
import { setCustomerField } from "./store/customerSlice";

export default function App() {
  const dispatch = useDispatch();

  const handleAdminLogout = () => {
    dispatch(setAdminField({ key: "authed", value: false }));
    dispatch(setAdminField({ key: "authStep", value: 1 }));
    dispatch(setAdminField({ key: "userId", value: "" }));
    dispatch(setAdminField({ key: "password", value: "" }));
    dispatch(setAdminField({ key: "otp", value: "" }));
  };

  const handleCustomerLogout = () => {
    dispatch(setCustomerField({ key: "authed", value: false }));
    dispatch(setCustomerField({ key: "authStep", value: "mobile" }));
    dispatch(setCustomerField({ key: "phone", value: "" }));
    dispatch(setCustomerField({ key: "otp", value: "" }));
    dispatch(setCustomerField({ key: "email", value: "" }));
  };

  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Admin Routes */}
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminPrivateRoute>
              <AdminDashboardPage onLogout={handleAdminLogout} />
            </AdminPrivateRoute>
          }
        />

        {/* Customer Routes */}
        <Route path="/customer/auth" element={<CustomerAuth />} />
        <Route
          path="/customer/shop"
          element={
            <CustomerPrivateRoute>
              <CustomerPage onLogout={handleCustomerLogout} />
            </CustomerPrivateRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
