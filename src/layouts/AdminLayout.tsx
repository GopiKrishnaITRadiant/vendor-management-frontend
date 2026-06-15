import { useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useAuth } from "../context/AuthContext";

// ─── Nav Items ───────────────────────────────────────────

type NavItem = {
  label: string;
  icon: string;
  path: string;
  badge?: number;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", icon: "pi pi-home", path: "/admin" },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "ASN Approvals", icon: "pi pi-inbox", path: "/admin/asn-approvals", badge: 8 },
      { label: "Purchase Orders", icon: "pi pi-file", path: "/admin/purchase-orders" },
    ],
  },
  {
    group: "Management",
    items: [
      { label: "Vendors", icon: "pi pi-building", path: "/admin/vendors" },
      { label: "Users & Roles", icon: "pi pi-users", path: "/admin/users" },
    ],
  },
];

// ─── Component ───────────────────────────────────────────

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<Menu>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userMenuItems = [
    {
      label: user?.name ?? "Admin",
      items: [
        { label: "Profile", icon: "pi pi-user", command: () => {} },
        { label: "Settings", icon: "pi pi-cog", command: () => {} },
        { separator: true },
        {
          label: "Logout",
          icon: "pi pi-sign-out",
          command: () => { logout(); navigate("/"); },
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── SIDEBAR ──────────────────────────────────── */}
      <aside
        className={`flex flex-col bg-card border-r border-border transition-all duration-300 shrink-0 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <i className="pi pi-shield text-white text-sm" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-foreground text-sm leading-tight">AdminPanel</p>
              <p className="text-xs text-muted-foreground leading-tight">Cipla Procurement</p>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.group} className="mb-4">
              {sidebarOpen && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 mb-1">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/admin"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <i className={`${item.icon} text-base shrink-0`} />
                        {sidebarOpen && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {item.badge && item.badge > 0 && (
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0 ${
                              isActive
                                ? "bg-white text-primary"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User info + collapse */}
        <div className="border-t border-border p-3 space-y-2">
          {sidebarOpen && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
              <Avatar
                label={user?.name?.charAt(0).toUpperCase()}
                size="normal"
                shape="circle"
                className="bg-primary text-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground leading-tight capitalize">
                  {user?.role}
                </p>
              </div>
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

      {/* ── MAIN ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Admin Portal
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button
              icon="pi pi-bell"
              rounded
              text
              severity="secondary"
              aria-label="Notifications"
              badge="8"
              badgeClassName="p-badge-danger"
            />

            {/* Help */}
            <Button
              icon="pi pi-question-circle"
              rounded
              text
              severity="secondary"
              aria-label="Help"
            />

            {/* User menu */}
            <Menu model={userMenuItems} popup ref={menuRef} />
            <button
              onClick={(e) => menuRef.current?.toggle(e)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar
                label={user?.name?.charAt(0).toUpperCase()}
                size="normal"
                shape="circle"
                className="bg-primary text-white"
              />
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground leading-tight capitalize">
                  {user?.role}
                </p>
              </div>
              <i className="pi pi-chevron-down text-xs text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}