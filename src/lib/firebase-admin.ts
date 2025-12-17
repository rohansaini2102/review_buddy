import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  if (getApps().length === 0) {
    // For Vercel, we can use the default credentials or service account
    // The project ID is required at minimum
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

export function getAdminDb(): Firestore {
  if (adminDb) return adminDb;

  const app = getAdminApp();
  adminDb = getFirestore(app);

  return adminDb;
}

export { getAdminApp };
