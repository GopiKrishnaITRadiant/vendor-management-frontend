import type { ASNStatus } from "../../../types/asnTypes";

export type TabStatus = ASNStatus | "All";

export const STATUS_TABS: Array<{
  label: string;
  value: TabStatus;
}> = [
  { label: "All", value: "All" },
  { label: "Pending", value: "submitted" },
  { label: "Approved", value: "confirmed" },
  { label: "Rejected", value: "rejected" },
];

export const ASN_KPI_CONFIG = [
  {
    label: "All",
    status: "all",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: "pi pi-box",
  },
  {
    label: "Pending",
    status: "submitted",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: "pi pi-clock",
  },
  {
    label: "Approved",
    status: "confirmed",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: "pi pi-check-circle",
  },
  {
    label: "Rejected",
    status: "rejected",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: "pi pi-times-circle",
  },
] as const;
