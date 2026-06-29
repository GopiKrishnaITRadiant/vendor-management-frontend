import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import AppTable from "../../components/table/DataTable";
import { useDebounce } from "../../hooks/debounceHook";
import {
  approveASN,
  rejectASN,
  getASNStatusCounts,
  getAllAdminASNs,
} from "../../services/ASNService";

export type ASNStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "rejected"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ASNItem = {
  id:               number;
  poNo:             string;
  poItem:           string;
  matCode:          string;
  matDesc:          string;
  ndcCode:          string;
  originalQty:       number;
  submittedQty:     number;
  availableQty:   number;
  uom:              string;
  batchNo:          string;
  manufactureDate:  string | null;
  expiryDate:       string | null;
  numberOfPackages: number;
  packageType:      string;
  grossWeight:      string;
  weightUnit:       string;
  upsWarehouseId:   string;
};

export type ASN = {
  id:                    number;
  asnNumber:             string;
  poNo:                  string;
  vendorId:              number;
  soldTo:                string;
  status:                ASNStatus;
  estimatedShipDate:     string;
  estimatedDeliveryDate: string;
  actualShipDate:        string | null;
  actualDeliveryDate:    string | null;
  carrierName:           string;
  trackingNumber:        string;
  shipmentMode:          string | null;
  validationErrors:      { field: string; message: string }[] | null;
  rejectionReason:       string | null;
  notes:                 string | null;
  submittedAt:           string | null;
  confirmedAt:           string | null;
  createdAt:             string;
  updatedAt:             string;
  shipFromAddress:       any | null;
  items:                 ASNItem[];
};

export type StatusCounts = {
  total:       number;
  pending:     number;  // submitted + confirmed
  approved:    number;  // confirmed + shipped + delivered
  rejected:    number;
};


