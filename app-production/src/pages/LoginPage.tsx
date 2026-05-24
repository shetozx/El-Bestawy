import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stethoscope, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const storeName = useSettingsStore((s) => s.getStoreName());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }
    setIsLoading(true);
    const success = await login(password);
    setIsLoading(false);
    if (!success) {
      toast.error("كلمة المرور غير صحيحة");
      setPassword("");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(185,50%,18%)] via-[hsl(195,40%,12%)] to-[hsl(210,35%,8%)]" />

      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-[hsl(185,60%,38%)/12] blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full bg-[hsl(172,60%,40%)/10] blur-3xl" />
      <div className="absolute top-1/2 left-1/4 h-[200px] w-[200px] rounded-full bg-[hsl(185,60%,38%)/6] blur-2xl" />

      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(185,60%,80%) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(185,60%,80%) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-[400px] px-4 animate-fade-up">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-2xl",
                "bg-gradient-to-br from-[hsl(185,60%,55%)] to-[hsl(172,60%,40%)]",
                "shadow-[0_0_40px_rgba(45,180,160,0.4)]"
              )}
            >
              <Stethoscope className="h-10 w-10 text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(38,92%,50%)] shadow-md">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {storeName}
            </h1>
            <p className="mt-1 text-sm text-[hsl(185,30%,70%)]">
              نظام إدارة مستلزمات الأسنان
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div
          className={cn(
            "rounded-2xl p-7 shadow-2xl",
            "bg-white/8 backdrop-blur-xl border border-white/10"
          )}
        >
          <div className="mb-5">
            <h2 className="text-base font-bold text-white/90">تسجيل الدخول</h2>
            <p className="text-xs text-[hsl(185,30%,65%)] mt-0.5">أدخل كلمة المرور للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "h-11 pr-9 pl-10 text-sm rounded-xl",
                    "bg-white/8 border-white/15 text-white placeholder:text-white/25",
                    "focus-visible:ring-1 focus-visible:ring-[hsl(185,60%,55%)] focus-visible:border-[hsl(185,60%,55%)/50]",
                    "transition-all duration-200"
                  )}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-11 text-sm font-bold rounded-xl shine-on-hover",
                "bg-gradient-to-r from-[hsl(185,60%,38%)] to-[hsl(172,60%,42%)]",
                "hover:from-[hsl(185,60%,43%)] hover:to-[hsl(172,60%,47%)]",
                "text-white shadow-[0_4px_20px_rgba(45,180,160,0.35)]",
                "transition-all duration-200 border-0",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  جاري الدخول...
                </span>
              ) : (
                "دخول النظام"
              )}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
