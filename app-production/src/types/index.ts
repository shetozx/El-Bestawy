export interface Product {
  id: string;
  name: string;
  company: string;
  category: string;
  stock: number;
  buyPrice: number;
  sellPrice: number;
  expiryDate: string;
  minStock: number;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalPurchases: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  lastPurchaseDate: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  storeName: string;
  currency: string;
  taxRate: number;
  password: string;
  darkMode: boolean;
}

export type NavItem = {
  label: string;
  icon: string;
  path: string;
};

export type StockStatus = "available" | "low" | "out";

export type ThemeMode = "light" | "dark";

export type ReportPeriod = "today" | "week" | "month" | "year" | "custom";

export interface DashboardStats {
  todaySales: number;
  todayInvoices: number;
  monthProfit: number;
  lowStockCount: number;
  expiringCount: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface SalesChartData {
  date: string;
  sales: number;
  profit: number;
}

export interface TopProductData {
  name: string;
  quantity: number;
  revenue: number;
}

export interface ExpiryAlertItem {
  id: string;
  name: string;
  expiryDate: string;
  daysLeft: number;
}

export interface LowStockAlertItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}
