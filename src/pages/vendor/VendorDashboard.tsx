import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useAuth } from "../../context/AuthContext";

// ─── Types ───────────────────────────────────────────────

type Period = "weekly" | "monthly" | "yearly";

type RecentASN = {
  id: number;
  asnNumber: string;
  poNumber: string;
  shipDate: string;
  carrier: string;
  status: "Pending" | "Approved" | "Rejected" | "Under Review";
};

// ─── Chart Data ──────────────────────────────────────────

const chartData: Record<Period, { label: string; submitted: number; approved: number; rejected: number }[]> = {
  weekly: [
    { label: "Mon", submitted: 2, approved: 1, rejected: 0 },
    { label: "Tue", submitted: 3, approved: 3, rejected: 0 },
    { label: "Wed", submitted: 1, approved: 1, rejected: 1 },
    { label: "Thu", submitted: 4, approved: 2, rejected: 0 },
    { label: "Fri", submitted: 3, approved: 3, rejected: 1 },
    { label: "Sat", submitted: 1, approved: 0, rejected: 0 },
    { label: "Sun", submitted: 0, approved: 0, rejected: 0 },
  ],
  monthly: [
    { label: "Jan", submitted: 8,  approved: 7,  rejected: 1 },
    { label: "Feb", submitted: 12, approved: 10, rejected: 2 },
    { label: "Mar", submitted: 9,  approved: 8,  rejected: 1 },
    { label: "Apr", submitted: 14, approved: 12, rejected: 2 },
    { label: "May", submitted: 11, approved: 9,  rejected: 2 },
    { label: "Jun", submitted: 15, approved: 13, rejected: 1 },
    { label: "Jul", submitted: 10, approved: 9,  rejected: 1 },
    { label: "Aug", submitted: 13, approved: 11, rejected: 2 },
    { label: "Sep", submitted: 7,  approved: 6,  rejected: 1 },
    { label: "Oct", submitted: 16, approved: 14, rejected: 2 },
    { label: "Nov", submitted: 12, approved: 10, rejected: 2 },
    { label: "Dec", submitted: 9,  approved: 8,  rejected: 1 },
  ],
  yearly: [
    { label: "2020", submitted: 48, approved: 42, rejected: 6 },
    { label: "2021", submitted: 72, approved: 65, rejected: 7 },
    { label: "2022", submitted: 95, approved: 88, rejected: 7 },
    { label: "2023", submitted: 118, approved: 108, rejected: 10 },
    { label: "2024", submitted: 126, approved: 115, rejected: 11 },
  ],
};

// ─── Mock ASN Data ───────────────────────────────────────

const recentASNs: RecentASN[] = [
  { id: 1, asnNumber: "ASN-2024-00125", poNumber: "PO10006", shipDate: "2024-06-20", carrier: "FedEx",    status: "Pending" },
  { id: 2, asnNumber: "ASN-2024-00123", poNumber: "PO10001", shipDate: "2024-06-15", carrier: "FedEx",    status: "Under Review" },
  { id: 3, asnNumber: "ASN-2024-00118", poNumber: "PO10005", shipDate: "2024-06-10", carrier: "UPS",      status: "Rejected" },
  { id: 4, asnNumber: "ASN-2024-00110", poNumber: "PO10003", shipDate: "2024-06-01", carrier: "DHL",      status: "Approved" },
];

// ─── Helpers ─────────────────────────────────────────────

const ASN_STATUS_STYLE: Record<RecentASN["status"], string> = {
  Pending:        "bg-amber-50 text-amber-700",
  "Under Review": "bg-blue-50 text-blue-700",
  Approved:       "bg-green-50 text-green-700",
  Rejected:       "bg-red-50 text-red-700",
};

const ASN_STATUS_ICON: Record<RecentASN["status"], string> = {
  Pending:        "pi pi-clock",
  "Under Review": "pi pi-search",
  Approved:       "pi pi-check-circle",
  Rejected:       "pi pi-times-circle",
};

function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── Bar Chart ───────────────────────────────────────────

type BarChartProps = {
  data: { label: string; submitted: number; approved: number; rejected: number }[];
};

