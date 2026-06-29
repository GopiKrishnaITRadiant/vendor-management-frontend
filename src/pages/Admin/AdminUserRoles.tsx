import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import AppTable from "../../components/table/DataTable";
import { useDebounce } from "../../hooks/debounceHook";
import {
  getAllUsers,
  getUserCounts,
  createUser,
  updateUser,
  suspendUser,
  activateUser,
} from "../../services/UsersService";
import { getAllRoles } from "../../services/rolesService";

type UserStatus = "active" | "inactive" | "suspended" | "pending_verification";

type Role = {
  id: number;
  name: string;
  description: string | null;
};

type AppUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  sapVendorId: string | null;
  status: UserStatus;
  isEmailVerified: boolean;
  isFirstLoginVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

type EditableUserFields = {
  firstName: string;
  lastName: string;
  email: string;
  roleId: number | null;
  status: UserStatus;
  password?: string;
};

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

const emptyUserForm: EditableUserFields = {
  firstName: "",
  lastName: "",
  email: "",
  roleId: null,
  status: "pending_verification",
};

export default function AdminUsersRolesPage() {
  const toast = useRef<Toast>(null);

  // ── Table state ───────────────────────────────────────
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // ── Filters ───────────────────────────────────────────
  const [roleFilter, setRoleFilter] = useState<string | null>("1");
  const [statusFilter, setStatusFilter] = useState<UserStatus | null>(null);

  // ── Roles ─────────────────────────────────────────────
  const [roles, setRoles] = useState<Role[]>([]);

  // ── KPI counts ────────────────────────────────────────
  const [counts, setCounts] = useState({
    total: 0,
    admins: 0,
    vendors: 0,
    inactive: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  // ── Dialog state ──────────────────────────────────────
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editingUser, setEditingUser] =
    useState<EditableUserFields>(emptyUserForm);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const rolesFetchedOnce = useRef(false);
  const countsFetchedOnce = useRef(false);

  // ── Load users ────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(
        page,
        rows,
        debouncedSearch,
        roleFilter ?? undefined,
        statusFilter ?? undefined,
      );
      setUsers(response.data);
      setTotalRecords(response.total);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message ?? "Failed to load users",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [page, rows, debouncedSearch, roleFilter, statusFilter]);

  const loadRoles = useCallback(async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      setCountsLoading(true);
      const data = await getUserCounts();
      setCounts({
        total: data.total,
        admins: data.admins ?? 0,
        vendors: data.vendors ?? 0,
        inactive: data.inactive ?? 0,
      });
    } catch (error) {
      console.error("Failed to load user counts:", error);
    } finally {
      setCountsLoading(false);
    }
  }, []);

  // ── Reset to page 1 on filter/search change ───────────
  useEffect(() => {
    setPage(1);
    setFirst(0);
  }, [debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (rolesFetchedOnce.current) return;
    rolesFetchedOnce.current = true;
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (countsFetchedOnce.current) return;
    countsFetchedOnce.current = true;
    loadCounts();
  }, [loadCounts]);

  // ── Handlers ──────────────────────────────────────────

  const handleView = (u: AppUser) => {
    setSelectedUser(u);
    setViewDialogVisible(true);
  };

  const handleEdit = (u: AppUser) => {
    setSelectedUser(u);
    setEditingUser({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      roleId: u.role?.id ?? null,
      status: u.status,
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
    if (
      !editingUser.firstName.trim() ||
      !editingUser.lastName.trim() ||
      !editingUser.email.trim()
    ) {
      toast.current?.show({
        severity: "error",
        summary: "Validation",
        detail: "First name, last name and email are required.",
        life: 3000,
      });
      return;
    }
    if (!editingUser.roleId) {
      toast.current?.show({
        severity: "error",
        summary: "Validation",
        detail: "Please select a role.",
        life: 3000,
      });
      return;
    }
    if (!isEditing && !editingUser.password?.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation",
        detail: "Password is required for new users.",
        life: 3000,
      });
      return;
    }

    try {
      setActionLoading(true);

      if (isEditing && selectedUser) {
        const updated = await updateUser(selectedUser.id, {
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          status: editingUser.status,
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, ...updated } : u,
          ),
        );
        toast.current?.show({
          severity: "success",
          summary: "Updated",
          detail: `${editingUser.firstName} ${editingUser.lastName} updated.`,
          life: 3000,
        });
      } else {
        const created = await createUser({
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          password: editingUser.password,
          roleId: editingUser.roleId,
        });
        setUsers((prev) => [created, ...prev]);
        setTotalRecords((t) => t + 1);
        setCounts((c) => ({ ...c, total: c.total + 1 }));
        toast.current?.show({
          severity: "success",
          summary: "Created",
          detail: `${editingUser.firstName} ${editingUser.lastName} added.`,
          life: 3000,
        });
      }

      setFormDialogVisible(false);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message ?? "Failed to save user",
        life: 3000,
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

  // ── Render ────────────────────────────────────────────

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin and vendor user accounts
          </p>
        </div>
        <Button
          label="Add User"
          icon="pi pi-user-plus"
          onClick={handleCreate}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: counts.total,
            color: "text-foreground",
          },
          { label: "Admins", value: counts.admins, color: "text-primary" },
          { label: "Vendors", value: counts.vendors, color: "text-success" },
          { label: "Inactive", value: counts.inactive, color: "text-danger" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>
              {countsLoading ? "—" : c.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          value={roleFilter}
          options={[...roleFilterOptions]}
          onChange={(e) => setRoleFilter(e.value)}
          placeholder="All Roles"
          className="w-44"
        />
        <Dropdown
          value={statusFilter}
          options={[{ label: "All Status", value: null }, ...STATUS_OPTIONS]}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder="All Status"
          className="w-56"
        />
        {(roleFilter || statusFilter) && (
          <Button
            label="Clear"
            text
            icon="pi pi-times"
            onClick={() => {
              setRoleFilter(null);
              setStatusFilter(null);
            }}
          />
        )}
      </div>

      {/* Table — lazy because API paginates server-side */}
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
        onPageChange={(e: any) => {
          setPage(e.page + 1);
          setRows(e.rows);
          setFirst(e.first);
        }}
        columns={[
          {
            field: "firstName",
            header: "Name",
            sortable: true,
            body: (row: AppUser) => `${row.firstName} ${row.lastName}`,
          },
          { field: "email", header: "Email", sortable: true, filter: true },
          {
            field: "role",
            header: "Role",
            sortable: true,
            body: (row: AppUser) => (
              <span className="capitalize">{row.role?.name ?? "—"}</span>
            ),
          },
          {
            field: "sapVendorId",
            header: "Vendor Code",
            body: (row: AppUser) => row.sapVendorId ?? "—",
          },
          {
            field: "lastLoginAt",
            header: "Last Login",
            sortable: true,
            body: (row: AppUser) =>
              row.lastLoginAt
                ? new Date(row.lastLoginAt).toLocaleString()
                : "Never",
          },
          {
            field: "createdAt",
            header: "Created",
            sortable: true,
            body: (row: AppUser) =>
              new Date(row.createdAt).toLocaleDateString(),
          },
          {
            field: "status",
            header: "Status",
            sortable: true,
            filter: true,
            body: (row: AppUser) => {
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
        ]}
      />

      {/* View Dialog */}
      <Dialog
        header={
          selectedUser
            ? `${selectedUser.firstName} ${selectedUser.lastName}`
            : ""
        }
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
                { label: "Last Name", value: selectedUser.lastName },
                { label: "Email", value: selectedUser.email },
                { label: "Role", value: selectedUser.role?.name },
                ...(selectedUser.sapVendorId
                  ? [{ label: "Vendor Code", value: selectedUser.sapVendorId }]
                  : []),
                {
                  label: "Status",
                  value: STATUS_BADGE[selectedUser.status]?.label,
                },
                {
                  label: "Email Verified",
                  value: selectedUser.isEmailVerified ? "Yes" : "No",
                },
                {
                  label: "First Login Done",
                  value: selectedUser.isFirstLoginVerified ? "Yes" : "No",
                },
                {
                  label: "Last Login",
                  value: selectedUser.lastLoginAt
                    ? new Date(selectedUser.lastLoginAt).toLocaleString()
                    : "Never",
                },
                {
                  label: "Created At",
                  value: new Date(selectedUser.createdAt).toLocaleDateString(),
                },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {f.label}
                  </p>
                  <p className="font-medium capitalize">{f.value}</p>
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
                  handleEdit(selectedUser);
                }}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog
        header={
          isEditing
            ? `Edit — ${editingUser.firstName} ${editingUser.lastName}`
            : "Add New User"
        }
        visible={formDialogVisible}
        onHide={() => setFormDialogVisible(false)}
        style={{ width: "520px" }}
        modal
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                First Name *
              </label>
              <InputText
                value={editingUser.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="e.g. Rajesh"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Last Name *
              </label>
              <InputText
                value={editingUser.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="e.g. Kumar"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Email *
              </label>
              <InputText
                value={editingUser.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="user@company.com"
              />
            </div>

            {!isEditing && (
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Password *
                </label>
                <Password
                  value={editingUser.password ?? ""}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Temporary password"
                  toggleMask
                  className="w-full"
                  inputClassName="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  User will be required to verify identity via OTP on first
                  login.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Role *
              </label>
              <Dropdown
                value={editingUser.roleId}
                options={roleDropdownOptions}
                onChange={(e) => set("roleId", e.value)}
                placeholder="Select role"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Status
              </label>
              <Dropdown
                value={editingUser.status}
                options={STATUS_OPTIONS}
                onChange={(e) => set("status", e.value)}
                disabled={!isEditing}
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
