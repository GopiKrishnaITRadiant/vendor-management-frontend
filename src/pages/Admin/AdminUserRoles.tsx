import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import AppTable from "../../components/table/DataTable";

// ─── Types ───────────────────────────────────────────────

type UserRole = "admin" | "vendor";
type UserStatus = "Active" | "Inactive";

type AppUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  vendorCode?: string;
  company: string;
  lastLogin: string;
  createdAt: string;
  status: UserStatus;
};

// ─── Mock Data ───────────────────────────────────────────

const initialUsers: AppUser[] = [
  { id: 1, name: "Ravi Sharma", email: "ravi@cipla.com", role: "admin", company: "Cipla", lastLogin: "2024-06-11 09:15", createdAt: "2022-01-10", status: "Active" },
  { id: 2, name: "Priya Menon", email: "priya@cipla.com", role: "admin", company: "Cipla", lastLogin: "2024-06-10 14:30", createdAt: "2022-03-05", status: "Active" },
  { id: 3, name: "Rajesh Kumar", email: "rajesh@exelan.com", role: "vendor", vendorCode: "VND001", company: "Exelan Pharma", lastLogin: "2024-06-11 08:00", createdAt: "2022-05-20", status: "Active" },
  { id: 4, name: "Sunita Rao", email: "sunita@healthcorp.com", role: "vendor", vendorCode: "VND002", company: "Health Corp", lastLogin: "2024-06-09 11:45", createdAt: "2022-06-15", status: "Active" },
  { id: 5, name: "Arvind Shah", email: "arvind@medisupplies.com", role: "vendor", vendorCode: "VND003", company: "Medi Supplies", lastLogin: "2024-06-08 16:20", createdAt: "2022-08-01", status: "Active" },
  { id: 6, name: "Meena Pillai", email: "meena@biogen.com", role: "vendor", vendorCode: "VND004", company: "BioGen Labs", lastLogin: "2024-05-30 10:00", createdAt: "2022-10-12", status: "Inactive" },
  { id: 7, name: "James Wilson", email: "jwilson@globalchem.com", role: "vendor", vendorCode: "VND005", company: "GlobalChem Inc", lastLogin: "2024-06-10 19:00", createdAt: "2023-01-05", status: "Active" },
  { id: 8, name: "Kiran Reddy", email: "kiran@cipla.com", role: "admin", company: "Cipla", lastLogin: "2024-06-07 13:00", createdAt: "2023-04-01", status: "Inactive" },
];

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Vendor", value: "vendor" },
];

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const vendorOptions = [
  { label: "Exelan Pharma (VND001)", value: "VND001" },
  { label: "Health Corp (VND002)", value: "VND002" },
  { label: "Medi Supplies (VND003)", value: "VND003" },
  { label: "BioGen Labs (VND004)", value: "VND004" },
  { label: "GlobalChem Inc (VND005)", value: "VND005" },
];

const emptyUser: Partial<AppUser> = {
  role: "vendor",
  status: "Active",
  company: "",
};

// ─── Component ───────────────────────────────────────────

