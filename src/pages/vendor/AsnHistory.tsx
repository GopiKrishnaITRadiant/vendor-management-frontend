import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import AppTable from "../../components/table/DataTable";


type ASNStatus = "Pending" | "Approved" | "Rejected" | "Under Review";

type ASNLine = {
  id: number;
  poNumber: string;
  materialCode: string;
  materialDescription: string;
  poQty: number;
  shipQty: number;
  batchNumber: string;
  expiryDate: string;
};

type ASN = {
  id: number;
  asnNumber: string;
  poNumbers: string[];
  vendor: string;
  vendorCode: string;
  shipDate: string;
  carrier: string;
  trackingNumber: string;
  shipTo: string;
  totalLines: number;
  totalQty: number;
  submittedAt: string;
  updatedAt: string;
  status: ASNStatus;
  rejectionReason?: string;
  approvedBy?: string;
  lines: ASNLine[];
};

// ─── Mock Data ───────────────────────────────────────────

const asnHistory: ASN[] = [
  {
    id: 1,
    asnNumber: "ASN-2024-00125",
    poNumbers: ["PO10006"],
    vendor: "Exelan Pharma",
    vendorCode: "VND001",
    shipDate: "2024-06-20",
    carrier: "FedEx",
    trackingNumber: "FX123456789",
    shipTo: "Mumbai Warehouse",
    totalLines: 2,
    totalQty: 4000,
    submittedAt: "2024-06-11 10:00",
    updatedAt: "2024-06-11 10:00",
    status: "Pending",
    lines: [
      { id: 1, poNumber: "PO10006", materialCode: "MAT009", materialDescription: "Ibuprofen 400mg", poQty: 2000, shipQty: 2000, batchNumber: "BT-2024-020", expiryDate: "2026-03-31" },
      { id: 2, poNumber: "PO10006", materialCode: "MAT010", materialDescription: "Omeprazole 20mg", poQty: 2000, shipQty: 2000, batchNumber: "BT-2024-021", expiryDate: "2025-11-30" },
    ],
  },
  {
    id: 2,
    asnNumber: "ASN-2024-00123",
    poNumbers: ["PO10001"],
    vendor: "Exelan Pharma",
    vendorCode: "VND001",
    shipDate: "2024-06-15",
    carrier: "FedEx",
    trackingNumber: "FX987654321",
    shipTo: "Hyderabad Warehouse",
    totalLines: 2,
    totalQty: 3000,
    submittedAt: "2024-06-10 09:32",
    updatedAt: "2024-06-11 14:20",
    status: "Under Review",
    lines: [
      { id: 1, poNumber: "PO10001", materialCode: "MAT001", materialDescription: "Paracetamol 500mg", poQty: 1000, shipQty: 1000, batchNumber: "BT-2024-001", expiryDate: "2026-12-31" },
      { id: 2, poNumber: "PO10001", materialCode: "MAT002", materialDescription: "Vitamin C Tablets", poQty: 2000, shipQty: 2000, batchNumber: "BT-2024-002", expiryDate: "2026-06-30" },
    ],
  },
  {
    id: 3,
    asnNumber: "ASN-2024-00120",
    poNumbers: ["PO10003"],
    vendor: "Exelan Pharma",
    vendorCode: "VND001",
    shipDate: "2024-06-12",
    carrier: "Blue Dart",
    trackingNumber: "BD556677889",
    shipTo: "Delhi Distribution Center",
    totalLines: 1,
    totalQty: 2500,
    submittedAt: "2024-06-08 14:00",
    updatedAt: "2024-06-09 11:00",
    status: "Approved",
    approvedBy: "Ravi Sharma",
    lines: [
      { id: 1, poNumber: "PO10003", materialCode: "MAT004", materialDescription: "Antibiotic Capsules", poQty: 2500, shipQty: 2500, batchNumber: "BT-2024-007", expiryDate: "2025-12-31" },
    ],
  },
  {
    id: 4,
    asnNumber: "ASN-2024-00118",
    poNumbers: ["PO10005"],
    vendor: "Exelan Pharma",
    vendorCode: "VND001",
    shipDate: "2024-06-10",
    carrier: "UPS",
    trackingNumber: "UPS998877665",
    shipTo: "Hyderabad Warehouse",
    totalLines: 2,
    totalQty: 1800,
    submittedAt: "2024-06-07 08:45",
    updatedAt: "2024-06-08 16:30",
    status: "Rejected",
    rejectionReason: "Batch number missing for line 2. Please resubmit with complete batch details.",
    lines: [
      { id: 1, poNumber: "PO10005", materialCode: "MAT005", materialDescription: "Paracetamol 500mg", poQty: 1000, shipQty: 800, batchNumber: "BT-2024-003", expiryDate: "2026-01-31" },
      { id: 2, poNumber: "PO10005", materialCode: "MAT006", materialDescription: "Vitamin C Tablets", poQty: 1000, shipQty: 1000, batchNumber: "", expiryDate: "" },
    ],
  },
  {
    id: 5,
    asnNumber: "ASN-2024-00110",
    poNumbers: ["PO10003"],
    vendor: "Exelan Pharma",
    vendorCode: "VND001",
    shipDate: "2024-06-01",
    carrier: "DHL",
    trackingNumber: "DH998811223",
    shipTo: "Delhi Distribution Center",
    totalLines: 1,
    totalQty: 2500,
    submittedAt: "2024-05-28 10:00",
    updatedAt: "2024-05-29 15:00",
    status: "Approved",
    approvedBy: "Priya Menon",
    lines: [
      { id: 1, poNumber: "PO10003", materialCode: "MAT004", materialDescription: "Antibiotic Capsules", poQty: 2500, shipQty: 2500, batchNumber: "BT-2024-005", expiryDate: "2025-10-31" },
    ],
  },
  {
    id: 6,
    asnNumber: "ASN-2024-00105",
    poNumbers: ["PO10001", "PO10002"],
    vendor: "Exelan Pharma",
    vendorCode: "VND001",
    shipDate: "2024-05-20",
    carrier: "FedEx",
    trackingNumber: "FX556644332",
    shipTo: "Hyderabad Warehouse",
    totalLines: 3,
    totalQty: 4500,
    submittedAt: "2024-05-15 09:00",
    updatedAt: "2024-05-17 11:00",
    status: "Approved",
    approvedBy: "Ravi Sharma",
    lines: [
      { id: 1, poNumber: "PO10001", materialCode: "MAT001", materialDescription: "Paracetamol 500mg", poQty: 1000, shipQty: 1000, batchNumber: "BT-2024-001A", expiryDate: "2026-05-31" },
      { id: 2, poNumber: "PO10001", materialCode: "MAT002", materialDescription: "Vitamin C Tablets", poQty: 2000, shipQty: 2000, batchNumber: "BT-2024-002A", expiryDate: "2026-03-31" },
      { id: 3, poNumber: "PO10002", materialCode: "MAT003", materialDescription: "Cough Syrup", poQty: 1500, shipQty: 1500, batchNumber: "BT-2024-003A", expiryDate: "2025-08-31" },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────

const STATUS_STYLE: Record<ASNStatus, { badge: string; icon: string; dot: string }> = {
  Pending:        { badge: "bg-amber-50 text-amber-700 border border-amber-200",  icon: "pi pi-clock",        dot: "bg-amber-400" },
  "Under Review": { badge: "bg-blue-50 text-blue-700 border border-blue-200",     icon: "pi pi-search",       dot: "bg-blue-400" },
  Approved:       { badge: "bg-green-50 text-green-700 border border-green-200",  icon: "pi pi-check-circle", dot: "bg-green-500" },
  Rejected:       { badge: "bg-red-50 text-red-700 border border-red-200",        icon: "pi pi-times-circle", dot: "bg-red-500" },
};

function StatusBadge({ status }: { status: ASNStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>
      <i className={`${s.icon} text-xs`} />
      {status}
    </span>
  );
}

const STATUS_TABS: Array<{ label: string; value: ASNStatus | "All" }> = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "Under Review", value: "Under Review" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

// ─── Detail Dialog ───────────────────────────────────────

function ASNDetailDialog({
  asn,
  visible,
  onHide,
}: {
  asn: ASN | null;
  visible: boolean;
  onHide: () => void;
}) {
  if (!asn) return null;
  const s = STATUS_STYLE[asn.status];

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${STATUS_STYLE[asn.status].badge}`}>
            <i className={`${s.icon} text-base`} />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{asn.asnNumber}</p>
            <p className="text-xs text-muted-foreground font-normal">Submitted {asn.submittedAt}</p>
          </div>
        </div>
      }
      visible={visible}
      onHide={onHide}
      style={{ width: "700px" }}
      modal
      className="asn-detail-dialog"
    >
      <div className="space-y-5 pt-1">

        {/* Status banner */}
        {asn.status === "Rejected" && asn.rejectionReason && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <i className="pi pi-times-circle text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Rejection Reason</p>
              <p className="text-sm text-red-600 mt-0.5">{asn.rejectionReason}</p>
            </div>
          </div>
        )}
        {asn.status === "Approved" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <i className="pi pi-check-circle text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-700">Approved</p>
              <p className="text-sm text-green-600 mt-0.5">
                Approved by {asn.approvedBy} · {asn.updatedAt}
              </p>
            </div>
          </div>
        )}
        {asn.status === "Under Review" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <i className="pi pi-search text-blue-500 mt-0.5" />
            <p className="text-sm text-blue-700">
              This ASN is currently being reviewed by the Cipla procurement team.
            </p>
          </div>
        )}

        {/* Shipment info grid */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Shipment Details
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            {[
              { label: "ASN Number",    value: asn.asnNumber },
              { label: "PO Number(s)",  value: asn.poNumbers.join(", ") },
              { label: "Status",        value: <StatusBadge status={asn.status} /> },
              { label: "Ship Date",     value: asn.shipDate },
              { label: "Carrier",       value: asn.carrier },
              { label: "Tracking #",    value: asn.trackingNumber || "—" },
              { label: "Ship To",       value: asn.shipTo },
              { label: "Submitted At",  value: asn.submittedAt },
              { label: "Last Updated",  value: asn.updatedAt },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
                {typeof f.value === "string"
                  ? <p className="font-medium text-foreground">{f.value}</p>
                  : f.value}
              </div>
            ))}
          </div>
        </div>

        <Divider className="!my-1" />

        {/* Line items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Line Items ({asn.totalLines})
            </p>
            <p className="text-xs text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{asn.totalQty.toLocaleString()} units</span>
            </p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
              <div className="col-span-1">#</div>
              <div className="col-span-2">PO / Code</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1 text-right">PO Qty</div>
              <div className="col-span-1 text-right">Ship Qty</div>
              <div className="col-span-2">Batch No.</div>
              <div className="col-span-2">Expiry</div>
            </div>

            {/* Rows */}
            {asn.lines.map((line, i) => (
              <div
                key={line.id}
                className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center ${
                  i < asn.lines.length - 1 ? "border-b border-border" : ""
                } ${i % 2 === 1 ? "bg-muted/20" : ""}`}
              >
                <div className="col-span-1 text-muted-foreground text-xs">{i + 1}</div>
                <div className="col-span-2">
                  <p className="font-medium text-foreground text-xs">{line.poNumber}</p>
                  <p className="text-muted-foreground text-xs">{line.materialCode}</p>
                </div>
                <div className="col-span-3 text-foreground text-xs leading-tight">{line.materialDescription}</div>
                <div className="col-span-1 text-right text-foreground">{line.poQty.toLocaleString()}</div>
                <div className="col-span-1 text-right font-medium text-foreground">{line.shipQty.toLocaleString()}</div>
                <div className="col-span-2">
                  {line.batchNumber
                    ? <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{line.batchNumber}</span>
                    : <span className="text-red-500 text-xs">Missing</span>}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">{line.expiryDate || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-1 border-t border-border">
          <Button label="Close" outlined severity="secondary" size="small" onClick={onHide} />
          <div className="flex gap-2">
            {/* <Button label="Print" icon="pi pi-print" outlined size="small" severity="secondary" /> */}
            <Button label="Download PDF" icon="pi pi-download" outlined size="small" />
          </div>
        </div>
      </div>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function ASNHistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ASNStatus | "All">("All");
  const [selectedASN, setSelectedASN] = useState<ASN | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const filtered = activeTab === "All" ? asnHistory : asnHistory.filter((a) => a.status === activeTab);

  const counts: Record<ASNStatus | "All", number> = {
    All:            asnHistory.length,
    Pending:        asnHistory.filter((a) => a.status === "Pending").length,
    "Under Review": asnHistory.filter((a) => a.status === "Under Review").length,
    Approved:       asnHistory.filter((a) => a.status === "Approved").length,
    Rejected:       asnHistory.filter((a) => a.status === "Rejected").length,
  };

  const handleView = (asn: ASN) => {
    setSelectedASN(asn);
    setDialogVisible(true);
  };

  return (
    <div className="page-container py-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ASN History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all your submitted advance shipment notices
          </p>
        </div>
        <Button
          label="Create New ASN"
          icon="pi pi-plus"
          onClick={() => navigate("/purchase-orders")}
        />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Pending",        value: counts.Pending,        color: "text-amber-600",  bg: "bg-amber-50",  icon: "pi pi-clock" },
          { label: "Under Review",   value: counts["Under Review"], color: "text-blue-600",   bg: "bg-blue-50",   icon: "pi pi-search" },
          { label: "Approved",       value: counts.Approved,       color: "text-green-600",  bg: "bg-green-50",  icon: "pi pi-check-circle" },
          { label: "Rejected",       value: counts.Rejected,       color: "text-red-600",    bg: "bg-red-50",    icon: "pi pi-times-circle" },
        ].map((c) => (
          <div
            key={c.label}
            className="card p-5 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab(c.label as ASNStatus)}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <h3 className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</h3>
              </div>
              <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
                <i className={`${c.icon} ${c.color} text-base`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABS + TABLE */}
      <div className="card overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-border overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.value ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        <AppTable
          data={filtered}
          globalSearch
          onView={handleView}
          columns={[
            { field: "asnNumber",    header: "ASN Number",   sortable: true, filter: true },
            {
              field: "poNumbers",
              header: "PO Number(s)",
              sortable: true,
              body: (row: ASN) => <span>{row.poNumbers.join(", ")}</span>,
            },
            { field: "shipDate",     header: "Ship Date",    sortable: true },
            { field: "carrier",      header: "Carrier",      sortable: true, filter: true },
            { field: "shipTo",       header: "Ship To",      sortable: true, filter: true },
            { field: "totalLines",   header: "Lines" },
            { field: "totalQty",     header: "Total Qty",    sortable: true },
            { field: "submittedAt",  header: "Submitted",    sortable: true },
            {
              field: "status",
              header: "Status",
              sortable: true,
              filter: true,
              body: (row: ASN) => <StatusBadge status={row.status} />,
            },
          ]}
        />
      </div>

      {/* DETAIL DIALOG */}
      <ASNDetailDialog
        asn={selectedASN}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
      />
    </div>
  );
}