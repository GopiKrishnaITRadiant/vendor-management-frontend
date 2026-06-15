import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Header */}
      <Header />

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-64px)] p-6">
          <Outlet />
        </main>

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}