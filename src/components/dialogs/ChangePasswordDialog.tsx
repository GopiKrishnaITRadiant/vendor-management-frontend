import { useState } from "react";
import { Button }   from "primereact/button";
import { Dialog }   from "primereact/dialog";
import { Password } from "primereact/password";

type Props = {
  visible:  boolean;
  onHide:   () => void;
  loading:  boolean;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
};

interface PasswordForm {
  currentPassword:  string;
  newPassword:      string;
  confirmPassword:  string;
}

interface PasswordErrors {
  currentPassword?:  string;
  newPassword?:      string;
  confirmPassword?:  string;
}

const PASSWORD_MIN_LENGTH = 8;

const empty: PasswordForm = {
  currentPassword:  "",
  newPassword:      "",
  confirmPassword:  "",
};

export default function ChangePasswordDialog({
  visible,
  onHide,
  loading,
  onSubmit,
}: Props) {
  const [form,   setForm]   = useState<PasswordForm>(empty);
  const [errors, setErrors] = useState<PasswordErrors>({});

  const setField =
    (field: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): PasswordErrors => {
    const errs: PasswordErrors = {};

    if (!form.currentPassword.trim())
      errs.currentPassword = "Current password is required";

    if (!form.newPassword.trim())
      errs.newPassword = "New password is required";
    else if (form.newPassword.length < PASSWORD_MIN_LENGTH)
      errs.newPassword = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    else if (form.newPassword === form.currentPassword)
      errs.newPassword = "New password must differ from the current one";

    if (!form.confirmPassword.trim())
      errs.confirmPassword = "Please confirm your new password";
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    await onSubmit(form.currentPassword, form.newPassword);
  };

  const handleHide = () => {
    // Prevent closing while a request is in flight.
    if (loading) return;
    setForm(empty);
    setErrors({});
    onHide();
  };

  return (
    <Dialog
      header="Change Password"
      visible={visible}
      closable={!loading}
      onHide={handleHide}
      modal
    >
      <div className="space-y-4 pt-1">

        {/* Current password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Current Password *
          </label>
          <Password
            value={form.currentPassword}
            onChange={setField("currentPassword")}
            toggleMask
            feedback={false}
            className="w-full"
            inputClassName="w-full"
            autoFocus
          />
          {errors.currentPassword && (
            <p className="text-xs text-danger flex items-center gap-1">
              <i className="pi pi-exclamation-circle" />
              {errors.currentPassword}
            </p>
          )}
        </div>

        {/* New password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            New Password *
          </label>
          <Password
            value={form.newPassword}
            onChange={setField("newPassword")}
            toggleMask
            feedback
            className="w-full"
            inputClassName="w-full"
          />
          {errors.newPassword && (
            <p className="text-xs text-danger flex items-center gap-1">
              <i className="pi pi-exclamation-circle" />
              {errors.newPassword}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Confirm Password *
          </label>
          <Password
            value={form.confirmPassword}
            onChange={setField("confirmPassword")}
            toggleMask
            feedback={false}
            className="w-full"
            inputClassName="w-full"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-danger flex items-center gap-1">
              <i className="pi pi-exclamation-circle" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button
            label="Cancel"
            outlined
            onClick={handleHide}
            disabled={loading}
          />
          <Button
            label="Update Password"
            icon="pi pi-lock"
            loading={loading}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
}