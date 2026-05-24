import { useState, useMemo } from "react";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useCustomerStore } from "@/stores/useCustomerStore";
import { useProductStore } from "@/stores/useProductStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  formatNumber,
  formatDateTime,
} from "@/lib/utils";
import {
  Plus,
  Trash2,
  Receipt,
  Save,
  ShoppingCart,
  Search,
  Minus,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { InvoiceItem } from "@/types";

interface CartItem extends InvoiceItem {
  key: string;
}

export function SalesPage() {
  const products = useProductStore((s) => s.products);
  const customers = useCustomerStore((s) => s.customers);
  const addInvoice = useInvoiceStore((s) => s.addInvoice);
  const invoices = useInvoiceStore((s) => s.invoices);

  const [customerId, setCustomerId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.filter((p) => p.stock > 0);
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.stock > 0 &&
        (p.name.toLowerCase().includes(q) || p.company.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(0, subtotal - discount);

  const addToCart = (product: { id: string; name: string; sellPrice: number }) => {
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      updateQuantity(existing.key, existing.quantity + 1);
    } else {
      const newItem: CartItem = {
        key: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellPrice,
        total: product.sellPrice,
      };
      setCart((prev) => [...prev, newItem]);
    }
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, quantity, total: item.price * quantity }
          : item
      )
    );
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerId("");
  };

  const saveInvoice = async () => {
    if (cart.length === 0) {
      toast.error("أضف منتجات إلى الفاتورة أولاً");
      return;
    }
    if (!customerId) {
      toast.error("اختر عميلاً");
      return;
    }
    setIsSaving(true);
    try {
      const id = await addInvoice({
        customerId,
        customerName: selectedCustomer?.name || "عميل غير معروف",
        items: cart.map(({ key, ...item }) => item),
        subtotal,
        discount,
        total,
      });
      // Update product stock
      for (const item of cart) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          await useProductStore.getState().updateProduct(product.id, {
            stock: Math.max(0, product.stock - item.quantity),
          });
        }
      }
      setShowReceipt(id);
      clearCart();
      toast.success("تم حفظ الفاتورة بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الفاتورة");
    } finally {
      setIsSaving(false);
    }
  };

  const lastInvoices = invoices.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">نقطة البيع</h1>
        <p className="text-sm text-muted-foreground mt-1">
          إنشاء فاتورة بيع جديدة
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Products Panel */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              المنتجات المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-1">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  className="w-full flex items-center justify-between rounded-lg border border-border p-3 text-right hover:bg-muted transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.company} — {product.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mr-3">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrency(product.sellPrice)} ج.م
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatNumber(product.stock)}
                    </Badge>
                    <PlusCircle className="h-4 w-4 text-primary shrink-0" />
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  لا توجد منتجات متاحة
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              الفاتورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Select */}
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العميل" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Cart Items */}
            <div className="max-h-[280px] overflow-y-auto no-scrollbar space-y-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">أضف منتجات لبدء الفاتورة</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-border p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateQuantity(item.key, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-semibold w-6 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateQuantity(item.key, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeFromCart(item.key)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(subtotal)} ج.م
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">الخصم</span>
                <Input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={(e) =>
                    setDiscount(Math.max(0, Number(e.target.value)))
                  }
                  className="h-8 w-24 text-left"
                />
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">الإجمالي</span>
                <span className="font-bold text-lg tabular-nums">
                  {formatCurrency(total)} ج.م
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-2"
                onClick={saveInvoice}
                disabled={cart.length === 0 || isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "جاري الحفظ..." : "حفظ الفاتورة"}
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">أحدث الفواتير</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الرقم</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المنتجات</TableHead>
                  <TableHead>الخصم</TableHead>
                  <TableHead>الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lastInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium text-xs">
                      {invoice.id.replace("inv_", "#")}
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(invoice.createdAt)}
                    </TableCell>
                    <TableCell>{invoice.items.length} منتج</TableCell>
                    <TableCell className="tabular-nums">
                      {formatCurrency(invoice.discount)} ج.م
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatCurrency(invoice.total)} ج.م
                    </TableCell>
                  </TableRow>
                ))}
                {lastInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا توجد فواتير بعد
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto">
                <Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold">تم حفظ الفاتورة بنجاح</p>
                <p className="text-sm text-muted-foreground">
                  رقم الفاتورة: {showReceipt.replace("inv_", "#")}
                </p>
              </div>
              <Button onClick={() => setShowReceipt(null)} className="w-full">
                إغلاق
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
