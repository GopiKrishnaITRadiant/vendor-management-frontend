import { useEffect, useRef, useState, useCallback } from "react";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import AppTable from "../../components/table/DataTable";
import { getPurchaseOrders } from "../../services/PurchaseOrderService";
import { getAdminDashboard } from "../../services/DashboardService";
import { useDebounce } from "../../hooks/debounceHook";

import type { POGroup, PurchaseOrder } from "../../types/purchaseOrderTypes";
import type { ExpandedColumn } from "../ExpandableTable";
import ExpandedTable from "../ExpandableTable";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  active: "bg-blue-50 text-blue-700",
  deleted: "bg-red-50 text-red-700",
  "ASN Created": "bg-amber-50 text-amber-700",
  "In Progress": "bg-purple-50 text-purple-700",
  Completed: "bg-green-50 text-green-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        STATUS_STYLE[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

// ─── Line-item expanded columns ───────────────────────────────────────────────

const buildLineItemColumns = (
  handleView: (row: PurchaseOrder) => void,
): ExpandedColumn<PurchaseOrder>[] => [
  { field: "poItem",    header: "Item #" },
  { field: "batch",     header: "Batch" },
  { field: "matCode",   header: "Material Code" },
  { field: "matDesc",   header: "Description" },
  { field: "actQty",    header: "Quantity" },
  { field: "vendorNo",  header: "Vendor No" },
  { field: "soldTo",    header: "Sold To" },
  { field: "incoterm1", header: "Incoterm 1" },
  { field: "incoterm2", header: "Incoterm 2" },
  { field: "odpoQuan",  header: "ODPO Quan" },
  {
    header: "Status",
    body: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: "Actions",
    style: { width: "60px" },
    body: (row) => (
      <Button icon="pi pi-eye" text rounded onClick={() => handleView(row)} />
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPurchaseOrdersPage() {
  const toast = useRef<Toast>(null);

  const [poGroups, setPoGroups] = useState<POGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [tableKey, setTableKey] = useState(0);
  useEffect(() => {
    setPage(1);
    setFirst(0);
    setTableKey((k) => k + 1);
  }, [debouncedSearch]);

  const [stats, setStats] = useState({
    totalPOLines: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
  });

  const requestIdRef = useRef(0);

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadPurchaseOrders = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const response = await getPurchaseOrders(page, rows, debouncedSearch);
      if (requestId !== requestIdRef.current) return;
      setPoGroups(response.data);
      setTotalRecords(response.total);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message ?? "Failed to load purchase orders",
        life: 3000,
      });
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, rows, debouncedSearch]);

  const loadDashboard = useCallback(async () => {
    try {
      const dashboard = await getAdminDashboard();
      setStats(dashboard.poSummary);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => { loadPurchaseOrders(); }, [loadPurchaseOrders]);
  useEffect(() => { loadDashboard(); },      [loadDashboard]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleView = useCallback((po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewDialogVisible(true);
  }, []);

  const lineItemColumns = buildLineItemColumns(handleView);

  const rowExpansionTemplate = (group: POGroup) => (
    <ExpandedTable<PurchaseOrder>
      title={`Line Items — ${group.poNo}`}
      data={group.lineItems}
      columns={lineItemColumns}
    />
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground">
          Admin view — all vendors and companies
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total PO Lines", value: stats.totalPOLines },
          { label: "Open",           value: stats.open },
          { label: "In Progress",    value: stats.inProgress },
          { label: "Completed",      value: stats.completed },
        ].map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Grouped Table — dataKey="poNo" so each PO row is tracked individually */}
      <AppTable<POGroup>
        key={tableKey}
        data={poGroups}
        loading={loading}
        lazy
        dataKey="poNo"
        rows={rows}
        first={first}
        totalRecords={totalRecords}
        globalSearch
        onSearchChange={(val) => setSearch(val)}
        onPageChange={(e: any) => {
          setPage(e.page + 1);
          setRows(e.rows);
          setFirst(e.first);
        }}
        rowExpansionTemplate={rowExpansionTemplate}
        expandableWhen={(group) => (group.lineItems?.length ?? 0) > 0}
        columns={[
          { field: "poNo",              header: "PO Number" },
          { field: "lineCount",         header: "Lines" },
          { field: "vendorNo",          header: "Vendor No" },
          { field: "soldTo",            header: "Sold To" },
          {
            field: "poType",
            header: "PO Type",
            body: (row: POGroup) => <span>{row.poType ?? "-"}</span>,
          },
          { field: "totalQty",          header: "Total Qty" },
          // { field: "deliveredQty",      header: "Delivered" },
          // { field: "fulfillmentStatus", header: "Fulfillment Status" },
          {
            field: "updatedAt",
            header: "Updated",
            body: (row: POGroup) => (
              <span>
                {row.updatedAt
                  ? new Date(row.updatedAt).toLocaleDateString()
                  : "-"}
              </span>
            ),
          },
        ]}
      />

      {/* View Dialog */}
      <Dialog
        header={`PO ${selectedPO?.poNo}`}
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        style={{ width: "650px" }}
        modal
      >
        {selectedPO && (
          <div className="grid grid-cols-2 gap-4">
            <div><strong>PO Number:</strong> {selectedPO.poNo}</div>
            <div><strong>PO Item:</strong> {selectedPO.poItem}</div>
            <div><strong>Material Code:</strong> {selectedPO.matCode}</div>
            <div><strong>Description:</strong> {selectedPO.matDesc}</div>
            <div><strong>Quantity:</strong> {selectedPO.actQty}</div>
            <div><strong>Status:</strong> {selectedPO.status}</div>
            <div><strong>Vendor:</strong> {selectedPO.vendorNo}</div>
            <div><strong>Batch:</strong> {selectedPO.batch}</div>
            <div><strong>Incoterm 1:</strong> {selectedPO.incoterm1}</div>
            <div><strong>odpoQuan:</strong> {selectedPO.odpoQuan}</div>
          </div>
        )}
      </Dialog>
    </div>
  );
}