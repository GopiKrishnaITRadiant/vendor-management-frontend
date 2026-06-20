import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth, getRoleHomeRoute } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";
import VendorLayout from "./layouts/VendorLayout";
import AdminLayout from "./layouts/AdminLayout";

import LoginPage from "./pages/Login";

import PurchaseOrdersPage from "./pages/vendor/PurchaseOrder";
import CreateASNPage from "./pages/vendor/CreateAsn";
import ASNHistoryPage from "./pages/vendor/AsnHistory";
import VendorDashboardPage from "./pages/vendor/VendorDashboard";

import AdminDashboardPage from "./pages/Admin/AdminDashboard";
import AdminASNApprovalsPage from "./pages/Admin/AsnApprove";
import AdminPurchaseOrdersPage from "./pages/Admin/AdminPurchaseOrders";
import AdminVendorManagementPage from "./pages/Admin/AdminVendorManagement";
import AdminUsersRolesPage from "./pages/Admin/AdminUserRoles";

import ProtectedRoute from "./routes/ProtectedRoutes";

// ── Root redirect — waits for the silent /auth/refresh bootstrap ──
function RootRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />; // never render null — avoids a flash of blank screen

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Single source of truth lives in AuthContext (ROLE_HOME_ROUTE) —
  // keeps this in sync with the redirect Login.tsx does post-auth.
  return <Navigate to={getRoleHomeRoute(user?.role?.name)} replace />;
}

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      <Route element={<MainLayout />}>
        {/* role values match backend role.name exactly: 'vendor' | 'admin' | 'manager' */}
        <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
          <Route element={<VendorLayout />}>
            <Route index path="/vendor-dashboard" element={<VendorDashboardPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/asn/create" element={<CreateASNPage />} />
            <Route path="/asn/history" element={<ASNHistoryPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="asn-approvals" element={<AdminASNApprovalsPage />} />
            <Route path="purchase-orders" element={<AdminPurchaseOrdersPage />} />
            <Route path="vendors" element={<AdminVendorManagementPage />} />
            <Route path="users" element={<AdminUsersRolesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}