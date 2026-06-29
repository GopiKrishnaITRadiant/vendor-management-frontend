import type { SyncStatus, TabStatus } from "../types/sapSyncLogTypes";

export const STATUS_BADGE: Record<SyncStatus, { label: string; className: string }> = {
  started: { label: "Running", className: "bg-blue-100 text-blue-700" },
  success: { label: "Success", className: "bg-green-100 text-green-700" },
  partial: { label: "Partial", className: "bg-amber-100 text-amber-700" },
  failed: { label: "Failed", className: "bg-red-100 text-red-700" },
};

export const TABS: { label: string; status: TabStatus }[] = [
  { label: "All", status: "All" },
  { label: "Success", status: "success" },
  { label: "Partial", status: "partial" },
  { label: "Failed", status: "failed" },
  { label: "Running", status: "started" },
];
