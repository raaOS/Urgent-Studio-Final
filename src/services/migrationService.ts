
'use server';

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, type Firestore, type DocumentData, doc } from 'firebase/firestore';
import { db as currentDb, isFirebaseConfigured as isCurrentDbConfigured } from '@/lib/firebase';

const OLD_PROJECT_ID = 'database-urgent-studio'; 

const oldFirebaseConfig = {
  apiKey: process.env.OLD_FIREBASE_API_KEY, 
  authDomain: `${OLD_PROJECT_ID}.firebaseapp.com`,
  projectId: OLD_PROJECT_ID,
  storageBucket: `${OLD_PROJECT_ID}.appspot.com`,
};

// Helper untuk inisialisasi aplikasi Firebase sekunder (untuk proyek lama)
let oldApp: FirebaseApp | null = null;
let oldDb: Firestore | null = null;

const isOldDbConfigured = !!oldFirebaseConfig.apiKey; // Simplified check

if (isOldDbConfigured) {
    const oldAppName = 'oldProject';
    const existingOldApp = getApps().find(app => app.name === oldAppName);
    if (existingOldApp) {
        oldApp = existingOldApp;
    } else {
        oldApp = initializeApp(oldFirebaseConfig, oldAppName);
    }
    oldDb = getFirestore(oldApp);
}

// Fungsi untuk memigrasi data produk
export async function migrateProductsFromOldProject(): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isCurrentDbConfigured) {
    return { success: false, count: 0, error: "Database tujuan (saat ini) tidak terkonfigurasi." };
  }
  if (!isOldDbConfigured || !oldDb) {
    return { success: false, count: 0, error: "Konfigurasi OLD_FIREBASE_API_KEY untuk proyek lama belum diatur di file .env. Harap periksa kembali." };
  }

  try {
    console.log(`Membaca koleksi 'products' dari proyek lama: ${OLD_PROJECT_ID}...`);
    const oldProductsCollection = collection(oldDb, 'products');
    const oldProductsSnapshot = await getDocs(oldProductsCollection);

    if (oldProductsSnapshot.empty) {
      return { success: true, count: 0, error: "Tidak ada produk yang ditemukan di database lama." };
    }

    const batch = writeBatch(currentDb!);
    let count = 0;

    oldProductsSnapshot.forEach((doc) => {
      const productData = doc.data();
      const newProductRef = doc(collection(currentDb!, 'products')); 
      batch.set(newProductRef, productData);
      count++;
    });

    console.log(`Menyimpan ${count} produk ke database baru...`);
    await batch.commit();
    console.log("Migrasi produk selesai.");

    return { success: true, count };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
    console.error("Gagal melakukan migrasi produk:", error);
    return { success: false, count: 0, error: message };
  }
}
