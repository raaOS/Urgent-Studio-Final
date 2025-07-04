
'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Promo } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';

// Helper to convert Firestore doc to Promo
function toPromo(doc: DocumentData): Promo {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    productId: data.productId || '',
    discountPercentage: data.discountPercentage || 0,
    startDate: (data.startDate as Timestamp)?.toDate() || new Date(),
    endDate: (data.endDate as Timestamp)?.toDate() || new Date(),
    image: data.image || 'https://placehold.co/300x150.png',
  };
}

// Fetches all promos from Firestore
export async function getPromos(): Promise<Promo[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const promosCollection = collection(db, 'promos');
    const snapshot = await getDocs(promosCollection);
    return snapshot.docs.map(toPromo);
  } catch (error) {
    console.warn("Firebase Warning: Gagal mengambil promo:", error);
    throw new Error("Gagal mengambil data promo.");
  }
}

// Adds a new promo to Firestore
export async function addPromo(promoData: Omit<Promo, 'id'>): Promise<Promo> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const promosCollection = collection(db, 'promos');
    const docRef = await addDoc(promosCollection, {
        ...promoData,
        startDate: Timestamp.fromDate(promoData.startDate),
        endDate: Timestamp.fromDate(promoData.endDate)
    });
    return { id: docRef.id, ...promoData };
  } catch (error) {
    console.warn("Firebase Warning: Gagal menambah promo:", error);
    throw new Error("Gagal menambah promo.");
  }
}

// Updates an existing promo in Firestore
export async function updatePromo(id: string, promoUpdate: Partial<Omit<Promo, 'id'>>): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const promoDoc = doc(db, 'promos', id);
    const updateData: { [key: string]: any } = { ...promoUpdate };
    if (promoUpdate.startDate) {
        updateData.startDate = Timestamp.fromDate(promoUpdate.startDate);
    }
    if (promoUpdate.endDate) {
        updateData.endDate = Timestamp.fromDate(promoUpdate.endDate);
    }
    await updateDoc(promoDoc, updateData);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal memperbarui promo ${id}:`, error);
    throw new Error("Gagal memperbarui promo.");
  }
}

// Deletes a promo from Firestore
export async function deletePromo(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const promoDoc = doc(db, 'promos', id);
    await deleteDoc(promoDoc);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal menghapus promo ${id}:`, error);
    throw new Error("Gagal menghapus promo.");
  }
}