function BarChart({ data }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.submitted), 1);
  const BAR_HEIGHT = 160; // px

  return (
    <div className="w-full">
      {/* Y-axis labels + bars */}
      <div className="flex items-end gap-1 sm:gap-2" style={{ height: BAR_HEIGHT + 24 }}>
        {/* Y axis */}
        <div className="flex flex-col justify-between text-right pr-2 shrink-0" style={{ height: BAR_HEIGHT }}>
          {[maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0].map((v) => (
            <span key={v} className="text-xs text-muted-foreground leading-none">{v}</span>
          ))}
        </div>

        {/* Grid + bars area */}
        <div className="flex-1 relative" style={{ height: BAR_HEIGHT + 24 }}>
          {/* Horizontal grid lines */}
          <div className="absolute inset-x-0 top-0 flex flex-col justify-between pointer-events-none" style={{ height: BAR_HEIGHT }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full border-t border-border/50" />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-x-0 top-0 flex items-end gap-1 sm:gap-2 px-1" style={{ height: BAR_HEIGHT }}>
            {data.map((d) => (
              <div key={d.label} className="flex-1 flex items-end justify-center gap-0.5">
                {/* Submitted */}
                <div className="group relative flex-1 flex items-end">
                  <div
                    className="w-full rounded-t bg-primary/70 hover:bg-primary transition-all cursor-pointer"
                    style={{ height: `${(d.submitted / maxVal) * BAR_HEIGHT}px`, minHeight: d.submitted > 0 ? "4px" : "0" }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap shadow">
                        Submitted: {d.submitted}
                      </div>
                      <div className="w-1.5 h-1.5 bg-foreground rotate-45 -mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* Approved */}
                <div className="group relative flex-1 flex items-end">
                  <div
                    className="w-full rounded-t bg-green-400 hover:bg-green-500 transition-all cursor-pointer"
                    style={{ height: `${(d.approved / maxVal) * BAR_HEIGHT}px`, minHeight: d.approved > 0 ? "4px" : "0" }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap shadow">
                        Approved: {d.approved}
                      </div>
                      <div className="w-1.5 h-1.5 bg-foreground rotate-45 -mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* Rejected */}
                <div className="group relative flex-1 flex items-end">
                  <div
                    className="w-full rounded-t bg-red-400 hover:bg-red-500 transition-all cursor-pointer"
                    style={{ height: `${(d.rejected / maxVal) * BAR_HEIGHT}px`, minHeight: d.rejected > 0 ? "4px" : "0" }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap shadow">
                        Rejected: {d.rejected}
                      </div>
                      <div className="w-1.5 h-1.5 bg-foreground rotate-45 -mt-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="absolute inset-x-0 flex gap-1 sm:gap-2 px-1" style={{ top: BAR_HEIGHT + 6 }}>
            {data.map((d) => (
              <div key={d.label} className="flex-1 text-center">
                <span className="text-xs text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("monthly");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const data = chartData[period];
  const totalSubmitted = data.reduce((s, d) => s + d.submitted, 0);
  const totalApproved  = data.reduce((s, d) => s + d.approved, 0);
  const totalRejected  = data.reduce((s, d) => s + d.rejected, 0);
  const approvalRate   = totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 100) : 0;

  return (
    <div className="page-container py-6 space-y-6">
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Open Orders",       value: "7",  sub: "Awaiting ASN",       icon: "pi pi-file-edit",    accent: "text-blue-600",   bg: "bg-blue-50" },
          { label: "ASNs Submitted",    value: "12", sub: "This month",          icon: "pi pi-send",         accent: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Pending Approval",  value: "2",  sub: "With Cipla team",     icon: "pi pi-clock",        accent: "text-purple-600", bg: "bg-purple-50" },
          { label: "Completed",         value: "38", sub: "All time",            icon: "pi pi-check-circle", accent: "text-green-600",  bg: "bg-green-50" },
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

          {/* Chart header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">ASN Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Submitted vs approved vs rejected</p>
            </div>

            {/* Period toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
              {(["weekly", "monthly", "yearly"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                    period === p
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "weekly" ? "Week" : p === "monthly" ? "Month" : "Year"}
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
          <BarChart data={data} />
        </div>

        {/* ── RECENT ASN ACTIVITY ─────────────────────── */}
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
            {recentASNs.map((asn) => (
              <div
                key={asn.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate("/asn/history")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ASN_STATUS_STYLE[asn.status]}`}>
                    <i className={`${ASN_STATUS_ICON[asn.status]} text-xs`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight truncate">{asn.asnNumber}</p>
                    <p className="text-xs text-muted-foreground">{asn.poNumber} · {asn.carrier}</p>
                  </div>
                </div>
                <StatusBadge label={asn.status} className={`shrink-0 ml-2 ${ASN_STATUS_STYLE[asn.status]}`} />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Ready to ship?</p>
                <p className="text-xs text-muted-foreground">Create a new ASN</p>
              </div>
              <Button label="Start" icon="pi pi-plus" size="small" onClick={() => navigate("/purchase-orders")} />
            </div>
          </div>
        </div>
      </div>

      {/* DELIVERY PERFORMANCE */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Your Performance This Quarter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "On-Time Delivery",  value: 94, color: "bg-green-500" },
            { label: "ASN Approval Rate", value: 88, color: "bg-blue-500" },
            { label: "Order Fulfilment",  value: 97, color: "bg-purple-500" },
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