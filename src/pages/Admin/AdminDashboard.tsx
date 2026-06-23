import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import {getAdminDashboard, getPOSummary} from "../../services/DashboardService";

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

// ─── Helpers ─────────────────────────────────────────────
const activityIcon: Record<
  ActivityType,
  { icon: string; color: string }
> = {
  CREATED: {
    icon: "pi pi-plus-circle",
    color: "text-primary",
  },
  SUBMITTED: {
    icon: "pi pi-send",
    color: "text-warning",
  },
  APPROVED: {
    icon: "pi pi-check-circle",
    color: "text-success",
  },
  REJECTED: {
    icon: "pi pi-times-circle",
    color: "text-danger",
  },
  UPDATED: {
    icon: "pi pi-pencil",
    color: "text-info",
  },
};

const BAR_MAX = 55;

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] =
  useState<AdminDashboardResponse | null>(null);

const [monthlyASN, setMonthlyASN] =
  useState<MonthlyActivity[]>([]);
  // const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // setLoading(true);
        const dashboardRes =await getAdminDashboard();

        setDashboard(dashboardRes);
        setMonthlyASN(dashboardRes?.monthlyActivity || []);
      } catch (error) {
        console.error("Dashboard API Error:", error);
      } finally {
        // setLoading(false);
      }
    };

    loadDashboard();
  }, []);

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
          <Button label="View POs" icon="pi pi-file" outlined onClick={() => navigate("/admin/purchase-orders")} />
          <Button label="ASN Approvals" icon="pi pi-inbox" onClick={() => navigate("/admin/asn-approvals")} />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total POs", value: dashboard?.stats?.totalPOs, sub: `${dashboard?.stats?.totalPOsThisWeek??0} this week`, icon: "pi pi-file", color: "text-primary" },
          { label: "Pending ASNs", value: dashboard?.stats?.pendingASNs??0, sub: "Awaiting approval", icon: "pi pi-clock", color: "text-warning" },
          { label: "Active Vendors", value: dashboard?.stats?.activeVendors??0, sub: `${dashboard?.stats?.suspendedVendors??0} suspended`, icon: "pi pi-building", color: "text-success" },
          { label: "Completed Orders", value: dashboard?.stats?.completedOrders??0, sub: `This month ${dashboard?.stats?.completedThisMonth??0} `, icon: "pi pi-check-circle", color: "text-success" },
        ].map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <h3 className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</h3>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>
              <i className={`${card.icon} text-xl text-muted-foreground opacity-40`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ASN TREND CHART */}
        <div className="card p-5 xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Monthly ASN Activity</h2>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Submitted</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" />Approved</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger inline-block" />Rejected</span>
            </div>
          </div>

          <div className="flex items-end gap-3 h-40 pt-2">
            {dashboard?.monthlyActivity?.map((m:any) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-32">
                  <div
                    className="flex-1 rounded-t bg-primary opacity-80"
                    style={{ height: `${(m.submitted / BAR_MAX) * 100}%` }}
                    title={`Submitted: ${m.submitted}`}
                  />
                  <div
                    className="flex-1 rounded-t bg-success opacity-80"
                    style={{ height: `${(m.approved / BAR_MAX) * 100}%` }}
                    title={`Approved: ${m.approved}`}
                  />
                  <div
                    className="flex-1 rounded-t bg-danger opacity-80"
                    style={{ height: `${(m.rejected / BAR_MAX) * 100}%` }}
                    title={`Rejected: ${m.rejected}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          <div className="space-y-3">
            {dashboard?.recentActivity.map((item,i) => {
              const { icon, color } = activityIcon[item.activityType];
              return (
                <div key={i} className="flex items-start gap-3">
                  <i className={`${icon} ${color} mt-0.5 text-sm`} />
                  <div className="flex-1 min-w-0">
                    {/* <p className="text-sm text-foreground leading-tight">{item.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.user} · {item.time}</p> */}
                    <p className="text-sm text-foreground leading-tight">
                      ASN {item.asnNumber} ({item.poNo})
                    </p>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.activityType} • {item.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TOP VENDORS */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Top Vendors by Orders</h2>
          <Button label="Manage Vendors" text size="small" onClick={() => navigate("/admin/vendors")} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vendor</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Orders</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">On-Time</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ASNs</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.topVendors.map((v, i:number) => (
                <tr key={v.vendorId} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    <span className="text-xs text-muted-foreground mr-2">#{i + 1}</span>
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
                      <span className="text-xs text-muted-foreground w-8 text-right">{v.onTimeRate}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">{v.totalASNs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}