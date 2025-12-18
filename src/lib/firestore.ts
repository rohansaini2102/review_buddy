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
    displayName: displayName || undefined,
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
// Uses dot notation to avoid overwriting existing fields
export async function updateUserSubscription(uid: string, subscription: Partial<UserSubscription>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', uid);

  // Build update object with dot notation to merge fields
  const updateData: Record<string, unknown> = {};

  if (subscription.status !== undefined) {
    updateData['subscription.status'] = subscription.status;
  }
  if (subscription.plan !== undefined) {
    updateData['subscription.plan'] = subscription.plan;
  }
  if (subscription.businessLimit !== undefined) {
    updateData['subscription.businessLimit'] = subscription.businessLimit;
  }
  if (subscription.currentPeriodEnd !== undefined) {
    updateData['subscription.currentPeriodEnd'] = subscription.currentPeriodEnd;
  }
  if (subscription.polarCustomerId !== undefined) {
    updateData['subscription.polarCustomerId'] = subscription.polarCustomerId;
  }
  if (subscription.polarSubscriptionId !== undefined) {
    updateData['subscription.polarSubscriptionId'] = subscription.polarSubscriptionId;
  }

  if (Object.keys(updateData).length > 0) {
    await updateDoc(userRef, updateData);
  }
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

// ============================================
// PAGE CONFIG - Review Page Customization
// ============================================

export interface Testimonial {
  id: string;
  text: string;
  author: string;
  rating: number;
  createdAt: Timestamp;
}

export interface PageConfig {
  headerTitle: string;
  headerSubtitle: string;
  ctaButtonText: string;
  ctaButtonColor: string;
  testimonials: Testimonial[];
  showRating: boolean;
  showTestimonials: boolean;
  updatedAt: Timestamp;
}

// Default page config for new businesses
export const DEFAULT_PAGE_CONFIG: Omit<PageConfig, 'updatedAt'> = {
  headerTitle: 'How was your experience?',
  headerSubtitle: 'We\'d love to hear your feedback!',
  ctaButtonText: 'Leave a Review',
  ctaButtonColor: '#3b82f6',
  testimonials: [],
  showRating: true,
  showTestimonials: true,
};

// Get page config for a business
export async function getPageConfig(uid: string, placeId: string): Promise<PageConfig | null> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const configRef = doc(db, 'users', uid, 'businesses', placeId, 'pageConfig', 'config');
  const configSnap = await getDoc(configRef);

  if (configSnap.exists()) {
    return configSnap.data() as PageConfig;
  }
  return null;
}

// Get page config or return defaults
export async function getPageConfigWithDefaults(uid: string, placeId: string): Promise<PageConfig> {
  const config = await getPageConfig(uid, placeId);
  if (config) return config;

  return {
    ...DEFAULT_PAGE_CONFIG,
    updatedAt: Timestamp.now(),
  };
}

// Save page config
export async function savePageConfig(uid: string, placeId: string, config: Partial<PageConfig>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const configRef = doc(db, 'users', uid, 'businesses', placeId, 'pageConfig', 'config');

  // Get existing config to merge
  const existing = await getPageConfig(uid, placeId);
  const updatedConfig: PageConfig = {
    ...DEFAULT_PAGE_CONFIG,
    ...existing,
    ...config,
    updatedAt: Timestamp.now(),
  };

  await setDoc(configRef, updatedConfig);
}

// Add testimonial to page config
export async function addTestimonial(uid: string, placeId: string, testimonial: Omit<Testimonial, 'id' | 'createdAt'>): Promise<string> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const config = await getPageConfigWithDefaults(uid, placeId);
  const newTestimonial: Testimonial = {
    ...testimonial,
    id: crypto.randomUUID(),
    createdAt: Timestamp.now(),
  };

  config.testimonials.push(newTestimonial);
  await savePageConfig(uid, placeId, { testimonials: config.testimonials });

  return newTestimonial.id;
}

// Update testimonial
export async function updateTestimonial(uid: string, placeId: string, testimonialId: string, updates: Partial<Omit<Testimonial, 'id' | 'createdAt'>>): Promise<void> {
  const config = await getPageConfigWithDefaults(uid, placeId);
  const index = config.testimonials.findIndex(t => t.id === testimonialId);

  if (index !== -1) {
    config.testimonials[index] = {
      ...config.testimonials[index],
      ...updates,
    };
    await savePageConfig(uid, placeId, { testimonials: config.testimonials });
  }
}

// Delete testimonial
export async function deleteTestimonial(uid: string, placeId: string, testimonialId: string): Promise<void> {
  const config = await getPageConfigWithDefaults(uid, placeId);
  config.testimonials = config.testimonials.filter(t => t.id !== testimonialId);
  await savePageConfig(uid, placeId, { testimonials: config.testimonials });
}

// ============================================
// PUBLIC PAGE CONFIG - For review page (no auth)
// ============================================

// Get page config by placeId (searches all users)
// This is used by the public review page
export async function getPublicPageConfig(placeId: string): Promise<{ config: PageConfig; business: SavedBusiness } | null> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  // We need to find which user owns this business
  // For efficiency, we'll store a mapping in a separate collection
  const mappingRef = doc(db, 'business_mappings', placeId);
  const mappingSnap = await getDoc(mappingRef);

  if (!mappingSnap.exists()) {
    return null;
  }

  const { uid } = mappingSnap.data() as { uid: string };

  const business = await getBusinessByPlaceId(uid, placeId);
  if (!business) return null;

  const config = await getPageConfigWithDefaults(uid, placeId);
  return { config, business };
}

// Create business mapping when a business is saved
export async function createBusinessMapping(uid: string, placeId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const mappingRef = doc(db, 'business_mappings', placeId);
  await setDoc(mappingRef, { uid, createdAt: serverTimestamp() });
}

// Delete business mapping
export async function deleteBusinessMapping(placeId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const mappingRef = doc(db, 'business_mappings', placeId);
  await deleteDoc(mappingRef);
}
