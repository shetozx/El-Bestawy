import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:mr-[260px]">
        <Topbar />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster
        position="bottom-left"
        richColors
        dir="rtl"
      />
    </div>
  );
}
