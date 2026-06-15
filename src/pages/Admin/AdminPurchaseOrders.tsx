import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import AppTable from "../../components/table/DataTable";

// ─── Types ───────────────────────────────────────────────

type POStatus = "Open" | "ASN Created" | "In Progress" | "Completed" | "Cancelled";

type PurchaseOrder = {
  id: number;
  poNumber: string;
  itemNumber: string;
  materialCode: string;
  materialDescription: string;
  orderQuantity: number;
  ndcCode: string;
  vendor: string;
  vendorCode: string;
  company: string;
  shipTo: string;
  deliveryDate: string;
  createdAt: string;
  status: POStatus;
};

// ─── Mock Data ───────────────────────────────────────────

const initialPOs: PurchaseOrder[] = [
  { id: 1, poNumber: "PO10001", itemNumber: "10", materialCode: "MAT001", materialDescription: "Paracetamol 500mg", orderQuantity: 1000, ndcCode: "NDC001", vendor: "Exelan Pharma", vendorCode: "VND001", company: "Cipla", shipTo: "Hyderabad Warehouse", deliveryDate: "2024-06-20", createdAt: "2024-05-15", status: "ASN Created" },
  { id: 2, poNumber: "PO10001", itemNumber: "20", materialCode: "MAT002", materialDescription: "Vitamin C Tablets", orderQuantity: 2000, ndcCode: "NDC002", vendor: "Exelan Pharma", vendorCode: "VND001", company: "Cipla", shipTo: "Hyderabad Warehouse", deliveryDate: "2024-06-20", createdAt: "2024-05-15", status: "ASN Created" },
  { id: 3, poNumber: "PO10002", itemNumber: "10", materialCode: "MAT003", materialDescription: "Cough Syrup", orderQuantity: 1500, ndcCode: "NDC003", vendor: "Health Corp", vendorCode: "VND002", company: "Cipla", shipTo: "Mumbai Warehouse", deliveryDate: "2024-06-25", createdAt: "2024-05-18", status: "In Progress" },
  { id: 4, poNumber: "PO10003", itemNumber: "10", materialCode: "MAT004", materialDescription: "Antibiotic Capsules", orderQuantity: 2500, ndcCode: "NDC004", vendor: "Medi Supplies", vendorCode: "VND003", company: "Cipla", shipTo: "Delhi Distribution Center", deliveryDate: "2024-06-15", createdAt: "2024-05-10", status: "Completed" },
  { id: 5, poNumber: "PO10005", itemNumber: "10", materialCode: "MAT005", materialDescription: "Paracetamol 500mg", orderQuantity: 1000, ndcCode: "NDC001", vendor: "Exelan Pharma", vendorCode: "VND001", company: "Cipla", shipTo: "Hyderabad Warehouse", deliveryDate: "2024-07-01", createdAt: "2024-05-20", status: "Open" },
  { id: 6, poNumber: "PO10006", itemNumber: "10", materialCode: "MAT009", materialDescription: "Ibuprofen 400mg", orderQuantity: 3000, ndcCode: "NDC009", vendor: "GlobalChem Inc", vendorCode: "VND005", company: "Cipla", shipTo: "Mumbai Warehouse", deliveryDate: "2024-07-05", createdAt: "2024-05-22", status: "ASN Created" },
  { id: 7, poNumber: "PO10007", itemNumber: "10", materialCode: "MAT003", materialDescription: "Cough Syrup", orderQuantity: 1500, ndcCode: "NDC003", vendor: "Health Corp", vendorCode: "VND002", company: "Cipla", shipTo: "Hyderabad Warehouse", deliveryDate: "2024-07-10", createdAt: "2024-05-25", status: "In Progress" },
  { id: 8, poNumber: "PO10008", itemNumber: "10", materialCode: "MAT004", materialDescription: "Antibiotic Capsules", orderQuantity: 2500, ndcCode: "NDC004", vendor: "Medi Supplies", vendorCode: "VND003", company: "Cipla", shipTo: "Delhi Distribution Center", deliveryDate: "2024-06-30", createdAt: "2024-05-28", status: "Open" },
  { id: 9, poNumber: "PO10009", itemNumber: "10", materialCode: "MAT010", materialDescription: "Omeprazole 20mg", orderQuantity: 1200, ndcCode: "NDC010", vendor: "Health Corp", vendorCode: "VND002", company: "Cipla", shipTo: "Mumbai Warehouse", deliveryDate: "2024-07-15", createdAt: "2024-06-01", status: "Open" },
  { id: 10, poNumber: "PO10010", itemNumber: "10", materialCode: "MAT011", materialDescription: "Metformin 500mg", orderQuantity: 5000, ndcCode: "NDC011", vendor: "Medi Supplies", vendorCode: "VND003", company: "Cipla", shipTo: "Hyderabad Warehouse", deliveryDate: "2024-07-20", createdAt: "2024-06-02", status: "Open" },
  { id: 11, poNumber: "PO10011", itemNumber: "10", materialCode: "MAT012", materialDescription: "Atorvastatin 10mg", orderQuantity: 800, ndcCode: "NDC012", vendor: "Exelan Pharma", vendorCode: "VND001", company: "Cipla", shipTo: "Delhi Distribution Center", deliveryDate: "2024-07-25", createdAt: "2024-06-03", status: "Open" },
  { id: 12, poNumber: "PO10012", itemNumber: "10", materialCode: "MAT001", materialDescription: "Paracetamol 500mg", orderQuantity: 2000, ndcCode: "NDC001", vendor: "Exelan Pharma", vendorCode: "VND001", company: "Cipla", shipTo: "Mumbai Warehouse", deliveryDate: "2024-07-30", createdAt: "2024-06-05", status: "Open" },
];

