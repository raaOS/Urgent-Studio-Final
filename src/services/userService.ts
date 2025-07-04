'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { User } from '@/lib/types';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  type DocumentSnapshot,
} from 'firebase/firestore';

// Helper to convert Firestore doc to User
function toUser(doc: DocumentSnapshot): User {
  const data = doc.data();
  return {
    id: doc.id,
    name: data?.name || '',
    email: data?.email || '',
    role: data?.role || 'Designer',
    avatar: data?.avatar || 'https://placehold.co/100x100.png',
  };
}

// Fetches all users from Firestore
export async function getUsers(): Promise<User[]> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase not configured. Returning empty user list for panel.");
    return [];
  }
  try {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);

    if (userSnapshot.empty) {
      console.log("No users found in database. The panel will not show user data until a user is created or the default one is added.");
       const defaultOwner: Omit<User, 'id'> = {
            name: "Admin Owner",
            email: "owner@artisant.com",
            role: "Owner",
            avatar: "https://placehold.co/100x100.png",
        };
        const newUser = await addUser(defaultOwner);
        return [newUser];
    }
    
    return userSnapshot.docs.map(toUser);
  } catch (error) {
    console.warn("Firebase Warning: Failed to get users, returning empty array.", error);
    // Return empty array on error to prevent client-side crashes.
    return [];
  }
}

// Fetches a single user by ID
export async function getUserById(id: string): Promise<User | null> {
  // If in prototype mode, return the mock owner
  if (!isFirebaseConfigured || !db) {
    if (id === 'mock-user-id-01') {
      return {
        id: 'mock-user-id-01',
        name: 'Admin (Prototype)',
        email: 'owner@artisant.com',
        role: 'Owner',
        avatar: 'https://placehold.co/100x100.png'
      };
    }
    return null;
  }
  // Real Firebase logic
  try {
    const userDocRef = doc(db, 'users', id);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      return null;
    }
    return toUser(userDoc);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal mengambil user ${id}:`, error);
    return null;
  }
}


// Adds a new user to Firestore
export async function addUser(userData: Omit<User, 'id'>): Promise<User> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const usersCollection = collection(db, 'users');
    const docRef = await addDoc(usersCollection, userData);
    return { id: docRef.id, ...userData };
  } catch (error) {
    console.warn("Firebase Warning: Gagal menambah user:", error);
    throw new Error("Gagal menambah user ke database.");
  }
}

// Updates an existing user in Firestore
export async function updateUser(id: string, userUpdate: Partial<Omit<User, 'id'>>): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const userDoc = doc(db, 'users', id);
    await updateDoc(userDoc, userUpdate);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal memperbarui user ${id}:`, error);
    throw new Error("Gagal memperbarui user di database.");
  }
}

// Deletes a user from Firestore
export async function deleteUser(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error("Firebase tidak terkonfigurasi.");
  try {
    const userDoc = doc(db, 'users', id);
    await deleteDoc(userDoc);
  } catch (error) {
    console.warn(`Firebase Warning: Gagal menghapus user ${id}:`, error);
    throw new Error("Gagal menghapus user dari database.");
  }
}
