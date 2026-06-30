import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  console.log("ProtectedRoute", {
  isLoading,
  isAuthenticated,
  role: user?.role?.name,
});
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roleName = user?.role?.name;
  if (!roleName || !allowedRoles.includes(roleName)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}