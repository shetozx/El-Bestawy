import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useProductStore } from "@/stores/useProductStore";
import { useCustomerStore } from "@/stores/useCustomerStore";
import { useSupplierStore } from "@/stores/useSupplierStore";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ProductDetailsPage } from "@/pages/ProductDetailsPage";
import { SalesPage } from "@/pages/SalesPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { SuppliersPage } from "@/pages/SuppliersPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { DataInitializer } from "@/components/shared/DataInitializer";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const fetchSuppliers = useSupplierStore((s) => s.fetchSuppliers);
  const fetchInvoices = useInvoiceStore((s) => s.fetchInvoices);

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchCustomers();
      fetchSuppliers();
      fetchInvoices();
    }
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <DataInitializer />
      <AppRoutes />
    </>
  );
}
