import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "الرئيسية",   icon: LayoutDashboard, path: "/" },
  { label: "المنتجات",   icon: Package,          path: "/products" },
  { label: "المبيعات",   icon: ShoppingCart,     path: "/sales" },
  { label: "العملاء",    icon: Users,            path: "/customers" },
  { label: "الموردين",   icon: Truck,            path: "/suppliers" },
  { label: "التقارير",   icon: BarChart3,         path: "/reports" },
  { label: "الإعدادات", icon: Settings,         path: "/settings" },
];

function DentalLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div
      className={cn(
        s,
        "shrink-0 rounded-xl flex items-center justify-center",
        "bg-gradient-to-br from-[hsl(185,60%,55%)] to-[hsl(172,60%,40%)]",
        "shadow-[0_0_16px_rgba(45,180,160,0.35)]"
      )}
    >
      <Stethoscope className={cn(icon, "text-white")} strokeWidth={1.8} />
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const storeName = useSettingsStore((s) => s.getStoreName());
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const NavContent = () => (
    <div className="flex h-full flex-col bg-[hsl(var(--sidebar-background))]">
      {/* ── Logo ── */}
      <div
        className={cn(
          "flex h-16 items-center gap-3 px-4",
          "border-b border-[hsl(var(--sidebar-border))]"
        )}
      >
        <DentalLogo />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[hsl(var(--sidebar-foreground))] leading-tight">
              {storeName}
            </p>
            <p className="text-[10px] text-[hsl(var(--sidebar-foreground))/60] mt-0.5">
              مستلزمات الأسنان
            </p>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 text-[hsl(var(--sidebar-foreground))/50] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]",
              collapsed && "mr-auto"
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar space-y-0.5">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-[hsl(var(--sidebar-foreground))/40] font-semibold">
            القائمة
          </p>
        )}
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "sidebar-item-active",
                isActive
                  ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                  : "text-[hsl(var(--sidebar-foreground))/60] hover:bg-[hsl(var(--sidebar-accent))/50] hover:text-[hsl(var(--sidebar-foreground))]"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-[hsl(var(--sidebar-primary))]"
                    : "text-current"
                )}
              />
              {!collapsed && (
                <span className="transition-opacity duration-200">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="mr-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--sidebar-primary))] pulse-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
            "text-[hsl(var(--sidebar-foreground))/50] hover:bg-red-500/10 hover:text-red-400",
            "transition-all duration-200"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-background/90 backdrop-blur-md px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 border-0">
              <NavContent />
            </SheetContent>
          </Sheet>
          <DentalLogo size="sm" />
          <span className="truncate font-bold text-sm">{storeName}</span>
        </div>
        <div className="h-14" />
      </>
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex flex-col",
        "border-l border-[hsl(var(--sidebar-border))]",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      <NavContent />
    </aside>
  );
}