export default function AdminUsersRolesPage() {
  const toast = useRef<Toast>(null);
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [roleFilter, setRoleFilter] = useState<UserRole | null>(null);
  const [statusFilter, setStatusFilter] = useState<UserStatus | null>(null);

  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<AppUser>>(emptyUser);
  const [isEditing, setIsEditing] = useState(false);

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    vendors: users.filter((u) => u.role === "vendor").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
  };

  const handleView = (u: AppUser) => { setSelectedUser(u); setViewDialogVisible(true); };

  const handleEdit = (u: AppUser) => {
    setEditingUser({ ...u });
    setIsEditing(true);
    setFormDialogVisible(true);
  };

  const handleCreate = () => {
    setEditingUser({ ...emptyUser });
    setIsEditing(false);
    setFormDialogVisible(true);
  };

  const handleDelete = (u: AppUser) => {
    confirmDialog({
      message: `Deactivate user "${u.name}"? They will lose access immediately.`,
      header: "Confirm Deactivation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => {
        setUsers((prev) => prev.map((user) => user.id === u.id ? { ...user, status: "Inactive" } : user));
        toast.current?.show({ severity: "warn", summary: "Deactivated", detail: `${u.name} has been deactivated.`, life: 3000 });
      },
    });
  };

  const handleSave = () => {
    if (!editingUser.name || !editingUser.email) {
      toast.current?.show({ severity: "error", summary: "Validation", detail: "Name and Email are required.", life: 3000 });
      return;
    }
    if (isEditing) {
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...editingUser } as AppUser : u));
      toast.current?.show({ severity: "success", summary: "Updated", detail: `${editingUser.name} updated.`, life: 3000 });
    } else {
      const newUser: AppUser = {
        ...emptyUser,
        ...editingUser,
        id: Date.now(),
        lastLogin: "—",
        createdAt: new Date().toISOString().split("T")[0],
      } as AppUser;
      setUsers((prev) => [newUser, ...prev]);
      toast.current?.show({ severity: "success", summary: "Created", detail: `${newUser.name} added.`, life: 3000 });
    }
    setFormDialogVisible(false);
  };

  const set = (field: keyof AppUser, value: any) =>
    setEditingUser((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin and vendor user accounts
          </p>
        </div>
        <Button label="Add User" icon="pi pi-user-plus" onClick={handleCreate} />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: counts.total, color: "text-foreground" },
          { label: "Admins", value: counts.admins, color: "text-primary" },
          { label: "Vendors", value: counts.vendors, color: "text-success" },
          { label: "Inactive", value: counts.inactive, color: "text-danger" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>{c.value}</h3>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          value={roleFilter}
          options={[{ label: "All Roles", value: null }, ...roleOptions]}
          onChange={(e) => setRoleFilter(e.value)}
          placeholder="All Roles"
          className="w-40"
        />
        <Dropdown
          value={statusFilter}
          options={[{ label: "All Status", value: null }, ...statusOptions]}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder="All Status"
          className="w-40"
        />
        {(roleFilter || statusFilter) && (
          <Button label="Clear" text icon="pi pi-times" onClick={() => { setRoleFilter(null); setStatusFilter(null); }} />
        )}
      </div>

      {/* TABLE */}
      <AppTable
        data={filtered}
        globalSearch
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        columns={[
          { field: "name", header: "Name", sortable: true, filter: true },
          { field: "email", header: "Email", sortable: true, filter: true },
          { field: "role", header: "Role", sortable: true, filter: true },
          { field: "company", header: "Company", sortable: true, filter: true },
          { field: "vendorCode", header: "Vendor Code", sortable: true },
          { field: "lastLogin", header: "Last Login", sortable: true },
          { field: "createdAt", header: "Created", sortable: true },
          { field: "status", header: "Status", sortable: true, filter: true },
        ]}
      />

      {/* VIEW DIALOG */}
      <Dialog
        header={selectedUser?.name}
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        style={{ width: "480px" }}
        modal
      >
        {selectedUser && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "Name", value: selectedUser.name },
                { label: "Email", value: selectedUser.email },
                { label: "Role", value: selectedUser.role },
                { label: "Company", value: selectedUser.company },
                ...(selectedUser.vendorCode ? [{ label: "Vendor Code", value: selectedUser.vendorCode }] : []),
                { label: "Status", value: selectedUser.status },
                { label: "Last Login", value: selectedUser.lastLogin },
                { label: "Created At", value: selectedUser.createdAt },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{f.label}</p>
                  <p className="font-medium capitalize">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button label="Close" outlined severity="secondary" onClick={() => setViewDialogVisible(false)} />
              <Button label="Edit" icon="pi pi-pencil" onClick={() => { setViewDialogVisible(false); handleEdit(selectedUser); }} />
            </div>
          </div>
        )}
      </Dialog>

      {/* ADD / EDIT DIALOG */}
      <Dialog
        header={isEditing ? `Edit – ${editingUser.name}` : "Add New User"}
        visible={formDialogVisible}
        onHide={() => setFormDialogVisible(false)}
        style={{ width: "520px" }}
        modal
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <InputText value={editingUser.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Rajesh Kumar" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <InputText value={editingUser.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="user@company.com" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Role *</label>
              <Dropdown
                value={editingUser.role}
                options={roleOptions}
                onChange={(e) => set("role", e.value)}
                placeholder="Select role"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Company</label>
              <InputText value={editingUser.company ?? ""} onChange={(e) => set("company", e.target.value)} placeholder="e.g. Cipla" />
            </div>

            {editingUser.role === "vendor" && (
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Linked Vendor</label>
                <Dropdown
                  value={editingUser.vendorCode}
                  options={vendorOptions}
                  onChange={(e) => set("vendorCode", e.value)}
                  placeholder="Select vendor account"
                  className="w-full"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Dropdown
                value={editingUser.status}
                options={statusOptions}
                onChange={(e) => set("status", e.value)}
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button label="Cancel" outlined severity="secondary" onClick={() => setFormDialogVisible(false)} />
            <Button label={isEditing ? "Update" : "Add User"} icon="pi pi-check" onClick={handleSave} />
          </div>
        </div>
      </Dialog>

    </div>
  );
}