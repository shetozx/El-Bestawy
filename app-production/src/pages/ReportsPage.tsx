import { useState, useMemo } from "react";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useProductStore } from "@/stores/useProductStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  BarChart3,
  TrendingUp,
  Package,
  Receipt,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

function SalesTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; name?: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-md">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold">
          {entry.dataKey === "sales" ? "المبيعات" : entry.dataKey === "profit" ? "الأرباح" : entry.dataKey === "count" ? "عدد الفواتير" : entry.name || ""}: {entry.dataKey === "count" ? formatNumber(entry.value) : formatCurrency(entry.value) + " ج.م"}
        </p>
      ))}
    </div>
  );
}

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-md">
      <p className="text-sm font-semibold">{payload[0].name}</p>
      <p className="text-xs text-muted-foreground">
        عدد المنتجات: {formatNumber(payload[0].value)}
      </p>
    </div>
  );
}

export function ReportsPage() {
  const invoices = useInvoiceStore((s) => s.invoices);
  const products = useProductStore((s) => s.products);
  const [reportPeriod, setReportPeriod] = useState<"week" | "month" | "year">("month");

  const salesData = useMemo(() => {
    const days = reportPeriod === "week" ? 7 : reportPeriod === "month" ? 30 : 365;
    const data: Array<{ date: string; sales: number; profit: number; count: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      const dayInvoices = invoices.filter((inv) => inv.createdAt.startsWith(dateStr));
      const sales = dayInvoices.reduce((s, inv) => s + inv.total, 0);
      const profit = dayInvoices.reduce((s, inv) => {
        return s + inv.items.reduce((p, item) => p + (item.price * 0.4) * item.quantity, 0);
      }, 0);
      data.push({ date: label, sales, profit, count: dayInvoices.length });
    }
    return data;
  }, [invoices, reportPeriod]);

  const summaryStats = useMemo(() => {
    const totalSales = invoices.reduce((s, i) => s + i.total, 0);
    const totalProfit = invoices.reduce((s, i) => {
      return s + i.items.reduce((p, item) => p + (item.price * 0.4) * item.quantity, 0);
    }, 0);
    const totalInvoices = invoices.length;
    const avgOrderValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;
    return { totalSales, totalProfit, totalInvoices, avgOrderValue };
  }, [invoices]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [products]);

  const stockData = useMemo(() => {
    const available = products.filter((p) => p.stock > p.minStock).length;
    const low = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const out = products.filter((p) => p.stock === 0).length;
    return [
      { name: "متوفر", value: available, color: "hsl(var(--chart-2))" },
      { name: "منخفض", value: low, color: "hsl(var(--chart-3))" },
      { name: "نفذ", value: out, color: "hsl(var(--chart-5))" },
    ];
  }, [products]);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= p.minStock && p.stock > 0),
    [products]
  );

  const expiringProducts = useMemo(
    () =>
      products
        .filter((p) => {
          if (!p.expiryDate) return false;
          return getDaysUntilExpiry(p.expiryDate) <= 30;
        })
        .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate)),
    [products]
  );

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
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [invoices]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">التقارير</h1>
        <p className="text-sm text-muted-foreground mt-1">
          تحليلات وإحصائيات المتجر
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatCurrency(summaryStats.totalSales)} ج.م
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الأرباح</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatCurrency(summaryStats.totalProfit)} ج.م
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">عدد الفواتير</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatNumber(summaryStats.totalInvoices)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">متوسط قيمة الطلب</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatCurrency(summaryStats.avgOrderValue)} ج.م
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2">
        {(["week", "month", "year"] as const).map((period) => (
          <Button
            key={period}
            variant={reportPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setReportPeriod(period)}
          >
            {period === "week" ? "أسبوع" : period === "month" ? "شهر" : "سنة"}
          </Button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sales Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">اتجاه المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 5, left: 5, right: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="salesReportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<SalesTooltip />} />
                  <Area type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" fill="url(#salesReportGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">توزيع المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {stockData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {stockData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">أعلى المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, left: 5, right: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(value: number) => [formatCurrency(value) + " ج.م", "الإيرادات"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 4, 4]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">المنتجات حسب التصنيف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 5, left: 5, right: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CategoryTooltip />} />
                  <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">منتجات منخفضة المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد منتجات منخفضة المخزون
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                {lowStockProducts.map((product) => {
                  const status =
                    product.stock === 0
                      ? "out"
                      : product.stock <= product.minStock
                      ? "low"
                      : "available";
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm tabular-nums">
                          {formatNumber(product.stock)} / {formatNumber(product.minStock)}
                        </span>
                        <Badge className={getStockStatusColor(status)}>
                          {getStockStatusLabel(status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="h-4 w-4 text-red-500" />
            <CardTitle className="text-base">المنتجات القريبة من الانتهاء</CardTitle>
          </CardHeader>
          <CardContent>
            {expiringProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد منتجات قريبة من الانتهاء
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                {expiringProducts.map((product) => {
                  const daysLeft = getDaysUntilExpiry(product.expiryDate);
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(product.expiryDate)}
                        </p>
                      </div>
                      <Badge className={getExpiryStatusColor(daysLeft)}>
                        {daysLeft < 0 ? "منتهي" : `${daysLeft} يوم`}
                      </Badge>
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
