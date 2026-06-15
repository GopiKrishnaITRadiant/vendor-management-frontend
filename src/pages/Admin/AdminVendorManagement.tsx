import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import AppTable from "../../components/table/DataTable";

// ─── Types ───────────────────────────────────────────────

type VendorStatus = "Active" | "Inactive" | "Suspended";

type Vendor = {
  id: number;
  vendorCode: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  category: string;
  gstin: string;
  status: VendorStatus;
  totalOrders: number;
  onTimeDelivery: string;
  joinedDate: string;
};

// ─── Mock Data ───────────────────────────────────────────

const initialVendors: Vendor[] = [
  { id: 1, vendorCode: "VND001", vendorName: "Exelan Pharma", contactPerson: "Rajesh Kumar", email: "rajesh@exelan.com", phone: "+91 98765 43210", address: "Plot 12, Phase II, IDA", city: "Hyderabad", state: "Telangana", country: "India", pincode: "500072", category: "API Manufacturer", gstin: "36AABCE1234F1Z5", status: "Active", totalOrders: 142, onTimeDelivery: "94%", joinedDate: "2020-01-15" },
  { id: 2, vendorCode: "VND002", vendorName: "Health Corp", contactPerson: "Sunita Rao", email: "sunita@healthcorp.com", phone: "+91 91234 56789", address: "Unit 5, MIDC Andheri", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400093", category: "Formulation", gstin: "27AABCH5678G1Z2", status: "Active", totalOrders: 98, onTimeDelivery: "88%", joinedDate: "2020-06-20" },
  { id: 3, vendorCode: "VND003", vendorName: "Medi Supplies", contactPerson: "Arvind Shah", email: "arvind@medisupplies.com", phone: "+91 99887 76655", address: "Block C, Naroda Industrial Area", city: "Ahmedabad", state: "Gujarat", country: "India", pincode: "382330", category: "Packaging", gstin: "24AABCM9012H1Z8", status: "Active", totalOrders: 76, onTimeDelivery: "91%", joinedDate: "2021-03-10" },
  { id: 4, vendorCode: "VND004", vendorName: "BioGen Labs", contactPerson: "Meena Pillai", email: "meena@biogen.com", phone: "+91 93456 78901", address: "Survey No. 45, Hinjewadi", city: "Pune", state: "Maharashtra", country: "India", pincode: "411057", category: "API Manufacturer", gstin: "27AABCB3456I1Z6", status: "Inactive", totalOrders: 34, onTimeDelivery: "79%", joinedDate: "2021-09-01" },
  { id: 5, vendorCode: "VND005", vendorName: "GlobalChem Inc", contactPerson: "James Wilson", email: "jwilson@globalchem.com", phone: "+1 555 234 5678", address: "123 Pharma Drive, Edison", city: "New Jersey", state: "NJ", country: "USA", pincode: "08817", category: "API Manufacturer", gstin: "N/A", status: "Active", totalOrders: 61, onTimeDelivery: "96%", joinedDate: "2022-01-05" },
  { id: 6, vendorCode: "VND006", vendorName: "PharmaKraft", contactPerson: "Priya Nair", email: "priya@pharmakraft.com", phone: "+91 87654 32109", address: "Old Mahabalipuram Rd, Sholinganallur", city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600119", category: "Formulation", gstin: "33AABCP7890J1Z3", status: "Suspended", totalOrders: 22, onTimeDelivery: "65%", joinedDate: "2022-08-15" },
];

const categoryOptions = [
  { label: "API Manufacturer", value: "API Manufacturer" },
  { label: "Formulation", value: "Formulation" },
  { label: "Packaging", value: "Packaging" },
  { label: "Logistics", value: "Logistics" },
];

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "Suspended", value: "Suspended" },
];

const countryOptions = [
  { label: "India", value: "India" },
  { label: "USA", value: "USA" },
  { label: "Germany", value: "Germany" },
  { label: "UK", value: "UK" },
];

