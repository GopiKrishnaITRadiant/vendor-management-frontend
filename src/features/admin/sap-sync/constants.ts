import type { SyncLogRange } from "./types";

//Constants
export const RANGE_OPTIONS: { label: string; value: SyncLogRange }[] = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "week" },
  { label: "Last month", value: "month" },
  { label: "Last quarter", value: "quarter" },
  { label: "Last year", value: "year" },
  { label: "Custom range", value: "custom" },
];