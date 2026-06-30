import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useAuth } from "../../../context/AuthContext";
import type { ActivityPeriod, RecentAsn, VendorDashboardResponse } from "../../../types/vendorDashboardTypes";
import { BarChart } from "../../../components/vendor/dashboard/BarChart";
import { ASN_STATUS_ICON, ASN_STATUS_STYLE } from "./vendor-dashborad.constants";
import { getVendorDashboard } from "../../../services/DashboardService";


function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export default function VendorDashboardPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [period, setPeriod] = useState<ActivityPeriod>("month");
  const [dashboard, setDashboard] = useState<VendorDashboardResponse["data"] | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    loadDashboard();
  }, [period, isLoading, isAuthenticated]);

  const loadDashboard = async () => {
    try {
      const res = await getVendorDashboard(period);
      setDashboard(res);
    } catch (error) {
      console.error("Dashboard API Error:", error);
    }
  };

  const totalSubmitted = dashboard?.totalSubmitted ?? 0;
  const totalApproved  = dashboard?.totalApproved  ?? 0;
  const totalRejected  = dashboard?.totalRejected  ?? 0;
  const approvalRate   = dashboard?.approvalRate   ?? 0;

  const chartData = (dashboard?.asnActivity ?? []).map((d) => ({
    label:     d.month,
    submitted: d.submitted,
    approved:  d.approved,
    rejected:  d.rejected,
  }));
  const recentASNs = dashboard?.recentASNs   ?? [];
  const stats      = dashboard?.stats;
  const perf       = dashboard?.performance;

  return (
    <div className="page-container py-6 space-y-6">

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label:  "Open Orders",
            value:  stats?.openOrders      ?? "—",
            sub:    "Awaiting ASN",
            icon:   "pi pi-file-edit",
            accent: "text-blue-600",
            bg:     "bg-blue-50",
          },
          {
            label:  "ASNs Submitted",
            value:  stats?.asnsSubmitted   ?? "—",
            sub:    "This month",
            icon:   "pi pi-send",
            accent: "text-amber-600",
            bg:     "bg-amber-50",
          },
          {
            label:  "Pending Approval",
            value:  stats?.pendingApproval ?? "—",
            sub:    "With Cipla team",
            icon:   "pi pi-clock",
            accent: "text-purple-600",
            bg:     "bg-purple-50",
          },
          {
            label:  "Completed",
            value:  stats?.completedAllTime ?? "—",
            sub:    "All time",
            icon:   "pi pi-check-circle",
            accent: "text-green-600",
            bg:     "bg-green-50",
          },
        ].map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{card.value}</h3>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <i className={`${card.icon} ${card.accent} text-lg`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── ASN ACTIVITY CHART ──────────────────────── */}
        <div className="card p-5 space-y-5 xl:col-span-2">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">ASN Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submitted vs approved vs rejected
              </p>
            </div>

            {/* Period toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
              {(["week", "month", "year"] as ActivityPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                    period === p
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "week" ? "Week" : p === "month" ? "Month" : "Year"}
                </button>
              ))}
            </div>
          </div>

          {/* Summary numbers */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary/70" />
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-sm font-bold text-foreground">{totalSubmitted}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-400" />
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-sm font-bold text-green-600">{totalApproved}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-400" />
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-sm font-bold text-red-600">{totalRejected}</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">Approval Rate</p>
              <p className="text-lg font-bold text-foreground">{approvalRate}%</p>
            </div>
          </div>

          {/* Bar chart */}
          <BarChart data={chartData} />
        </div>

        {/* ── RECENT ASNs ─────────────────────────────── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent ASNs</h2>
            <Button
              label="View all"
              text
              size="small"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={() => navigate("/asn/history")}
            />
          </div>

          <div className="space-y-2">
            {recentASNs.length > 0 ? (
              recentASNs.map((asn: RecentAsn) => (
                <div
                  key={asn.asnNumber}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/asn/history")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ASN_STATUS_STYLE[asn.status]}`}
                    >
                      <i className={`${ASN_STATUS_ICON[asn.status]} text-xs`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight truncate">
                        {asn.asnNumber}
                      </p>
                      {/* poNo & carrierName match the API shape */}
                      <p className="text-xs text-muted-foreground">
                        {asn.poNo} · {asn.carrierName}
                      </p>
                    </div>
                  </div>
                  {/* statusLabel is the human-readable label from the API */}
                  <StatusBadge
                    label={asn.statusLabel}
                    className={`shrink-0 ml-2 ${ASN_STATUS_STYLE[asn.status]}`}
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                No recent ASNs found.
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Ready to ship?</p>
                <p className="text-xs text-muted-foreground">Create a new ASN</p>
              </div>
              <Button
                label="Start"
                icon="pi pi-plus"
                size="small"
                onClick={() => navigate("/purchase-orders")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DELIVERY PERFORMANCE */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">
          Your Performance This Quarter
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "On-Time Delivery",  value: perf?.onTimeDelivery  ?? 0, color: "bg-green-500" },
            { label: "ASN Approval Rate", value: perf?.asnApprovalRate ?? 0, color: "bg-blue-500"  },
            { label: "Order Fulfilment",  value: perf?.orderFulfilment ?? 0, color: "bg-purple-500" },
          ].map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-sm font-bold text-foreground">{metric.value}%</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${metric.color}`}
                  style={{ width: `${metric.value}%`, transition: "width 0.6s ease" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}