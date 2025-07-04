
'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Refund } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';

// Helper to convert Firestore doc to Refund
function toRefund(doc: DocumentData): Refund {
  const data = doc.data();
  return {
    id: doc.id,
    orderCode: data.orderCode || '',
    refundAmount: data.refundAmount || 0,
    reason: data.reason || '',
    processedAt: (data.processedAt as Timestamp)?.toDate() || new Date(),
    processedBy: data.processedBy || 'N/A',
  };
}

// Fetches all refunds from Firestore
export async function getRefunds(): Promise<Refund[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const refundsCollection = collection(db, 'refunds');
    const snapshot = await getDocs(refundsCollection);
    return snapshot.docs.map(toRefund);
  } catch (error) {
    console.warn("Firebase Warning: Gagal mengambil data refund:", error);
    throw new Error("Gagal mengambil data refund.");
  }
}

// Adds a new refund record to Firestore
export async function addRefund(refundData: Omit<Refund, 'id'>): Promise<Refund> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const refundsCollection = collection(db, 'refunds');
    const docRef = await addDoc(refundsCollection, {
        ...refundData,
        processedAt: Timestamp.fromDate(refundData.processedAt)
    });
    return { id: docRef.id, ...refundData };
  } catch (error) {
    console.warn("Firebase Warning: Gagal menambah data refund:", error);
    throw new Error("Gagal menambah data refund ke database.");
  }
}
