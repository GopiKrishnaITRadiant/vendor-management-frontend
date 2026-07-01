import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import type { ASN } from "../../../types/asnTypes";
import { useAuth } from "../../../context/AuthContext";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import { getAllASNs, submitASN } from "../../../services/ASNService";
import AppTable from "../../../components/table/DataTable";
import {
  ASNDetailDialog,
  StatusBadge,
} from "../../../components/dialogs/AsnDetailDialog";
import { STATUS_TABS, type TabStatus } from "./asn.constants";
import { formatDateTime } from "../../../utils/formatDateTime";
import { formatDate } from "../../../utils/formatDateUtil";

type AsnFilters = { status: TabStatus };

export default function ASNHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedASN, setSelectedASN] = useState<ASN | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  //Stable initial filters
  const initialFilters = useMemo<AsnFilters>(() => ({ status: "All" }), []);

  const vendorNo = String(user?.sapVendorId || "1");

  const {
    data: asnHistory,
    totalRecords,
    loading,
    rows,
    onPageChange,
    setSearch,
    filters,
    setFilter,
    refetch,
  } = usePaginatedQuery<ASN, AsnFilters>({
    initialFilters,

    fetchFn: useCallback(
      ({ page, rows, search, filters }) =>
        getAllASNs(
          page,
          rows,
          vendorNo,
          search,
          filters.status === "All" ? undefined : filters.status,
        ),
      [vendorNo],
    ),

    onError: useCallback((error: any) => {
      console.error("Failed to load ASN history:", error);
    }, []),
  });

  const counts = useMemo(
    () => ({
      All: totalRecords,
      submitted: asnHistory.filter((item) => item.status === "submitted")
        .length,
      confirmed: asnHistory.filter((item) => item.status === "confirmed")
        .length,
      rejected: asnHistory.filter((item) => item.status === "rejected").length,
    }),
    [asnHistory, totalRecords],
  );

  const kpiCards = useMemo(
    () => [
      {
        label: "All",
        status: "All" as TabStatus,
        value: counts.All,
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: "pi pi-box",
      },
      {
        label: "Pending",
        status: "submitted" as TabStatus,
        value: counts.submitted,
        color: "text-amber-600",
        bg: "bg-amber-50",
        icon: "pi pi-clock",
      },
      {
        label: "Approved",
        status: "confirmed" as TabStatus,
        value: counts.confirmed,
        color: "text-green-600",
        bg: "bg-green-50",
        icon: "pi pi-check-circle",
      },
      {
        label: "Rejected",
        status: "rejected" as TabStatus,
        value: counts.rejected,
        color: "text-red-600",
        bg: "bg-red-50",
        icon: "pi pi-times-circle",
      },
    ],
    [counts],
  );

  const handleView = (asn: ASN) => {
    setSelectedASN(asn);
    setDialogVisible(true);
  };

  const handleSubmitDraft = async (asnId: number) => {
    try {
      await submitASN(asnId);
      setDialogVisible(false);
      refetch();
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div className="page-container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ASN History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all submitted advance shipment notices
          </p>
        </div>
        <Button
          label="Create New ASN"
          icon="pi pi-plus"
          onClick={() => navigate("/purchase-orders")}
        />
      </div>

      {/* KPI Cards — clicking sets the status filter */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`card p-5 cursor-pointer transition-all hover:shadow-md ${
              filters.status === card.status ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setFilter("status", card.status)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <h3 className={`text-2xl font-bold mt-1 ${card.color}`}>
                  {card.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
              >
                <i className={`${card.icon} ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="card overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter("status", tab.value)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                filters.status === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filters.status === tab.value
                    ? "bg-primary text-white"
                    : "bg-muted"
                }`}
              >
                {counts[tab.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        <AppTable
          data={asnHistory}
          loading={loading}
          globalSearch
          onSearchChange={setSearch}
          onView={handleView}
          totalRecords={totalRecords}
          rows={rows}
          onPageChange={onPageChange}
          columns={[
            {
              field: "asnNumber",
              header: "ASN Number",
              sortable: true,
              filter: true,
            },
            { field: "poNo", header: "PO Number", sortable: true },
            { field: "carrierName", header: "Carrier", sortable: true },
            { field: "trackingNumber", header: "Tracking Number" },
            {
              field: "estimatedShipDate",
              header: "Ship Date",
              sortable: true,
              body: (row: ASN) => formatDate(row.estimatedShipDate as string),
            },
            { field: "soldTo", header: "Sold To", sortable: true },
            {
              field: "items",
              header: "Items",
              body: (row: ASN) => row.items?.length ?? 0,
            },
            {
              field: "submittedAt",
              header: "Submitted",
              sortable: true,
              body: (row: ASN) => formatDateTime(row.submittedAt as string),
            },
            {
              field: "status",
              header: "Status",
              sortable: true,
              body: (row: ASN) => <StatusBadge status={row.status} />,
            },
          ]}
        />
      </div>

      <ASNDetailDialog
        asn={selectedASN}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        onSubmitDraft={handleSubmitDraft}
      />
    </div>
  );
}
