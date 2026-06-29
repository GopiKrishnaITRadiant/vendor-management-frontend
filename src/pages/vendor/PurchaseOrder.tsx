import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { getPurchaseOrders, getVendorPurchaseOrderSummary } from "../../services/PurchaseOrderService";
import { useAuth } from "../../context/AuthContext";
import type { POGroup, PurchaseOrder, Stats, StatusTab } from "../../types/purchaseOrderTypes";
import { useDebounce } from "../../hooks/debounceHook";


const STATUS_STYLE: Record<string, string> = {
  active:        "bg-blue-50 text-blue-700",
  deleted:       "bg-red-50 text-red-700",
  "ASN Created": "bg-amber-50 text-amber-700",
  "In Progress": "bg-purple-50 text-purple-700",
  Completed:     "bg-green-50 text-green-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const toast    = useRef<Toast>(null);
  const { user } = useAuth();

  //Table state
  const [poGroups,     setPoGroups]     = useState<POGroup[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [rows,         setRows]         = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search,       setSearch]       = useState("");
  const debouncedSearch                 = useDebounce(search, 500);

  const [selectedLines, setSelectedLines] = useState<PurchaseOrder[]>([]);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  //KPI stats
  const [stats,        setStats]        = useState<Stats>({ totalPOLines: 0, open: 0, inProgress: 0, completed: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Request guard
  const tableRequestId  = useRef(0);

  const vendorNo = (user as any)?.sapVendorId ?? user?.id;

  //Load table data
  const loadPurchaseOrders = useCallback(async () => {
    const requestId = ++tableRequestId.current;
    try {
      setLoading(true);
      const response = await getPurchaseOrders(
        page, rows, debouncedSearch || undefined, vendorNo,
      );
      if (requestId !== tableRequestId.current) return;
      setPoGroups(response.data);
      setTotalRecords(response.total);
    } catch (error: any) {
      if (requestId !== tableRequestId.current) return;
      toast.current?.show({
        severity: "error", summary: "Error",
        detail: error?.response?.data?.message ?? "Failed to load purchase orders",
        life: 3000,
      });
    } finally {
      if (requestId === tableRequestId.current) setLoading(false);
    }
  }, [page, rows, debouncedSearch,  vendorNo]);

  //Load KPI stats once on mount
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getVendorPurchaseOrderSummary(vendorNo);
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

  useEffect(() => { setPage(1); }, [debouncedSearch]);
  useEffect(() => { loadPurchaseOrders(); }, [loadPurchaseOrders]);
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCreateASN = () => {
    if (!selectedLines.length) return;
    navigate("/asn/create", { state: { selectedOrders: selectedLines } });
  };

  //Row expansion template
  const rowExpansionTemplate = (group: POGroup) => (
    <div className="px-4 pb-4 pt-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Line Items — {group.poNo}
      </p>
      <DataTable
        value={group.lineItems}
        size="small"
        selection={selectedLines}
        onSelectionChange={(e) => {
          const otherGroupLines = selectedLines.filter((l) => l.poNo !== group.poNo);
          setSelectedLines([...otherGroupLines, ...(e.value as PurchaseOrder[])]);
        }}
        dataKey="id"
        className="nested-po-table"
        showGridlines
        selectionMode="checkbox"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="poItem"    header="Item #"        sortable />
        <Column field="batch"     header="Batch"         sortable />
        <Column field="matCode"   header="Material Code" sortable />
        <Column field="matDesc"   header="Description"   sortable />
        <Column field="actQty"    header="Quantity"      sortable />
        <Column field="incoterm1" header="Incoterm 1"    sortable />
        <Column field="incoterm2" header="Incoterm 2"    sortable />
        <Column
          field="status"
          header="Status"
          sortable
          body={(row: PurchaseOrder) => <StatusBadge status={row.status} />}
        />
      </DataTable>

      {group.lineItems.some((l) => selectedLines.includes(l)) && (
        <div className="flex justify-end mt-2">
          <Button
            label={`Create ASN for ${group.lineItems.filter((l) => selectedLines.includes(l)).length} selected line(s)`}
            icon="pi pi-plus"
            size="small"
            onClick={handleCreateASN}
          />
        </div>
      )}
    </div>
  );

  const updatedAtBody = (g: POGroup) =>
    g.updatedAt ? new Date(g.updatedAt).toLocaleDateString() : "—";

  //Render
  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Expand a PO to view and select line items, then create an ASN
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {selectedLines.length > 0 && (
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              {selectedLines.length} line{selectedLines.length > 1 ? "s" : ""} selected
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
        {/* Global selection action bar */}
        {selectedLines.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border-b border-primary/20">
            <p className="text-sm text-primary font-medium">
              <i className="pi pi-check-circle mr-2" />
              {selectedLines.length} line{selectedLines.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center gap-2">
              <Button label="Clear" text size="small" severity="secondary" onClick={() => setSelectedLines([])} />
              <Button label="Create ASN" icon="pi pi-plus" size="small" onClick={handleCreateASN} />
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="flex justify-end px-4 py-3 border-b border-border">
          <span className="p-input-icon-left w-full max-w-sm">
            <InputText
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search PO number, material, batch…"
              className="w-full"
            />
          </span>
        </div>

        {/* Outer grouped table */}
        <DataTable
          value={poGroups}
          dataKey="poNo"
          loading={loading}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data as Record<string, boolean>)}
          rowExpansionTemplate={rowExpansionTemplate}
          lazy
          paginator
          rows={rows}
          totalRecords={totalRecords}
          first={(page - 1) * rows}
          onPage={(e: any) => { setPage(e.page + 1); setRows(e.rows); }}
          // rowsPerPageOptions={[10, 25, 50]}
          emptyMessage="No purchase orders found."
          className="po-grouped-table"
        >
          <Column expander style={{ width: "3.5rem" }} />
          <Column field="poNo"     header="PO Number"    />
          <Column field="lineCount" header="Lines"/>
          <Column field="vendorNo" header="Vendor No"    />
          <Column field="soldTo"   header="Sold To"      />
          <Column field="poType"   header="PO Type"      />
          <Column
            field="updatedAt"
            header="Last Updated"
            body={updatedAtBody}
          />
          <Column field="totalQty" header="Total Qty"  />

        </DataTable>
      </div>
    </div>
  );
}