const vendorOptions = [
  { label: "All Vendors", value: null },
  { label: "Exelan Pharma", value: "Exelan Pharma" },
  { label: "Health Corp", value: "Health Corp" },
  { label: "Medi Supplies", value: "Medi Supplies" },
  { label: "GlobalChem Inc", value: "GlobalChem Inc" },
];

const statusOptions = [
  { label: "All Status", value: null },
  { label: "Open", value: "Open" },
  { label: "ASN Created", value: "ASN Created" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

const shipToOptions = [
  { label: "Hyderabad Warehouse", value: "Hyderabad Warehouse" },
  { label: "Mumbai Warehouse", value: "Mumbai Warehouse" },
  { label: "Delhi Distribution Center", value: "Delhi Distribution Center" },
];

// ─── Component ───────────────────────────────────────────

export default function AdminPurchaseOrdersPage() {
  const toast = useRef<Toast>(null);
  const [pos, setPos] = useState<PurchaseOrder[]>(initialPOs);
  const [vendorFilter, setVendorFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // View dialog
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Create/Edit dialog
  const [formDialogVisible, setFormDialogVisible] = useState(false);
  const [editingPO, setEditingPO] = useState<Partial<PurchaseOrder> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filtered = pos.filter((p) => {
    if (vendorFilter && p.vendor !== vendorFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    total: pos.length,
    open: pos.filter((p) => p.status === "Open").length,
    inProgress: pos.filter((p) => p.status === "In Progress" || p.status === "ASN Created").length,
    completed: pos.filter((p) => p.status === "Completed").length,
  };

  const handleView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewDialogVisible(true);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setEditingPO({ ...po });
    setIsEditing(true);
    setFormDialogVisible(true);
  };

  const handleCreate = () => {
    setEditingPO({ company: "Cipla", status: "Open" });
    setIsEditing(false);
    setFormDialogVisible(true);
  };

  const handleDelete = (po: PurchaseOrder) => {
    confirmDialog({
      message: `Cancel PO ${po.poNumber} – Item ${po.itemNumber}? This cannot be undone.`,
      header: "Confirm Cancellation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => {
        setPos((prev) => prev.map((p) => p.id === po.id ? { ...p, status: "Cancelled" } : p));
        toast.current?.show({ severity: "warn", summary: "Cancelled", detail: `PO ${po.poNumber} has been cancelled.`, life: 3000 });
      },
    });
  };

  const handleSave = () => {
    if (!editingPO) return;
    if (isEditing) {
      setPos((prev) => prev.map((p) => p.id === editingPO.id ? { ...p, ...editingPO } as PurchaseOrder : p));
      toast.current?.show({ severity: "success", summary: "Updated", detail: "Purchase order updated.", life: 3000 });
    } else {
      const newPO: PurchaseOrder = {
        ...editingPO,
        id: Date.now(),
        status: "Open",
        createdAt: new Date().toISOString().split("T")[0],
      } as PurchaseOrder;
      setPos((prev) => [newPO, ...prev]);
      toast.current?.show({ severity: "success", summary: "Created", detail: `${newPO.poNumber} created.`, life: 3000 });
    }
    setFormDialogVisible(false);
  };

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin view — all vendors and companies</p>
        </div>
        {/* <Button label="Create PO" icon="pi pi-plus" onClick={handleCreate} /> */}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total PO Lines", value: counts.total, color: "text-foreground" },
          { label: "Open", value: counts.open, color: "text-primary" },
          { label: "In Progress / ASN", value: counts.inProgress, color: "text-warning" },
          { label: "Completed", value: counts.completed, color: "text-success" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>{c.value}</h3>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown value={vendorFilter} options={vendorOptions} onChange={(e) => setVendorFilter(e.value)} placeholder="All Vendors" className="w-44" />
        <Dropdown value={statusFilter} options={statusOptions} onChange={(e) => setStatusFilter(e.value)} placeholder="All Status" className="w-44" />
        {(vendorFilter || statusFilter) && (
          <Button label="Clear" text icon="pi pi-times" onClick={() => { setVendorFilter(null); setStatusFilter(null); }} />
        )}
      </div>

      {/* TABLE */}
      <AppTable
        data={filtered}
        globalSearch
        onView={handleView}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
        columns={[
          { field: "poNumber", header: "PO Number", sortable: true, filter: true },
          { field: "itemNumber", header: "Item #", sortable: true },
          { field: "materialCode", header: "Material Code", sortable: true, filter: true },
          { field: "materialDescription", header: "Description", sortable: true },
          { field: "orderQuantity", header: "Qty", sortable: true },
          { field: "vendor", header: "Vendor", sortable: true, filter: true },
          { field: "shipTo", header: "Ship To", sortable: true },
          { field: "deliveryDate", header: "Delivery Date", sortable: true },
          { field: "status", header: "Status", sortable: true, filter: true },
        ]}
      />

      {/* VIEW DIALOG */}
      <Dialog header={`PO: ${selectedPO?.poNumber} – Item ${selectedPO?.itemNumber}`} visible={viewDialogVisible} onHide={() => setViewDialogVisible(false)} style={{ width: "520px" }} modal>
        {selectedPO && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "PO Number", value: selectedPO.poNumber },
                { label: "Item Number", value: selectedPO.itemNumber },
                { label: "Material Code", value: selectedPO.materialCode },
                { label: "Description", value: selectedPO.materialDescription },
                { label: "NDC Code", value: selectedPO.ndcCode },
                { label: "Order Qty", value: selectedPO.orderQuantity.toLocaleString() },
                { label: "Vendor", value: `${selectedPO.vendor} (${selectedPO.vendorCode})` },
                { label: "Company", value: selectedPO.company },
                { label: "Ship To", value: selectedPO.shipTo },
                { label: "Delivery Date", value: selectedPO.deliveryDate },
                { label: "Created At", value: selectedPO.createdAt },
                { label: "Status", value: selectedPO.status },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{f.label}</p>
                  <p className="font-medium">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button label="Close" outlined severity="secondary" onClick={() => setViewDialogVisible(false)} />
              {/* <Button label="Edit" icon="pi pi-pencil" onClick={() => { setViewDialogVisible(false); handleEdit(selectedPO); }} /> */}
            </div>
          </div>
        )}
      </Dialog>

      {/* CREATE / EDIT DIALOG */}
      {/* <Dialog header={isEditing ? "Edit Purchase Order" : "Create Purchase Order"} visible={formDialogVisible} onHide={() => setFormDialogVisible(false)} style={{ width: "560px" }} modal>
        {editingPO && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "PO Number", field: "poNumber", placeholder: "e.g. PO10020" },
                { label: "Item Number", field: "itemNumber", placeholder: "e.g. 10" },
                { label: "Material Code", field: "materialCode", placeholder: "e.g. MAT001" },
                { label: "Material Description", field: "materialDescription", placeholder: "e.g. Paracetamol 500mg" },
                { label: "NDC Code", field: "ndcCode", placeholder: "e.g. NDC001" },
                { label: "Company", field: "company", placeholder: "e.g. Cipla" },
              ].map((f) => (
                <div key={f.field} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">{f.label}</label>
                  <InputText
                    value={(editingPO as any)[f.field] ?? ""}
                    onChange={(e) => setEditingPO((prev) => ({ ...prev, [f.field]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Order Quantity</label>
                <InputText
                  value={String(editingPO.orderQuantity ?? "")}
                  onChange={(e) => setEditingPO((prev) => ({ ...prev, orderQuantity: Number(e.target.value) }))}
                  placeholder="e.g. 1000"
                  keyfilter="int"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Vendor</label>
                <Dropdown
                  value={editingPO.vendor}
                  options={vendorOptions.filter((v) => v.value)}
                  onChange={(e) => setEditingPO((prev) => ({ ...prev, vendor: e.value }))}
                  placeholder="Select vendor"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Ship To</label>
                <Dropdown
                  value={editingPO.shipTo}
                  options={shipToOptions}
                  onChange={(e) => setEditingPO((prev) => ({ ...prev, shipTo: e.value }))}
                  placeholder="Select destination"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Delivery Date</label>
                <Calendar
                  value={editingPO.deliveryDate ? new Date(editingPO.deliveryDate) : null}
                  onChange={(e) => setEditingPO((prev) => ({ ...prev, deliveryDate: (e.value as Date)?.toISOString().split("T")[0] }))}
                  placeholder="Select date"
                  showIcon
                  minDate={new Date()}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button label="Cancel" outlined severity="secondary" onClick={() => setFormDialogVisible(false)} />
              <Button label={isEditing ? "Update" : "Create"} icon="pi pi-check" onClick={handleSave} />
            </div>
          </div>
        )}
      </Dialog> */}
    </div>
  );
}