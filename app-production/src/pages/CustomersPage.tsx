import { useState } from "react";
import { useCustomerStore } from "@/stores/useCustomerStore";
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
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Phone,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Customer } from "@/types";

const customerSchema = z.object({
  name: z.string().min(1, "اسم العميل مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
});

type CustomerFormData = z.infer<typeof customerSchema>;

function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || { name: "", phone: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">اسم العميل *</label>
        <Input {...register("name")} placeholder="اسم العميل" />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">رقم الهاتف *</label>
        <Input {...register("phone")} placeholder="مثال: 01001234567" />
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

export function CustomersPage() {
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getFilteredCustomers,
  } = useCustomerStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = getFilteredCustomers();

  const handleAdd = async (data: CustomerFormData) => {
    await addCustomer(data);
    setDialogOpen(false);
    toast.success("تم إضافة العميل بنجاح");
  };

  const handleEdit = async (data: CustomerFormData) => {
    if (!editingCustomer) return;
    await updateCustomer(editingCustomer.id, data);
    setDialogOpen(false);
    setEditingCustomer(undefined);
    toast.success("تم تحديث العميل بنجاح");
  };

  const handleDelete = async (id: string) => {
    await deleteCustomer(id);
    setDeleteConfirm(null);
    toast.success("تم حذف العميل بنجاح");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">العملاء</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة قائمة العملاء
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCustomer(undefined);
                setDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              إضافة عميل
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "تعديل عميل" : "إضافة عميل جديد"}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm
              initialData={editingCustomer}
              onSubmit={editingCustomer ? handleEdit : handleAdd}
              onCancel={() => {
                setDialogOpen(false);
                setEditingCustomer(undefined);
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
              placeholder="البحث في العملاء..."
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
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium">لا يوجد عملاء</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? "جرب تغيير البحث" : "أضف عملاء للبدء"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>إجمالي المشتريات</TableHead>
                    <TableHead>المديونية</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(customer.totalPurchases)} ج.م
                      </TableCell>
                      <TableCell>
                        <span
                          className={`tabular-nums font-medium ${
                            customer.balance > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatCurrency(customer.balance)} ج.م
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(customer.id)}
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
            هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.
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
