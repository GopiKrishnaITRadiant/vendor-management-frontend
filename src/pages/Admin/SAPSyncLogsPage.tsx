import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import AppTable from "../../components/table/DataTable";
import { useDebounce } from "../../hooks/debounceHook";
import { getSyncStatus } from "../../services/sapSyncService";
import type {
  FailedRow,
  SyncLog,
  TabStatus,
} from "../../types/sapSyncLogTypes";
import { STATUS_BADGE, TABS } from "../../constants/SAPSyncLogConstants";
import { formatDateTime } from "../../utils/formatDateTime";
import { formatDuration } from "../../utils/formatDurationUtil";
import type { ExpandedColumn } from "../ExpandableTable";
import ExpandedTable from "../ExpandableTable";

//Types
type SyncLogRange = "today" | "week" | "month" | "quarter" | "year" | "custom";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

//Constants
const RANGE_OPTIONS: { label: string; value: SyncLogRange }[] = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "week" },
  { label: "Last month", value: "month" },
  { label: "Last quarter", value: "quarter" },
  { label: "Last year", value: "year" },
  { label: "Custom range", value: "custom" },
];

const failedRowColumns: ExpandedColumn<FailedRow>[] = [
  {
    field: "rowNumber",
    header: "Row #",
    body: (fr: FailedRow) => (
      <span className="font-mono text-muted-foreground">#{fr.rowNumber}</span>
    ),
  },
  {
    field: "rawData",
    header: "Raw data",
    body: (fr: FailedRow) => (
      <span
        title={fr.rawData._raw}
        className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded
                   text-muted-foreground truncate block max-w-[260px]"
      >
        {fr.rawData._raw}
      </span>
    ),
  },
  {
    field: "errorMessage",
    header: "Error",
    body: (fr: FailedRow) => (
      <span className="text-red-600 font-medium">{fr.errorMessage}</span>
    ),
  },
  {
    field: "status",
    header: "Status",
    body: (fr: FailedRow) => (
      <span className="text-muted-foreground capitalize">{fr.status}</span>
    ),
  },
  {
    field: "retryCount",
    header: "Retries",
    body: (fr: FailedRow) => (
      <span className="text-muted-foreground">{fr.retryCount}x</span>
    ),
  },
];

