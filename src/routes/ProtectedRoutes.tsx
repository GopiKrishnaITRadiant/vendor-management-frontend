import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export type UserRole = "vendor" | "admin";
type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // While decoding the JWT, show nothing (avoids flash)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="pi pi-spin pi-spinner text-2xl text-muted-foreground" />
      </div>
    );
  }

  // Not logged in → redirect to login, preserving the attempted path
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their home
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "admin" ? "/admin-dashboard" : "/purchase-orders";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}