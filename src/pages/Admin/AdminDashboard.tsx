import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

// ─── Types ───────────────────────────────────────────────

type ActivityItem = {
  id: number;
  type: "asn_submitted" | "asn_approved" | "asn_rejected" | "vendor_added" | "po_created";
  message: string;
  user: string;
  time: string;
};

type TopVendor = {
  name: string;
  orders: number;
  onTime: number;
  asns: number;
};

// ─── Mock Data ───────────────────────────────────────────

const recentActivity: ActivityItem[] = [
  { id: 1, type: "asn_submitted", message: "ASN-2024-00126 submitted", user: "Exelan Pharma", time: "5 min ago" },
  { id: 2, type: "asn_approved", message: "ASN-2024-00120 approved", user: "Admin • Ravi", time: "23 min ago" },
  { id: 3, type: "po_created", message: "PO10012 created for Exelan Pharma", user: "Admin • Priya", time: "1 hr ago" },
  { id: 4, type: "asn_rejected", message: "ASN-2024-00118 rejected", user: "Admin • Ravi", time: "2 hr ago" },
  { id: 5, type: "vendor_added", message: "GlobalChem Inc added as vendor", user: "Admin • Priya", time: "Yesterday" },
  { id: 6, type: "asn_submitted", message: "ASN-2024-00125 submitted", user: "GlobalChem Inc", time: "Yesterday" },
];

const topVendors: TopVendor[] = [
  { name: "Exelan Pharma", orders: 142, onTime: 94, asns: 38 },
  { name: "Health Corp", orders: 98, onTime: 88, asns: 26 },
  { name: "Medi Supplies", orders: 76, onTime: 91, asns: 19 },
  { name: "GlobalChem Inc", orders: 61, onTime: 96, asns: 15 },
  { name: "BioGen Labs", orders: 34, onTime: 79, asns: 9 },
];

const monthlyASN = [
  { month: "Jan", submitted: 28, approved: 24, rejected: 4 },
  { month: "Feb", submitted: 35, approved: 30, rejected: 5 },
  { month: "Mar", submitted: 42, approved: 38, rejected: 4 },
  { month: "Apr", submitted: 38, approved: 33, rejected: 5 },
  { month: "May", submitted: 51, approved: 44, rejected: 7 },
  { month: "Jun", submitted: 46, approved: 39, rejected: 7 },
];

// ─── Helpers ─────────────────────────────────────────────

const activityIcon: Record<ActivityItem["type"], { icon: string; color: string }> = {
  asn_submitted: { icon: "pi pi-inbox", color: "text-primary" },
  asn_approved: { icon: "pi pi-check-circle", color: "text-success" },
  asn_rejected: { icon: "pi pi-times-circle", color: "text-danger" },
  vendor_added: { icon: "pi pi-building", color: "text-warning" },
  po_created: { icon: "pi pi-file", color: "text-muted-foreground" },
};

const BAR_MAX = 55;

// ─── Component ───────────────────────────────────────────

export default function AdminDashboardPage() {
  const navigate = useNavigate();

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
          { label: "Total POs", value: "1,245", sub: "+12 this week", icon: "pi pi-file", color: "text-primary" },
          { label: "Pending ASNs", value: "8", sub: "Awaiting approval", icon: "pi pi-clock", color: "text-warning" },
          { label: "Active Vendors", value: "24", sub: "3 suspended", icon: "pi pi-building", color: "text-success" },
          { label: "Completed Orders", value: "191", sub: "This month", icon: "pi pi-check-circle", color: "text-success" },
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
            {monthlyASN.map((m) => (
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
            {recentActivity.map((item) => {
              const { icon, color } = activityIcon[item.type];
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <i className={`${icon} ${color} mt-0.5 text-sm`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-tight">{item.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.user} · {item.time}</p>
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
              {topVendors.map((v, i) => (
                <tr key={v.name} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    <span className="text-xs text-muted-foreground mr-2">#{i + 1}</span>
                    {v.name}
                  </td>
                  <td className="py-2.5 px-3 text-right">{v.orders}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full"
                          style={{ width: `${v.onTime}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{v.onTime}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">{v.asns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}