
'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Coupon } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  limit,
  type DocumentData,
} from 'firebase/firestore';

// Helper to convert Firestore doc to Coupon
function toCoupon(doc: DocumentData): Coupon {
  const data = doc.data();
  return {
    id: doc.id,
    code: data.code || '',
    name: data.name || '',
    discountPercentage: data.discountPercentage || 0,
    image: data.image || 'https://placehold.co/300x150.png',
    isActive: data.isActive ?? false,
  };
}

// Fetches all coupons from Firestore
export async function getCoupons(): Promise<Coupon[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const couponsCollection = collection(db, 'coupons');
    const snapshot = await getDocs(couponsCollection);
    return snapshot.docs.map(toCoupon);
  } catch (error) {
    console.warn("Firebase Warning: Gagal mengambil kupon:", error);
    throw new Error("Gagal mengambil data kupon.");
  }
}

// Fetches a single active coupon by its code
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  if (!code || !isFirebaseConfigured || !db) return null;
  try {
    const couponsCollection = collection(db, 'coupons');
    const q = query(
      couponsCollection, 
      where("code", "==", code.toUpperCase()), 
      where("isActive", "==", true), 
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    return toCoupon(snapshot.docs[0]);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal mengambil kupon dengan kode ${code}:`, error);
    throw new Error("Gagal mengambil data kupon.");
  }
}

// Adds a new coupon to Firestore
export async function addCoupon(couponData: Omit<Coupon, 'id'>): Promise<Coupon> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const couponsCollection = collection(db, 'coupons');
    const docRef = await addDoc(couponsCollection, couponData);
    return { id: docRef.id, ...couponData };
  } catch (error) {
    console.warn("Firebase Warning: Gagal menambah kupon:", error);
    throw new Error("Gagal menambah kupon.");
  }
}

// Updates an existing coupon in Firestore
export async function updateCoupon(id: string, couponUpdate: Partial<Omit<Coupon, 'id'>>): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const couponDoc = doc(db, 'coupons', id);
    await updateDoc(couponDoc, couponUpdate);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal memperbarui kupon ${id}:`, error);
    throw new Error("Gagal memperbarui kupon.");
  }
}

// Deletes a coupon from Firestore
export async function deleteCoupon(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const couponDoc = doc(db, 'coupons', id);
    await deleteDoc(couponDoc);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal menghapus kupon ${id}:`, error);
    throw new Error("Gagal menghapus kupon.");
  }
}
