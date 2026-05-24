import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Store,
  Percent,
  Lock,
  Moon,
  Save,
  AlertTriangle,
} from "lucide-react";

interface SettingsFormData {
  storeName: string;
  currency: string;
  taxRate: number;
  password: string;
  darkMode: boolean;
}

export function SettingsPage() {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [formData, setFormData] = useState<SettingsFormData>({
    storeName: settings.storeName,
    currency: settings.currency,
    taxRate: settings.taxRate,
    password: settings.password,
    darkMode: settings.darkMode,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SettingsFormData, string>>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData({
      storeName: settings.storeName,
      currency: settings.currency,
      taxRate: settings.taxRate,
      password: settings.password,
      darkMode: settings.darkMode,
    });
  }, [settings]);

  const updateField = (field: keyof SettingsFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SettingsFormData, string>> = {};
    if (!formData.storeName.trim()) newErrors.storeName = "اسم المتجر مطلوب";
    if (!formData.currency.trim()) newErrors.currency = "العملة مطلوبة";
    if (formData.taxRate < 0 || formData.taxRate > 100) newErrors.taxRate = "نسبة الضريبة يجب أن تكون بين 0 و 100";
    if (formData.password.length < 4) newErrors.password = "كلمة المرور يجب أن تكون 4 أحرف على الأقل";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await updateSettings(formData);
      setIsDirty(false);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-sm text-muted-foreground mt-1">
          إدارة إعدادات المتجر
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              معلومات المتجر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم المتجر</label>
              <Input
                value={formData.storeName}
                onChange={(e) => updateField("storeName", e.target.value)}
                placeholder="اسم المتجر"
              />
              {errors.storeName && (
                <p className="text-xs text-destructive">{errors.storeName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">العملة</label>
              <Input
                value={formData.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                placeholder="EGP"
              />
              {errors.currency && (
                <p className="text-xs text-destructive">{errors.currency}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tax */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              الضريبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">نسبة الضريبة (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => updateField("taxRate", Number(e.target.value))}
              />
              {errors.taxRate && (
                <p className="text-xs text-destructive">{errors.taxRate}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              الأمان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">كلمة المرور</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="كلمة المرور"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" />
              المظهر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">الوضع الليلي</p>
                <p className="text-xs text-muted-foreground">
                  تفعيل الوضع الليلي للواجهة
                </p>
              </div>
              <Switch
                checked={formData.darkMode}
                onCheckedChange={(checked) => updateField("darkMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-2">
          <Button type="submit" disabled={!isDirty || isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </form>

      <Separator />

      {/* Data Management */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            إدارة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            يمكنك تصدير بياناتك أو إعادة تعيين البيانات التجريبية. احذر من هذه الإجراءات.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                toast.info("سيتم توفير التصدير في الإصدار القادم");
              }}
            >
              تصدير البيانات
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (resetConfirm) {
                  toast.info("سيتم توفير إعادة التعيين في الإصدار القادم");
                  setResetConfirm(false);
                } else {
                  setResetConfirm(true);
                }
              }}
            >
              {resetConfirm ? "تأكيد إعادة التعيين" : "إعادة تعيين البيانات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
