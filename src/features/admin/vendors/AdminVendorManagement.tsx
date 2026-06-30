import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import AppTable from "../../../components/table/DataTable";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import {
  getAllUsers,
  getUserCounts,
  updateUser,
  setupVendor,
} from "../../../services/UsersService";
import type { UserStatus } from "../../../types/sharedTypes";
import type { EditableVendorFields, Vendor } from "./types";
import { STATUS_BADGE, STATUS_OPTIONS, VENDOR_DASHBOARD_CARDS } from "./constants";

const emptyVendorForm: Partial<EditableVendorFields> = {
  status: "pending_verification",
};

function generatePassword(): string {
  const upper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower   = "abcdefghijklmnopqrstuvwxyz";
  const digits  = "0123456789";
  const special = "@#$!%*?&";
  const all     = upper + lower + digits + special;
  const rand    = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const chars = [
    rand(upper), rand(lower), rand(digits), rand(special),
    ...Array.from({ length: 8 }, () => rand(all)),
  ];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// ── Filter shape — just status, matching the original page ──
type VendorFilters = { status: UserStatus | null };

export default function AdminVendorManagementPage() {
  const toast = useRef<Toast>(null);

  //KPI counts — independent of table filters
  const [counts, setCounts] = useState({
    total: 0, active: 0, inactive: 0, suspended: 0, pending: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const countsFetchedOnce = useRef(false);

  //Dialog state
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [selectedVendor,    setSelectedVendor]    = useState<Vendor | null>(null);
  const [editingVendor,     setEditingVendor]     = useState<Partial<EditableVendorFields>>(emptyVendorForm);
  const [actionLoading,     setActionLoading]     = useState(false);

  const [setupDialogVisible, setSetupDialogVisible] = useState(false);
  const [setupVendorTarget,  setSetupVendorTarget]  = useState<Vendor | null>(null);
  const [setupEmail,         setSetupEmail]         = useState("");
  const [setupPassword,      setSetupPassword]      = useState("");
  const [setupSending,       setSetupSending]       = useState(false);

  //Stable initial filters
  const initialFilters = useMemo<VendorFilters>(() => ({status: null }), []);

  //Paginated table — replaces page/rows/first/search/statusFilter/loadVendors
  const {
    data: vendors,
    totalRecords,
    loading,
    rows,
    first,
    onPageChange,
    setSearch,
    filters,
    setFilter,
    refetch,
  } = usePaginatedQuery<Vendor, VendorFilters>({
    initialFilters,

    fetchFn: useCallback(
      ({ page, rows, search, filters }) =>
        getAllUsers(page, rows, search, "vendor", filters.status ?? undefined),
      [],
    ),

    onError: useCallback((error: any) => {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   error?.response?.data?.message ?? "Failed to load vendors",
        life:     3000,
      });
    }, []),
  });

  //KPI counts — fetched once
  const loadCounts = useCallback(async () => {
    try {
      setCountsLoading(true);
      const data = await getUserCounts("vendor");
      setCounts({
        total:     data.total,
        active:    data.active,
        inactive:  data.inactive,
        suspended: data.suspended,
        pending:   data.pending,
      });
    } catch (error) {
      console.error("Failed to load vendor counts:", error);
    } finally {
      setCountsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (countsFetchedOnce.current) return;
    countsFetchedOnce.current = true;
    loadCounts();
  }, [loadCounts]);

  //Handlers
  const handleView = (v: Vendor) => {
    setSelectedVendor(v);
    setViewDialogVisible(true);
  };

  const handleEdit = (v: Vendor) => {
    setSelectedVendor(v);
    setEditingVendor({
      firstName: v.firstName,
      lastName:  v.lastName,
      email:     v.email,
      status:    v.status,
    });
    setFormDialogVisible(true);
  };

  const openSetupDialog = (v: Vendor) => {
    setSetupVendorTarget(v);
    setSetupEmail(v.email.endsWith("@pending.internal") ? "" : v.email);
    setSetupPassword(generatePassword());
    setSetupDialogVisible(true);
  };

  const regeneratePassword = () => setSetupPassword(generatePassword());

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(setupPassword);
    toast.current?.show({
      severity: "info",
      summary:  "Copied",
      detail:   "Password copied to clipboard.",
      life:     2000,
    });
  };

  const submitSetupVendor = async () => {
    if (!setupVendorTarget) return;

    if (!setupEmail.trim()) {
      toast.current?.show({ severity: "error", summary: "Validation", detail: "Email is required to send credentials.", life: 3000 });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(setupEmail.trim())) {
      toast.current?.show({ severity: "error", summary: "Validation", detail: "Enter a valid email address.", life: 3000 });
      return;
    }
    if (!setupPassword.trim()) {
      toast.current?.show({ severity: "error", summary: "Validation", detail: "Generate a password before sending.", life: 3000 });
      return;
    }

    try {
      setSetupSending(true);
      await setupVendor(setupVendorTarget.id, {
        email:    setupEmail.trim().toLowerCase(),
        password: setupPassword,
      });

      setCounts((c) => ({
        ...c,
        pending: Math.max(0, c.pending - 1),
        active:  c.active + 1,
      }));

      toast.current?.show({
        severity: "success",
        summary:  "Vendor Activated",
        detail:   `Credentials sent to ${setupEmail.trim()}.`,
        life:     4000,
      });

      setSetupDialogVisible(false);
      refetch();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   error?.response?.data?.message ?? "Failed to set up vendor",
        life:     3000,
      });
    } finally {
      setSetupSending(false);
    }
  };

  const handleSave = async () => {
    if (!editingVendor.firstName?.trim() || !editingVendor.lastName?.trim()) {
      toast.current?.show({ severity: "error", summary: "Validation", detail: "First name and last name are required.", life: 3000 });
      return;
    }
    if (!selectedVendor) return;

    try {
      setActionLoading(true);
      await updateUser(selectedVendor.id, editingVendor);

      toast.current?.show({
        severity: "success",
        summary:  "Updated",
        detail:   `${editingVendor.firstName} ${editingVendor.lastName} updated.`,
        life:     3000,
      });

      setFormDialogVisible(false);
      refetch();   // ← reflects the updated fields from server
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   error?.response?.data?.message ?? "Failed to update vendor",
        life:     3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const set = (field: keyof EditableVendorFields, value: any) =>
    setEditingVendor((prev: any) => ({ ...prev, [field]: value }));

  const isPlaceholderEmail = (email: string) => email.endsWith("@pending.internal");

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Vendor Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vendor accounts are auto-provisioned from SAP purchase order sync.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {VENDOR_DASHBOARD_CARDS.map((card) => (
          <div key={card.key} className="card p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${card.color}`}>
              {countsLoading ? "—" : (counts[card.key] ?? 0)}
            </h3>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          value={filters.status}
          options={[{ label: "All Status", value: null }, ...STATUS_OPTIONS]}
          onChange={(e) => setFilter("status", e.value)}
          placeholder="All Status"
          className="w-56"
        />
        {filters.status && (
          <Button label="Clear" text icon="pi pi-times" onClick={() => setFilter("status", null)} />
        )}
      </div>

      <AppTable
        data={vendors}
        loading={loading}
        lazy
        rows={rows}
        first={first}
        totalRecords={totalRecords}
        globalSearch
        onSearchChange={setSearch}
        onView={handleView}
        onPageChange={onPageChange}
        columns={[
          { field: "id", header: "ID", sortable: true },
          {
            field: "firstName",
            header: "Name",
            sortable: true,
            body: (row: Vendor) => `${row.firstName} ${row.lastName}`,
          },
          {
            field: "email",
            header: "Email",
            sortable: true,
            filter: true,
            body: (row: Vendor) =>
              isPlaceholderEmail(row.email) ? (
                <span className="text-amber-600 italic text-sm">Not set up yet</span>
              ) : (
                row.email
              ),
          },
          { field: "sapVendorId", header: "SAP Vendor ID", sortable: true, filter: true },
          {
            field: "status",
            header: "Status",
            sortable: true,
            filter: true,
            body: (row: Vendor) => {
              const badge = STATUS_BADGE[row.status];
              return (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}>
                  {badge.label}
                </span>
              );
            },
          },
          {
            field: "isEmailVerified",
            header: "Email Verified",
            body: (row: Vendor) => (row.isEmailVerified ? "Verified" : "Unverified"),
          },
          {
            field: "lastLoginAt",
            header: "Last Login",
            sortable: true,
            body: (row: Vendor) =>
              row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : "Never",
          },
        ]}
      />

      {/* View Dialog */}
      <Dialog
        header={selectedVendor ? `${selectedVendor.firstName} ${selectedVendor.lastName}` : ""}
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
                { label: "SAP Vendor ID", value: selectedVendor.sapVendorId ?? "—" },
                { label: "Status", value: STATUS_BADGE[selectedVendor.status]?.label },
                { label: "Email Verified", value: selectedVendor.isEmailVerified ? "Yes" : "No" },
                { label: "First Login Done", value: selectedVendor.isFirstLoginVerified ? "Yes" : "No" },
                {
                  label: "Last Login",
                  value: selectedVendor.lastLoginAt
                    ? new Date(selectedVendor.lastLoginAt).toLocaleString()
                    : "Never",
                },
                { label: "Last Login IP", value: selectedVendor.lastLoginIp ?? "—" },
                { label: "Created At", value: new Date(selectedVendor.createdAt).toLocaleDateString() },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{f.label}</p>
                  <p className="font-medium">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button label="Close" outlined severity="secondary" onClick={() => setViewDialogVisible(false)} />
              {selectedVendor.status === "pending_verification" && (
                <Button
                  label="Setup Vendor"
                  icon="pi pi-key"
                  severity="warning"
                  onClick={() => { setViewDialogVisible(false); openSetupDialog(selectedVendor); }}
                />
              )}
              <Button
                label="Edit"
                icon="pi pi-pencil"
                onClick={() => { setViewDialogVisible(false); handleEdit(selectedVendor); }}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Edit Dialog */}
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
              <label className="text-sm font-medium text-foreground">First Name *</label>
              <InputText value={editingVendor.firstName ?? ""} onChange={(e) => set("firstName", e.target.value)} placeholder="First name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Last Name *</label>
              <InputText value={editingVendor.lastName ?? ""} onChange={(e) => set("lastName", e.target.value)} placeholder="Last name" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <InputText value={editingVendor.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="vendor@example.com" />
              <p className="text-xs text-muted-foreground">Changing this will require the vendor to re-verify their email.</p>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Dropdown value={editingVendor.status} options={STATUS_OPTIONS} onChange={(e) => set("status", e.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button label="Cancel" outlined severity="secondary" onClick={() => setFormDialogVisible(false)} disabled={actionLoading} />
            <Button label="Update" icon="pi pi-check" loading={actionLoading} onClick={handleSave} />
          </div>
        </div>
      </Dialog>

      {/* Setup Vendor Dialog */}
      <Dialog
        header={`Setup Vendor — ${setupVendorTarget?.sapVendorId ?? ""}`}
        visible={setupDialogVisible}
        onHide={() => setSetupDialogVisible(false)}
        style={{ width: "480px" }}
        modal
      >
        {setupVendorTarget && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              This vendor account was auto-created from SAP sync and has no real
              email or password yet. Enter the vendor's email, generate a
              password, then send the credentials.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Vendor Email *</label>
              <InputText value={setupEmail} onChange={(e) => setSetupEmail(e.target.value)} placeholder="vendor@example.com" className="w-full" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Generated Password</label>
              <div className="flex gap-2">
                <Password
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  toggleMask
                  feedback={false}
                  className="flex-1"
                  inputClassName="w-full font-mono"
                />
                <Button icon="pi pi-refresh" outlined tooltip="Regenerate" onClick={regeneratePassword} type="button" />
                <Button icon="pi pi-copy" outlined tooltip="Copy to clipboard" onClick={copyPasswordToClipboard} type="button" />
              </div>
              <p className="text-xs text-muted-foreground">
                This password will be emailed directly to the vendor. The vendor will verify via OTP on first login.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button label="Cancel" outlined severity="secondary" onClick={() => setSetupDialogVisible(false)} disabled={setupSending} />
              <Button label="Activate & Send Credentials" icon="pi pi-send" loading={setupSending} onClick={submitSetupVendor} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}