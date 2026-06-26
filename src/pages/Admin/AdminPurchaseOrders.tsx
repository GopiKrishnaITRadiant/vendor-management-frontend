import { useEffect, useRef, useState, useCallback } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import { getPurchaseOrders } from "../../services/PurchaseOrderService";
import { getAdminDashboard } from "../../services/DashboardService";
import { useDebounce } from "../../hooks/DebounceHook";

import type { POGroup, PurchaseOrder } from "../../types/purchaseOrderTypes";

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

export default function AdminPurchaseOrdersPage() {
  const toast = useRef<Toast>(null);

  const [poGroups, setPoGroups] = useState<POGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const [viewDialogVisible, setViewDialogVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [stats, setStats] = useState({
    totalPOLines: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
  });

  const requestIdRef = useRef(0);

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
        detail:
          error?.response?.data?.message ?? "Failed to load purchase orders",
        life: 3000,
      });
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
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

  useEffect(() => {
    loadPurchaseOrders();
  }, [loadPurchaseOrders]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewDialogVisible(true);
  };

  const rowExpansionTemplate = (group: POGroup) => (
    <div className="px-4 pb-4 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Line Items — {group.poNo}
      </p>

      <DataTable
        value={group.lineItems}
        size="small"
        showGridlines
        dataKey="id"
      >
        <Column field="poItem" header="Item #" />
        <Column field="batch" header="Batch" />
        <Column field="matCode" header="Material Code" />
        <Column field="matDesc" header="Description" />
        <Column field="actQty" header="Quantity" />
        <Column field="vendorNo" header="Vendor No" />
        <Column field="soldTo" header="Sold To" />
        <Column field="incoterm1" header="Incoterm 1" />
        <Column field="incoterm2" header="Incoterm 2" />
        <Column field="odpoQuan" header="odpoQuan" />

        <Column
          field="status"
          header="Status"
          body={(row: PurchaseOrder) => <StatusBadge status={row.status} />}
        />

        <Column
          header="Actions"
          body={(row: PurchaseOrder) => (
            <Button
              icon="pi pi-eye"
              text
              rounded
              onClick={() => handleView(row)}
            />
          )}
        />
      </DataTable>
    </div>
  );

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground">
          Admin view — all vendors and companies
        </p>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total PO Lines",
            value: stats.totalPOLines,
          },
          {
            label: "Open",
            value: stats.open,
          },
          {
            label: "In Progress",
            value: stats.inProgress,
          },
          {
            label: "Completed",
            value: stats.completed,
          },
        ].map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* GROUPED TABLE */}
      <div className="card overflow-hidden">
        <div className="flex justify-end px-4 py-3 border-b border-border">
          <InputText
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search PO number, material, vendor..."
            className="w-full md:w-80"
          />
        </div>
        <DataTable
          value={poGroups}
          dataKey="poNo"
          loading={loading}
          expandedRows={expandedRows}
          onRowToggle={(e) =>
            setExpandedRows(e.data as Record<string, boolean>)
          }
          rowExpansionTemplate={rowExpansionTemplate}
          paginator
          lazy
          rows={rows}
          totalRecords={totalRecords}
          first={(page - 1) * rows}
          onPage={(e: any) => {
            setPage(e.page + 1);
            setRows(e.rows);
          }}
          emptyMessage="No purchase orders found"
        >
          <Column expander style={{ width: "4rem" }} />

          <Column field="poNo" header="PO Number" />

          <Column field="lineCount" header="Lines" />

          <Column field="vendorNo" header="Vendor No" />

          <Column field="soldTo" header="Sold To" />

          <Column
            header="PO Type"
            body={(row) => row.poType ?? "-"}
          />
          <Column field="totalQty" header="Total Qty" />
          <Column field="deliveredQty" header="Delivered" />
          <Column field="fulfillmentStatus" header="Fulfillment Status" />

          <Column
            field="updatedAt"
            header="Updated"
            body={(row: POGroup) =>
              row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "-"
            }
          />
        </DataTable>
      </div>

      {/* VIEW DIALOG */}

      <Dialog
        header={`PO ${selectedPO?.poNo}`}
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        style={{ width: "650px" }}
        modal
      >
        {selectedPO && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>PO Number:</strong> {selectedPO.poNo}
            </div>

            <div>
              <strong>PO Item:</strong> {selectedPO.poItem}
            </div>

            <div>
              <strong>Material Code:</strong> {selectedPO.matCode}
            </div>

            <div>
              <strong>Description:</strong> {selectedPO.matDesc}
            </div>

            <div>
              <strong>Quantity:</strong> {selectedPO.actQty}
            </div>

            <div>
              <strong>Status:</strong> {selectedPO.status}
            </div>

            <div>
              <strong>Vendor:</strong> {selectedPO.vendorNo}
            </div>

            <div>
              <strong>Batch:</strong> {selectedPO.batch}
            </div>

            <div>
              <strong>Incoterm 1:</strong> {selectedPO.incoterm1}
            </div>

            <div>
              <strong>odpoQuan:</strong> {selectedPO.odpoQuan}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
