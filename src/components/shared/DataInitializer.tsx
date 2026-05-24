import { useEffect, useRef } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const sampleProducts = [
  { id: "prod_1", name: "حشوة تجميلية أمامية 3M", company: "3M ESPE", category: "حشوات", stock: 45, buyPrice: 120, sellPrice: 180, expiryDate: "2026-12-31", minStock: 10, supplierId: "sup_1", createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-05-20T14:30:00Z" },
  { id: "prod_2", name: "أدوات قلع أسنان جراحية", company: "Hu-Friedy", category: "أدوات جراحية", stock: 8, buyPrice: 850, sellPrice: 1200, expiryDate: "", minStock: 5, supplierId: "sup_2", createdAt: "2025-02-10T08:00:00Z", updatedAt: "2025-05-18T11:00:00Z" },
  { id: "prod_3", name: "تاج زيركونيا أمريكي", company: "Glidewell", category: "تيجان", stock: 25, buyPrice: 350, sellPrice: 550, expiryDate: "", minStock: 8, supplierId: "sup_1", createdAt: "2025-01-20T09:00:00Z", updatedAt: "2025-05-22T16:00:00Z" },
  { id: "prod_4", name: "لاصق أقواس معدنية", company: "Ormco", category: "تقويم", stock: 3, buyPrice: 200, sellPrice: 320, expiryDate: "2025-08-15", minStock: 5, supplierId: "sup_3", createdAt: "2025-03-05T12:00:00Z", updatedAt: "2025-05-19T10:00:00Z" },
  { id: "prod_5", name: "واقي أسنان رياضي", company: "Shock Doctor", category: "واقيات", stock: 30, buyPrice: 85, sellPrice: 150, expiryDate: "2027-06-30", minStock: 10, supplierId: "sup_2", createdAt: "2025-02-28T14:00:00Z", updatedAt: "2025-05-21T09:00:00Z" },
  { id: "prod_6", name: "جهاز تعقيم أوتوكلاف", company: "MELAG", category: "تعقيم", stock: 12, buyPrice: 12000, sellPrice: 16500, expiryDate: "", minStock: 2, supplierId: "sup_1", createdAt: "2024-11-10T08:00:00Z", updatedAt: "2025-05-15T11:00:00Z" },
  { id: "prod_7", name: "كرسي أسنان كهربائي", company: "A-dec", category: "أثاث", stock: 4, buyPrice: 45000, sellPrice: 62000, expiryDate: "", minStock: 1, supplierId: "sup_1", createdAt: "2024-10-20T07:00:00Z", updatedAt: "2025-05-10T13:00:00Z" },
  { id: "prod_8", name: "أشعة ديجيتال محمولة", company: "Dexis", category: "أشعة", stock: 7, buyPrice: 28000, sellPrice: 38000, expiryDate: "", minStock: 2, supplierId: "sup_3", createdAt: "2024-12-01T09:00:00Z", updatedAt: "2025-05-12T15:00:00Z" },
  { id: "prod_9", name: "مطهر أسطح ومعدات", company: "Metrex", category: "تطهير", stock: 18, buyPrice: 95, sellPrice: 145, expiryDate: "2026-03-20", minStock: 8, supplierId: "sup_2", createdAt: "2025-01-05T11:00:00Z", updatedAt: "2025-05-23T08:00:00Z" },
  { id: "prod_10", name: "تيجان EMAX", company: "Ivoclar Vivadent", category: "تيجان", stock: 40, buyPrice: 450, sellPrice: 700, expiryDate: "", minStock: 10, supplierId: "sup_1", createdAt: "2025-02-15T10:00:00Z", updatedAt: "2025-05-22T14:00:00Z" },
  { id: "prod_11", name: "وحدة قلع عقل", company: "Kohler Medizintechnik", category: "أدوات جراحية", stock: 15, buyPrice: 2200, sellPrice: 3100, expiryDate: "", minStock: 3, supplierId: "sup_3", createdAt: "2025-03-10T09:00:00Z", updatedAt: "2025-05-20T12:00:00Z" },
  { id: "prod_12", name: "ليزر أسنان علاجي", company: "Biolase", category: "ليزر", stock: 2, buyPrice: 65000, sellPrice: 89000, expiryDate: "", minStock: 1, supplierId: "sup_1", createdAt: "2024-09-15T08:00:00Z", updatedAt: "2025-05-08T10:00:00Z" },
  { id: "prod_13", name: "مواد تبييض أسنان", company: "Ultradent", category: "تبييض", stock: 22, buyPrice: 180, sellPrice: 280, expiryDate: "2026-01-31", minStock: 8, supplierId: "sup_2", createdAt: "2025-01-25T13:00:00Z", updatedAt: "2025-05-21T11:00:00Z" },
  { id: "prod_14", name: "غراء أقواس تقويم", company: "3M Unitek", category: "تقويم", stock: 0, buyPrice: 320, sellPrice: 480, expiryDate: "2025-07-15", minStock: 5, supplierId: "sup_1", createdAt: "2025-02-20T10:00:00Z", updatedAt: "2025-05-18T09:00:00Z" },
  { id: "prod_15", name: "حشوة عصب MTA", company: "Dentsply", category: "حشوات عصب", stock: 6, buyPrice: 650, sellPrice: 950, expiryDate: "2026-09-30", minStock: 4, supplierId: "sup_3", createdAt: "2025-03-15T11:00:00Z", updatedAt: "2025-05-23T10:00:00Z" },
];

const sampleCustomers = [
  { id: "cust_1", name: "عيادة الدكتور أحمد سعيد", phone: "01001234567", totalPurchases: 45000, balance: 0, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-05-20T14:00:00Z" },
  { id: "cust_2", name: "مركز أسنان النخبة", phone: "01112223334", totalPurchases: 28000, balance: 5000, createdAt: "2025-02-05T09:00:00Z", updatedAt: "2025-05-22T11:00:00Z" },
  { id: "cust_3", name: "عيادة الدكتورة سارة محمود", phone: "01555556666", totalPurchases: 12500, balance: 0, createdAt: "2025-02-20T10:00:00Z", updatedAt: "2025-05-18T16:00:00Z" },
  { id: "cust_4", name: "مستشفى الأسنان التخصصي", phone: "01224455667", totalPurchases: 78000, balance: 12000, createdAt: "2025-01-15T07:00:00Z", updatedAt: "2025-05-23T09:00:00Z" },
  { id: "cust_5", name: "عيادة ابتسامة جديدة", phone: "01009998877", totalPurchases: 8900, balance: 0, createdAt: "2025-03-10T11:00:00Z", updatedAt: "2025-05-19T13:00:00Z" },
];

const sampleSuppliers = [
  { id: "sup_1", name: "شركة الدلتا الطبية", phone: "0223456789", lastPurchaseDate: "2025-05-18", balance: 45000, createdAt: "2024-10-01T08:00:00Z", updatedAt: "2025-05-18T12:00:00Z" },
  { id: "sup_2", name: "المؤسسة العربية للمستلزمات", phone: "0334567890", lastPurchaseDate: "2025-05-10", balance: 22000, createdAt: "2024-11-15T09:00:00Z", updatedAt: "2025-05-10T14:00:00Z" },
  { id: "sup_3", name: "يونيفرسال ميديكال", phone: "0245678901", lastPurchaseDate: "2025-05-22", balance: 31000, createdAt: "2025-01-05T10:00:00Z", updatedAt: "2025-05-22T11:00:00Z" },
];

const sampleInvoices = [
  { id: "inv_1", customerId: "cust_1", customerName: "عيادة الدكتور أحمد سعيد", items: [
    { productId: "prod_1", productName: "حشوة تجميلية أمامية 3M", quantity: 5, price: 180, total: 900 },
    { productId: "prod_3", productName: "تاج زيركونيا أمريكي", quantity: 2, price: 550, total: 1100 },
  ], subtotal: 2000, discount: 100, total: 1900, createdAt: "2025-05-24T08:30:00Z", updatedAt: "2025-05-24T08:30:00Z" },
  { id: "inv_2", customerId: "cust_4", customerName: "مستشفى الأسنان التخصصي", items: [
    { productId: "prod_6", productName: "جهاز تعقيم أوتوكلاف", quantity: 1, price: 16500, total: 16500 },
  ], subtotal: 16500, discount: 500, total: 16000, createdAt: "2025-05-24T10:00:00Z", updatedAt: "2025-05-24T10:00:00Z" },
  { id: "inv_3", customerId: "cust_2", customerName: "مركز أسنان النخبة", items: [
    { productId: "prod_10", productName: "تيجان EMAX", quantity: 3, price: 700, total: 2100 },
    { productId: "prod_13", productName: "مواد تبييض أسنان", quantity: 2, price: 280, total: 560 },
  ], subtotal: 2660, discount: 160, total: 2500, createdAt: "2025-05-23T14:00:00Z", updatedAt: "2025-05-23T14:00:00Z" },
  { id: "inv_4", customerId: "cust_3", customerName: "عيادة الدكتورة سارة محمود", items: [
    { productId: "prod_9", productName: "مطهر أسطح ومعدات", quantity: 4, price: 145, total: 580 },
  ], subtotal: 580, discount: 0, total: 580, createdAt: "2025-05-23T09:30:00Z", updatedAt: "2025-05-23T09:30:00Z" },
  { id: "inv_5", customerId: "cust_1", customerName: "عيادة الدكتور أحمد سعيد", items: [
    { productId: "prod_5", productName: "واقي أسنان رياضي", quantity: 10, price: 150, total: 1500 },
  ], subtotal: 1500, discount: 0, total: 1500, createdAt: "2025-05-22T11:00:00Z", updatedAt: "2025-05-22T11:00:00Z" },
];

export function DataInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function initialize() {
      try {
        const settingsSnap = await getDoc(doc(db, "settings", "default"));
        if (!settingsSnap.exists()) {
          await setDoc(doc(db, "settings", "default"), {
            storeName: "El-Bestawy Groups",
            currency: "EGP",
            taxRate: 14,
            password: "admin123",
            darkMode: false,
          });

          for (const product of sampleProducts) {
            await setDoc(doc(db, "products", product.id), product);
          }
          for (const customer of sampleCustomers) {
            await setDoc(doc(db, "customers", customer.id), customer);
          }
          for (const supplier of sampleSuppliers) {
            await setDoc(doc(db, "suppliers", supplier.id), supplier);
          }
          for (const invoice of sampleInvoices) {
            await setDoc(doc(db, "invoices", invoice.id), invoice);
          }
        }
      } catch {
        // Silently fail - Firestore might not be configured yet
      }
    }

    initialize();
  }, []);

  return null;
}
