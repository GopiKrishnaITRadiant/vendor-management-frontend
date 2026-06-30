import type { RecentAsnStatus } from "../../../types/vendorDashboardTypes";

export const ASN_STATUS_STYLE: Record<RecentAsnStatus, string> = {
  draft:     "bg-gray-50 text-gray-700",
  submitted: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  approved:  "bg-green-50 text-green-700",
  rejected:  "bg-red-50 text-red-700",
  shipped:   "bg-indigo-50 text-indigo-700",
  delivered: "bg-teal-50 text-teal-700",
};

export const ASN_STATUS_ICON: Record<RecentAsnStatus, string> = {
  draft:     "pi pi-file",
  submitted: "pi pi-clock",
  confirmed: "pi pi-search",
  approved:  "pi pi-check-circle",
  rejected:  "pi pi-times-circle",
  shipped:   "pi pi-truck",
  delivered: "pi pi-box",
};