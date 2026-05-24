import { create } from "zustand";
import {
  customersRef,
  getCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  doc,
  orderBy,
} from "@/lib/firebase";
import type { Customer } from "@/types";

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt" | "totalPurchases" | "balance">) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  getFilteredCustomers: () => Customer[];
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  isLoading: false,
  searchQuery: "",

  setSearchQuery: (q) => set({ searchQuery: q }),

  fetchCustomers: async () => {
    set({ isLoading: true });
    try {
      const data = await getCollection<Customer>(customersRef, [orderBy("updatedAt", "desc")]);
      set({ customers: data });
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addCustomer: async (customer) => {
    const now = new Date().toISOString();
    const id = `cust_${Date.now()}`;
    const newCustomer = {
      ...customer,
      id,
      totalPurchases: 0,
      balance: 0,
      createdAt: now,
      updatedAt: now,
    };
    await addDocument(customersRef, id, newCustomer);
    set((s) => ({ customers: [newCustomer as Customer, ...s.customers] }));
  },

  updateCustomer: async (id, data) => {
    const docRef = doc(customersRef, id);
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    await updateDocument(docRef, updateData);
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, ...updateData } : c
      ),
    }));
  },

  deleteCustomer: async (id) => {
    const docRef = doc(customersRef, id);
    await deleteDocument(docRef);
    set((s) => ({
      customers: s.customers.filter((c) => c.id !== id),
    }));
  },

  getCustomerById: (id) => get().customers.find((c) => c.id === id),

  getFilteredCustomers: () => {
    const { customers, searchQuery } = get();
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  },
}));
