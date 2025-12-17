import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Subscription status types
export type SubscriptionStatus = 'trialing' | 'active' | 'expired' | 'canceled' | 'past_due';
export type PlanType = 'pro' | 'business' | null;

// Subscription interface
export interface UserSubscription {
  status: SubscriptionStatus;
  plan: PlanType;
  businessLimit: number;
  currentPeriodEnd: Timestamp | null;
  polarCustomerId?: string | null;
  polarSubscriptionId?: string | null;
}

// Types
export interface UserProfile {
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  onboardingCompleted: boolean;
  // Trial info
  trialStartDate: Timestamp;
  trialEndDate: Timestamp;
  // Subscription
  subscription: UserSubscription;
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

// Helper: Create trial end date (14 days from now)
function createTrialEndDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date;
}

// Helper: Check if trial is expired
export function isTrialExpired(profile: UserProfile): boolean {
  if (!profile.trialEndDate) return true;
  const now = new Date();
  const trialEnd = profile.trialEndDate.toDate();
  return now > trialEnd;
}

// Helper: Get days remaining in trial
export function getTrialDaysRemaining(profile: UserProfile): number {
  if (!profile.trialEndDate) return 0;
  const now = new Date();
  const trialEnd = profile.trialEndDate.toDate();
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Helper: Check if user has active subscription (trial or paid)
export function hasActiveSubscription(profile: UserProfile): boolean {
  const status = profile.subscription?.status;
  return status === 'trialing' || status === 'active';
}

// Helper: Get business limit for user
export function getBusinessLimit(profile: UserProfile): number {
  return profile.subscription?.businessLimit || 0;
}

// User functions
export async function createUserProfile(uid: string, email: string, displayName?: string): Promise<UserProfile> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const trialEndDate = createTrialEndDate();
  const now = new Date();

  const newProfile: Omit<UserProfile, 'createdAt' | 'trialStartDate'> & { createdAt: ReturnType<typeof serverTimestamp>, trialStartDate: ReturnType<typeof serverTimestamp> } = {
    email,
    displayName: displayName || null,
    createdAt: serverTimestamp(),
    onboardingCompleted: false,
    trialStartDate: serverTimestamp(),
    trialEndDate: Timestamp.fromDate(trialEndDate),
    subscription: {
      status: 'trialing',
      plan: 'pro',
      businessLimit: 1,
      currentPeriodEnd: Timestamp.fromDate(trialEndDate),
    },
  };

  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, newProfile);

  // Return the profile with Timestamp objects
  return {
    ...newProfile,
    createdAt: Timestamp.fromDate(now),
    trialStartDate: Timestamp.fromDate(now),
  } as UserProfile;
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

// Get or create user profile (auto-create with trial if doesn't exist)
export async function getOrCreateUserProfile(uid: string, email: string, displayName?: string): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  if (existing) {
    return existing;
  }
  return createUserProfile(uid, email, displayName);
}

// Update user's onboarding status
export async function updateOnboardingStatus(uid: string, completed: boolean): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    onboardingCompleted: completed,
  });
}

// Update user's subscription (called by webhook)
export async function updateUserSubscription(uid: string, subscription: Partial<UserSubscription>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    subscription: subscription,
  });
}

// Check if user can add more businesses
export async function canAddBusiness(uid: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  const profile = await getUserProfile(uid);
  if (!profile) {
    return { allowed: false, current: 0, limit: 0 };
  }

  // Check if subscription is active
  if (!hasActiveSubscription(profile)) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const businesses = await getSavedBusinesses(uid);
  const limit = getBusinessLimit(profile);
  const current = businesses.length;

  return {
    allowed: current < limit,
    current,
    limit,
  };
}

// Link pending subscription (if user signed up after payment)
export async function linkPendingSubscription(uid: string, email: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  // Check for pending subscription
  const pendingRef = doc(db, 'pending_subscriptions', email);
  const pendingSnap = await getDoc(pendingRef);

  if (pendingSnap.exists()) {
    const pendingData = pendingSnap.data();

    // Update user's subscription with pending data
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      subscription: {
        status: pendingData.status === 'active' ? 'active' : 'trialing',
        plan: pendingData.plan,
        businessLimit: pendingData.plan === 'business' ? 5 : 1,
        currentPeriodEnd: pendingData.currentPeriodEnd,
        polarCustomerId: pendingData.polarCustomerId,
        polarSubscriptionId: pendingData.polarSubscriptionId,
      },
    });

    // Delete pending subscription
    await deleteDoc(pendingRef);
    return true;
  }

  return false;
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
