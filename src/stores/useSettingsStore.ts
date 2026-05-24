import { create } from "zustand";
import { settingsRef, getDocument, updateDocument } from "@/lib/firebase";
import type { Settings } from "@/types";

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<Settings>) => Promise<void>;
  getStoreName: () => string;
}

const defaultSettings: Settings = {
  storeName: "El-Bestawy Groups",
  currency: "EGP",
  taxRate: 14,
  password: "admin123",
  darkMode: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...defaultSettings },
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const data = await getDocument<Settings>(settingsRef);
      if (data) {
        set({ settings: data });
        // Apply dark mode if set
        if (data.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (data) => {
    try {
      await updateDocument(settingsRef, data);
      set((s) => ({ settings: { ...s.settings, ...data } }));
      if (data.darkMode !== undefined) {
        if (data.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  },

  getStoreName: () => get().settings.storeName || "El-Bestawy Groups",
}));
