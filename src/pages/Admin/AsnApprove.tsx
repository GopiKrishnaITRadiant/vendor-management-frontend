import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import AppTable from "../../components/table/DataTable"
// ─── Types ───────────────────────────────────────────────

type ASNStatus = "Pending" | "Approved" | "Rejected" | "Under Review";

type ASNLine = {
  lineId: number;
  id: number;
  poNumber: string;
  materialCode: string;
  materialDescription: string;
  poQty: number;
  shipQty: number;
  batchNumber: string;
  expiryDate: string;
};

type ASNApproval = {
  id: number;
  asnNumber: string;
  poNumber: string;
  vendor: string;
  vendorCode: string;
  shipDate: string;
  carrier: string;
  trackingNumber: string;
  shipTo: string;
  totalLines: number;
  totalQty: number;
  submittedAt: string;
  status: ASNStatus;
  rejectionReason?: string;
  lines: ASNLine[];
};

// ─── Mock Data ───────────────────────────────────────────

const initialASNs: ASNApproval[] = [
  {
    id: 1,
    asnNumber: "ASN-2024-00123",
    poNumber: "PO10001",
    vendor: "Exelan Pharma",
    vendorCode: "VND001",
    shipDate: "2024-06-15",
    carrier: "FedEx",
    trackingNumber: "FX987654321",
    shipTo: "Hyderabad Warehouse",
    totalLines: 2,
    totalQty: 3000,
    submittedAt: "2024-06-10 09:32",
    status: "Pending",
    lines: [
      { lineId: 1, id: 1, poNumber: "PO10001", materialCode: "MAT001", materialDescription: "Paracetamol 500mg", poQty: 1000, shipQty: 1000, batchNumber: "BT-2024-001", expiryDate: "2026-12-31" },
      { lineId: 2, id: 2, poNumber: "PO10001", materialCode: "MAT002", materialDescription: "Vitamin C Tablets", poQty: 2000, shipQty: 2000, batchNumber: "BT-2024-002", expiryDate: "2026-06-30" },
    ],
  },
  {
    id: 2,
    asnNumber: "ASN-2024-00124",
    poNumber: "PO10002",
    vendor: "Health Corp",
    vendorCode: "VND002",
    shipDate: "2024-06-18",
    carrier: "DHL",
    trackingNumber: "DH112233445",
    shipTo: "Mumbai Warehouse",
    totalLines: 1,
    totalQty: 1500,
    submittedAt: "2024-06-10 11:15",
    status: "Under Review",
    lines: [
      { lineId: 1, id: 1, poNumber: "PO10002", materialCode: "MAT003", materialDescription: "Cough Syrup", poQty: 1500, shipQty: 1500, batchNumber: "BT-2024-010", expiryDate: "2025-09-30" },
    ],
  },
  {
    id: 3,
    asnNumber: "ASN-2024-00120",
    poNumber: "PO10003",
    vendor: "Medi Supplies",
    vendorCode: "VND003",
    shipDate: "2024-06-12",
    carrier: "Blue Dart",
    trackingNumber: "BD556677889",
    shipTo: "Delhi Distribution Center",
    totalLines: 1,
    totalQty: 2500,
    submittedAt: "2024-06-08 14:00",
    status: "Approved",
    lines: [
      { lineId: 1, id: 1, poNumber: "PO10003", materialCode: "MAT004", materialDescription: "Antibiotic Capsules", poQty: 2500, shipQty: 2500, batchNumber: "BT-2024-007", expiryDate: "2025-12-31" },
    ],
  },
  {
    id: 4,
    asnNumber: "ASN-2024-00118",
    poNumber: "PO10005",
    vendor: "Exelan Pharma",
    vendorCode: "VND001",
    shipDate: "2024-06-10",
    carrier: "UPS",
    trackingNumber: "UPS998877665",
    shipTo: "Hyderabad Warehouse",
    totalLines: 2,
    totalQty: 1800,
    submittedAt: "2024-06-07 08:45",
    status: "Rejected",
    rejectionReason: "Batch numbers missing for line 2.",
    lines: [
      { lineId: 1, id: 1, poNumber: "PO10005", materialCode: "MAT005", materialDescription: "Paracetamol 500mg", poQty: 1000, shipQty: 800, batchNumber: "BT-2024-003", expiryDate: "2026-01-31" },
      { lineId: 2, id: 2, poNumber: "PO10005", materialCode: "MAT006", materialDescription: "Vitamin C Tablets", poQty: 1000, shipQty: 1000, batchNumber: "", expiryDate: "" },
    ],
  },
  {
    id: 5,
    asnNumber: "ASN-2024-00125",
    poNumber: "PO10006",
    vendor: "GlobalChem Inc",
    vendorCode: "VND005",
    shipDate: "2024-06-20",
    carrier: "FedEx",
    trackingNumber: "FX123456789",
    shipTo: "Mumbai Warehouse",
    totalLines: 2,
    totalQty: 4000,
    submittedAt: "2024-06-11 10:00",
    status: "Pending",
    lines: [
      { lineId: 1, id: 1, poNumber: "PO10006", materialCode: "MAT009", materialDescription: "Ibuprofen 400mg", poQty: 2000, shipQty: 2000, batchNumber: "BT-2024-020", expiryDate: "2026-03-31" },
      { lineId: 2, id: 2, poNumber: "PO10006", materialCode: "MAT010", materialDescription: "Omeprazole 20mg", poQty: 2000, shipQty: 2000, batchNumber: "BT-2024-021", expiryDate: "2025-11-30" },
    ],
  },
];

