import { apiFetch } from "../api/client";

type SyncLogsParams = {
  page?:     number;
  limit?:    number;
  range?:    "today" | "week" | "month" | "quarter" | "year" | "custom";
  fromDate?: string;   // YYYY-MM-DD
  toDate?:   string;   // YYYY-MM-DD
};

export async function getSyncStatus(params: SyncLogsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }

  if (params.range) {
    searchParams.set("range", params.range);
  }

  if (params.fromDate) {
    searchParams.set("fromDate", params.fromDate);
  }

  if (params.toDate) {
    searchParams.set("toDate", params.toDate);
  }

  const url = `/sap-sync/logs?${searchParams.toString()}`;

  const response = await apiFetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? "Failed to fetch sync status");
  }

  return data.data;
}

export const getSyncFailedRows = async () => {
  const res = await apiFetch("/sap-sync/logs/failed-rows");
  const data = await res.json().catch(() => ({}));
console.log(data)
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch sync status");
  }

  return data.data;
};

export const getSyncStats = async () => {
  const res = await apiFetch("/sap-sync/stats");
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch sync stats");
  }

  return data.data;
};
