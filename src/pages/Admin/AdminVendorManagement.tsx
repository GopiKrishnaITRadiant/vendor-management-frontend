import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import AppTable from "../../components/table/DataTable";
import { useDebounce } from "../../hooks/DebounceHook";
import {
  getAllUsers,
  getUserCounts,
  updateUser,
  suspendUser,
  activateUser,
  resendVerification,
} from "../../services/usersService";

type UserStatus = "active" | "inactive" | "suspended" | "pending_verification";

type Vendor = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  isEmailVerified: boolean;
  isFirstLoginVerified: boolean;
  sapVendorId: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
};

type EditableVendorFields = Pick<
  Vendor,
  "firstName" | "lastName" | "email" | "status"
>;

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
  { label: "Pending Verification", value: "pending_verification" },
];

const STATUS_BADGE: Record<UserStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-700" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-600" },
  suspended: { label: "Suspended", className: "bg-red-100 text-red-700" },
  pending_verification: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
  },
};

const emptyVendorForm: Partial<EditableVendorFields> = {
  status: "pending_verification",
};

export default function AdminVendorManagementPage() {
  const toast = useRef<Toast>(null);

  // ── Table state ───────────────────────────────────────
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<UserStatus | null>(null);

  // ── KPI counts — single API call ──────────────────────
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    pending: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  // ── Dialog state ──────────────────────────────────────
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [editingVendor, setEditingVendor] =
    useState<Partial<EditableVendorFields>>(emptyVendorForm);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Guards against duplicate / stale requests ─────────
  // requestIdRef ensures only the LATEST request's response is applied
  // (handles StrictMode double-invoke + rapid filter changes)
  const vendorsRequestId = useRef(0);
  const countsFetchedOnce = useRef(false);

  // ── Load vendors — guarded against stale/duplicate responses ──
  const loadVendors = useCallback(async () => {
    const requestId = ++vendorsRequestId.current;

    try {
      setLoading(true);
      const response = await getAllUsers(
        page,
        rows,
        debouncedSearch,
        '3',
        statusFilter ?? undefined,
      );

      if (requestId !== vendorsRequestId.current) return;

      setVendors(response.data);
      setTotalRecords(response.total);
    } catch (error: any) {
      if (requestId !== vendorsRequestId.current) return;
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message ?? "Failed to load vendors",
        life: 3000,
      });
    } finally {
      if (requestId === vendorsRequestId.current) setLoading(false);
    }
  }, [page, rows, debouncedSearch, statusFilter]);

  // ── Load counts — ONE API call, fetched once on mount ─
  // Refresh only after actions that change counts (suspend/reactivate)
  const loadCounts = useCallback(async () => {
    try {
      setCountsLoading(true);
      const data = await getUserCounts("vendor");
      setCounts({
        total: data.total,
        active: data.active,
        inactive: data.inactive,
        suspended: data.suspended,
        pending: data.pending,
      });
    } catch (error) {
      console.error("Failed to load vendor counts:", error);
    } finally {
      setCountsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  useEffect(() => {
    if (countsFetchedOnce.current) return;
    countsFetchedOnce.current = true;
    loadCounts();
  }, [loadCounts]);

  const handleView = (v: Vendor) => {
    setSelectedVendor(v);
    setViewDialogVisible(true);
  };

  const handleEdit = (v: Vendor) => {
    setSelectedVendor(v);
    setEditingVendor({
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      status: v.status,
    });
    setFormDialogVisible(true);
  };

  const handleSuspend = (v: Vendor) => {
    confirmDialog({
      message: `Suspend ${v.firstName} ${v.lastName}? They will no longer be able to submit ASNs.`,
      header: "Confirm Suspension",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => submitSuspend(v),
    });
  };

  const submitSuspend = async (v: Vendor) => {
    try {
      setActionLoading(true);
      await suspendUser(v.id);

      setVendors((prev) =>
        prev.map((vendor) =>
          vendor.id === v.id
            ? { ...vendor, status: "suspended" as UserStatus }
            : vendor,
        ),
      );

      // Update counts locally instead of re-fetching
      setCounts((c) => ({
        ...c,
        active: Math.max(0, c.active - (v.status === "active" ? 1 : 0)),
        suspended: c.suspended + 1,
      }));

      toast.current?.show({
        severity: "warn",
        summary: "Suspended",
        detail: `${v.firstName} ${v.lastName} has been suspended.`,
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message ?? "Failed to suspend vendor",
        life: 3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = (v: Vendor) => {
    confirmDialog({
      message: `Reactivate ${v.firstName} ${v.lastName}?`,
      header: "Confirm Reactivation",
      icon: "pi pi-check-circle",
      acceptClassName: "p-button-success",
      accept: () => submitReactivate(v),
    });
  };

  const submitReactivate = async (v: Vendor) => {
    try {
      setActionLoading(true);
      await activateUser(v.id);

      setVendors((prev) =>
        prev.map((vendor) =>
          vendor.id === v.id
            ? { ...vendor, status: "active" as UserStatus }
            : vendor,
        ),
      );

      setCounts((c) => ({
        ...c,
        active: c.active + 1,
        suspended: Math.max(
          0,
          c.suspended - (v.status === "suspended" ? 1 : 0),
        ),
      }));

      toast.current?.show({
        severity: "success",
        summary: "Activated",
        detail: `${v.firstName} ${v.lastName} has been reactivated.`,
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message ?? "Failed to reactivate vendor",
        life: 3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendVerification = async (v: Vendor) => {
    try {
      setActionLoading(true);
      await resendVerification(v.email);
      toast.current?.show({
        severity: "info",
        summary: "Sent",
        detail: `Verification email resent to ${v.email}.`,
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error?.response?.data?.message ?? "Failed to resend verification",
        life: 3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingVendor.firstName?.trim() || !editingVendor.lastName?.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation",
        detail: "First name and last name are required.",
        life: 3000,
      });
      return;
    }

    if (!selectedVendor) return;

    try {
      setActionLoading(true);
      const updated = await updateUser(selectedVendor.id, editingVendor);

      setVendors((prev) =>
        prev.map((v) =>
          v.id === selectedVendor.id ? { ...v, ...updated } : v,
        ),
      );

      toast.current?.show({
        severity: "success",
        summary: "Updated",
        detail: `${editingVendor.firstName} ${editingVendor.lastName} updated.`,
        life: 3000,
      });
      setFormDialogVisible(false);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message ?? "Failed to update vendor",
        life: 3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const set = (field: keyof EditableVendorFields, value: any) =>
    setEditingVendor((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Vendor Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vendor accounts are auto-provisioned from SAP purchase order sync.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          {
            label: "Total Vendors",
            value: counts.total,
            color: "text-foreground",
          },
          { label: "Active", value: counts.active, color: "text-success" },
          {
            label: "Inactive",
            value: counts.inactive,
            color: "text-muted-foreground",
          },
          { label: "Suspended", value: counts.suspended, color: "text-danger" },
          { label: "Pending", value: counts.pending, color: "text-warning" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>
              {countsLoading ? "—" : c.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          value={statusFilter}
          options={[ ...STATUS_OPTIONS]}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder="All Status"
          className="w-56"
        />
        {statusFilter && (
          <Button
            label="Clear"
            text
            icon="pi pi-times"
            onClick={() => setStatusFilter(null)}
          />
        )}
      </div>

      <AppTable
        data={vendors}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        totalRecords={totalRecords}
        rows={rows}
        onPageChange={(e: any) => {
          setPage(e.page + 1);
          setRows(e.rows);
        }}
        onSearchChange={setSearch}
        columns={[
          { field: "id", header: "ID", sortable: true },
          {
            field: "firstName",
            header: "Name",
            sortable: true,
            body: (row: Vendor) => `${row.firstName} ${row.lastName}`,
          },
          { field: "email", header: "Email", sortable: true, filter: true },
          {
            field: "sapVendorId",
            header: "SAP Vendor ID",
            sortable: true,
            filter: true,
          },
          {
            field: "status",
            header: "Status",
            sortable: true,
            filter: true,
            body: (row: Vendor) => {
              const badge = STATUS_BADGE[row.status];
              return (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}
                >
                  {badge.label}
                </span>
              );
            },
          },
          {
            field: "isEmailVerified",
            header: "Email Verified",
            body: (row: Vendor) =>
              row.isEmailVerified ? "Verified" : "Unverified",
          },
          {
            field: "lastLoginAt",
            header: "Last Login",
            sortable: true,
            body: (row: Vendor) =>
              row.lastLoginAt
                ? new Date(row.lastLoginAt).toLocaleString()
                : "Never",
          },
          // {
          //   field:  "actions",
          //   header: "Actions",
          //   body: (row: Vendor) => (
          //     <div className="flex gap-2">
          //       {row.status === "active" && (
          //         <Button icon="pi pi-ban" severity="danger" size="small" text tooltip="Suspend" onClick={() => handleSuspend(row)} />
          //       )}
          //       {row.status === "suspended" && (
          //         <Button icon="pi pi-check-circle" severity="success" size="small" text tooltip="Reactivate" onClick={() => handleReactivate(row)} />
          //       )}
          //       {!row.isEmailVerified && (
          //         <Button icon="pi pi-envelope" severity="info" size="small" text tooltip="Resend Verification" onClick={() => handleResendVerification(row)} />
          //       )}
          //     </div>
          //   ),
          // },
        ]}
      />

      <Dialog
        header={
          selectedVendor
            ? `${selectedVendor.firstName} ${selectedVendor.lastName}`
            : ""
        }
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        style={{ width: "520px" }}
        modal
      >
        {selectedVendor && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "First Name", value: selectedVendor.firstName },
                { label: "Last Name", value: selectedVendor.lastName },
                { label: "Email", value: selectedVendor.email },
                {
                  label: "SAP Vendor ID",
                  value: selectedVendor.sapVendorId ?? "—",
                },
                {
                  label: "Status",
                  value: STATUS_BADGE[selectedVendor.status]?.label,
                },
                {
                  label: "Email Verified",
                  value: selectedVendor.isEmailVerified ? "Yes" : "No",
                },
                {
                  label: "First Login Done",
                  value: selectedVendor.isFirstLoginVerified ? "Yes" : "No",
                },
                {
                  label: "Last Login",
                  value: selectedVendor.lastLoginAt
                    ? new Date(selectedVendor.lastLoginAt).toLocaleString()
                    : "Never",
                },
                {
                  label: "Last Login IP",
                  value: selectedVendor.lastLoginIp ?? "—",
                },
                {
                  label: "Created At",
                  value: new Date(
                    selectedVendor.createdAt,
                  ).toLocaleDateString(),
                },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {f.label}
                  </p>
                  <p className="font-medium">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                label="Close"
                outlined
                severity="secondary"
                onClick={() => setViewDialogVisible(false)}
              />
              <Button
                label="Edit"
                icon="pi pi-pencil"
                onClick={() => {
                  setViewDialogVisible(false);
                  handleEdit(selectedVendor);
                }}
              />
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        header={`Edit — ${editingVendor.firstName ?? ""} ${editingVendor.lastName ?? ""}`}
        visible={formDialogVisible}
        onHide={() => setFormDialogVisible(false)}
        style={{ width: "480px" }}
        modal
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                First Name *
              </label>
              <InputText
                value={editingVendor.firstName ?? ""}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Last Name *
              </label>
              <InputText
                value={editingVendor.lastName ?? ""}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Email *
              </label>
              <InputText
                value={editingVendor.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
                placeholder="vendor@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Changing this will require the vendor to re-verify their email.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Status
              </label>
              <Dropdown
                value={editingVendor.status}
                options={STATUS_OPTIONS}
                onChange={(e) => set("status", e.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              label="Cancel"
              outlined
              severity="secondary"
              onClick={() => setFormDialogVisible(false)}
              disabled={actionLoading}
            />
            <Button
              label="Update"
              icon="pi pi-check"
              loading={actionLoading}
              onClick={handleSave}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
