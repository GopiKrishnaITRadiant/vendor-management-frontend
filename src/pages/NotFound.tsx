import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-primary mb-2">404</p>
        <h1 className="text-xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button label="Go back" severity="secondary" outlined onClick={() => navigate(-1)} />
          <Button
            label={isAuthenticated ? "Go home" : "Go to login"}
            icon="pi pi-home"
            onClick={() => navigate("/")}
          />
        </div>
      </div>
    </div>
  );
}