// hooks/useConfirmLogout.ts
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { confirmDialog } from "primereact/confirmdialog";

export function useConfirmLogout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const confirmLogout = () => {
    confirmDialog({
      header: "Logout",
      message: "Are you sure you want to logout?",
      icon: "pi pi-sign-out",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await logout();
        navigate("/");
      },
    });
  };

  return confirmLogout;
}