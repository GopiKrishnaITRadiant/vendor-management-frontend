export interface DashboardStats {
  totalPOs: number;
  totalPOsThisWeek: number;
  pendingASNs: number;
  activeVendors: number;
  suspendedVendors: number;
  completedOrders: number;
  completedThisMonth: number;
}

export interface POSummary {
  totalPOLines: number;
  open: number;
  inProgress: number;
  completed: number;
}

export interface MonthlyActivity {
  month: string;
  submitted: number;
  approved: number;
  rejected: number;
}

export type ActivityType =
  | "CREATED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "UPDATED";

export interface RecentActivity {
  asnId: number;
  asnNumber: string;
  poNo: string;
  status: string;
  activityType: ActivityType;
  activityDate: string;
}

export interface TopVendor {
  rank: number;
  vendorId: number;
  vendorNo: string | null;
  vendorName: string;
  totalOrders: number;
  totalASNs: number;
  deliveredASNs: number;
  onTimeRate: number;
}

export interface AdminDashboardResponse {
  stats: DashboardStats;
  poSummary: POSummary;
  monthlyActivity: MonthlyActivity[];
  recentActivity: RecentActivity[];
  topVendors: TopVendor[];
}
