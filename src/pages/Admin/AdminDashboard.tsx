import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { BarChart } from "../../components/vendor/dashboard/BarChart";
import { getAdminDashboard } from "../../services/DashboardService";
import { useAuth } from "../../context/AuthContext";

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

const activityIcon: Record<ActivityType, { icon: string; color: string }> = {
  CREATED: { icon: "pi pi-plus-circle", color: "text-primary" },
  SUBMITTED: { icon: "pi pi-send", color: "text-warning" },
  APPROVED: { icon: "pi pi-check-circle", color: "text-success" },
  REJECTED: { icon: "pi pi-times-circle", color: "text-danger" },
  UPDATED: { icon: "pi pi-pencil", color: "text-info" },
};

export default function AdminDashboardPage() {
  const {isLoading,isAuthenticated}=useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        if (isLoading || !isAuthenticated) return;

        const dashboardRes = await getAdminDashboard();
        setDashboard(dashboardRes);
      } catch (error) {
        console.error("Dashboard API Error:", error);
      }
    };
    loadDashboard();
  }, [isLoading, isAuthenticated]);

  const chartData = useMemo(() => {
    return (dashboard?.monthlyActivity ?? []).map((m) => ({
      label: m.month,
      submitted: m.submitted,
      approved: m.approved,
      rejected: m.rejected,
    }));
  }, [dashboard?.monthlyActivity]);

  return (
    <div className="page-container py-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of procurement activity
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            label="View POs"
            icon="pi pi-file"
            outlined
            onClick={() => navigate("/admin/purchase-orders")}
          />
          <Button
            label="ASN Approvals"
            icon="pi pi-inbox"
            onClick={() => navigate("/admin/asn-approvals")}
          />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total POs",
            value: dashboard?.stats?.totalPOs ?? "—",
            sub: `${dashboard?.stats?.totalPOsThisWeek ?? 0} this week`,
            icon: "pi pi-file",
            accent: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Pending ASNs",
            value: dashboard?.stats?.pendingASNs ?? "—",
            sub: "Awaiting approval",
            icon: "pi pi-clock",
            accent: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Active Vendors",
            value: dashboard?.stats?.activeVendors ?? "—",
            sub: `${dashboard?.stats?.suspendedVendors ?? 0} suspended`,
            icon: "pi pi-building",
            accent: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Completed Orders",
            value: dashboard?.stats?.completedOrders ?? "—",
            sub: `This month ${dashboard?.stats?.completedThisMonth ?? 0}`,
            icon: "pi pi-check-circle",
            accent: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">
                  {card.value}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
              >
                <i className={`${card.icon} ${card.accent} text-lg`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ASN TREND CHART */}
        <div className="card p-5 xl:col-span-2 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Monthly ASN Activity
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submitted vs approved vs rejected
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Submitted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success inline-block" />
                Approved
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-danger inline-block" />
                Rejected
              </span>
            </div>
          </div>

          <BarChart data={chartData} />
        </div>

        {/* RECENT ACTIVITY */}
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {dashboard?.recentActivity?.length ? (
              dashboard.recentActivity.map((item, i) => {
                const { icon, color } = activityIcon[item.activityType];
                return (
                  <div key={i} className="flex items-start gap-3">
                    <i className={`${icon} ${color} mt-0.5 text-sm`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-tight">
                        ASN {item.asnNumber} ({item.poNo})
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.activityType} • {item.status}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                No recent activity found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* TOP VENDORS */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Top Vendors by Orders
          </h2>
          <Button
            label="Manage Vendors"
            text
            size="small"
            onClick={() => navigate("/admin/vendors")}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Vendor
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Orders
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  On-Time
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  ASNs
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.topVendors?.length ? (
                dashboard.topVendors.map((v, i) => (
                  <tr
                    key={v.vendorId}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      <span className="text-xs text-muted-foreground mr-2">
                        #{i + 1}
                      </span>
                      {v.vendorName}
                    </td>
                    <td className="py-2.5 px-3 text-right">{v.totalOrders}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full"
                            style={{ width: `${v.onTimeRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {v.onTimeRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">{v.totalASNs}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-xs text-muted-foreground"
                  >
                    No vendor data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}