export default function SAPSyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabStatus>("All");
  const [search, setSearch] = useState("");
  const [tableKey, setTableKey] = useState(0);

  //Server-side pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  //Date range filter
  const [range, setRange] = useState<SyncLogRange>("week");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    setTableKey((k) => k + 1);
  }, [debouncedSearch, activeTab, range, fromDate, toDate]);

  //Load logs from server
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, any> = { page, limit, range };

      if (range === "custom") {
        if (fromDate) params.fromDate = fromDate.toISOString().split("T")[0];
        if (toDate) params.toDate = toDate.toISOString().split("T")[0];
      }

      const response = await getSyncStatus(params);
      setLogs(response.data ?? []);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Failed to load sync logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, range, fromDate, toDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    if (activeTab === "All") return logs;
    return logs.filter((l) => l.status === activeTab);
  }, [logs, activeTab]);

  //KPI counts — computed from current page data
  const counts = useMemo(
    () => ({
      All: logs.length,
      runs: new Set(logs.map((l) => l.runId)).size,
      success: logs.filter((l) => l.status === "success").length,
      partial: logs.filter((l) => l.status === "partial").length,
      failed: logs.filter((l) => l.status === "failed").length,
      started: logs.filter((l) => l.status === "started").length,
    }),
    [logs],
  );

  const kpiCards = useMemo(
    () => [
      {
        label: "Total files",
        value: pagination.total,
        color: "text-foreground",
        bg: "bg-muted",
        icon: "pi pi-file",
        status: "All" as TabStatus,
      },
      {
        label: "Unique runs",
        value: counts.runs,
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: "pi pi-refresh",
        status: null,
      },
      {
        label: "Success",
        value: counts.success,
        color: "text-green-600",
        bg: "bg-green-50",
        icon: "pi pi-check-circle",
        status: "success" as TabStatus,
      },
      {
        label: "Partial",
        value: counts.partial,
        color: "text-amber-600",
        bg: "bg-amber-50",
        icon: "pi pi-exclamation-circle",
        status: "partial" as TabStatus,
      },
      {
        label: "Failed",
        value: counts.failed,
        color: "text-red-600",
        bg: "bg-red-50",
        icon: "pi pi-times-circle",
        status: "failed" as TabStatus,
      },
    ],
    [counts, pagination.total],
  );

  //Row expansion template
  const rowExpansionTemplate = (row: SyncLog) => (
    <ExpandedTable<FailedRow>
      title={`Failed rows — ${row.fileName}`}
      data={row.failedRows ?? []}
      columns={failedRowColumns}
    />
  );

  return (
    <div className="page-container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SAP sync logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Purchase order synchronisation history and failed row details.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`card p-5 transition-all hover:shadow-md
                        ${card.status ? "cursor-pointer" : "cursor-default"}
                        ${activeTab === card.status ? "ring-2 ring-primary" : ""}`}
            onClick={() => card.status && setActiveTab(card.status)}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <h3 className={`text-2xl font-bold mt-1 ${card.color}`}>
                  {card.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
              >
                <i className={`${card.icon} ${card.color} text-sm`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Date range preset */}
        <Dropdown
          value={range}
          options={RANGE_OPTIONS}
          onChange={(e) => {
            setRange(e.value);
            if (e.value !== "custom") {
              setFromDate(null);
              setToDate(null);
            }
          }}
          className="w-44"
        />

        {/* Custom date pickers — shown only when range = custom */}
        {range === "custom" && (
          <>
            <Calendar
              value={fromDate}
              onChange={(e) => setFromDate(e.value as Date | null)}
              placeholder="From date"
              showIcon
              maxDate={toDate ?? new Date()}
              className="w-44"
            />
            <Calendar
              value={toDate}
              onChange={(e) => setToDate(e.value as Date | null)}
              placeholder="To date"
              showIcon
              minDate={fromDate ?? undefined}
              maxDate={new Date()}
              className="w-44"
            />
            {(fromDate || toDate) && (
              <Button
                label="Clear dates"
                text
                icon="pi pi-times"
                size="small"
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
              />
            )}
          </>
        )}

      </div>

      {/* Table */}
      <AppTable
        key={tableKey}
        data={filteredLogs}
        loading={loading}
        rows={limit}
        lazy
        first={(page - 1) * limit}
        totalRecords={pagination.total}
        globalSearch
        onSearchChange={setSearch}
        onPageChange={(e: any) => {
          setPage(e.page + 1);
          setLimit(e.rows);
        }}
        rowExpansionTemplate={rowExpansionTemplate}
        expandableWhen={(row: SyncLog) => (row.failedRows?.length ?? 0) > 0}
        columns={[
          {
            field: "runId",
            header: "Run ID",
            body: (row: SyncLog) => (
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded border border-border text-muted-foreground">
                {row.runId.slice(0, 8)}
              </span>
            ),
          },
          {
            field: "fileName",
            header: "File name",
            body: (row: SyncLog) => (
              <span
                className="font-mono text-xs text-muted-foreground"
                title={row.fileName}
              >
                {row.fileName.length > 36
                  ? row.fileName.slice(0, 36) + "…"
                  : row.fileName}
              </span>
            ),
          },
          { field: "totalRecords", header: "Total" },
          {
            field: "insertedRecords",
            header: "Inserted",
            body: (row: SyncLog) => (
              <span className="text-green-600 font-medium">
                {row.insertedRecords > 0 ? `+${row.insertedRecords}` : "—"}
              </span>
            ),
          },
          {
            field: "updatedRecords",
            header: "Updated",
            body: (row: SyncLog) => (
              <span className="text-blue-600 font-medium">
                {row.updatedRecords > 0 ? `~${row.updatedRecords}` : "—"}
              </span>
            ),
          },
          {
            field: "failedRecords",
            header: "Failed",
            body: (row: SyncLog) => (
              <span
                className={
                  row.failedRecords > 0
                    ? "text-red-600 font-medium"
                    : "text-muted-foreground"
                }
              >
                {row.failedRecords > 0 ? row.failedRecords : "—"}
              </span>
            ),
          },
          {
            field: "startedAt",
            header: "Started at",
            body: (row: SyncLog) => (
              <span className="text-xs text-muted-foreground">
                {formatDateTime(row.startedAt)}
              </span>
            ),
          },
          {
            field: "completedAt",
            header: "Completed at",
            body: (row: SyncLog) => (
              <span className="text-xs text-muted-foreground">
                {formatDateTime(row.completedAt)}
              </span>
            ),
          },
          {
            field: "durationMs",
            header: "Duration",
            body: (row: SyncLog) => (
              <span className="text-xs text-muted-foreground">
                {formatDuration(row.durationMs)}
              </span>
            ),
          },
          {
            field: "status",
            header: "Status",
            body: (row: SyncLog) => {
              const badge = STATUS_BADGE[row.status];
              return (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${badge.className}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  {badge.label}
                </span>
              );
            },
          },
        ]}
      />
    </div>
  );
}
