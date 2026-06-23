import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

import AppTable from "../../components/table/DataTable";
import { ASNDetailDialog, StatusBadge } from "../../components/dialogs/AsnDetailDialog";

import { getAllASNs, submitASN } from "../../services/ASNService";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/DebounceHook";

import type { ASN, ASNStatus } from "../../types/asnTypes";

type TabStatus = ASNStatus | "All";

const STATUS_TABS: Array<{
  label: string;
  value: TabStatus;
}> = [
  { label: "All", value: "All" },
  { label: "Pending", value: "submitted" },
  { label: "Approved", value: "confirmed" },
  { label: "Rejected", value: "rejected" },
];

export default function ASNHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabStatus>("All");

  const [asnHistory, setAsnHistory] = useState<ASN[]>([]);
  const [selectedASN, setSelectedASN] = useState<ASN | null>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);

  const loadAsns = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const response = await getAllASNs(
        page,
        rows,
        String(user?.id||'1'),
        debouncedSearch,
        activeTab === "All" ? undefined : activeTab
      );

      setAsnHistory(response.data ?? []);
      setTotalRecords(response.total ?? 0);
    } catch (error) {
      console.error("Failed to load ASN history:", error);
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    page,
    rows,
    debouncedSearch,
    activeTab,
  ]);

  useEffect(() => {
    loadAsns();
  }, [loadAsns]);

  const counts = useMemo(
    () => ({
      All: totalRecords,
      submitted: asnHistory.filter(
        (item) => item.status === "submitted"
      ).length,
      confirmed: asnHistory.filter(
        (item) => item.status === "confirmed"
      ).length,
      rejected: asnHistory.filter(
        (item) => item.status === "rejected"
      ).length,
    }),
    [asnHistory, totalRecords]
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
    [counts]
  );

  

  const handleView = (asn: ASN) => {
    setSelectedASN(asn);
    setDialogVisible(true);
  };

  const formatDate = (value?: string | Date) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString();
  };

  const handleSubmitDraft = async (asnId: number) => {
  try {
    await submitASN(asnId);
    await loadAsns();

    setDialogVisible(false);
  } catch (error: any) {
    console.log(error);
  }
};

  const formatDateTime = (value?: string | Date) => {
    if (!value) return "-";

    return new Date(value).toLocaleString();
  };

  return (
    <div className="page-container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            ASN History
          </h1>

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`card p-5 cursor-pointer transition-all hover:shadow-md ${
              activeTab === card.status
                ? "ring-2 ring-primary"
                : ""
            }`}
            onClick={() => setActiveTab(card.status)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">
                  {card.label}
                </p>

                <h3
                  className={`text-2xl font-bold mt-1 ${card.color}`}
                >
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
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}

              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.value
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
          // searchValue={search}
          onSearchChange={setSearch}
          onView={handleView}
          totalRecords={totalRecords}
          rows={rows}
          // page={page}
          onPageChange={(event: any) => {
            setPage(event.page + 1);
            setRows(event.rows);
          }}
          columns={[
            {
              field: "asnNumber",
              header: "ASN Number",
              sortable: true,
              filter: true,
            },
            {
              field: "poNo",
              header: "PO Number",
              sortable: true,
            },
            {
              field: "carrierName",
              header: "Carrier",
              sortable: true,
            },
            {
              field: "trackingNumber",
              header: "Tracking Number",
            },
            {
              field: "estimatedShipDate",
              header: "Ship Date",
              sortable: true,
              body: (row: ASN) =>
                formatDate(row.estimatedShipDate as string),
            },
            {
              field: "soldTo",
              header: "Sold To",
              sortable: true,
            },
            {
              field: "items",
              header: "Items",
              body: (row: ASN) => row.items?.length ?? 0,
            },
            {
              field: "submittedAt",
              header: "Submitted",
              sortable: true,
              body: (row: ASN) =>
                formatDateTime(row.submittedAt as string),
            },
            {
              field: "status",
              header: "Status",
              sortable: true,
              body: (row: ASN) => (
                <StatusBadge status={row.status} />
              ),
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