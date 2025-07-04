'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, type DocumentData, type DocumentSnapshot } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

// Kelas dasar ini tidak dimaksudkan untuk digunakan langsung,
// tetapi untuk di-extend oleh service lain seperti OrderService, ProductService, dll.
export abstract class BaseService<T extends { id?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    if (!collectionName) {
        throw new Error("Nama koleksi wajib diisi saat membuat service.");
    }
    this.collectionName = collectionName;
  }

  protected toFirestore(data: Partial<T>): DocumentData {
    // Implementasi default, bisa di-override oleh kelas turunan
    return data;
  }

  protected fromFirestore(snapshot: DocumentSnapshot<DocumentData>): T {
    // Implementasi default, bisa di-override oleh kelas turunan
    if (!snapshot.exists()) {
        throw new Error(`Dokumen tidak ditemukan: ${snapshot.id}`);
    }
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as T;
  }

  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? this.fromFirestore(docSnap) : null;
    } catch (error) {
      this.handleError('getById', error);
      return null;
    }
  }

  async create(data: Omit<T, 'id'>): Promise<string | null> {
    try {
      const dataToSave = this.toFirestore({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Partial<T>);

      const docRef = await addDoc(collection(db, this.collectionName), dataToSave);
      return docRef.id;
    } catch (error) {
      this.handleError('create', error);
      return null;
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<boolean> {
    try {
      const dataToUpdate = this.toFirestore({
          ...data,
          updatedAt: new Date()
      } as Partial<T>);

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, dataToUpdate);
      return true;
    } catch (error) {
      this.handleError('update', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      this.handleError('delete', error);
      return false;
    }
  }

  protected handleError(operation: string, error: unknown): void {
    const errorMessage = error instanceof FirebaseError
      ? `Firebase error (${error.code})`
      : 'Unknown error occurred';

    console.error(`[${this.collectionName}Service][${operation}] ${errorMessage}`, error);

    // Di masa depan, ini bisa diintegrasikan dengan layanan monitoring seperti Sentry
    // if (typeof window !== 'undefined' && window.errorReporter) {
    //   window.errorReporter.captureException(error);
    // }
  }
}
