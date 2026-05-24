import { useParams, Link, useNavigate } from "react-router-dom";
import { useProductStore } from "@/stores/useProductStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getStockStatusColor,
  getStockStatusLabel,
  getDaysUntilExpiry,
  getExpiryStatusColor,
} from "@/lib/utils";
import {
  ArrowRight,
  Package,
  Layers,
  Hash,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getProductById = useProductStore((s) => s.getProductById);
  const product = getProductById(id || "");

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm font-medium">المنتج غير موجود</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/products">العودة للمنتجات</Link>
        </Button>
      </div>
    );
  }

  const stockStatus =
    product.stock <= 0
      ? "out"
      : product.stock <= product.minStock
      ? "low"
      : "available";

  const daysUntilExpiry = product.expiryDate
    ? getDaysUntilExpiry(product.expiryDate)
    : null;

  const profit = product.sellPrice - product.buyPrice;
  const profitMargin = product.sellPrice > 0 ? (profit / product.sellPrice) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/products" className="hover:text-foreground transition-colors">
          المنتجات
        </Link>
        <ArrowRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{product.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{product.company}</Badge>
            <Badge variant="outline">{product.category}</Badge>
            <Badge className={getStockStatusColor(stockStatus)}>
              {getStockStatusLabel(stockStatus)}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/products")}>
          العودة للقائمة
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="info">المعلومات الأساسية</TabsTrigger>
          <TabsTrigger value="pricing">التسعير</TabsTrigger>
          <TabsTrigger value="stock">المخزون</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  تفاصيل المنتج
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">الاسم</span>
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">الشركة</span>
                  <span className="text-sm font-medium">{product.company}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">التصنيف</span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">تاريخ الإضافة</span>
                  <span className="text-sm">{formatDate(product.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  معلومات الصلاحية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">تاريخ الانتهاء</span>
                  <span className="text-sm font-medium">
                    {product.expiryDate ? formatDate(product.expiryDate) : "غير محدد"}
                  </span>
                </div>
                {daysUntilExpiry !== null && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">الأيام المتبقية</span>
                    <Badge className={getExpiryStatusColor(daysUntilExpiry)}>
                      {daysUntilExpiry < 0
                        ? "منتهي"
                        : `${daysUntilExpiry} يوم`}
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">آخر تحديث</span>
                  <span className="text-sm">{formatDate(product.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">سعر الشراء</p>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatCurrency(product.buyPrice)} <span className="text-sm font-normal">ج.م</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">سعر البيع</p>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatCurrency(product.sellPrice)} <span className="text-sm font-normal">ج.م</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">هامش الربح</p>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatNumber(Math.round(profitMargin))}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">الربح لكل وحدة</span>
                  <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(profit)} ج.م
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-muted-foreground">القيمة الإجمالية (سعر البيع × المخزون)</span>
                  <span className="text-lg font-semibold tabular-nums">
                    {formatCurrency(product.sellPrice * product.stock)} ج.م
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المخزون الحالي</p>
                    <p className="text-2xl font-bold tabular-nums">{formatNumber(product.stock)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الحد الأدنى</p>
                    <p className="text-2xl font-bold tabular-nums">{formatNumber(product.minStock)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatCurrency(product.buyPrice * product.stock)} ج.م
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">الحالة</span>
                  <Badge className={getStockStatusColor(stockStatus)}>
                    {getStockStatusLabel(stockStatus)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-muted-foreground">المنتج متاح للبيع</span>
                  <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                    {product.stock > 0 ? "نعم" : "لا"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
