import { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import AppTable from "../../components/table/DataTable";
import { getPurchaseOrders } from "../../services/PurchaseOrderService";
import { getAdminDashboard } from "../../services/DashboardService";
import { useDebounce } from "../../hooks/DebounceHook";
import Loader from "../../components/Loader";

type PurchaseOrder = {
  id: number;
  poNo: string;
  poItem: string;
  matCode: string;
  matDesc: string;
  actQty: number;
  ndcCode: string;
  vendorNo: string;
  soldTo: string;

  incoterm1: string | null;
  incoterm2: string | null;
  loadingGroup: string | null;
  loekz: string | null;
  poType: string | null;

  odpoQuan: number;
  sourceFileName: string;

  createdAt: string;
  updatedAt: string;

  batch: string | null;
  status: string;
};

export default function AdminPurchaseOrdersPage() {
  const toast = useRef<Toast>(null);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState({
    totalPOLines: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
  });

  const [loading, setLoading] = useState(true);

  // View dialog
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadPurchaseOrders();
  }, [page, rows,debouncedSearch]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadPurchaseOrders = async () => {
  try {
    setLoading(true);

    const poResponse = await getPurchaseOrders(
      page,
      rows,
      debouncedSearch
    );

    setPos(poResponse.data);
    setTotalRecords(poResponse.total);
  } catch (error:any) {
    console.error(error);
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail:
        error?.response?.data?.message ||
        "Failed to load purchase orders",
      life: 3000,
    });
  } finally {
    setLoading(false);
  }
};

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const statsResponse = await getAdminDashboard();
      setStats(statsResponse.poSummary);
    } catch (error:any) {
      console.error(error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error?.response?.data?.message ||
          "Failed to load purchase orders",
        life: 3000,
      });
    }finally {
      setLoading(false);
    }
  };

  // const filtered = pos.filter((p) => {
  //   if (vendorFilter && p.vendor !== vendorFilter) return false;
  //   if (statusFilter && p.status !== statusFilter) return false;
  //   return true;
  // });
  console.log('stats',stats);

  const handleView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewDialogVisible(true);
  };

  if(loading)(
    <div>
      <Loader />
    </div>
  )

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
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total PO Lines", value: stats.totalPOLines, color: "text-foreground" },
          { label: "Open", value: stats.open, color: "text-primary" },
          { label: "In Progress / ASN", value: stats.inProgress, color: "text-warning" },
          { label: "Completed", value: stats.completed, color: "text-success" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <h3 className={`text-2xl font-bold mt-2 ${c.color}`}>{c.value}</h3>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      {/* <div className="flex flex-wrap items-center gap-3">
        <Dropdown value={vendorFilter} options={vendorOptions} onChange={(e) => setVendorFilter(e.value)} placeholder="All Vendors" className="w-44" />
        <Dropdown value={statusFilter} options={statusOptions} onChange={(e) => setStatusFilter(e.value)} placeholder="All Status" className="w-44" />
        {(vendorFilter || statusFilter) && (
          <Button label="Clear" text icon="pi pi-times" onClick={() => { setVendorFilter(null); setStatusFilter(null); }} />
        )}
      </div> */}

      {/* TABLE */}
      <AppTable
        data={pos}
        loading={loading}
        onView={handleView}
        rows={rows}
        totalRecords={totalRecords}
        first={(page - 1) * rows}
        onPageChange={(e) => {
          setPage(e.page + 1);
          setRows(e.rows);
        }}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
        columns={[
          { field: "poNo", header: "PO Number", sortable: true, filter: true },
          { field: "poItem", header: "Item #", sortable: true },
          { field: "batch", header: "Batch", sortable: true, filter: true },
          { field: "matCode", header: "Material Code", sortable: true, filter: true },
          { field: "matDesc", header: "Description", sortable: true },
          { field: "actQty", header: "Quantity", sortable: true },
          { field: "vendorNo", header: "Vendor No", sortable: true },
          { field: "soldTo", header: "Sold To", sortable: true },
          { field: "incoterm1", header: "Incoterm 1", sortable: true },
          { field: "incoterm2", header: "Incoterm 2", sortable: true },
          { field: "createdAt", header: "Created Date", sortable: true },
          { field: "status", header: "Status", sortable: true, filter: true },
        ]}
      />

      {/* VIEW DIALOG */}
      <Dialog header={`PO: ${selectedPO?.poNo} – Item ${selectedPO?.poItem}`} visible={viewDialogVisible} onHide={() => setViewDialogVisible(false)} style={{ width: "520px" }} modal>
        {selectedPO && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "PO Number", value: selectedPO.poNo },
                { label: "Item Number", value: selectedPO.poItem },
                { label: "Batch Number", value: selectedPO.batch },
                { label: "Material Code", value: selectedPO.matCode },
                { label: "Description", value: selectedPO.matDesc },
                { label: "NDC Code", value: selectedPO.ndcCode },
                { label: "Order Qty", value: selectedPO.actQty.toLocaleString() },
                { label: "Vendor", value: `(${selectedPO.vendorNo})` },
                { label: "Sold To", value: selectedPO.soldTo },
                { label: "Incoterm 1", value: selectedPO.incoterm1 },
                { label: "Incoterm 2", value: selectedPO.incoterm2 },
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
    </div>
  );
}