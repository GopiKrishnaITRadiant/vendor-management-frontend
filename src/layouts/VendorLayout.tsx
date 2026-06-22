import { useState, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", icon: "pi pi-home", path: "/vendor-dashboard" },
  { label: "Purchase Orders", icon: "pi pi-file", path: "/purchase-orders" },
  { label: "Create ASN", icon: "pi pi-plus-circle", path: "/asn/create" },
  { label: "ASN History", icon: "pi pi-history", path: "/asn/history" },
];

export default function VendorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<Menu>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userMenuItems = [
    {
      label: user?.fullName ?? "Account",
      items: [
        { label: "Profile", icon: "pi pi-user", command: () => navigate("/profile") },
        { label: "Settings", icon: "pi pi-cog", command: () => navigate("/settings") },
        { separator: true },
        { label: "Logout", icon: "pi pi-sign-out", command: () => { logout(); navigate("/"); } },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* SIDEBAR */}
      <aside className={`flex flex-col bg-card border-r border-border transition-all duration-300 shrink-0 ${sidebarOpen ? "w-56" : "w-16"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <i className="pi pi-box text-white text-sm" />
          </div>
          {sidebarOpen && <span className="font-bold text-foreground text-sm tracking-tight">VendorPortal</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <i className={`${item.icon} text-base shrink-0`} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Vendor info + collapse */}
        <div className="border-t border-border p-3 space-y-2">
          {sidebarOpen && (
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-foreground truncate">{user?.id}</p>
              {/* <p className="text-xs text-muted-foreground">Cipla Procurement</p> */}
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-sm"
          >
            <i className={`pi ${sidebarOpen ? "pi-chevron-left" : "pi-chevron-right"} text-xs`} />
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border shrink-0">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Vendor Portal</p>

          <div className="flex items-center gap-2">
            <Button icon="pi pi-bell" rounded text severity="secondary" badge="2" badgeClassName="p-badge-danger" />
            <Menu model={userMenuItems} popup ref={menuRef} />
            <button
              onClick={(e) => menuRef.current?.toggle(e)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar label={user?.fullName.charAt(0).toUpperCase()} size="normal" shape="circle" className="bg-primary text-white" />
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-foreground leading-tight">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground leading-tight">{user?.id}</p>
              </div>
              <i className="pi pi-chevron-down text-xs text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}