import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";

type AdminHeaderProps = {
  setSidebarOpen: (open: boolean) => void;
};

export default function AdminHeader({
  setSidebarOpen,
}: AdminHeaderProps) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Button
          icon="pi pi-bars"
          text
          rounded
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        />

        {/* Logo */}
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
          V
        </div>

        <div>
          <h1 className="font-semibold text-base lg:text-lg">
            Vendor Management System
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <Button
          icon="pi pi-bell"
          text
          rounded
          severity="secondary"
        />

        <div className="flex items-center gap-2">
          <Avatar label="A" shape="circle" />

          {/* Hide text on small mobile */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium">
              Admin User
            </p>

            <p className="text-xs text-gray-500">
              System Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}