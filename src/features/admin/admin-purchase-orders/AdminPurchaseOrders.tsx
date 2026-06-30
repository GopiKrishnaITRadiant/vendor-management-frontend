import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { POGroup, PurchaseOrder } from "../../../types/purchaseOrderTypes";
import type { ExpandedColumn } from "../../../pages/ExpandableTable";
import { getPurchaseOrders } from "../../../services/PurchaseOrderService";
import { getAdminDashboard } from "../../../services/DashboardService";
import ExpandedTable from "../../../pages/ExpandableTable";
import AppTable from "../../../components/table/DataTable";
import { PURCHASE_ORDER_STATS_CARDS, STATUS_STYLE } from "./constants";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";

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

//Line-item expanded columns
const buildLineItemColumns = (
  handleView: (row: PurchaseOrder) => void,
): ExpandedColumn<PurchaseOrder>[] => [
  { field: "poItem", header: "Item #" },
  { field: "batch", header: "Batch" },
  { field: "matCode", header: "Material Code" },
  { field: "matDesc", header: "Description" },
  { field: "actQty", header: "Quantity" },
  { field: "vendorNo", header: "Vendor No" },
  { field: "soldTo", header: "Sold To" },
  { field: "incoterm1", header: "Incoterm 1" },
  { field: "incoterm2", header: "Incoterm 2" },
  { field: "odpoQuan", header: "ODPO Quan" },
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

// Stable empty-filters type — no filters on this page
type NoFilters = Record<string, never>;

export default function AdminPurchaseOrdersPage() {
  const toast = useRef<Toast>(null);

  const [selectedPO,        setSelectedPO]        = useState<PurchaseOrder | null>(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);

  const [stats, setStats] = useState({
    totalPOLines: 0,
    open:         0,
    inProgress:   0,
    completed:    0,
  });

  //Stable initialFilters — created once, not every render
  const initialFilters = useMemo<NoFilters>(() => ({}), []);

  const {
    data: poGroups,
    totalRecords,
    loading,
    rows,
    first,
    onPageChange,
    setSearch,
  } = usePaginatedQuery<POGroup, NoFilters>({
    initialFilters,

    fetchFn: useCallback(
      ({ page, rows, search }) => getPurchaseOrders(page, rows, search),
      [],
    ),

    onError: useCallback((error: any) => {
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail:   error?.response?.data?.message ?? "Failed to load purchase orders",
        life:     3000,
      });
    }, []),
  });

  // Dashboard stats — separate, not part of the paginated table
  const loadDashboard = useCallback(async () => {
    try {
      const dashboard = await getAdminDashboard();
      setStats(dashboard.poSummary);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  //Handlers
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

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />

      <div>
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground">
          Admin view — all vendors and companies
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {PURCHASE_ORDER_STATS_CARDS.map((card) => (
          <div key={card.key} className="card p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <h3 className="text-2xl font-bold mt-2">{stats[card.key] ?? 0}</h3>
          </div>
        ))}
      </div>

      <AppTable<POGroup>
        data={poGroups}
        loading={loading}
        lazy
        dataKey="poNo"
        rows={rows}
        first={first}
        totalRecords={totalRecords}
        globalSearch
        onSearchChange={setSearch}
        onPageChange={onPageChange}
        rowExpansionTemplate={rowExpansionTemplate}
        expandableWhen={(group) => (group.lineItems?.length ?? 0) > 0}
        columns={[
          { field: "poNo",      header: "PO Number" },
          { field: "lineCount", header: "Lines" },
          { field: "vendorNo",  header: "Vendor No" },
          { field: "soldTo",    header: "Sold To" },
          {
            field: "poType",
            header: "PO Type",
            body: (row: POGroup) => <span>{row.poType ?? "-"}</span>,
          },
          { field: "totalQty",          header: "Total Qty" },
          { field: "deliveredQty",      header: "Delivered" },
          { field: "fulfillmentStatus", header: "Fulfillment Status" },
          {
            field: "updatedAt",
            header: "Updated",
            body: (row: POGroup) => (
              <span>
                {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "-"}
              </span>
            ),
          },
        ]}
      />

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
