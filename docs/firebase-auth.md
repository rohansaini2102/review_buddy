# Firebase Authentication - Review Buddy

## Overview

Review Buddy uses Firebase Authentication for user management. This document covers the authentication methods, setup, and usage.

---

## Authentication Methods Enabled

| Method | Description | Use Case |
|--------|-------------|----------|
| **Email/Password** | Traditional signup/login | Users who prefer passwords |
| **Google OAuth** | One-click Google sign-in | Quick signup, trusted identity |
| **Magic Links** | Passwordless email links | Frictionless, no password to remember |

---

## Project Structure

```
src/
├── lib/
│   ├── firebase.ts      # Firebase initialization
│   └── auth.ts          # Auth helper functions
├── contexts/
│   └── AuthContext.tsx  # Global auth state
└── app/(auth)/
    ├── login/           # Login page
    ├── signup/          # Signup page
    ├── forgot-password/ # Password reset
    └── auth/action/     # Magic link verification
```

---

## Firebase Console Setup

### 1. Enable Auth Providers

Go to **Firebase Console** → **Authentication** → **Sign-in method**:

- **Email/Password**: Enable
- **Google**: Enable (add your domain to authorized domains)
- **Email Link (Passwordless)**: Enable

### 2. Authorized Domains

Add your domains under **Settings** → **Authorized domains**:
- `localhost` (for development)
- `your-app.vercel.app` (production)
- `your-custom-domain.com`

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## Auth Functions (src/lib/auth.ts)

### Sign Up with Email/Password

```typescript
import { signUpWithEmail } from '@/lib/auth';

const { user, error } = await signUpWithEmail(email, password);

if (error) {
  console.error(error.message);
} else {
  console.log('User created:', user.uid);
}
```

### Sign In with Email/Password

```typescript
import { signInWithEmail } from '@/lib/auth';

const { user, error } = await signInWithEmail(email, password);
```

### Sign In with Google

```typescript
import { signInWithGoogle } from '@/lib/auth';

const { user, error } = await signInWithGoogle();
```

### Send Magic Link

```typescript
import { sendMagicLink } from '@/lib/auth';

const { error } = await sendMagicLink(email);

if (!error) {
  console.log('Magic link sent!');
}
```

### Password Reset

```typescript
import { sendPasswordReset } from '@/lib/auth';

const { error } = await sendPasswordReset(email);
```

### Sign Out

```typescript
import { logOut } from '@/lib/auth';

await logOut();
```

---

## AuthContext Usage

The `AuthContext` provides global auth state throughout the app.

### Provider Setup (already in layout.tsx)

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Using Auth in Components

```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <p>User ID: {user.uid}</p>
    </div>
  );
}
```

### Auth State Properties

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current Firebase user object |
| `loading` | `boolean` | True while checking auth state |
| `user.uid` | `string` | Unique user ID |
| `user.email` | `string` | User's email |
| `user.displayName` | `string \| null` | User's display name |
| `user.photoURL` | `string \| null` | User's profile photo URL |

---

## Protected Routes

### Using Middleware (src/middleware.ts)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for auth cookie/token
  // Redirect to login if not authenticated
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### Client-Side Protection

```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Dashboard content</div>;
}
```

---

## Error Handling

Common Firebase Auth error codes:

| Error Code | Meaning | User Message |
|------------|---------|--------------|
| `auth/email-already-in-use` | Email registered | "This email is already registered" |
| `auth/invalid-email` | Bad email format | "Please enter a valid email" |
| `auth/weak-password` | Password too short | "Password must be at least 6 characters" |
| `auth/user-not-found` | Email not registered | "No account found with this email" |
| `auth/wrong-password` | Incorrect password | "Incorrect password" |
| `auth/too-many-requests` | Rate limited | "Too many attempts. Try again later" |
| `auth/popup-closed-by-user` | User closed OAuth popup | "Sign-in was cancelled" |

---

## Security Best Practices

1. **Never expose Firebase Admin SDK credentials** - Use only client-side config
2. **Use environment variables** - Don't hardcode API keys
3. **Validate on server** - Don't trust client-side auth alone for sensitive operations
4. **Set up Firestore rules** - Protect user data with proper security rules
5. **Enable email verification** - For sensitive apps, require email verification

---

## Firebase User Object

After authentication, you get a `User` object:

```typescript
interface User {
  uid: string;              // Unique identifier
  email: string | null;     // User's email
  emailVerified: boolean;   // Email verification status
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  metadata: {
    creationTime: string;   // Account creation timestamp
    lastSignInTime: string; // Last login timestamp
  };
  providerData: [{
    providerId: string;     // 'google.com', 'password', etc.
    uid: string;
    email: string;
  }];
}
```

---

## Useful Links

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com)
- [Next.js + Firebase Guide](https://firebase.google.com/docs/web/setup)
