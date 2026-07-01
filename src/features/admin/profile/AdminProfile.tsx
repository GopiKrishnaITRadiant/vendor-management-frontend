import { useNavigate }          from "react-router-dom";
import { Avatar }               from "primereact/avatar";
import { Button }               from "primereact/button";
import { Tag }                  from "primereact/tag";
import { Toast }                from "primereact/toast";
import { useRef, useState }     from "react";

import { useAuth }              from "../../../context/AuthContext";
import { changePassword, updateUser } from "../../../services/UsersService";
import ChangePasswordDialog from "../../../components/dialogs/ChangePasswordDialog";
import UserFormDialog from "../../../components/dialogs/userFromDialog";

export default function AdminProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast    = useRef<Toast>(null);

  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [editProfileVisible,    setEditProfileVisible]    = useState(false);
  const [savingPassword,        setSavingPassword]        = useState(false);
  const [savingProfile,         setSavingProfile]         = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.fullName?.split(" ")?.[0] ?? "",
    lastName:  user?.fullName?.split(" ")?.slice(1).join(" ") ?? "",
    email:     user?.email ?? "",
  });

  const initials = (user?.fullName || user?.email)?.charAt(0).toUpperCase();

  const fields = [
    { label: "Full name",     value: user?.fullName,     icon: "pi-user"     },
    { label: "Email address", value: user?.email,        icon: "pi-envelope" },
    { label: "Role",          value: user?.role?.name,   icon: "pi-shield", capitalize: true },
    { label: "SAP vendor ID", value: user?.sapVendorId,  icon: "pi-building" },
  ];

  // ── Change password ────────────────────────────────────
  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      setSavingPassword(true);
      await changePassword(Number(user?.id), { currentPassword, newPassword });

      toast.current?.show({
        severity: "success",
        summary:  "Success",
        detail:   "Password updated successfully",
      });

      setChangePasswordVisible(false);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   error?.response?.data?.message ?? "Failed to update password",
      });
      // Re-throw so ChangePasswordDialog keeps its form state on failure
      // (user can correct and retry without re-entering everything).
      throw error;
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Edit profile ───────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.email.trim()) {
      toast.current?.show({
        severity: "error",
        summary:  "Validation",
        detail:   "First name and email are required.",
      });
      return;
    }

    try {
      setSavingProfile(true);
      await updateUser(Number(user?.id), profileForm);

      toast.current?.show({
        severity: "success",
        summary:  "Updated",
        detail:   "Profile updated successfully",
      });

      setEditProfileVisible(false);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   error?.response?.data?.message ?? "Failed to update profile",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="page-container py-8 max-w-4xl mx-auto space-y-6">
      <Toast ref={toast} />

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <i className="pi pi-arrow-left text-xs transition-transform group-hover:-translate-x-0.5" />
        Back
      </button>

      {/* ── Profile hero card ───────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Avatar
              label={initials}
              size="xlarge"
              shape="circle"
              className="bg-primary text-white font-bold flex-shrink-0"
              style={{ width: "80px", height: "80px", fontSize: "1.8rem" }}
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {user?.role?.name === "admin"
                  ? "Administrator"
                  : user?.fullName || user?.email?.split("@")[0]}
              </h1>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Tag
                  value={user?.role?.name ?? "User"}
                  className="capitalize !rounded-full"
                />
                {user?.isTwoFactorEnabled && (
                  <Tag
                    severity="success"
                    value="2FA Enabled"
                    icon="pi pi-shield"
                    className="!rounded-full"
                  />
                )}
              </div>
            </div>
          </div>

          <Button
            label="Edit Profile"
            icon="pi pi-user-edit"
            outlined
            onClick={() => setEditProfileVisible(true)}
          />
        </div>
      </div>

      {/* ── Personal information ────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface p-7">
        <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <i className="pi pi-id-card text-primary text-sm" />
          Personal information
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
          {fields.map((field) => (
            <div key={field.label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-alt flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className={`pi ${field.icon} text-muted-foreground text-sm`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {field.label}
                </p>
                <p className={`font-medium text-foreground mt-0.5 ${field.capitalize ? "capitalize" : ""}`}>
                  {field.value || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Security ────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface p-7">
        <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <i className="pi pi-lock text-primary text-sm" />
          Security
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-alt flex items-center justify-center flex-shrink-0">
              <i className="pi pi-key text-muted-foreground text-sm" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Password</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>
          <Button
            label="Change password"
            icon="pi pi-lock"
            outlined
            onClick={() => setChangePasswordVisible(true)}
            className="!rounded-xl flex-shrink-0"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-alt flex items-center justify-center flex-shrink-0">
              <i className="pi pi-shield text-muted-foreground text-sm" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                Two-factor authentication
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Additional protection for your account.
              </p>
            </div>
          </div>
          <Tag
            severity={user?.isTwoFactorEnabled ? "success" : "warning"}
            value={user?.isTwoFactorEnabled ? "Enabled" : "Disabled"}
            className="!rounded-full flex-shrink-0"
          />
        </div>
      </div>

      {/* ── Edit Profile Dialog ─────────────────────────── */}
      <UserFormDialog
        visible={editProfileVisible}
        onHide={() => setEditProfileVisible(false)}
        title="Edit Profile"
        disableEmail={user?.role.name !== "admin"}
        user={profileForm}
        loading={savingProfile}
        onChange={(field:string, value:any) =>
          setProfileForm((prev) => ({ ...prev, [field]: value }))
        }
        onSave={handleSaveProfile}
        saveLabel="Save Changes"
      />

      {/* ── Change Password Dialog ──────────────────────── */}
      <ChangePasswordDialog
        visible={changePasswordVisible}
        onHide={() => setChangePasswordVisible(false)}
        loading={savingPassword}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}