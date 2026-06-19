import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import VendorLayout from "./layouts/VendorLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public
import VendorLoginPage from "./pages/Login";

// Vendor pages
import PurchaseOrdersPage from "./pages/vendor/PurchaseOrder";
import CreateASNPage from "./pages/vendor/CreateAsn";
import ASNHistoryPage from "./pages/vendor/AsnHistory";

// Admin pages
import AdminDashboardPage from "./pages/Admin/AdminDashboard";
import AdminASNApprovalsPage from "./pages/Admin/AsnApprove";
import AdminPurchaseOrdersPage from "./pages/Admin/AdminPurchaseOrders";
import AdminVendorManagementPage from "./pages/Admin/AdminVendorManagement";
import AdminUsersRolesPage from "./pages/Admin/AdminUserRoles";
import ProtectedRoute from "./routes/ProtectedRoutes";
import VendorDashboardPage from "./pages/vendor/VendorDashboard";


function RootRedirect() {
  const { isAuthenticated, user={role: "admin"}, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return user?.role === "admin"
    ? <Navigate to="/admin-dashboard" replace />
    : <Navigate to="/purchase-orders" replace />;
}

// ─── App ─────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>

      {/* ── Public ──────────────────────────────────── */}
      <Route path="/login" element={<VendorLoginPage />} />

      {/* Root → smart redirect based on role */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Protected shell ─────────────────────────── */}
      <Route element={<MainLayout />}>

        {/* ── Vendor routes (role: vendor) ───────────── */}
        <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
          <Route element={<VendorLayout />}>
            <Route index path="/vendor-dashboard" element={<VendorDashboardPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/asn/create" element={<CreateASNPage />} />
            <Route path="/asn/history" element={<ASNHistoryPage />} />
          </Route>
        </Route>

        {/* ── Admin routes (role: admin) ─────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="asn-approvals" element={<AdminASNApprovalsPage />} />
            <Route path="purchase-orders" element={<AdminPurchaseOrdersPage />} />
            <Route path="vendors" element={<AdminVendorManagementPage />} />
            <Route path="users" element={<AdminUsersRolesPage />} />
          </Route>
        </Route>

      </Route>

      {/* ── 404 fallback ──────────────────────────────── */}
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