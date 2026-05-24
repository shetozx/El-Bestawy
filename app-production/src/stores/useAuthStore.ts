import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDoc } from "firebase/firestore";
import { settingsRef } from "@/lib/firebase";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: true,

      login: async (password: string) => {
        try {
          const snapshot = await getDoc(settingsRef);
          if (!snapshot.exists()) return false;
          const settings = snapshot.data();
          if (settings.password === password) {
            set({ isAuthenticated: true });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      logout: () => {
        set({ isAuthenticated: false });
        localStorage.removeItem("auth-storage");
      },

      checkAuth: () => {
        const state = get();
        set({ isLoading: false, isAuthenticated: state.isAuthenticated });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);
