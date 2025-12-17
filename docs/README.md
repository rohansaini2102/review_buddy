# Review Buddy - Documentation

## Overview

This folder contains documentation for the Review Buddy application's backend services.

---

## Documents

| File | Description |
|------|-------------|
| [firebase-auth.md](./firebase-auth.md) | Firebase Authentication setup, methods, and usage |
| [firestore.md](./firestore.md) | Firestore database structure, CRUD operations, and rules |
| [security-rules-reference.md](./security-rules-reference.md) | Quick reference for Firestore security rules |

---

## Quick Start

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** with Email/Password and Google providers
3. Create **Firestore Database** in test mode
4. Update security rules (see below)

### 2. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### 3. Firestore Security Rules

Go to **Firestore** → **Rules** and paste:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /businesses/{businessId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Tech Stack Summary

| Service | Purpose | Docs |
|---------|---------|------|
| **Firebase Auth** | User authentication | [firebase-auth.md](./firebase-auth.md) |
| **Firestore** | Database | [firestore.md](./firestore.md) |
| **Google Places API** | Business info | External API |
| **Next.js** | Framework | [nextjs.org](https://nextjs.org) |

---

## Key Files

```
src/
├── lib/
│   ├── firebase.ts       # Firebase initialization
│   ├── auth.ts           # Auth helper functions
│   ├── firestore.ts      # Firestore CRUD operations
│   └── google-places.ts  # Google Places API
├── contexts/
│   └── AuthContext.tsx   # Global auth state
└── app/
    ├── (auth)/           # Auth pages (login, signup, etc.)
    └── (dashboard)/      # Protected dashboard
```

---

## Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Google Cloud Console](https://console.cloud.google.com) (for Places API)
