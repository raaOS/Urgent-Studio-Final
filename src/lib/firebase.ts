// This file is a server-side utility for initializing Firebase.
// It should not be marked with 'use server' itself, but imported by files that are.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// =================================================================
// PENGHUBUNG KE FIREBASE
// Objek di bawah ini adalah 'alamat dan kunci' yang menghubungkan aplikasi ini 
// ke proyek Firebase Anda. Nilainya diambil dari file .env di direktori utama.
// =================================================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// This boolean is a flag to check if the Firebase config is valid.
const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log("Firebase terhubung dengan sukses.");
  } catch(e) {
    console.error("Kesalahan inisialisasi Firebase:", e);
    app = null;
    db = null;
    // Overwrite the flag if initialization fails
    (isFirebaseConfigured as any) = false;
  }
} else {
  console.warn(
    "Konfigurasi Firebase tidak ditemukan di .env. Aplikasi akan berjalan dalam mode prototipe."
  );
}

// Check for other critical environment variables
if (!process.env.GOOGLE_API_KEY) {
    console.warn("Peringatan: GOOGLE_API_KEY tidak diatur. Fitur AI tidak akan berfungsi.");
}
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("Peringatan: TELEGRAM_BOT_TOKEN tidak diatur. Fitur Bot tidak akan berfungsi.");
}

export { app, db, isFirebaseConfigured };
