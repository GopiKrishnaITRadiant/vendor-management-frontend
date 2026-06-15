import { NavLink, useNavigate } from "react-router-dom";

type AdminSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const menus = [
  {
    label: "Dashboard",
    icon: "pi pi-home",
    path: "/admin",
  },
  {
    label: "Purchase Orders",
    icon: "pi pi-shopping-cart",
    path: "/admin/purchase-orders",
  },
  {
    label: "ASN Approvals",
    icon: "pi pi-check-circle",
    path: "/admin/asn-approvals",
  },
  {
    label: "Vendors",
    icon: "pi pi-building",
    path: "/admin/vendors",
  },
  {
    label: "Users",
    icon: "pi pi-users",
    path: "/admin/users",
  },
  {
    label: "Reports",
    icon: "pi pi-chart-bar",
    path: "/admin/reports",
  },
  {
    label: "Settings",
    icon: "pi pi-cog",
    path: "/admin/settings",
  },
];

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
}: AdminSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static
          inset-y-0 left-0
          z-50
          w-64
          bg-white
          border-r
          flex
          flex-col
          transition-transform
          duration-300
          ease-in-out

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="h-16 border-b flex items-center px-5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            V
          </div>

          <div className="ml-3">
            <h2 className="font-semibold text-sm">
              Vendor Management
            </h2>
            <p className="text-xs text-gray-500">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {menus.map((menu) => (
              <li key={menu.path}>
                <NavLink
                  to={menu.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3
                    px-4 py-3
                    rounded-xl
                    text-sm
                    font-medium
                    transition-all

                    ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `
                  }
                >
                  <i className={`${menu.icon} text-base`} />

                  <span>{menu.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Section */}
        <div className="border-t p-3">
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-3
              w-full
              px-4 py-3
              rounded-xl
              text-red-600
              hover:bg-red-50
              transition-colors
            "
          >
            <i className="pi pi-sign-out" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}