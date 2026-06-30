import { useMemo, useCallback } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import type { ExpandedColumn } from "../../../pages/ExpandableTable";
import type { FailedRow, SyncLog, TabStatus } from "../../../types/sapSyncLogTypes";
import { usePaginatedQuery } from "../../../hooks/usePaginatedQuery";
import { getSyncStatus } from "../../../services/sapSyncService";
import ExpandedTable from "../../../pages/ExpandableTable";
import AppTable from "../../../components/table/DataTable";
import { formatDateTime } from "../../../utils/formatDateTime";
import { formatDuration } from "../../../utils/formatDurationUtil";
import { STATUS_BADGE } from "../../../constants/SAPSyncLogConstants";
import type { SyncLogRange } from "./types";
import { RANGE_OPTIONS } from "./constants";

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

// ── Filter shape — status tab + date range, all server-side ──
type SyncLogFilters = {
  status:   TabStatus;
  range:    SyncLogRange;
  fromDate: Date | null;
  toDate:   Date | null;
};

export default function SAPSyncLogsPage() {
  // Stable initial filters
  const initialFilters = useMemo<SyncLogFilters>(
    () => ({ status: "All", range: "week", fromDate: null, toDate: null }),
    [],
  );

  const {
    data: logs,
    totalRecords,
    loading,
    rows,
    onPageChange,
    setSearch,
    filters,
    setFilter,
  } = usePaginatedQuery<SyncLog, SyncLogFilters>({
    initialFilters,
    defaultRows: 10,

    fetchFn: useCallback(
      async ({ page, rows, search, filters }) => {
        const params: Record<string, any> = {
          page,
          limit:  rows,
          range:  filters.range,
        };

        if (search) params.search = search;

        // Status tab — sent server-side instead of filtered client-side
        // on the current page only (which was the bug in the original)
        if (filters.status !== "All") {
          params.status = filters.status;
        }

        if (filters.range === "custom") {
          if (filters.fromDate) {
            params.fromDate = filters.fromDate.toISOString().split("T")[0];
          }
          if (filters.toDate) {
            params.toDate = filters.toDate.toISOString().split("T")[0];
          }
        }

        const response = await getSyncStatus(params);
        return {
          data:  response.data ?? [],
          total: response.pagination?.total ?? 0,
        };
      },
      [],
    ),

    onError: useCallback((err: any) => {
      console.error("Failed to load sync logs:", err);
    }, []),
  });

  // ── KPI counts ──────────────────────────────────────────
  // NOTE: these now only reflect the CURRENT PAGE's data, same
  // limitation as before. If you want true totals across all
  // pages/statuses, add a dedicated GET /sap-sync/counts endpoint
  // (same pattern as ASN/vendor counts elsewhere in the app) and
  // fetch it once, independent of this table's pagination.
  const counts = useMemo(
    () => ({
      runs:     new Set(logs.map((l) => l.runId)).size,
      success:  logs.filter((l) => l.status === "success").length,
      partial:  logs.filter((l) => l.status === "partial").length,
      failed:   logs.filter((l) => l.status === "failed").length,
      started:  logs.filter((l) => l.status === "started").length,
    }),
    [logs],
  );

  const kpiCards = useMemo(
    () => [
      {
        label:  "Total files",
        value:  totalRecords,
        color:  "text-foreground",
        bg:     "bg-muted",
        icon:   "pi pi-file",
        status: "All" as TabStatus,
      },
      {
        label:  "Unique runs",
        value:  counts.runs,
        color:  "text-blue-600",
        bg:     "bg-blue-50",
        icon:   "pi pi-refresh",
        status: null,
      },
      {
        label:  "Success",
        value:  counts.success,
        color:  "text-green-600",
        bg:     "bg-green-50",
        icon:   "pi pi-check-circle",
        status: "success" as TabStatus,
      },
      {
        label:  "Partial",
        value:  counts.partial,
        color:  "text-amber-600",
        bg:     "bg-amber-50",
        icon:   "pi pi-exclamation-circle",
        status: "partial" as TabStatus,
      },
      {
        label:  "Failed",
        value:  counts.failed,
        color:  "text-red-600",
        bg:     "bg-red-50",
        icon:   "pi pi-times-circle",
        status: "failed" as TabStatus,
      },
    ],
    [counts, totalRecords],
  );

  const rowExpansionTemplate = (row: SyncLog) => (
    <ExpandedTable<FailedRow>
      title={`Failed rows — ${row.fileName}`}
      data={row.failedRows ?? []}
      columns={failedRowColumns}
    />
  );

  return (
    <div className="page-container py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SAP sync logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Purchase order synchronisation history and failed row details.
          </p>
        </div>
      </div>

      {/* KPI Cards — clicking sets the status filter, which now
          auto-resets to page 1 via the hook */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`card p-5 transition-all hover:shadow-md
                        ${card.status ? "cursor-pointer" : "cursor-default"}
                        ${filters.status === card.status ? "ring-2 ring-primary" : ""}`}
            onClick={() => card.status && setFilter("status", card.status)}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <h3 className={`text-2xl font-bold mt-1 ${card.color}`}>
                  {card.value}
                </h3>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <i className={`${card.icon} ${card.color} text-sm`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <Dropdown
          value={filters.range}
          options={RANGE_OPTIONS}
          onChange={(e) => {
            setFilter("range", e.value);
            if (e.value !== "custom") {
              setFilter("fromDate", null);
              setFilter("toDate", null);
            }
          }}
          className="w-44"
        />

        {filters.range === "custom" && (
          <>
            <Calendar
              value={filters.fromDate}
              onChange={(e) => setFilter("fromDate", (e.value as Date) ?? null)}
              placeholder="From date"
              showIcon
              maxDate={filters.toDate ?? new Date()}
              className="w-44"
            />
            <Calendar
              value={filters.toDate}
              onChange={(e) => setFilter("toDate", (e.value as Date) ?? null)}
              placeholder="To date"
              showIcon
              minDate={filters.fromDate ?? undefined}
              maxDate={new Date()}
              className="w-44"
            />
            {(filters.fromDate || filters.toDate) && (
              <Button
                label="Clear dates"
                text
                icon="pi pi-times"
                size="small"
                onClick={() => {
                  setFilter("fromDate", null);
                  setFilter("toDate", null);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Table */}
      <AppTable
        data={logs}
        loading={loading}
        rows={rows}
        lazy
        totalRecords={totalRecords}
        globalSearch
        onSearchChange={setSearch}
        onPageChange={onPageChange}
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
              <span className="font-mono text-xs text-muted-foreground" title={row.fileName}>
                {row.fileName.length > 36 ? row.fileName.slice(0, 36) + "…" : row.fileName}
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
              <span className={row.failedRecords > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                {row.failedRecords > 0 ? row.failedRecords : "—"}
              </span>
            ),
          },
          {
            field: "startedAt",
            header: "Started at",
            body: (row: SyncLog) => (
              <span className="text-xs text-muted-foreground">{formatDateTime(row.startedAt)}</span>
            ),
          },
          {
            field: "completedAt",
            header: "Completed at",
            body: (row: SyncLog) => (
              <span className="text-xs text-muted-foreground">{formatDateTime(row.completedAt)}</span>
            ),
          },
          {
            field: "durationMs",
            header: "Duration",
            body: (row: SyncLog) => (
              <span className="text-xs text-muted-foreground">{formatDuration(row.durationMs)}</span>
            ),
          },
          {
            field: "status",
            header: "Status",
            body: (row: SyncLog) => {
              const badge = STATUS_BADGE[row.status];
              return (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${badge.className}`}>
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