import { useEffect, useRef, useState } from "react";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Password } from "primereact/password";

import { BuildingIcon } from "../components/icons/BuildingIcon";

export function Header() {
  const [open, setOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);

  const [logoutOpen, setLogoutOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header
        className="
          sticky top-0 z-50
          border-b border-border
          bg-card/95
          backdrop-blur
        "
      >
        <div className="page-container h-16 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div
              className="
                w-10 h-10
                rounded-lg
                bg-primary
                text-primary-foreground
                flex-center
              "
            >
              <BuildingIcon />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-foreground">
                VendorSync
              </h1>

              <p className="text-xs text-muted-foreground">
                Vendor Management System
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* Notification */}
            <button
              className="
                relative
                w-10 h-10
                rounded-lg
                border border-border
                bg-background
                hover:bg-secondary
                flex-center
              "
            >
              <i className="pi pi-bell text-sm" />

              <span
                className="
                  absolute top-2 right-2
                  w-2 h-2
                  rounded-full
                  bg-danger
                "
              />
            </button>

            {/* PROFILE */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="
                  flex items-center gap-3
                  rounded-lg
                  border border-border
                  bg-background
                  px-3 py-2
                  hover:bg-secondary
                "
              >
                <div
                  className="
                    w-9 h-9
                    rounded-full
                    bg-primary
                    text-primary-foreground
                    flex-center
                    font-semibold
                    text-sm
                  "
                >
                  V
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground">Vendor</p>

                  <p className="text-xs text-muted-foreground">
                    vendor@company.com
                  </p>
                </div>

                <i
                  className={`
                    pi pi-chevron-down
                    text-xs text-muted-foreground
                    transition-transform
                    ${open ? "rotate-180" : ""}
                  `}
                />
              </button>

              {/* DROPDOWN */}
              {open && (
                <div
                  className="
                    absolute right-0 top-14
                    w-64
                    card
                    p-2
                    shadow-lg
                    z-50
                  "
                >
                  <div className="px-3 py-2 border-b border-border mb-2">
                    <p className="text-sm font-medium text-foreground">
                      Vendor
                    </p>

                    <p className="text-xs text-muted-foreground">
                      vendor@company.com
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(true);
                      setOpen(false);
                    }}
                    className="
                      w-full text-left
                      px-3 py-2
                      rounded-md
                      text-sm
                      hover:bg-secondary
                    "
                  >
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setPasswordOpen(true);
                      setOpen(false);
                    }}
                    className="
                      w-full text-left
                      px-3 py-2
                      rounded-md
                      text-sm
                      hover:bg-secondary
                    "
                  >
                    Change Password
                  </button>

                  <button
                    className="
                      w-full text-left
                      px-3 py-2
                      rounded-md
                      text-sm
                      hover:bg-secondary
                    "
                  >
                    Settings
                  </button>

                  <div className="my-2 border-t border-border" />

                  <button
                    onClick={() => {
                      setLogoutOpen(true);
                      setOpen(false);
                    }}
                    className="
                      w-full text-left
                      px-3 py-2
                      rounded-md
                      text-sm
                      text-danger
                      hover:bg-red-50
                      dark:hover:bg-red-950/30
                    "
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PROFILE MODAL */}
      <Dialog
        header="Vendor Details"
        visible={profileOpen}
        onHide={() => setProfileOpen(false)}
        style={{ width: "450px" }}
        modal
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div
              className="
                w-14 h-14
                rounded-full
                bg-primary
                text-primary-foreground
                flex-center
                text-lg
                font-semibold
              "
            >
              V
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">Vendor</h3>

              <p className="text-sm text-muted-foreground">
                vendor@company.com
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Company</p>

              <p className="text-sm font-medium text-foreground">Cipla Ltd</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Vendor ID</p>

              <p className="text-sm font-medium text-foreground">VEN-10021</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Phone</p>

              <p className="text-sm font-medium text-foreground">
                +91 9876543210
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>

              <span
                className="
                  inline-flex items-center
                  px-2 py-1
                  rounded-full
                  text-xs
                  bg-success/10
                  text-success
                "
              >
                Active
              </span>
            </div>
          </div>
        </div>
      </Dialog>

      {/* CHANGE PASSWORD MODAL */}
      <Dialog
        header="Change Password"
        visible={passwordOpen}
        onHide={() => setPasswordOpen(false)}
        style={{ width: "450px" }}
        modal
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Current Password
            </label>

            <Password
              toggleMask
              feedback={false}
              className="w-full"
              inputClassName="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              New Password
            </label>

            <Password toggleMask className="w-full" inputClassName="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>

            <Password
              toggleMask
              feedback={false}
              className="w-full"
              inputClassName="w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              label="Cancel"
              outlined
              onClick={() => setPasswordOpen(false)}
            />

            <Button label="Update Password" icon="pi pi-check" />
          </div>
        </div>
      </Dialog>

      {/* LOGOUT CONFIRMATION */}
      <Dialog
        header="Logout Confirmation"
        visible={logoutOpen}
        onHide={() => setLogoutOpen(false)}
        style={{ width: "400px" }}
        modal
        footer={
          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              outlined
              onClick={() => setLogoutOpen(false)}
            />

            <Button label="Logout" severity="danger" icon="pi pi-sign-out" />
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <div
            className="
              w-10 h-10
              rounded-full
              bg-danger/10
              text-danger
              flex-center
              shrink-0
            "
          >
            <i className="pi pi-exclamation-triangle" />
          </div>

          <div>
            <p className="text-sm text-foreground font-medium">
              Are you sure you want to logout?
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              You will need to sign in again to access the portal.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
