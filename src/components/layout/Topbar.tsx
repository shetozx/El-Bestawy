import { useState } from "react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { formatDate, getArabicGreeting } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sun, Moon, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onSearch?: (query: string) => void;
}

export function Topbar({ onSearch }: TopbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const storeName = useSettingsStore((s) => s.getStoreName());

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    updateSettings({ darkMode: newDark });
  };

  const today = new Date().toISOString();
  const greeting = getArabicGreeting();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 px-4 lg:px-6",
        "border-b border-border bg-background/80 backdrop-blur-md",
        "transition-colors duration-300"
      )}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث في المنتجات والعملاء..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className={cn(
            "h-9 pr-9 text-sm rounded-xl",
            "bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50",
            "placeholder:text-muted-foreground/60 transition-all duration-200",
            "focus:bg-card focus:shadow-sm"
          )}
        />
      </div>

      <div className="mr-auto flex items-center gap-1">
        {/* Greeting */}
        <span className="hidden md:block text-xs text-muted-foreground font-medium px-2">
          {greeting} 👋
        </span>

        {/* Notification placeholder */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* Dark mode */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70"
          onClick={toggleTheme}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Date pill */}
        <div className="hidden lg:flex items-center gap-2 mr-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground leading-none mb-0.5">التاريخ</p>
            <p className="text-xs font-semibold leading-none">{formatDate(today)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
