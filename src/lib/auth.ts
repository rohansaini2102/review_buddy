import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  User,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Email/Password Sign Up
export async function signUpWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { user: null, error: new Error('Firebase not initialized') };
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

// Email/Password Sign In
export async function signInWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { user: null, error: new Error('Firebase not initialized') };
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

// Google Sign In
export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { user: null, error: new Error('Firebase not initialized') };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

// Send Magic Link (Email Link Sign In)
export async function sendMagicLink(email: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { success: false, error: new Error('Firebase not initialized') };
  }

  const actionCodeSettings = {
    url: `${window.location.origin}/auth/action`,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save email to localStorage for later verification
    window.localStorage.setItem('emailForSignIn', email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Complete Magic Link Sign In
export async function completeMagicLinkSignIn(email: string, emailLink: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { user: null, error: new Error('Firebase not initialized') };
  }

  try {
    if (isSignInWithEmailLink(auth, emailLink)) {
      const result = await signInWithEmailLink(auth, email, emailLink);
      // Clear saved email
      window.localStorage.removeItem('emailForSignIn');
      return { user: result.user, error: null };
    }
    return { user: null, error: new Error('Invalid sign-in link') };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

// Check if URL is a magic link
export function isMagicLink(url: string) {
  const auth = getFirebaseAuth();
  if (!auth) return false;
  return isSignInWithEmailLink(auth, url);
}

// Get saved email for magic link
export function getSavedEmailForSignIn() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('emailForSignIn');
}

// Send Password Reset Email
export async function sendPasswordReset(email: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { success: false, error: new Error('Firebase not initialized') };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Sign Out
export async function signOut() {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { success: false, error: new Error('Firebase not initialized') };
  }

  try {
    await firebaseSignOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Get friendly error message
export function getAuthErrorMessage(error: Error): string {
  const errorCode = (error as { code?: string }).code;

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
}
