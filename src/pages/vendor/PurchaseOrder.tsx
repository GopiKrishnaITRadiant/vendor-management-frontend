import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import AppTable from "../../components/table/DataTable";

// ─── Types ───────────────────────────────────────────────

export type PurchaseOrder = {
  id: number;
  poNumber: string;
  itemNumber: string;
  materialCode: string;
  materialDescription: string;
  orderQuantity: number;
  ndcCode: string;
  vendor: string;
  company: string;
  deliveryDate: string;
  status: "Open" | "ASN Created" | "In Progress" | "Completed";
};

// ─── Helpers ─────────────────────────────────────────────

const STATUS_STYLE: Record<PurchaseOrder["status"], string> = {
  Open: "bg-blue-50 text-blue-700",
  "ASN Created": "bg-amber-50 text-amber-700",
  "In Progress": "bg-purple-50 text-purple-700",
  Completed: "bg-green-50 text-green-700",
};

function StatusBadge({ status }: { status: PurchaseOrder["status"] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

// ─── Mock Data ───────────────────────────────────────────

const purchaseOrders: PurchaseOrder[] = [
  { id: 1, poNumber: "PO10001", itemNumber: "10", materialCode: "MAT001", materialDescription: "Paracetamol 500mg", orderQuantity: 1000, ndcCode: "NDC001", vendor: "Exelan Pharma", company: "Cipla", deliveryDate: "2024-06-20", status: "ASN Created" },
  { id: 2, poNumber: "PO10001", itemNumber: "20", materialCode: "MAT002", materialDescription: "Vitamin C Tablets", orderQuantity: 2000, ndcCode: "NDC002", vendor: "Exelan Pharma", company: "Cipla", deliveryDate: "2024-06-20", status: "ASN Created" },
  { id: 3, poNumber: "PO10002", itemNumber: "30", materialCode: "MAT003", materialDescription: "Cough Syrup", orderQuantity: 1500, ndcCode: "NDC003", vendor: "Health Corp", company: "Cipla", deliveryDate: "2024-06-25", status: "In Progress" },
  { id: 4, poNumber: "PO10003", itemNumber: "40", materialCode: "MAT004", materialDescription: "Antibiotic Capsules", orderQuantity: 2500, ndcCode: "NDC004", vendor: "Medi Supplies", company: "Cipla", deliveryDate: "2024-06-15", status: "Completed" },
  { id: 5, poNumber: "PO10005", itemNumber: "10", materialCode: "MAT005", materialDescription: "Paracetamol 500mg", orderQuantity: 1000, ndcCode: "NDC001", vendor: "Exelan Pharma", company: "Cipla", deliveryDate: "2024-07-01", status: "Open" },
  { id: 6, poNumber: "PO10006", itemNumber: "20", materialCode: "MAT006", materialDescription: "Vitamin C Tablets", orderQuantity: 2000, ndcCode: "NDC002", vendor: "Exelan Pharma", company: "Cipla", deliveryDate: "2024-07-05", status: "ASN Created" },
  { id: 7, poNumber: "PO10007", itemNumber: "30", materialCode: "MAT007", materialDescription: "Cough Syrup", orderQuantity: 1500, ndcCode: "NDC007", vendor: "Health Corp", company: "Cipla", deliveryDate: "2024-07-10", status: "In Progress" },
  { id: 8, poNumber: "PO10008", itemNumber: "40", materialCode: "MAT008", materialDescription: "Antibiotic Capsules", orderQuantity: 2500, ndcCode: "NDC004", vendor: "Medi Supplies", company: "Cipla", deliveryDate: "2024-06-30", status: "Open" },
  { id: 9, poNumber: "PO10009", itemNumber: "10", materialCode: "MAT009", materialDescription: "Ibuprofen 400mg", orderQuantity: 3000, ndcCode: "NDC009", vendor: "Exelan Pharma", company: "Cipla", deliveryDate: "2024-07-01", status: "Open" },
  { id: 10, poNumber: "PO10010", itemNumber: "20", materialCode: "MAT010", materialDescription: "Omeprazole 20mg", orderQuantity: 1200, ndcCode: "NDC010", vendor: "Health Corp", company: "Cipla", deliveryDate: "2024-07-15", status: "ASN Created" },
  { id: 11, poNumber: "PO10011", itemNumber: "30", materialCode: "MAT011", materialDescription: "Metformin 500mg", orderQuantity: 5000, ndcCode: "NDC011", vendor: "Medi Supplies", company: "Cipla", deliveryDate: "2024-07-20", status: "Completed" },
  { id: 12, poNumber: "PO10012", itemNumber: "40", materialCode: "MAT012", materialDescription: "Atorvastatin 10mg", orderQuantity: 800, ndcCode: "NDC012", vendor: "Exelan Pharma", company: "Cipla", deliveryDate: "2024-07-30", status: "Open" },
];

const STATUS_TABS: Array<{ label: string; value: PurchaseOrder["status"] | "All" }> = [
  { label: "All", value: "All" },
  { label: "Open", value: "Open" },
  { label: "ASN Created", value: "ASN Created" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

// ─── Component ───────────────────────────────────────────

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [selectedOrders, setSelectedOrders] = useState<PurchaseOrder[]>([]);
  const [activeStatus, setActiveStatus] = useState<PurchaseOrder["status"] | "All">("All");

  const handleCreateASN = () => {
    if (!selectedOrders.length) return;
    navigate("/asn/create", { state: { selectedOrders } });
  };

  const filteredOrders =
    activeStatus === "All"
      ? purchaseOrders
      : purchaseOrders.filter((po) => po.status === activeStatus);

  const counts = {
    All: purchaseOrders.length,
    Open: purchaseOrders.filter((p) => p.status === "Open").length,
    "ASN Created": purchaseOrders.filter((p) => p.status === "ASN Created").length,
    "In Progress": purchaseOrders.filter((p) => p.status === "In Progress").length,
    Completed: purchaseOrders.filter((p) => p.status === "Completed").length,
  };

  return (
    <div className="page-container py-6 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select open orders to create an ASN
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {selectedOrders.length > 0 && (
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              {selectedOrders.length} selected
            </span>
          )}
          <Button
            label="ASN History"
            icon="pi pi-history"
            outlined
            onClick={() => navigate("/asn/history")}
          />
          <Button
            label="Create ASN"
            icon="pi pi-plus"
            disabled={selectedOrders.length === 0}
            onClick={handleCreateASN}
            tooltip={
              selectedOrders.length === 0
                ? "Select at least one order"
                : `Create ASN for ${selectedOrders.length} order(s)`
            }
            tooltipOptions={{ position: "left" }}
          />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: counts.All, color: "text-foreground" },
          { label: "Open", value: counts.Open, color: "text-blue-600" },
          { label: "In Progress", value: counts["In Progress"] + counts["ASN Created"], color: "text-amber-600" },
          { label: "Completed", value: counts.Completed, color: "text-green-600" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>{c.value}</h3>
          </div>
        ))}
      </div>

      {/* STATUS TABS + TABLE */}
      <div className="card overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-border overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveStatus(tab.value);
                setSelectedOrders([]);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeStatus === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeStatus === tab.value
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Selection action bar */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border-b border-primary/20">
            <p className="text-sm text-primary font-medium">
              <i className="pi pi-check-circle mr-2" />
              {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                label="Clear"
                text
                size="small"
                severity="secondary"
                onClick={() => setSelectedOrders([])}
              />
              <Button
                label="Create ASN"
                icon="pi pi-plus"
                size="small"
                onClick={handleCreateASN}
              />
            </div>
          </div>
        )}

        <AppTable
          data={filteredOrders}
          selectable
          globalSearch
          onSelectionChange={setSelectedOrders}
          columns={[
            { field: "poNumber", header: "PO Number", sortable: true, filter: true },
            { field: "itemNumber", header: "Item #", sortable: true },
            { field: "materialCode", header: "Material Code", sortable: true, filter: true },
            { field: "materialDescription", header: "Description", sortable: true, filter: true },
            { field: "orderQuantity", header: "Qty", sortable: true },
            { field: "deliveryDate", header: "Delivery Date", sortable: true },
            {
              field: "status",
              header: "Status",
              sortable: true,
              filter: true,
              body: (row) => <StatusBadge status={row.status} />,
            },
          ]}
        />
      </div>
    </div>
  );
}