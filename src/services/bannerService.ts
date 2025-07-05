
'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Banner } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore';

// Helper to convert Firestore doc to Banner
function toBanner(doc: DocumentData): Banner {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || '',
    link: data.link || '',
    image: data.image || 'https://placehold.co/1200x400.png',
    isActive: data.isActive ?? false,
  };
}

// Fetches all banners from Firestore
export async function getBanners(): Promise<Banner[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const bannersCollection = collection(db, 'banners');
    const snapshot = await getDocs(bannersCollection);
    return snapshot.docs.map(toBanner);
  } catch (error) {
    console.warn("Firebase Warning: Gagal mengambil banners:", error);
    throw error;
  }
}

// Fetches only active banners
export async function getActiveBanners(): Promise<Banner[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const bannersCollection = collection(db, 'banners');
    const q = query(bannersCollection, where("isActive", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(toBanner);
  } catch (error) {
    console.warn("Firebase Warning: Gagal mengambil banners aktif:", error);
    throw error;
  }
}

// Adds a new banner to Firestore
export async function addBanner(bannerData: Omit<Banner, 'id'>): Promise<Banner> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const bannersCollection = collection(db, 'banners');
    const docRef = await addDoc(bannersCollection, bannerData);
    return { id: docRef.id, ...bannerData };
  } catch (error) {
    console.warn("Firebase Warning: Gagal menambah banner:", error);
    throw new Error("Gagal menambah banner.");
  }
}

// Updates an existing banner in Firestore
export async function updateBanner(id: string, bannerUpdate: Partial<Omit<Banner, 'id'>>): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const bannerDoc = doc(db, 'banners', id);
    await updateDoc(bannerDoc, bannerUpdate);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal memperbarui banner ${id}:`, error);
    throw new Error("Gagal memperbarui banner.");
  }
}

// Deletes a banner from Firestore
export async function deleteBanner(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const bannerDoc = doc(db, 'banners', id);
    await deleteDoc(bannerDoc);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal menghapus banner ${id}:`, error);
    throw new Error("Gagal menghapus banner.");
  }
}
