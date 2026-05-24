import { useState } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "@/stores/useProductStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getStockStatusColor,
  getStockStatusLabel,
  getExpiryStatusColor,
  getDaysUntilExpiry,
} from "@/lib/utils";
import {
  Plus,
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronLeft,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";

interface ProductFormData {
  name: string;
  company: string;
  category: string;
  stock: number;
  buyPrice: number;
  sellPrice: number;
  expiryDate: string;
  minStock: number;
  supplierId: string;
}

function ProductForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    company: initialData?.company || "",
    category: initialData?.category || "",
    stock: initialData?.stock ?? 0,
    buyPrice: initialData?.buyPrice ?? 0,
    sellPrice: initialData?.sellPrice ?? 0,
    expiryDate: initialData?.expiryDate || "",
    minStock: initialData?.minStock ?? 5,
    supplierId: initialData?.supplierId || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = "اسم المنتج مطلوب";
    if (!formData.company.trim()) newErrors.company = "اسم الشركة مطلوب";
    if (!formData.category.trim()) newErrors.category = "التصنيف مطلوب";
    if (formData.stock < 0) newErrors.stock = "الكمية يجب أن تكون 0 أو أكثر";
    if (formData.buyPrice < 0) newErrors.buyPrice = "سعر الشراء مطلوب";
    if (formData.sellPrice < 0) newErrors.sellPrice = "سعر البيع مطلوب";
    if (formData.minStock < 0) newErrors.minStock = "الحد الأدنى مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const updateField = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم المنتج *</label>
          <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="مثال: حشوة تجميلية 3M" />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الشركة *</label>
          <Input value={formData.company} onChange={(e) => updateField("company", e.target.value)} placeholder="مثال: 3M ESPE" />
          {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">التصنيف *</label>
          <Input value={formData.category} onChange={(e) => updateField("category", e.target.value)} placeholder="مثال: حشوات" />
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الكمية *</label>
          <Input type="number" min="0" value={formData.stock} onChange={(e) => updateField("stock", Number(e.target.value))} />
          {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">سعر الشراء *</label>
          <Input type="number" min="0" step="0.01" value={formData.buyPrice} onChange={(e) => updateField("buyPrice", Number(e.target.value))} />
          {errors.buyPrice && <p className="text-xs text-destructive">{errors.buyPrice}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">سعر البيع *</label>
          <Input type="number" min="0" step="0.01" value={formData.sellPrice} onChange={(e) => updateField("sellPrice", Number(e.target.value))} />
          {errors.sellPrice && <p className="text-xs text-destructive">{errors.sellPrice}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">تاريخ الانتهاء</label>
          <Input type="date" value={formData.expiryDate} onChange={(e) => updateField("expiryDate", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الحد الأدنى للمخزون *</label>
          <Input type="number" min="0" value={formData.minStock} onChange={(e) => updateField("minStock", Number(e.target.value))} />
          {errors.minStock && <p className="text-xs text-destructive">{errors.minStock}</p>}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          {initialData ? "تحديث المنتج" : "إضافة المنتج"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

export function ProductsPage() {
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedCompany,
    setSelectedCompany,
    setSortField,
    page,
    pageSize,
    setPage,
    addProduct,
    updateProduct,
    deleteProduct,
    getFilteredProducts,
    getCategories,
    getCompanies,
  } = useProductStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredProducts = getFilteredProducts();
  const categories = getCategories();
  const companies = getCompanies();

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleAdd = async (data: ProductFormData) => {
    await addProduct(data as Omit<Product, "id" | "createdAt" | "updatedAt">);
    setDialogOpen(false);
    toast.success("تم إضافة المنتج بنجاح");
  };

  const handleEdit = async (data: ProductFormData) => {
    if (!editingProduct) return;
    await updateProduct(editingProduct.id, data as Partial<Product>);
    setDialogOpen(false);
    setEditingProduct(undefined);
    toast.success("تم تحديث المنتج بنجاح");
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeleteConfirm(null);
    toast.success("تم حذف المنتج بنجاح");
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المنتجات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة مخزون المنتجات
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              initialData={editingProduct}
              onSubmit={editingProduct ? handleEdit : handleAdd}
              onCancel={() => {
                setDialogOpen(false);
                setEditingProduct(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل التصنيفات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="الشركة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل الشركات</SelectItem>
                {companies.map((comp) => (
                  <SelectItem key={comp} value={comp}>
                    {comp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium">لا توجد منتجات</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || selectedCategory || selectedCompany
                  ? "جرب تغيير عوامل التصفية"
                  : "أضف منتجات للبدء"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الشركة</TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => setSortField("stock")}
                      >
                        الكمية
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>سعر الشراء</TableHead>
                    <TableHead>سعر البيع</TableHead>
                    <TableHead>الصلاحية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => {
                    const status =
                      product.stock <= 0
                        ? "out"
                        : product.stock <= product.minStock
                        ? "low"
                        : "available";
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Link
                            to={`/products/${product.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {product.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.company}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold tabular-nums">
                          {formatNumber(product.stock)}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatCurrency(product.buyPrice)}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatCurrency(product.sellPrice)}
                        </TableCell>
                        <TableCell>
                          {product.expiryDate ? (
                            <Badge
                              className={getExpiryStatusColor(
                                getDaysUntilExpiry(product.expiryDate)
                              )}
                            >
                              {formatDate(product.expiryDate)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStockStatusColor(status)}>
                            {getStockStatusLabel(status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(product)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirm(product.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {formatNumber(filteredProducts.length)} منتج
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-xs">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              حذف
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
