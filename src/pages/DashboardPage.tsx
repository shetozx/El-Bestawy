import { useMemo } from "react";
import { useProductStore } from "@/stores/useProductStore";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useCustomerStore } from "@/stores/useCustomerStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getDaysUntilExpiry,
  getStockStatusColor,
  getStockStatusLabel,
  getExpiryStatusColor,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Activity,
  ArrowLeft,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────
function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  trendUp,
  color = "teal",
  delay = 0,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  color?: "teal" | "green" | "amber" | "blue";
  delay?: number;
}) {
  const colors = {
    teal:  { icon: "bg-[hsl(185,60%,92%)] text-[hsl(185,70%,32%)] dark:bg-[hsl(185,50%,20%)] dark:text-[hsl(185,60%,65%)]", bar: "from-[hsl(185,70%,32%)] to-[hsl(172,60%,40%)]" },
    green: { icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400", bar: "from-emerald-500 to-teal-500" },
    amber: { icon: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400", bar: "from-amber-400 to-orange-500" },
    blue:  { icon: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400", bar: "from-sky-500 to-blue-600" },
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300",
        "hover:-translate-y-0.5 group"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Accent bar */}
      <div className={cn("absolute top-0 right-0 w-1 h-full rounded-r-xl bg-gradient-to-b", colors[color].bar)} />

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2.5 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
              {title}
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1">
                {trendUp !== undefined && (
                  trendUp ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />
                  )
                )}
                <span className={cn(
                  "text-xs font-medium",
                  trendUp === undefined ? "text-muted-foreground" :
                  trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {trend}
                </span>
              </div>
            )}
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", colors[color].icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────
// Tooltips
// ─────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-sm">
      <p className="text-[11px] font-semibold text-muted-foreground mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className={cn("h-2 w-2 rounded-full", entry.dataKey === "sales" ? "bg-[hsl(var(--chart-1))]" : "bg-[hsl(var(--chart-2))]")} />
          <span className="text-muted-foreground text-xs">{entry.dataKey === "sales" ? "المبيعات" : "الأرباح"}:</span>
          <span className="font-bold text-xs">{formatCurrency(entry.value)} ج.م</span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; quantity: number } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-bold text-foreground">{payload[0]?.payload?.name}</p>
      <p className="text-xs text-muted-foreground mt-1">
        الكمية: <span className="font-bold text-foreground">{payload[0]?.payload?.quantity}</span>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────
function SectionHeader({ title, href, count }: { title: string; href?: string; count?: number }) {
  return (
    <div className="flex items-center justify-between pb-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {count !== undefined && (
          <Badge variant="secondary" className="text-xs font-bold px-1.5 py-0.5 h-auto">
            {count}
          </Badge>
        )}
      </div>
      {href && (
        <Link
          to={href}
          className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        >
          عرض الكل
          <ArrowLeft className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────
export function DashboardPage() {
  const products  = useProductStore((s) => s.products);
  const invoices  = useInvoiceStore((s) => s.invoices);
  const customers = useCustomerStore((s) => s.customers);

  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayInvoices = invoices.filter(
      (inv) => new Date(inv.createdAt).toDateString() === today
    );
    return {
      sales: todayInvoices.reduce((sum, inv) => sum + inv.total, 0),
      count: todayInvoices.length,
    };
  }, [invoices]);

  const monthStats = useMemo(() => {
    const now = new Date();
    const monthInvoices = invoices.filter((inv) => {
      const d = new Date(inv.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const sales = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const cost = monthInvoices.reduce(
      (sum, inv) =>
        sum +
        inv.items.reduce((s, item) => {
          const p = products.find((pr) => pr.id === item.productId);
          return s + (p ? p.buyPrice * item.quantity : 0);
        }, 0),
      0
    );
    return { sales, profit: sales - cost };
  }, [invoices, products]);

  const lowStockProducts = useMemo(
    () =>
      products
        .filter((p) => p.stock > 0 && p.stock <= p.minStock)
        .sort((a, b) => a.stock - b.stock),
    [products]
  );

  const expiringProducts = useMemo(
    () =>
      products
        .filter((p) => {
          const d = getDaysUntilExpiry(p.expiryDate);
          return d !== Infinity && d <= 60;
        })
        .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate)),
    [products]
  );

  const salesChartData = useMemo(() => {
    const map = new Map<string, { date: string; sales: number; profit: number }>();
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toDateString();
    });
    last14.forEach((day) => {
      const label = new Date(day).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
      map.set(day, { date: label, sales: 0, profit: 0 });
    });
    invoices.forEach((inv) => {
      const day = new Date(inv.createdAt).toDateString();
      if (!map.has(day)) return;
      const entry = map.get(day)!;
      const cost = inv.items.reduce((s, item) => {
        const p = products.find((pr) => pr.id === item.productId);
        return s + (p ? p.buyPrice * item.quantity : 0);
      }, 0);
      entry.sales += inv.total;
      entry.profit += inv.total - cost;
    });
    return Array.from(map.values());
  }, [invoices, products]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number }>();
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const existing = map.get(item.productName) || { name: item.productName, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.total;
        map.set(item.productName, existing);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  }, [invoices]);

  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">

      {/* ── Welcome ── */}
      <div className="flex items-center justify-between animate-fade-up-1">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            لوحة التحكم
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            نظرة شاملة على أداء المتجر — {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-up-1">
          <StatCard
            title="مبيعات اليوم"
            value={`${formatCurrency(todayStats.sales)} ج`}
            trend={`${todayStats.count} فاتورة`}
            trendUp={todayStats.count > 0}
            icon={ShoppingCart}
            color="teal"
          />
        </div>
        <div className="animate-fade-up-2">
          <StatCard
            title="أرباح الشهر"
            value={`${formatCurrency(monthStats.profit)} ج`}
            trend={`مبيعات ${formatCurrency(monthStats.sales)} ج`}
            trendUp={monthStats.profit > 0}
            icon={TrendingUp}
            color="green"
          />
        </div>
        <div className="animate-fade-up-3">
          <StatCard
            title="إجمالي المنتجات"
            value={formatNumber(products.length)}
            trend={outOfStockCount > 0 ? `${outOfStockCount} نفذت` : "المخزون جيد"}
            trendUp={outOfStockCount === 0}
            icon={Package}
            color="blue"
          />
        </div>
        <div className="animate-fade-up-4">
          <StatCard
            title="إجمالي العملاء"
            value={formatNumber(customers.length)}
            icon={Users}
            color="amber"
          />
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Sales Chart */}
        <Card className="lg:col-span-3 border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <SectionHeader title="نظرة عامة على المبيعات (14 يوم)" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 5, left: 0, right: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="sales"  stroke="hsl(var(--chart-1))" fill="url(#salesGrad)"  strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" fill="url(#profitGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 px-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-4 rounded-full bg-[hsl(var(--chart-1))]" />
                المبيعات
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-4 rounded-full bg-[hsl(var(--chart-2))]" />
                الأرباح
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <SectionHeader title="أكثر المنتجات مبيعاً" href="/products" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, left: 0, right: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 10) + "…" : v}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar
                    dataKey="quantity"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 4, 4]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Alerts ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Low Stock */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <SectionHeader
              title="منتجات منخفضة المخزون"
              href="/products"
              count={lowStockProducts.length}
            />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Package className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-xs font-medium">المخزون في حالة جيدة</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto thin-scrollbar">
                {lowStockProducts.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    className={cn(
                      "flex items-center justify-between rounded-xl border border-border/60 px-3.5 py-2.5",
                      "bg-muted/30 hover:bg-muted/50 transition-colors duration-150"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{product.company}</p>
                    </div>
                    <div className="flex items-center gap-2.5 mr-3 shrink-0">
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground leading-none mb-0.5">المخزون</p>
                        <p className="text-sm font-extrabold tabular-nums text-foreground">{formatNumber(product.stock)}</p>
                      </div>
                      <Badge className={cn("text-[10px] font-bold px-1.5 py-0.5 h-auto", getStockStatusColor("low"))}>
                        {getStockStatusLabel("low")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <SectionHeader
              title="منتجات قريبة من الانتهاء"
              href="/products"
              count={expiringProducts.length}
            />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {expiringProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-xs font-medium">لا توجد منتجات قريبة من الانتهاء</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto thin-scrollbar">
                {expiringProducts.slice(0, 6).map((product) => {
                  const daysLeft = getDaysUntilExpiry(product.expiryDate);
                  return (
                    <div
                      key={product.id}
                      className={cn(
                        "flex items-center justify-between rounded-xl border border-border/60 px-3.5 py-2.5",
                        "bg-muted/30 hover:bg-muted/50 transition-colors duration-150"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ينتهي: {formatDate(product.expiryDate)}
                        </p>
                      </div>
                      <div className="mr-3 shrink-0">
                        <Badge className={cn("text-[10px] font-bold px-1.5 py-0.5 h-auto", getExpiryStatusColor(daysLeft))}>
                          {daysLeft < 0 ? "منتهي" : `${daysLeft} يوم`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
