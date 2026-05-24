import { create } from "zustand";
import {
  invoicesRef,
  getCollection,
  addDocument,
  deleteDocument,
  doc,
  orderBy,
  where,
} from "@/lib/firebase";
import type { Invoice, SalesChartData, TopProductData } from "@/types";
import { subDays } from "date-fns";

interface InvoiceState {
  invoices: Invoice[];
  isLoading: boolean;
  startDate: string;
  endDate: string;
  setDateRange: (start: string, end: string) => void;
  fetchInvoices: () => Promise<void>;
  fetchTodayInvoices: () => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoiceById: (id: string) => Invoice | undefined;
  getFilteredInvoices: () => Invoice[];
  getTodayStats: () => { sales: number; count: number };
  getMonthStats: () => { sales: number; profit: number };
  getSalesChartData: (days?: number) => SalesChartData[];
  getTopProducts: () => TopProductData[];
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  isLoading: false,
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],

  setDateRange: (start, end) => set({ startDate: start, endDate: end }),

  fetchInvoices: async () => {
    set({ isLoading: true });
    try {
      const data = await getCollection<Invoice>(invoicesRef, [orderBy("createdAt", "desc")]);
      set({ invoices: data });
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodayInvoices: async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await getCollection<Invoice>(invoicesRef, [
        where("createdAt", ">=", `${today}T00:00:00.000Z`),
        where("createdAt", "<=", `${today}T23:59:59.999Z`),
        orderBy("createdAt", "desc"),
      ]);
      set((s) => ({
        invoices: [...data, ...s.invoices.filter((i) => !i.createdAt.startsWith(today))],
      }));
    } catch (error) {
      console.error("Error fetching today's invoices:", error);
    }
  },

  addInvoice: async (invoice) => {
    const now = new Date().toISOString();
    const id = `inv_${Date.now()}`;
    const newInvoice = {
      ...invoice,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await addDocument(invoicesRef, id, newInvoice);
    set((s) => ({ invoices: [newInvoice as Invoice, ...s.invoices] }));
    return id;
  },

  deleteInvoice: async (id) => {
    const docRef = doc(invoicesRef, id);
    await deleteDocument(docRef);
    set((s) => ({
      invoices: s.invoices.filter((i) => i.id !== id),
    }));
  },

  getInvoiceById: (id) => get().invoices.find((i) => i.id === id),

  getFilteredInvoices: () => {
    const { invoices, startDate, endDate } = get();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      return invDate >= start && invDate <= end;
    });
  },

  getTodayStats: () => {
    const today = new Date().toISOString().split("T")[0];
    const todayInvoices = get().invoices.filter((i) =>
      i.createdAt.startsWith(today)
    );
    return {
      sales: todayInvoices.reduce((sum, i) => sum + i.total, 0),
      count: todayInvoices.length,
    };
  },

  getMonthStats: () => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthInvoices = get().invoices.filter((i) =>
      i.createdAt.startsWith(monthStart)
    );
    const sales = monthInvoices.reduce((sum, i) => sum + i.total, 0);
    const profit = monthInvoices.reduce((sum, i) => {
      const itemsProfit = i.items.reduce(
        (p, item) => p + (item.price * 0.4) * item.quantity,
        0
      );
      return sum + itemsProfit;
    }, 0);
    return { sales, profit };
  },

  getSalesChartData: (days = 30) => {
    const { invoices } = get();
    const data: SalesChartData[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const label = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
      const dayInvoices = invoices.filter((inv) =>
        inv.createdAt.startsWith(dateStr)
      );
      const sales = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const profit = dayInvoices.reduce((sum, inv) => {
        return (
          sum +
          inv.items.reduce(
            (p, item) => p + (item.price * 0.4) * item.quantity,
            0
          )
        );
      }, 0);
      data.push({
        date: label,
        sales,
        profit,
      });
    }
    return data;
  },

  getTopProducts: () => {
    const { invoices } = get();
    const productMap = new Map<string, { quantity: number; revenue: number }>();

    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const existing = productMap.get(item.productName) || {
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.total;
        productMap.set(item.productName, existing);
      });
    });

    return Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  },
}));
