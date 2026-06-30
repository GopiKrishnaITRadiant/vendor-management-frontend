//Types
export type SyncLogRange = "today" | "week" | "month" | "quarter" | "year" | "custom";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
