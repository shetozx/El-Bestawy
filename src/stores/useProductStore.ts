import { create } from "zustand";
import {
  productsRef,
  getCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  doc,
  orderBy,
} from "@/lib/firebase";
import type { Product } from "@/types";
import { calculateStockStatus, getDaysUntilExpiry } from "@/lib/utils";

interface ProductState {
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  selectedCompany: string;
  sortField: keyof Product;
  sortDirection: "asc" | "desc";
  page: number;
  pageSize: number;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  setSelectedCompany: (c: string) => void;
  setSortField: (f: keyof Product) => void;
  toggleSortDirection: () => void;
  setPage: (p: number) => void;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getFilteredProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  getCategories: () => string[];
  getCompanies: () => string[];
  getLowStockProducts: () => Product[];
  getExpiringProducts: () => Product[];
  getTotalStockValue: () => number;
  getStockStatus: (product: Product) => "available" | "low" | "out";
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  searchQuery: "",
  selectedCategory: "",
  selectedCompany: "",
  sortField: "name",
  sortDirection: "asc",
  page: 1,
  pageSize: 20,

  setSearchQuery: (q) => set({ searchQuery: q, page: 1 }),
  setSelectedCategory: (c) => set({ selectedCategory: c, page: 1 }),
  setSelectedCompany: (c) => set({ selectedCompany: c, page: 1 }),
  setSortField: (f) => {
    const { sortField, sortDirection } = get();
    if (sortField === f) {
      set({ sortDirection: sortDirection === "asc" ? "desc" : "asc" });
    } else {
      set({ sortField: f, sortDirection: "asc" });
    }
  },
  toggleSortDirection: () =>
    set((s) => ({ sortDirection: s.sortDirection === "asc" ? "desc" : "asc" })),
  setPage: (p) => set({ page: p }),

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const data = await getCollection<Product>(productsRef, [orderBy("updatedAt", "desc")]);
      set({ products: data });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    const now = new Date().toISOString();
    const id = `prod_${Date.now()}`;
    const newProduct = {
      ...product,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await addDocument(productsRef, id, newProduct);
    set((s) => ({ products: [newProduct as Product, ...s.products] }));
  },

  updateProduct: async (id, data) => {
    const docRef = doc(productsRef, id);
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    await updateDocument(docRef, updateData);
    set((s) => ({
      products: s.products.map((p) =>
        p.id === id ? { ...p, ...updateData } : p
      ),
    }));
  },

  deleteProduct: async (id) => {
    const docRef = doc(productsRef, id);
    await deleteDocument(docRef);
    set((s) => ({
      products: s.products.filter((p) => p.id !== id),
    }));
  },

  getFilteredProducts: () => {
    const { products, searchQuery, selectedCategory, selectedCompany, sortField, sortDirection } = get();
    let filtered = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedCompany) {
      filtered = filtered.filter((p) => p.company === selectedCompany);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal, "ar")
          : bVal.localeCompare(aVal, "ar");
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return filtered;
  },

  getProductById: (id) => get().products.find((p) => p.id === id),

  getCategories: () => {
    const cats = new Set(get().products.map((p) => p.category));
    return Array.from(cats).filter(Boolean).sort();
  },

  getCompanies: () => {
    const comps = new Set(get().products.map((p) => p.company));
    return Array.from(comps).filter(Boolean).sort();
  },

  getLowStockProducts: () =>
    get().products.filter((p) => p.stock <= p.minStock && p.stock > 0),

  getExpiringProducts: () =>
    get().products.filter((p) => {
      if (!p.expiryDate) return false;
      return getDaysUntilExpiry(p.expiryDate) <= 30;
    }),

  getTotalStockValue: () =>
    get().products.reduce((sum, p) => sum + p.stock * p.buyPrice, 0),

  getStockStatus: (product) => calculateStockStatus(product),
}));
