import { create } from "zustand";
import {
  suppliersRef,
  getCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  doc,
  orderBy,
} from "@/lib/firebase";
import type { Supplier } from "@/types";

interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt" | "lastPurchaseDate" | "balance">) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: string) => Supplier | undefined;
  getFilteredSuppliers: () => Supplier[];
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  isLoading: false,
  searchQuery: "",

  setSearchQuery: (q) => set({ searchQuery: q }),

  fetchSuppliers: async () => {
    set({ isLoading: true });
    try {
      const data = await getCollection<Supplier>(suppliersRef, [orderBy("updatedAt", "desc")]);
      set({ suppliers: data });
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addSupplier: async (supplier) => {
    const now = new Date().toISOString();
    const id = `sup_${Date.now()}`;
    const newSupplier = {
      ...supplier,
      id,
      lastPurchaseDate: "",
      balance: 0,
      createdAt: now,
      updatedAt: now,
    };
    await addDocument(suppliersRef, id, newSupplier);
    set((s) => ({ suppliers: [newSupplier as Supplier, ...s.suppliers] }));
  },

  updateSupplier: async (id, data) => {
    const docRef = doc(suppliersRef, id);
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    await updateDocument(docRef, updateData);
    set((s) => ({
      suppliers: s.suppliers.map((sup) =>
        sup.id === id ? { ...sup, ...updateData } : sup
      ),
    }));
  },

  deleteSupplier: async (id) => {
    const docRef = doc(suppliersRef, id);
    await deleteDocument(docRef);
    set((s) => ({
      suppliers: s.suppliers.filter((sup) => sup.id !== id),
    }));
  },

  getSupplierById: (id) => get().suppliers.find((s) => s.id === id),

  getFilteredSuppliers: () => {
    const { suppliers, searchQuery } = get();
    if (!searchQuery) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q)
    );
  },
}));
