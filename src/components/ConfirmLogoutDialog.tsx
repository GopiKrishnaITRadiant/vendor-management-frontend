import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

type ConfirmLogoutDialogProps = {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
};

export default function ConfirmLogoutDialog({
  visible,
  onHide,
  onConfirm,
}: ConfirmLogoutDialogProps) {
  return (
    <Dialog
      header="Confirm Logout"
      visible={visible}
      onHide={onHide}
      modal
      draggable={false}
      resizable={false}
      style={{ width: "28rem" }}
    >
      <div className="flex align-items-center gap-3 py-2">
        <i
          className="pi pi-exclamation-triangle text-yellow-500"
          style={{ fontSize: "2rem" }}
        />
        <span>
          Are you sure you want to logout from your account?
        </span>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button
          label="Cancel"
          outlined
          severity="secondary"
          onClick={onHide}
        />

        <Button
          label="Logout"
          icon="pi pi-sign-out"
          severity="danger"
          onClick={onConfirm}
        />
      </div>
    </Dialog>
  );
}