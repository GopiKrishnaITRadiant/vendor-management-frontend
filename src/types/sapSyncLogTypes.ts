export type SyncStatus = "started" | "success" | "partial" | "failed";
export type TabStatus = SyncStatus | "All";

export type FailedRow = {
  id: number;
  syncLogId: number;
  fileName: string;
  rowNumber: number;
  rawData: { _raw: string };
  errorMessage: string;
  status: string;
  retryCount: number;
  retrySyncLogId: number | null;
  lastRetriedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SyncLog = {
  id: number;
  runId: string;
  fileName: string;
  fileChecksum?: string | null;
  status: SyncStatus;
  totalRecords: number;
  insertedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  failedRows: FailedRow[];
  errors: { row: number; error: string }[];
  startedAt: string;
  completedAt?: string | null;
  durationMs?: number | null;
  createdAt: string;
};