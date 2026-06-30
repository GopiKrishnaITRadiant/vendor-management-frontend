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
  createUser,
  updateUser,
} from "../../../services/UsersService";
import { getAllRoles } from "../../../services/rolesService";
import type { AppUser, EditableUserFields, Role } from "./types";
import {
  STATUS_BADGE,
  STATUS_OPTIONS,
  USER_DASHBOARD_CARDS,
} from "./constants";
import type { UserStatus } from "../../../types/sharedTypes";

const emptyUserForm: EditableUserFields = {
  firstName: "",
  lastName:  "",
  email:     "",
  roleId:    null,
  status:    "pending_verification",
};

// ── Filter shape — role + status, matching the original page ──
type UserFilters = {
  role:   string | null;
  status: UserStatus | null;
};

export default function AdminUsersRolesPage() {
  const toast = useRef<Toast>(null);

  // ── Roles list (for dropdowns + filter) ─────────────────
  const [roles, setRoles] = useState<Role[]>([]);
  const rolesFetchedOnce = useRef(false);

  // ── KPI counts — independent of table filters ───────────
  const [counts, setCounts] = useState({
    total: 0, admins: 0, vendors: 0, inactive: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const countsFetchedOnce = useRef(false);

  // ── Dialog state ──────────────────────────────────────────
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [selectedUser,      setSelectedUser]      = useState<AppUser | null>(null);
  const [editingUser,       setEditingUser]       = useState<EditableUserFields>(emptyUserForm);
  const [isEditing,         setIsEditing]         = useState(false);
  const [actionLoading,     setActionLoading]     = useState(false);

  // Stable initial filters
  // Kept "1" as default role filter to match your original behaviour
  const initialFilters = useMemo<UserFilters>(() => ({ role: "1", status: null }), []);

  //Paginated table
  const {
    data: users,
    totalRecords,
    loading,
    rows,
    first,
    onPageChange,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    refetch,
  } = usePaginatedQuery<AppUser, UserFilters>({
    initialFilters,

    fetchFn: useCallback(
      ({ page, rows, search, filters }) =>
        getAllUsers(page, rows, search, filters.role ?? undefined, filters.status ?? undefined),
      [],
    ),

    onError: useCallback((error: any) => {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   error?.response?.data?.message ?? "Failed to load users",
        life:     3000,
      });
    }, []),
  });

  //Roles — fetched once
  const loadRoles = useCallback(async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  }, []);

  useEffect(() => {
    if (rolesFetchedOnce.current) return;
    rolesFetchedOnce.current = true;
    loadRoles();
  }, [loadRoles]);

  //Counts — fetched once
  const loadCounts = useCallback(async () => {
    try {
      setCountsLoading(true);
      const data = await getUserCounts();
      setCounts({
        total:    data.total,
        admins:   data.admins   ?? 0,
        vendors:  data.vendors  ?? 0,
        inactive: data.inactive ?? 0,
      });
    } catch (error) {
      console.error("Failed to load user counts:", error);
    } finally {
      setCountsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (countsFetchedOnce.current) return;
    countsFetchedOnce.current = true;
    loadCounts();
  }, [loadCounts]);

  const handleView = (u: AppUser) => {
    setSelectedUser(u);
    setViewDialogVisible(true);
  };

  const handleEdit = (u: AppUser) => {
    setSelectedUser(u);
    setEditingUser({
      firstName: u.firstName,
      lastName:  u.lastName,
      email:     u.email,
      roleId:    u.role?.id ?? null,
      status:    u.status,
    });
    setIsEditing(true);
    setFormDialogVisible(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setEditingUser({ ...emptyUserForm });
    setIsEditing(false);
    setFormDialogVisible(true);
  };

  const handleSave = async () => {
    if (!editingUser.firstName.trim() || !editingUser.lastName.trim() || !editingUser.email.trim()) {
      toast.current?.show({
        severity: "error",
        summary:  "Validation",
        detail:   "First name, last name and email are required.",
        life:     3000,
      });
      return;
    }
    if (!editingUser.roleId) {
      toast.current?.show({
        severity: "error",
        summary:  "Validation",
        detail:   "Please select a role.",
        life:     3000,
      });
      return;
    }
    if (!isEditing && !editingUser.password?.trim()) {
      toast.current?.show({
        severity: "error",
        summary:  "Validation",
        detail:   "Password is required for new users.",
        life:     3000,
      });
      return;
    }

    try {
      setActionLoading(true);

      if (isEditing && selectedUser) {
        await updateUser(selectedUser.id, {
          firstName: editingUser.firstName,
          lastName:  editingUser.lastName,
          email:     editingUser.email,
          status:    editingUser.status,
        });

        toast.current?.show({
          severity: "success",
          summary:  "Updated",
          detail:   `${editingUser.firstName} ${editingUser.lastName} updated.`,
          life:     3000,
        });
      } else {
        await createUser({
          firstName: editingUser.firstName,
          lastName:  editingUser.lastName,
          email:     editingUser.email,
          password:  editingUser.password,
          roleId:    editingUser.roleId,
        });

        setCounts((c) => ({ ...c, total: c.total + 1 }));

        toast.current?.show({
          severity: "success",
          summary:  "Created",
          detail:   `${editingUser.firstName} ${editingUser.lastName} added.`,
          life:     3000,
        });
      }

      setFormDialogVisible(false);
      refetch();   // ← reflects the created/updated user from server
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   error?.response?.data?.message ?? "Failed to save user",
        life:     3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const set = (field: keyof EditableUserFields, value: any) =>
    setEditingUser((prev) => ({ ...prev, [field]: value }));

  const roleDropdownOptions = roles.map((r) => ({
    label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
    value: r.id,
  }));

  const roleFilterOptions = roles.map((r) => ({
    label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
    value: r.id,
  }));

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin and vendor user accounts
          </p>
        </div>
        <Button label="Add User" icon="pi pi-user-plus" onClick={handleCreate} />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {USER_DASHBOARD_CARDS.map((card) => (
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
          value={filters.role}
          options={roleFilterOptions}
          onChange={(e) => setFilter("role", e.value)}
          placeholder="All Roles"
          className="w-44"
        />
        <Dropdown
          value={filters.status}
          options={[{ label: "All Status", value: null }, ...STATUS_OPTIONS]}
          onChange={(e) => setFilter("status", e.value)}
          placeholder="All Status"
          className="w-56"
        />
        {(filters.role || filters.status) && (
          <Button label="Clear" text icon="pi pi-times" onClick={clearFilters} />
        )}
      </div>

      <AppTable
        data={users}
        loading={loading}
        lazy
        rows={rows}
        first={first}
        totalRecords={totalRecords}
        globalSearch
        onSearchChange={setSearch}
        onView={handleView}
        onEdit={handleEdit}
        onPageChange={onPageChange}
        columns={[
          {
            field:  "firstName",
            header: "Name",
            sortable: true,
            body: (row: AppUser) => `${row.firstName} ${row.lastName}`,
          },
          { field: "email", header: "Email", sortable: true, filter: true },
          {
            field:  "role",
            header: "Role",
            sortable: true,
            body: (row: AppUser) => <span className="capitalize">{row.role?.name ?? "—"}</span>,
          },
          {
            field:  "sapVendorId",
            header: "Vendor Code",
            body: (row: AppUser) => row.sapVendorId ?? "—",
          },
          {
            field:  "lastLoginAt",
            header: "Last Login",
            sortable: true,
            body: (row: AppUser) =>
              row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : "Never",
          },
          {
            field:  "createdAt",
            header: "Created",
            sortable: true,
            body: (row: AppUser) => new Date(row.createdAt).toLocaleDateString(),
          },
          {
            field:  "status",
            header: "Status",
            sortable: true,
            filter: true,
            body: (row: AppUser) => {
              const badge = STATUS_BADGE[row.status];
              return (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}>
                  {badge.label}
                </span>
              );
            },
          },
        ]}
      />

      {/* View Dialog */}
      <Dialog
        header={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ""}
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        style={{ width: "480px" }}
        modal
      >
        {selectedUser && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "First Name", value: selectedUser.firstName },
                { label: "Last Name",  value: selectedUser.lastName },
                { label: "Email",      value: selectedUser.email },
                { label: "Role",       value: selectedUser.role?.name },
                ...(selectedUser.sapVendorId
                  ? [{ label: "Vendor Code", value: selectedUser.sapVendorId }]
                  : []),
                { label: "Status",           value: STATUS_BADGE[selectedUser.status]?.label },
                { label: "Email Verified",   value: selectedUser.isEmailVerified ? "Yes" : "No" },
                { label: "First Login Done", value: selectedUser.isFirstLoginVerified ? "Yes" : "No" },
                {
                  label: "Last Login",
                  value: selectedUser.lastLoginAt
                    ? new Date(selectedUser.lastLoginAt).toLocaleString()
                    : "Never",
                },
                { label: "Created At", value: new Date(selectedUser.createdAt).toLocaleDateString() },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{f.label}</p>
                  <p className="font-medium capitalize">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button label="Close" outlined severity="secondary" onClick={() => setViewDialogVisible(false)} />
              <Button
                label="Edit"
                icon="pi pi-pencil"
                onClick={() => { setViewDialogVisible(false); handleEdit(selectedUser); }}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog
        header={isEditing ? `Edit — ${editingUser.firstName} ${editingUser.lastName}` : "Add New User"}
        visible={formDialogVisible}
        onHide={() => setFormDialogVisible(false)}
        style={{ width: "520px" }}
        modal
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">First Name *</label>
              <InputText value={editingUser.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="e.g. Rajesh" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Last Name *</label>
              <InputText value={editingUser.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="e.g. Kumar" />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <InputText value={editingUser.email} onChange={(e) => set("email", e.target.value)} placeholder="user@company.com" />
            </div>

            {!isEditing && (
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Password *</label>
                <Password
                  value={editingUser.password ?? ""}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Temporary password"
                  toggleMask
                  className="w-full"
                  inputClassName="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  User will be required to verify identity via OTP on first login.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Role *</label>
              <Dropdown
                value={editingUser.roleId}
                options={roleDropdownOptions}
                onChange={(e) => set("roleId", e.value)}
                placeholder="Select role"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Dropdown
                value={editingUser.status}
                options={STATUS_OPTIONS}
                onChange={(e) => set("status", e.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button label="Cancel" outlined severity="secondary" onClick={() => setFormDialogVisible(false)} disabled={actionLoading} />
            <Button
              label={isEditing ? "Update" : "Add User"}
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