import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { updateTwoFactor } from "../../../services/UsersService";

export default function AdminSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const [twoFactorEnabled, setTwoFactorEnabledState] = useState<boolean>(
    !!user?.isTwoFactorEnabled,
  );
  const [saving, setSaving] = useState(false);

  const handleToggle = async (next: boolean) => {
    const previous = twoFactorEnabled;

    setTwoFactorEnabledState(next);
    setSaving(true);

    try {
      const response = await updateTwoFactor(next);

      setTwoFactorEnabledState(response.isTwoFactorEnabled);

      toast.current?.show({
        severity: "success",
        summary: response.isTwoFactorEnabled
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled",
        life: 3000,
      });
    } catch (err) {
      setTwoFactorEnabledState(previous);

      toast.current?.show({
        severity: "error",
        summary: "Couldn't update two-factor authentication",
        detail: err instanceof Error ? err.message : "Please try again.",
        life: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Toast ref={toast} />

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <i className="pi pi-arrow-left text-xs" />
        Back
      </button>

      <h1 className="text-xl font-bold text-foreground mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage security settings for {user?.fullName ?? "your account"}.
      </p>

      {/* Security section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Security
        </h2>

        <div className="flex items-start justify-between gap-6 py-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              Two-factor authentication
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Require a one-time code in addition to your password when signing
              in.
            </p>
          </div>
          <InputSwitch
            checked={twoFactorEnabled}
            onChange={(e) => handleToggle(e.value)}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}
