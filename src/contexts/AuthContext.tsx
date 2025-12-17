'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import {
  UserProfile,
  UserSubscription,
  getOrCreateUserProfile,
  linkPendingSubscription,
  getTrialDaysRemaining,
  isTrialExpired,
  hasActiveSubscription,
} from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  // Helper values
  trialDaysRemaining: number;
  isTrialExpired: boolean;
  hasActiveSubscription: boolean;
  // Functions
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  profileLoading: true,
  trialDaysRemaining: 0,
  isTrialExpired: true,
  hasActiveSubscription: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Load or create user profile
  const loadUserProfile = useCallback(async (firebaseUser: User) => {
    try {
      setProfileLoading(true);

      // Get or create profile (auto-creates with 14-day trial)
      const profile = await getOrCreateUserProfile(
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.displayName || undefined
      );

      // Check for pending subscription (if user paid before signing up)
      if (firebaseUser.email) {
        const linked = await linkPendingSubscription(firebaseUser.uid, firebaseUser.email);
        if (linked) {
          // Refresh profile after linking
          const updatedProfile = await getOrCreateUserProfile(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName || undefined
          );
          setUserProfile(updatedProfile);
          return;
        }
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Refresh profile manually
  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user);
    }
  }, [user, loadUserProfile]);

  useEffect(() => {
    const auth = getFirebaseAuth();

    if (!auth) {
      // Firebase not initialized (likely missing config)
      setLoading(false);
      setProfileLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Load/create user profile
        await loadUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  // Computed values
  const trialDaysRemaining = userProfile ? getTrialDaysRemaining(userProfile) : 0;
  const trialExpired = userProfile ? isTrialExpired(userProfile) : true;
  const activeSubscription = userProfile ? hasActiveSubscription(userProfile) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        profileLoading,
        trialDaysRemaining,
        isTrialExpired: trialExpired,
        hasActiveSubscription: activeSubscription,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
