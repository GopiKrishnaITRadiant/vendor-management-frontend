import { useRef } from "react";
import { Button }    from "primereact/button";
import { Dialog }    from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password }  from "primereact/password";
import { Toast }     from "primereact/toast";
import type { Vendor } from "../../features/admin/vendors/types";

type Props = {
  visible:  boolean;
  onHide:   () => void;
  vendor:   Vendor | null;

  email:        string;
  password:     string;
  loading:      boolean;

  onEmailChange:    (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRegenerate:     () => void;
  onSubmit:         () => void;
};

export default function SetupVendorDialog({
  visible,
  onHide,
  vendor,
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onRegenerate,
  onSubmit,
}: Props) {
  const toast = useRef<Toast>(null);

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(password);
    toast.current?.show({
      severity: "info",
      summary:  "Copied",
      detail:   "Password copied to clipboard.",
      life:     2000,
    });
  };

  if (!vendor) return null;

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        header={`Setup Vendor — ${vendor.sapVendorId ?? ""}`}
        visible={visible}
        onHide={onHide}
        style={{ width: "480px" }}
        modal
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            This vendor account was auto-created from SAP sync and has no real
            email or password yet. Enter the vendor's email, generate a
            password, then send the credentials.
          </p>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Vendor Email *
            </label>
            <InputText
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="vendor@example.com"
              className="w-full"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Generated Password
            </label>
            <div className="flex gap-2">
              <Password
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                toggleMask
                feedback={false}
                className="flex-1"
                inputClassName="w-full font-mono"
              />
              <Button
                icon="pi pi-refresh"
                outlined
                tooltip="Regenerate"
                onClick={onRegenerate}
                type="button"
              />
              <Button
                icon="pi pi-copy"
                outlined
                tooltip="Copy to clipboard"
                onClick={copyPasswordToClipboard}
                type="button"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This password will be emailed directly to the vendor. The vendor
              will verify via OTP on first login.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              label="Cancel"
              outlined
              severity="secondary"
              onClick={onHide}
              disabled={loading}
            />
            <Button
              label="Activate & Send Credentials"
              icon="pi pi-send"
              loading={loading}
              onClick={onSubmit}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}