import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";

type Props = {
  visible: boolean;
  onHide: () => void;

  title: string;

  user: any;
  loading?: boolean;

  showPassword?: boolean;
  showRole?: boolean;
  showStatus?: boolean;
  disableEmail?: boolean;

  roleOptions?: any[];
  statusOptions?: any[];

  onChange: (field: string, value: any) => void;
  onSave: () => void;

  saveLabel?: string;
};

export default function UserFormDialog({
  visible,
  onHide,
  title,
  user,
  loading,

  showPassword = false,
  showRole = false,
  showStatus = false,
  disableEmail = false,

  roleOptions = [],
  statusOptions = [],

  onChange,
  onSave,

  saveLabel = "Save",
}: Props) {
  return (
    <Dialog
      header={title}
      visible={visible}
      onHide={onHide}
      style={{ width: "520px" }}
      modal
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              First Name *
            </label>

            <InputText
              value={user.firstName}
              onChange={(e) =>
                onChange("firstName", e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Last Name *
            </label>

            <InputText
              value={user.lastName}
              onChange={(e) =>
                onChange("lastName", e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium">
              Email *
            </label>

            <InputText
              value={user.email}
              disabled={disableEmail}
              onChange={(e) =>
                onChange("email", e.target.value)
              }
            />
          </div>

          {showPassword && (
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium">
                Password *
              </label>

              <Password
                value={user.password ?? ""}
                onChange={(e) =>
                  onChange("password", e.target.value)
                }
                toggleMask
                className="w-full"
                inputClassName="w-full"
              />
            </div>
          )}

          {showRole && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Role
              </label>

              <Dropdown
                value={user.roleId}
                options={roleOptions}
                onChange={(e) =>
                  onChange("roleId", e.value)
                }
                placeholder="Select role"
              />
            </div>
          )}

          {showStatus && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Status
              </label>

              <Dropdown
                value={user.status}
                options={statusOptions}
                onChange={(e) =>
                  onChange("status", e.value)
                }
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button
            label="Cancel"
            outlined
            onClick={onHide}
            disabled={loading}
          />

          <Button
            label={saveLabel}
            icon="pi pi-check"
            loading={loading}
            onClick={onSave}
          />
        </div>
      </div>
    </Dialog>
  );
}