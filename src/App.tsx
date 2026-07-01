import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth, getRoleHomeRoute } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";
import VendorLayout from "./layouts/VendorLayout";
import AdminLayout from "./layouts/AdminLayout";

import LoginPage from "./pages/Login";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

import PurchaseOrdersPage from "./features/vendor/vendor-purchase-orders/PurchaseOrder";
import CreateASNPage from "./features/vendor/vendor-create-asn/CreateAsn";
import ASNHistoryPage from "./features/vendor/vendor-asn-history/AsnHistory";
import VendorDashboardPage from "./features/vendor/vendor-dashboard/VendorDashboard";

import AdminDashboardPage from "./features/admin/dashboard/AdminDashboard";
import AdminASNApprovalsPage from "./features/admin/asn/AsnApprove";
import AdminPurchaseOrdersPage from "./features/admin/admin-purchase-orders/AdminPurchaseOrders";
import AdminVendorManagementPage from "./features/admin/vendors/AdminVendorManagement";
import AdminUsersRolesPage from "./features/admin/users/AdminUserRoles";

import ProtectedRoute from "./routes/ProtectedRoutes";
import AdminProfile from "./features/admin/profile/AdminProfile";
import AdminSettings from "./features/admin/settings/AdminSettings";
import SAPSyncLogsPage from "./features/admin/sap-sync/SAPSyncLogsPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

//Root redirect — waits for the silent /auth/refresh bootstrap
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path= "/not-found" element={<NotFound />} />
      <Route path="/" element={<RootRedirect />} />

      <Route element={<MainLayout />}>
        {/* role values match backend role.name exactly: 'vendor' | 'admin' | 'manager' */}
        <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
          <Route element={<VendorLayout />}>
            <Route index path="/vendor-dashboard" element={<VendorDashboardPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/asn/create" element={<CreateASNPage />} />
            <Route path="/asn/history" element={<ASNHistoryPage />} />
            <Route  path= "profile" element={ <AdminProfile /> }/>
            <Route path= "settings" element={ <AdminSettings /> }/>
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="asn-approvals" element={<AdminASNApprovalsPage />} />
            <Route path="purchase-orders" element={<AdminPurchaseOrdersPage />} />
            <Route path="sap-sync-logs" element={<SAPSyncLogsPage />} />
            <Route path="vendors" element={<AdminVendorManagementPage />} />
            <Route path="users" element={<AdminUsersRolesPage />} />
            <Route  path= "profile" element={ <AdminProfile /> }/>
            <Route path= "settings" element={ <AdminSettings /> }/>
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
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}