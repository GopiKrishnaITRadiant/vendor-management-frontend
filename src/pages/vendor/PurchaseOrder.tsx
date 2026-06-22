import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import AppTable from "../../components/table/DataTable";
import { getPurchaseOrders, getPurchaseOrderSummary } from "../../services/PurchaseOrderService";
import { useDebounce } from "../../hooks/DebounceHook";
import { useAuth } from "../../context/AuthContext";
import type { PurchaseOrder } from "../../types/purchaseOrderTypes";

// ─── Types ───────────────────────────────────────────────

type StatusTab = PurchaseOrder["status"] | "All";

interface Stats {
  totalPOLines: number;
  open:         number;
  inProgress:   number;
  completed:    number;
}

// ─── Constants ───────────────────────────────────────────

const STATUS_STYLE: Record<PurchaseOrder["status"], string> = {
  Open:         "bg-blue-50 text-blue-700",
  "ASN Created":"bg-amber-50 text-amber-700",
  "In Progress":"bg-purple-50 text-purple-700",
  Completed:    "bg-green-50 text-green-700",
};

const STATUS_TABS: { label: string; value: StatusTab }[] = [
  { label: "All",         value: "All" },
  { label: "Open",        value: "Open" },
  { label: "ASN Created", value: "ASN Created" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed",   value: "Completed" },
];

// ─── Sub-components ──────────────────────────────────────

function StatusBadge({ status }: { status: PurchaseOrder["status"] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const toast    = useRef<Toast>(null);
  const { user } = useAuth();

  // ── Table state ───────────────────────────────────────
  const [pos,          setPos]          = useState<PurchaseOrder[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [rows,         setRows]         = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search,       setSearch]       = useState("");
  const debouncedSearch                 = useDebounce(search, 500);
  const [activeStatus, setActiveStatus] = useState<StatusTab>("All");
  const [selectedOrders, setSelectedOrders] = useState<PurchaseOrder[]>([]);

  // ── KPI stats ─────────────────────────────────────────
  const [stats,        setStats]        = useState<Stats>({ totalPOLines: 0, open: 0, inProgress: 0, completed: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Request guard ─────────────────────────────────────
  const tableRequestId  = useRef(0);
  const statsFetchedRef = useRef(false);

  // ── Vendor number from the logged-in user ─────────────
  const vendorNo = (user as any)?.sapVendorId ?? undefined;

  // ── Load table data ───────────────────────────────────

  const loadPurchaseOrders = useCallback(async () => {
    const requestId = ++tableRequestId.current;

    try {
      setLoading(true);

      const response = await getPurchaseOrders(
        page,
        rows,
        debouncedSearch || undefined,
        vendorNo,
        activeStatus === "All" ? undefined : activeStatus,
      );

      if (requestId !== tableRequestId.current) return; // stale — ignore

      setPos(response.data);
      setTotalRecords(response.total);
    } catch (error: any) {
      if (requestId !== tableRequestId.current) return;
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   error?.response?.data?.message ?? "Failed to load purchase orders",
        life:     3000,
      });
    } finally {
      if (requestId === tableRequestId.current) setLoading(false);
    }
  }, [page, rows, debouncedSearch, activeStatus, vendorNo]);

  // ── Load KPI stats once on mount ──────────────────────

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getPurchaseOrderSummary(vendorNo);
      setStats({
        totalPOLines: data.totalPOLines ?? 0,
        open:         data.open         ?? 0,
        inProgress:   (data.inProgress  ?? 0) + (data.asnCreated ?? 0),
        completed:    data.completed    ?? 0,
      });
    } catch (error: any) {
      console.error("Failed to load PO stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [vendorNo]);

  // ── Reset to page 1 when filter/search changes ────────
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeStatus]);

  useEffect(() => {
    loadPurchaseOrders();
  }, [loadPurchaseOrders]);

  useEffect(() => {
    if (statsFetchedRef.current) return;
    statsFetchedRef.current = true;
    loadStats();
  }, [loadStats]);

  // ── Handlers ─────────────────────────────────────────

  const handleStatusChange = (status: StatusTab) => {
    setActiveStatus(status);
    setSelectedOrders([]);
  };

  const handleCreateASN = () => {
    if (!selectedOrders.length) return;
    navigate("/asn/create", { state: { selectedOrders } });
  };

  const tabCount = (value: StatusTab) => {
    if (statsLoading) return "—";
    switch (value) {
      case "All":         return stats.totalPOLines;
      case "Open":        return stats.open;
      case "In Progress": return stats.inProgress;
      case "Completed":   return stats.completed;
      default:            return 0;
    }
  };

  // ── Render ────────────────────────────────────────────

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />

      {/* HEADER */}
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
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.totalPOLines, color: "text-foreground" },
          { label: "Open",         value: stats.open,         color: "text-blue-600" },
          { label: "In Progress",  value: stats.inProgress,   color: "text-amber-600" },
          { label: "Completed",    value: stats.completed,    color: "text-green-600" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>
              {statsLoading ? "—" : c.value}
            </h3>
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
              onClick={() => handleStatusChange(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeStatus === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeStatus === tab.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {tabCount(tab.value)}
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
              <Button label="Clear" text size="small" severity="secondary" onClick={() => setSelectedOrders([])} />
              <Button label="Create ASN" icon="pi pi-plus" size="small" onClick={handleCreateASN} />
            </div>
          </div>
        )}

        <AppTable
          data={pos}
          loading={loading}
          rows={rows}
          totalRecords={totalRecords}
          first={(page - 1) * rows}
          selectable
          onSelectionChange={setSelectedOrders}
          onPageChange={(e) => {
            setPage(e.page + 1);
            setRows(e.rows);
          }}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          columns={[
            { field: "poNo",      header: "PO Number",     sortable: true, filter: true },
            { field: "poItem",    header: "Item #",         sortable: true },
            { field: "batch",     header: "Batch",          sortable: true, filter: true },
            { field: "matCode",   header: "Material Code",  sortable: true, filter: true },
            { field: "matDesc",   header: "Description",    sortable: true },
            { field: "actQty",    header: "Quantity",       sortable: true },
            { field: "vendorNo",  header: "Vendor No",      sortable: true },
            { field: "soldTo",    header: "Sold To",        sortable: true },
            { field: "incoterm1", header: "Incoterm 1",     sortable: true },
            { field: "incoterm2", header: "Incoterm 2",     sortable: true },
            { field: "createdAt", header: "Created Date",   sortable: true,
              body: (row: PurchaseOrder) =>
                row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
            },
            {
              field: "status",
              header: "Status",
              sortable: true,
              filter: true,
              body: (row: PurchaseOrder) => <StatusBadge status={row.status} />,
            },
          ]}
        />
      </div>
    </div>
  );
}