import type { UserStatus } from "../../../types/sharedTypes";

export const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
  { label: "Pending Verification", value: "pending_verification" },
];

export const STATUS_BADGE: Record<UserStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-700" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-600" },
  suspended: { label: "Suspended", className: "bg-red-100 text-red-700" },
  pending_verification: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
  },
};

export const VENDOR_DASHBOARD_CARDS = [
  {
    label: "Total Vendors",
    key: "total",
    color: "text-foreground",
  },
  {
    label: "Active",
    key: "active",
    color: "text-success",
  },
  {
    label: "Inactive",
    key: "inactive",
    color: "text-muted-foreground",
  },
  {
    label: "Suspended",
    key: "suspended",
    color: "text-danger",
  },
  {
    label: "Pending",
    key: "pending",
    color: "text-warning",
  },
] as const;