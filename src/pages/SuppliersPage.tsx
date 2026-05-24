import { useState } from "react";
import { useSupplierStore } from "@/stores/useSupplierStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Truck,
  Phone,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Supplier } from "@/types";

const supplierSchema = z.object({
  name: z.string().min(1, "اسم المورد مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

function SupplierForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Supplier;
  onSubmit: (data: SupplierFormData) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData || { name: "", phone: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">اسم المورد *</label>
        <Input {...register("name")} placeholder="اسم المورد" />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">رقم الهاتف *</label>
        <Input {...register("phone")} placeholder="مثال: 0223456789" />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          {initialData ? "تحديث" : "إضافة"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

export function SuppliersPage() {
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getFilteredSuppliers,
  } = useSupplierStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = getFilteredSuppliers();

  const handleAdd = async (data: SupplierFormData) => {
    await addSupplier(data);
    setDialogOpen(false);
    toast.success("تم إضافة المورد بنجاح");
  };

  const handleEdit = async (data: SupplierFormData) => {
    if (!editingSupplier) return;
    await updateSupplier(editingSupplier.id, data);
    setDialogOpen(false);
    setEditingSupplier(undefined);
    toast.success("تم تحديث المورد بنجاح");
  };

  const handleDelete = async (id: string) => {
    await deleteSupplier(id);
    setDeleteConfirm(null);
    toast.success("تم حذف المورد بنجاح");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الموردين</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة قائمة الموردين
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingSupplier(undefined);
                setDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              إضافة مورد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "تعديل مورد" : "إضافة مورد جديد"}
              </DialogTitle>
            </DialogHeader>
            <SupplierForm
              initialData={editingSupplier}
              onSubmit={editingSupplier ? handleEdit : handleAdd}
              onCancel={() => {
                setDialogOpen(false);
                setEditingSupplier(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="البحث في الموردين..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium">لا يوجد موردين</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? "جرب تغيير البحث" : "أضف موردين للبدء"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المورد</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>آخر عملية شراء</TableHead>
                    <TableHead>الرصيد</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {supplier.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {supplier.lastPurchaseDate
                          ? formatDate(supplier.lastPurchaseDate)
                          : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(supplier.balance)} ج.م
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingSupplier(supplier);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(supplier.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.
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
