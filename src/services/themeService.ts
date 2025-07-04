
'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { ThemeSettings } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const defaultTheme: ThemeSettings = {
  light: {
    background: "210 20% 98%",
    primary: "212 84% 53%",
    accent: "39 100% 50%",
    animatedGradient: {
      duration: 6,
      colors: "#2F80ED, #FFA500, #2F80ED",
    },
  },
};

export async function getThemeSettings(): Promise<ThemeSettings> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase not configured, returning default theme settings.");
    return defaultTheme;
  }
  try {
    const docRef = doc(db, 'settings', 'theme');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dbSettings = docSnap.data();
      // Deep merge defaults with db settings to ensure all properties exist, especially nested ones.
      const settings: ThemeSettings = {
        light: { 
          ...defaultTheme.light, 
          ...dbSettings.light, 
          animatedGradient: { ...defaultTheme.light.animatedGradient, ...dbSettings.light?.animatedGradient } 
        },
      };
      return settings;
    } else {
      console.log("No theme document found, returning default.");
      return defaultTheme;
    }
  } catch (error) {
    console.warn("Firebase Warning: Gagal mengambil pengaturan tema:", error);
    return defaultTheme;
  }
}

export async function saveThemeSettings(settings: ThemeSettings): Promise<{ success: boolean; error?: string }> {
    if (!isFirebaseConfigured || !db) {
        return { success: false, error: "Firebase tidak terkonfigurasi." };
    }
    try {
        const docRef = doc(db, 'settings', 'theme');
        await setDoc(docRef, settings, { merge: true });
        revalidatePath('/', 'layout'); // Revalidate all pages
        return { success: true };
    } catch (error) {
        console.warn("Firebase Warning: Gagal menyimpan pengaturan tema:", error);
        return { success: false, error: "Gagal menyimpan ke database." };
    }
}
