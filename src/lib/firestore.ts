import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Types
export interface UserProfile {
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  plan: 'free' | 'pro';
}

export interface SavedBusiness {
  placeId: string;
  name: string;
  address?: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
  addedAt: Timestamp;
}

// User functions
export async function createUserProfile(uid: string, email: string, displayName?: string) {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    email,
    displayName: displayName || null,
    createdAt: serverTimestamp(),
    plan: 'free',
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
}

// Business functions
export async function saveBusiness(uid: string, business: Omit<SavedBusiness, 'addedAt'>) {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const businessRef = doc(db, 'users', uid, 'businesses', business.placeId);
  await setDoc(businessRef, {
    ...business,
    addedAt: serverTimestamp(),
  });
}

export async function getSavedBusinesses(uid: string): Promise<SavedBusiness[]> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const businessesRef = collection(db, 'users', uid, 'businesses');
  const q = query(businessesRef, orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data() as SavedBusiness);
}

export async function deleteBusiness(uid: string, placeId: string) {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const businessRef = doc(db, 'users', uid, 'businesses', placeId);
  await deleteDoc(businessRef);
}

export async function getBusinessByPlaceId(uid: string, placeId: string): Promise<SavedBusiness | null> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const businessRef = doc(db, 'users', uid, 'businesses', placeId);
  const businessSnap = await getDoc(businessRef);

  if (businessSnap.exists()) {
    return businessSnap.data() as SavedBusiness;
  }
  return null;
}