const emptyVendor: Partial<Vendor> = {
  country: "India",
  status: "Active",
  totalOrders: 0,
  onTimeDelivery: "0%",
  joinedDate: new Date().toISOString().split("T")[0],
};

// ─── Component ───────────────────────────────────────────

export default function AdminVendorManagementPage() {
  const toast = useRef<Toast>(null);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [editingVendor, setEditingVendor] = useState<Partial<Vendor>>(emptyVendor);
  const [isEditing, setIsEditing] = useState(false);

  const filtered = vendors.filter((v) => {
    if (categoryFilter && v.category !== categoryFilter) return false;
    if (statusFilter && v.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === "Active").length,
    inactive: vendors.filter((v) => v.status === "Inactive").length,
    suspended: vendors.filter((v) => v.status === "Suspended").length,
  };

  const handleView = (v: Vendor) => { setSelectedVendor(v); setViewDialogVisible(true); };

  const handleEdit = (v: Vendor) => {
    setEditingVendor({ ...v });
    setIsEditing(true);
    setFormDialogVisible(true);
  };

  const handleCreate = () => {
    setEditingVendor({ ...emptyVendor });
    setIsEditing(false);
    setFormDialogVisible(true);
  };

  const handleDelete = (v: Vendor) => {
    confirmDialog({
      message: `Suspend vendor "${v.vendorName}"? They will no longer be able to submit ASNs.`,
      header: "Confirm Suspension",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => {
        setVendors((prev) => prev.map((vendor) => vendor.id === v.id ? { ...vendor, status: "Suspended" } : vendor));
        toast.current?.show({ severity: "warn", summary: "Suspended", detail: `${v.vendorName} has been suspended.`, life: 3000 });
      },
    });
  };

  const handleSave = () => {
    if (!editingVendor.vendorName || !editingVendor.vendorCode) {
      toast.current?.show({ severity: "error", summary: "Validation", detail: "Vendor Code and Name are required.", life: 3000 });
      return;
    }
    if (isEditing) {
      setVendors((prev) => prev.map((v) => v.id === editingVendor.id ? { ...v, ...editingVendor } as Vendor : v));
      toast.current?.show({ severity: "success", summary: "Updated", detail: `${editingVendor.vendorName} updated.`, life: 3000 });
    } else {
      const newVendor: Vendor = { ...emptyVendor, ...editingVendor, id: Date.now() } as Vendor;
      setVendors((prev) => [newVendor, ...prev]);
      toast.current?.show({ severity: "success", summary: "Created", detail: `${newVendor.vendorName} added.`, life: 3000 });
    }
    setFormDialogVisible(false);
  };

  const set = (field: keyof Vendor, value: any) =>
    setEditingVendor((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, and manage vendor accounts</p>
        </div>
        <Button label="Add Vendor" icon="pi pi-plus" onClick={handleCreate} />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: counts.total, color: "text-foreground" },
          { label: "Active", value: counts.active, color: "text-success" },
          { label: "Inactive", value: counts.inactive, color: "text-muted-foreground" },
          { label: "Suspended", value: counts.suspended, color: "text-danger" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>{c.value}</h3>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown value={categoryFilter} options={[{ label: "All Categories", value: null }, ...categoryOptions]} onChange={(e) => setCategoryFilter(e.value)} placeholder="All Categories" className="w-48" />
        <Dropdown value={statusFilter} options={[{ label: "All Status", value: null }, ...statusOptions]} onChange={(e) => setStatusFilter(e.value)} placeholder="All Status" className="w-40" />
        {(categoryFilter || statusFilter) && (
          <Button label="Clear" text icon="pi pi-times" onClick={() => { setCategoryFilter(null); setStatusFilter(null); }} />
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
          { field: "vendorCode", header: "Code", sortable: true, filter: true },
          { field: "vendorName", header: "Vendor Name", sortable: true, filter: true },
          { field: "contactPerson", header: "Contact", sortable: true },
          { field: "email", header: "Email" },
          { field: "city", header: "City", sortable: true },
          { field: "category", header: "Category", sortable: true, filter: true },
          { field: "totalOrders", header: "Orders", sortable: true },
          { field: "onTimeDelivery", header: "On-Time", sortable: true },
          { field: "status", header: "Status", sortable: true, filter: true },
        ]}
      />

      {/* VIEW DIALOG */}
      <Dialog header={selectedVendor?.vendorName} visible={viewDialogVisible} onHide={() => setViewDialogVisible(false)} style={{ width: "560px" }} modal>
        {selectedVendor && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "Vendor Code", value: selectedVendor.vendorCode },
                { label: "Category", value: selectedVendor.category },
                { label: "Contact Person", value: selectedVendor.contactPerson },
                { label: "Email", value: selectedVendor.email },
                { label: "Phone", value: selectedVendor.phone },
                { label: "GSTIN", value: selectedVendor.gstin },
                { label: "Address", value: selectedVendor.address },
                { label: "City / State", value: `${selectedVendor.city}, ${selectedVendor.state}` },
                { label: "Country", value: selectedVendor.country },
                { label: "Pincode", value: selectedVendor.pincode },
                { label: "Total Orders", value: selectedVendor.totalOrders },
                { label: "On-Time Delivery", value: selectedVendor.onTimeDelivery },
                { label: "Joined Date", value: selectedVendor.joinedDate },
                { label: "Status", value: selectedVendor.status },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{f.label}</p>
                  <p className="font-medium">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button label="Close" outlined severity="secondary" onClick={() => setViewDialogVisible(false)} />
              <Button label="Edit" icon="pi pi-pencil" onClick={() => { setViewDialogVisible(false); handleEdit(selectedVendor); }} />
            </div>
          </div>
        )}
      </Dialog>

      {/* ADD / EDIT DIALOG */}
      <Dialog header={isEditing ? `Edit – ${editingVendor.vendorName}` : "Add New Vendor"} visible={formDialogVisible} onHide={() => setFormDialogVisible(false)} style={{ width: "620px" }} modal>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                { label: "Vendor Code *", field: "vendorCode", placeholder: "e.g. VND007" },
                { label: "Vendor Name *", field: "vendorName", placeholder: "e.g. Pharma Co" },
                { label: "Contact Person", field: "contactPerson", placeholder: "Full name" },
                { label: "Email", field: "email", placeholder: "contact@vendor.com" },
                { label: "Phone", field: "phone", placeholder: "+91 ..." },
                { label: "GSTIN", field: "gstin", placeholder: "15-char GSTIN" },
                { label: "Address", field: "address", placeholder: "Street / Plot" },
                { label: "City", field: "city", placeholder: "City" },
                { label: "State", field: "state", placeholder: "State" },
                { label: "Pincode", field: "pincode", placeholder: "Pincode" },
              ] as { label: string; field: keyof Vendor; placeholder: string }[]
            ).map((f) => (
              <div key={f.field} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">{f.label}</label>
                <InputText
                  value={(editingVendor as any)[f.field] ?? ""}
                  onChange={(e) => set(f.field, e.target.value)}
                  placeholder={f.placeholder}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Country</label>
              <Dropdown value={editingVendor.country} options={countryOptions} onChange={(e) => set("country", e.value)} placeholder="Select country" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Dropdown value={editingVendor.category} options={categoryOptions} onChange={(e) => set("category", e.value)} placeholder="Select category" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Dropdown value={editingVendor.status} options={statusOptions} onChange={(e) => set("status", e.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button label="Cancel" outlined severity="secondary" onClick={() => setFormDialogVisible(false)} />
            <Button label={isEditing ? "Update" : "Add Vendor"} icon="pi pi-check" onClick={handleSave} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}