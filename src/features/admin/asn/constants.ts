import type { ASNStatus } from "../../../types/asnTypes";

export const STATUS_OPTIONS = [
  // { label: "All",       value: null },
  { label: "Draft",     value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Rejected",  value: "rejected" },
  { label: "Shipped",   value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export const STATUS_BADGE: Record<ASNStatus, { label: string; className: string }> = {
  draft:     { label: "Draft",      className: "bg-gray-100 text-gray-600" },
  submitted: { label: "Submitted",  className: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmed",  className: "bg-green-100 text-green-700" },
  rejected:  { label: "Rejected",   className: "bg-red-100 text-red-700" },
  shipped:   { label: "Shipped",    className: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered",  className: "bg-teal-100 text-teal-700" },
  cancelled: { label: "Cancelled",  className: "bg-gray-100 text-gray-500" },
};
