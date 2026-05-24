import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type QueryConstraint,
  type DocumentSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Use new persistent cache API (replaces deprecated enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Collection references
export const productsRef = collection(db, "products");
export const customersRef = collection(db, "customers");
export const suppliersRef = collection(db, "suppliers");
export const invoicesRef = collection(db, "invoices");
export const settingsRef = doc(db, "settings", "default");

// Generic CRUD helpers
export async function getDocument<T>(docRef: ReturnType<typeof doc>) {
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T;
}

export async function getCollection<T>(
  colRef: ReturnType<typeof collection>,
  constraints: QueryConstraint[] = []
) {
  const q = query(colRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
}

export async function getPaginated<T>(
  colRef: ReturnType<typeof collection>,
  pageSize: number,
  lastDoc?: DocumentSnapshot,
  constraints: QueryConstraint[] = []
) {
  const paginatedConstraints: QueryConstraint[] = [
    ...constraints,
    limit(pageSize),
  ];
  if (lastDoc) {
    paginatedConstraints.push(startAfter(lastDoc));
  }
  const q = query(colRef, ...paginatedConstraints);
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
  return { docs, lastVisible, hasMore: snapshot.docs.length === pageSize };
}

export async function addDocument<T extends Record<string, unknown>>(
  colRef: ReturnType<typeof collection>,
  id: string,
  data: T
) {
  const docRef = doc(colRef, id);
  await setDoc(docRef, data);
  return { id, ...data };
}

export async function updateDocument<T extends Record<string, unknown>>(
  docRef: ReturnType<typeof doc>,
  data: Partial<T>
) {
  await updateDoc(docRef, data as Record<string, unknown>);
}

export async function deleteDocument(docRef: ReturnType<typeof doc>) {
  await deleteDoc(docRef);
}

// Re-exports for convenience
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
};

export type { DocumentSnapshot };
