import type { ActivityType } from "./types";

export const activityIcon: Record<ActivityType, { icon: string; color: string }> = {
  CREATED: { icon: "pi pi-plus-circle", color: "text-primary" },
  SUBMITTED: { icon: "pi pi-send", color: "text-warning" },
  APPROVED: { icon: "pi pi-check-circle", color: "text-success" },
  REJECTED: { icon: "pi pi-times-circle", color: "text-danger" },
  UPDATED: { icon: "pi pi-pencil", color: "text-info" },
};

export const DASHBOARD_CARDS = [
  {
    label: "Total POs",
    valueKey: "totalPOs",
    sub: (stats: any) => `${stats?.totalPOsThisWeek ?? 0} this week`,
    icon: "pi pi-file",
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Pending ASNs",
    valueKey: "pendingASNs",
    sub: () => "Awaiting approval",
    icon: "pi pi-clock",
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Active Vendors",
    valueKey: "activeVendors",
    sub: (stats: any) => `${stats?.suspendedVendors ?? 0} suspended`,
    icon: "pi pi-building",
    accent: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Completed Orders",
    valueKey: "completedOrders",
    sub: (stats: any) => `This month ${stats?.completedThisMonth ?? 0}`,
    icon: "pi pi-check-circle",
    accent: "text-purple-600",
    bg: "bg-purple-50",
  },
] as const;