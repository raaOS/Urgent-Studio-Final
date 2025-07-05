
'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  documentId,
  type DocumentData,
  writeBatch,
} from 'firebase/firestore';
import { mockProducts } from '@/lib/data';

// Helper to convert Firestore doc to Product, ensuring prices object exists
function toProduct(document: DocumentData): Product {
  const data = document.data();
  return {
    id: document.id,
    name: data.name || '',
    description: data.description || '',
    prices: data.prices || { kakiLima: 0, umkm: 0, ecommerce: 0 },
    category: data.category || '',
    image: data.image || '',
    hint: data.hint || '',
    // price field is for display only and can be added later if needed
  };
}

// Fetches all products from Firestore
export async function getProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase not configured, returning empty product list.");
    return [];
  }
  try {
    const productsCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productsCollection);
    const productList = productSnapshot.docs.map(toProduct);
    return productList;
  } catch (error) {
    console.warn("Firebase Warning: Gagal mengambil produk:", error);
    // Return empty array on error to prevent crashes on the client-side.
    // The calling page should handle this case.
    return [];
  }
}

// Fetches a specific subset of products by their IDs
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!isFirebaseConfigured || !db || ids.length === 0) {
    return [];
  }
  try {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where(documentId(), 'in', ids));
    const productSnapshot = await getDocs(q);
    const productList = productSnapshot.docs.map(toProduct);
    return productList;
  } catch (error) {
    console.warn("Firebase Warning: Gagal mengambil produk berdasarkan ID:", error);
    return [];
  }
}


// Adds a new product to Firestore
export async function addProduct(product: Omit<Product, 'id' | 'price'>): Promise<Product> {
    if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
    try {
        const productsCollection = collection(db, 'products');
        // The data being added to Firestore should not include an 'id' or 'price' field
        const { ...productData } = product;
        const docRef = await addDoc(productsCollection, productData);
        // Return the full product object including the new ID
        return { ...product, id: docRef.id };
    } catch (error) {
        console.warn("Firebase Warning: Gagal menambah produk:", error);
        throw new Error("Gagal menambah produk ke database.");
    }
}

// Updates an existing product in Firestore
export async function updateProduct(id: string, productUpdate: Partial<Omit<Product, 'id' | 'price'>>): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
    try {
        const productDoc = doc(db, 'products', id);
        await updateDoc(productDoc, productUpdate);
    } catch (error) {
        console.warn(`Firebase Warning: Gagal memperbarui produk ${id}:`, error);
        throw new Error("Gagal memperbarui produk di database.");
    }
}

// Deletes a product from Firestore
export async function deleteProduct(id: string): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
    try {
        const productDoc = doc(db, 'products', id);
        await deleteDoc(productDoc);
    } catch (error) {
        console.warn(`Firebase Warning: Gagal menghapus produk ${id}:`, error);
        throw new Error("Gagal menghapus produk dari database.");
    }
}

// Seeds the database with mock products
export async function seedMockProducts(): Promise<{success: boolean, count: number, error?: string}> {
  if (!isFirebaseConfigured || !db) {
    return { success: false, count: 0, error: "Firebase tidak terkonfigurasi." };
  }
  try {
    const batch = writeBatch(db);
    mockProducts.forEach(product => {
      // The mock data has an 'id' field, which we should not send to Firestore on creation.
      const { id, ...productData } = product;
      const productRef = doc(collection(db, 'products'));
      batch.set(productRef, productData);
    });
    await batch.commit();
    return { success: true, count: mockProducts.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui.";
    console.error("Gagal mengisi data contoh:", error);
    return { success: false, count: 0, error: message };
  }
}
