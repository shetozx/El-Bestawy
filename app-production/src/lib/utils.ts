import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ar-EG").format(num);
}

export function formatDate(date: string): string {
  if (!date) return "—";
  try {
    const d = date.includes("T") ? parseISO(date) : new Date(date);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return date;
  }
}

export function formatDateTime(date: string): string {
  if (!date) return "—";
  try {
    const d = parseISO(date);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return date;
  }
}

export function getDaysUntilExpiry(expiryDate: string): number {
  if (!expiryDate) return Infinity;
  try {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return differenceInDays(expiry, today);
  } catch {
    return Infinity;
  }
}

export function calculateStockStatus(product: {
  stock: number;
  minStock: number;
}): "available" | "low" | "out" {
  if (product.stock <= 0) return "out";
  if (product.stock <= product.minStock) return "low";
  return "available";
}

export function getStockStatusColor(
  status: "available" | "low" | "out"
): string {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "low":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "out":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  }
}

export function getStockStatusLabel(
  status: "available" | "low" | "out"
): string {
  switch (status) {
    case "available":
      return "متوفر";
    case "low":
      return "منخفض";
    case "out":
      return "نفذ";
  }
}

export function getExpiryStatusColor(daysLeft: number): string {
  if (daysLeft < 0)
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (daysLeft <= 30)
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getArabicGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صباح الخير";
  if (hour < 17) return "مساء الخير";
  return "مساء الخير";
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