const STATUS_OPTIONS = [
  // { label: "All",       value: null },
  { label: "Draft",     value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Rejected",  value: "rejected" },
  { label: "Shipped",   value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_BADGE: Record<ASNStatus, { label: string; className: string }> = {
  draft:     { label: "Draft",      className: "bg-gray-100 text-gray-600" },
  submitted: { label: "Submitted",  className: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmed",  className: "bg-green-100 text-green-700" },
  rejected:  { label: "Rejected",   className: "bg-red-100 text-red-700" },
  shipped:   { label: "Shipped",    className: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered",  className: "bg-teal-100 text-teal-700" },
  cancelled: { label: "Cancelled",  className: "bg-gray-100 text-gray-500" },
};


export default function AdminASNApprovalsPage() {
  const toast = useRef<Toast>(null);

  //Table state
  const [asns,         setAsns]         = useState<ASN[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [rows,         setRows]         = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search,       setSearch]       = useState("");
  const debouncedSearch                 = useDebounce(search, 500);

  //Filter state — server-side
  const [statusFilter, setStatusFilter] = useState<ASNStatus | null>(null);

  //KPI counts
  const [counts, setCounts] = useState<StatusCounts>({
    total: 0, pending: 0, approved: 0, rejected: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  //Dialog state
  const [selectedASN,          setSelectedASN]          = useState<ASN | null>(null);
  const [dialogVisible,        setDialogVisible]        = useState(false);
  const [rejectDialogVisible,  setRejectDialogVisible]  = useState(false);
  const [rejectReason,         setRejectReason]         = useState("");
  const [actionLoading,        setActionLoading]        = useState(false);

  //Load KPI counts once (independent of table filters)
  const loadCounts = useCallback(async () => {
    try {
      setCountsLoading(true);
      const data = await getASNStatusCounts();
      setCounts(data);
    } catch (err: any) {
      console.error("Failed to load ASN counts:", err);
    } finally {
      setCountsLoading(false);
    }
  }, []);

  // Load table data
  // Re-runs when page, rows, search, or statusFilter changes
  const loadASNs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllAdminASNs(
        page,
        rows,
        debouncedSearch,
        statusFilter ?? undefined,
      );
      setAsns(response.data);
      setTotalRecords(response.total);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   err?.response?.data?.message ?? "Failed to load ASNs",
        life:     3000,
      });
    } finally {
      setLoading(false);
    }
  }, [page, rows, debouncedSearch, statusFilter]);

  //Reset to page 1 when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    loadASNs();
  }, [loadASNs]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const handleView = (asn: ASN) => {
    setSelectedASN(asn);
    setDialogVisible(true);
  };

  const handleApprove = (asn: ASN) => {
    confirmDialog({
      message:         `Approve ${asn.asnNumber}? This will notify the vendor.`,
      header:          "Confirm Approval",
      icon:            "pi pi-check-circle",
      acceptClassName: "p-button-success",
      accept:          () => submitApprove(asn),
    });
  };

  const submitApprove = async (asn: ASN) => {
    try {
      setActionLoading(true);
      await approveASN(asn.id);

      // Update row in place — no full reload needed
      setAsns((prev) =>
        prev.map((a) =>
          a.id === asn.id ? { ...a, status: "confirmed" as ASNStatus } : a,
        ),
      );
      setCounts((c) => ({
        ...c,
        pending:  Math.max(0, c.pending - 1),
        approved: c.approved + 1,
      }));

      setDialogVisible(false);
      toast.current?.show({
        severity: "success",
        summary:  "Approved",
        detail:   `${asn.asnNumber} approved successfully.`,
        life:     3000,
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   err?.response?.data?.message ?? "Failed to approve ASN",
        life:     3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (asn: ASN) => {
    setSelectedASN(asn);
    setRejectReason("");
    setRejectDialogVisible(true);
  };

  const submitReject = async () => {
    if (!selectedASN || !rejectReason.trim()) return;

    try {
      setActionLoading(true);
      await rejectASN(selectedASN.id, rejectReason.trim());

      setAsns((prev) =>
        prev.map((a) =>
          a.id === selectedASN.id
            ? { ...a, status: "rejected" as ASNStatus, rejectionReason: rejectReason.trim() }
            : a,
        ),
      );
      setCounts((c) => ({
        ...c,
        pending:  Math.max(0, c.pending - 1),
        rejected: c.rejected + 1,
      }));

      setRejectDialogVisible(false);
      setDialogVisible(false);
      toast.current?.show({
        severity: "error",
        summary:  "Rejected",
        detail:   `${selectedASN.asnNumber} has been rejected.`,
        life:     3000,
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   err?.response?.data?.message ?? "Failed to reject ASN",
        life:     3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusFilterChange = (value: ASNStatus | null) => {
    setStatusFilter(value);
    setPage(1);
  };

  const canActOn = (status: ASNStatus) =>
    status === "submitted" || status === "draft";

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
          { label: "Total",    value: counts.total,    color: "text-primary" },
          { label: "Pending",  value: counts.pending,  color: "text-warning" },
          { label: "Approved", value: counts.approved, color: "text-success" },
          { label: "Rejected", value: counts.rejected, color: "text-danger" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>
              {countsLoading ? "—" : c.value}
            </h3>
          </div>
        ))}
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Dropdown
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(e) => handleStatusFilterChange(e.value)}
          placeholder="All statuses"
          className="w-48"
        />
        {statusFilter && (
          <Button
            label="Clear"
            icon="pi pi-times"
            size="small"
            text
            onClick={() => handleStatusFilterChange(null)}
          />
        )}
      </div>

      {/* TABLE */}
      <AppTable
        data={asns}
        loading={loading}
        onView={handleView}
        totalRecords={totalRecords}
        // page={page}
        rows={rows}
        onPageChange={(e:any) => {
          setPage(e.page + 1);
          setRows(e.rows);
        }}
        // search={search}
        onSearchChange={setSearch}
        columns={[
          { field: "asnNumber",          header: "ASN Number",    sortable: true, filter: true },
          { field: "poNo",               header: "PO Number",     sortable: true, filter: true },
          { field: "vendorId",           header: "Vendor ID",     sortable: true, filter: true },
          { field: "estimatedShipDate",  header: "Ship Date",     sortable: true },
          { field: "carrierName",        header: "Carrier",       sortable: true },
          { field: "trackingNumber",     header: "Tracking #",    sortable: true },
          { field: "submittedAt",        header: "Submitted At",  sortable: true },
          {
            field:  "status",
            header: "Status",
            sortable: true,
            filter: true,
            body:   (row: ASN) => {
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

            {/* HEADER INFO */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "ASN Number",          value: selectedASN.asnNumber },
                { label: "PO Number",           value: selectedASN.poNo },
                { label: "Vendor ID",           value: selectedASN.vendorId },
                { label: "Carrier",             value: selectedASN.carrierName },
                { label: "Tracking #",          value: selectedASN.trackingNumber },
                { label: "Shipment Mode",       value: selectedASN.shipmentMode ?? "—" },
                { label: "Sold To",             value: selectedASN.soldTo ?? "—" },
                {
                  label: "Estimated Ship Date",
                  value: selectedASN.estimatedShipDate
                    ? new Date(selectedASN.estimatedShipDate).toLocaleDateString()
                    : "—",
                },
                {
                  label: "Estimated Delivery",
                  value: selectedASN.estimatedDeliveryDate
                    ? new Date(selectedASN.estimatedDeliveryDate).toLocaleDateString()
                    : "—",
                },
                {
                  label: "Submitted At",
                  value: selectedASN.submittedAt
                    ? new Date(selectedASN.submittedAt).toLocaleString()
                    : "—",
                },
                {
                  label: "Status",
                  value: STATUS_BADGE[selectedASN.status]?.label ?? selectedASN.status,
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs uppercase text-muted-foreground mb-1">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}

              {selectedASN.rejectionReason && (
                <div className="col-span-2 md:col-span-3">
                  <p className="text-xs uppercase text-muted-foreground mb-1">Rejection Reason</p>
                  <p className="font-medium text-red-500">{selectedASN.rejectionReason}</p>
                </div>
              )}

              {selectedASN.notes && (
                <div className="col-span-2 md:col-span-3">
                  <p className="text-xs uppercase text-muted-foreground mb-1">Notes</p>
                  <p className="font-medium">{selectedASN.notes}</p>
                </div>
              )}
            </div>

            {/* LINE ITEMS */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Line Items
              </p>
              <AppTable
                data={selectedASN.items}
                selectable={false}
                globalSearch={false}
                rows={5}
                columns={[
                  { field: "poItem",          header: "PO Item" },
                  { field: "matCode",         header: "Material Code" },
                  { field: "matDesc",         header: "Description" },
                  { field: "ndcCode",         header: "NDC" },
                  { field: "originalQty",      header: "Ordered Qty" },
                  { field: "submittedQty",  header: "Deliverable Qty" },
                  { field: "uom",             header: "UOM" },
                  { field: "batchNo",         header: "Batch No" },
                  { field: "numberOfPackages",header: "Packages" },
                  { field: "packageType",     header: "Type" },
                  { field: "grossWeight",     header: "Gross Weight" },
                  { field: "weightUnit",      header: "Unit" },
                  { field: "upsWarehouseId",  header: "Warehouse" },
                ]}
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                label="Close"
                outlined
                severity="secondary"
                onClick={() => setDialogVisible(false)}
                disabled={actionLoading}
              />
              {canActOn(selectedASN.status) && (
                <>
                  <Button
                    label="Reject"
                    icon="pi pi-times"
                    severity="danger"
                    outlined
                    loading={actionLoading}
                    onClick={() => openRejectDialog(selectedASN)}
                  />
                  <Button
                    label="Approve"
                    icon="pi pi-check"
                    severity="success"
                    loading={actionLoading}
                    onClick={() => handleApprove(selectedASN)}
                  />
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
            <Button
              label="Cancel"
              outlined
              severity="secondary"
              onClick={() => setRejectDialogVisible(false)}
              disabled={actionLoading}
            />
            <Button
              label="Confirm Reject"
              icon="pi pi-times"
              severity="danger"
              loading={actionLoading}
              onClick={submitReject}
              disabled={!rejectReason.trim()}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}