const statusOptions = [
  { label: "All", value: null },
  { label: "Pending", value: "Pending" },
  { label: "Under Review", value: "Under Review" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

// ─── Component ───────────────────────────────────────────

export default function AdminASNApprovalsPage() {
  const toast = useRef<Toast>(null);
  const [asns, setAsns] = useState<ASNApproval[]>(initialASNs);
  const [statusFilter, setStatusFilter] = useState<ASNStatus | null>(null);
  const [selectedASN, setSelectedASN] = useState<ASNApproval | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);

  const filtered = statusFilter ? asns.filter((a) => a.status === statusFilter) : asns;

  const counts = {
    pending: asns.filter((a) => a.status === "Pending").length,
    underReview: asns.filter((a) => a.status === "Under Review").length,
    approved: asns.filter((a) => a.status === "Approved").length,
    rejected: asns.filter((a) => a.status === "Rejected").length,
  };

  const handleView = (asn: ASNApproval) => {
    setSelectedASN(asn);
    setDialogVisible(true);
  };

  const updateStatus = (id: number, status: ASNStatus, reason?: string) => {
    setAsns((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status, rejectionReason: reason } : a
      )
    );
  };

  const handleApprove = (asn: ASNApproval) => {
    confirmDialog({
      message: `Approve ${asn.asnNumber}? This will notify the vendor.`,
      header: "Confirm Approval",
      icon: "pi pi-check-circle",
      acceptClassName: "p-button-success",
      accept: () => {
        updateStatus(asn.id, "Approved");
        setDialogVisible(false);
        toast.current?.show({ severity: "success", summary: "Approved", detail: `${asn.asnNumber} approved successfully.`, life: 3000 });
      },
    });
  };

  const openRejectDialog = (asn: ASNApproval) => {
    setSelectedASN(asn);
    setRejectReason("");
    setRejectDialogVisible(true);
  };

  const confirmReject = () => {
    if (!selectedASN) return;
    updateStatus(selectedASN.id, "Rejected", rejectReason);
    setRejectDialogVisible(false);
    setDialogVisible(false);
    toast.current?.show({ severity: "error", summary: "Rejected", detail: `${selectedASN.asnNumber} has been rejected.`, life: 3000 });
  };

  const handleMarkUnderReview = (asn: ASNApproval) => {
    updateStatus(asn.id, "Under Review");
    setDialogVisible(false);
    toast.current?.show({ severity: "info", summary: "Under Review", detail: `${asn.asnNumber} marked for review.`, life: 3000 });
  };

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">ASN Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve advance shipment notices from vendors
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: counts.pending, color: "text-warning" },
          { label: "Under Review", value: counts.underReview, color: "text-primary" },
          { label: "Approved", value: counts.approved, color: "text-success" },
          { label: "Rejected", value: counts.rejected, color: "text-danger" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>{c.value}</h3>
          </div>
        ))}
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Dropdown
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder="All"
          className="w-44"
        />
      </div>

      {/* TABLE */}
      <AppTable
        data={filtered}
        globalSearch
        onView={handleView}
        columns={[
          { field: "asnNumber", header: "ASN Number", sortable: true, filter: true },
          { field: "poNumber", header: "PO Number", sortable: true, filter: true },
          { field: "vendor", header: "Vendor", sortable: true, filter: true },
          { field: "shipDate", header: "Ship Date", sortable: true },
          { field: "carrier", header: "Carrier", sortable: true },
          { field: "shipTo", header: "Ship To", sortable: true },
          { field: "totalLines", header: "Lines" },
          { field: "totalQty", header: "Total Qty", sortable: true },
          { field: "submittedAt", header: "Submitted At", sortable: true },
          { field: "status", header: "Status", sortable: true, filter: true },
        ]}
      />

      {/* DETAIL DIALOG */}
      <Dialog
        header={`ASN: ${selectedASN?.asnNumber}`}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: "720px" }}
        modal
      >
        {selectedASN && (
          <div className="space-y-5 pt-2">
            {/* Header info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "Vendor", value: `${selectedASN.vendor} (${selectedASN.vendorCode})` },
                { label: "PO Number", value: selectedASN.poNumber },
                { label: "Carrier", value: selectedASN.carrier },
                { label: "Tracking #", value: selectedASN.trackingNumber },
                { label: "Ship Date", value: selectedASN.shipDate },
                { label: "Ship To", value: selectedASN.shipTo },
                { label: "Submitted At", value: selectedASN.submittedAt },
                { label: "Status", value: selectedASN.status },
                ...(selectedASN.rejectionReason
                  ? [{ label: "Rejection Reason", value: selectedASN.rejectionReason }]
                  : []),
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{f.label}</p>
                  <p className="font-medium">{f.value}</p>
                </div>
              ))}
            </div>

            {/* Line items */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Line Items</p>
              <AppTable
                data={selectedASN.lines.map((l) => ({ ...l, id: l.lineId }))}
                selectable={false}
                globalSearch={false}
                rows={5}
                columns={[
                  { field: "materialCode", header: "Material Code" },
                  { field: "materialDescription", header: "Description" },
                  { field: "poQty", header: "PO Qty" },
                  { field: "shipQty", header: "Ship Qty" },
                  { field: "batchNumber", header: "Batch #" },
                  { field: "expiryDate", header: "Expiry" },
                ]}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button label="Close" outlined severity="secondary" onClick={() => setDialogVisible(false)} />
              {(selectedASN.status === "Pending" || selectedASN.status === "Under Review") && (
                <>
                  {selectedASN.status === "Pending" && (
                    <Button label="Mark Under Review" icon="pi pi-search" severity="info" outlined onClick={() => handleMarkUnderReview(selectedASN)} />
                  )}
                  <Button label="Reject" icon="pi pi-times" severity="danger" outlined onClick={() => openRejectDialog(selectedASN)} />
                  <Button label="Approve" icon="pi pi-check" severity="success" onClick={() => handleApprove(selectedASN)} />
                </>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* REJECT REASON DIALOG */}
      <Dialog
        header="Reason for Rejection"
        visible={rejectDialogVisible}
        onHide={() => setRejectDialogVisible(false)}
        style={{ width: "420px" }}
        modal
      >
        <div className="space-y-4 pt-2">
          <InputTextarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Describe why this ASN is being rejected..."
            className="w-full"
            autoResize
          />
          <div className="flex justify-end gap-2">
            <Button label="Cancel" outlined severity="secondary" onClick={() => setRejectDialogVisible(false)} />
            <Button label="Confirm Reject" icon="pi pi-times" severity="danger" onClick={confirmReject} disabled={!rejectReason.trim()} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}