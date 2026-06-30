import { useNavigate } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useAuth } from "../../../context/AuthContext";

export default function AdminProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const fields: { label: string; value?: string | null }[] = [
    { label: "Full name", value: user?.fullName },
    { label: "Email", value: user?.email },
    { label: "Role", value: user?.role?.name },
    // { label: "Phone", value: user?.phone },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <i className="pi pi-arrow-left text-xs" />
        Back
      </button>

      {/* Header card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar
            label={(user?.fullName||user?.email)?.charAt(0).toUpperCase()}
            size="xlarge"
            shape="circle"
            className="bg-primary text-white shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {(user?.fullName||user?.email.split('@')[0]) ?? "Admin"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Tag value={user?.role?.name ?? "Admin"} className="capitalize" />
              {user?.isTwoFactorEnabled && (
                <Tag severity="success" value="2FA on" icon="pi pi-shield" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Account details
        </h2>
        <dl className="divide-y divide-border">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <dt className="text-sm text-muted-foreground">{field.label}</dt>
              <dd className="text-sm font-medium text-foreground">
                {field.value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Actions */}
      <div className="flex justify-end mt-6">
        <Button
          label="Go to settings"
          icon="pi pi-cog"
          outlined
          onClick={() => navigate("/admin/settings")}
        />
      </div>
    </div>
  );
}