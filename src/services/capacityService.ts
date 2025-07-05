
'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { CapacitySettings } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const defaultCapacity: CapacitySettings = {
  weekly: 5,
  monthly: 20,
};

// Fetches capacity settings from Firestore
export async function getCapacitySettings(): Promise<CapacitySettings> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase not configured, returning default capacity settings.");
    return defaultCapacity;
  }
  try {
    const docRef = doc(db, 'settings', 'capacity');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Merge with defaults to ensure all fields are present
      return { ...defaultCapacity, ...docSnap.data() };
    } else {
      console.log("No capacity settings found, returning default.");
      return defaultCapacity;
    }
  } catch (error) {
    console.error("Firebase Warning: Gagal mengambil pengaturan kapasitas:", error);
    throw error;
  }
}

// Saves capacity settings to Firestore
export async function saveCapacitySettings(settings: CapacitySettings): Promise<void> {
    if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
    try {
        const docRef = doc(db, 'settings', 'capacity');
        await setDoc(docRef, settings, { merge: true });
    } catch (error) {
        console.warn("Firebase Warning: Gagal menyimpan pengaturan kapasitas:", error);
        throw new Error("Gagal menyimpan pengaturan kapasitas ke database.");
    }
}
