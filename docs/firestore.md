# Firestore Database - Review Buddy

## Overview

Review Buddy uses Cloud Firestore as its database. Firestore is a NoSQL document database that syncs data in real-time.

---

## Data Model

```
Firestore Database
│
└── users (collection)
    │
    └── {userId} (document)
        │
        ├── email: "user@example.com"
        ├── displayName: "John Doe"
        ├── createdAt: Timestamp
        ├── plan: "free" | "pro"
        │
        └── businesses (subcollection)
            │
            └── {placeId} (document)
                ├── placeId: "ChIJ..."
                ├── name: "My Coffee Shop"
                ├── address: "123 Main St, City"
                ├── photoUrl: "https://..."
                ├── rating: 4.5
                ├── reviewCount: 128
                └── addedAt: Timestamp
```

---

## Why This Structure?

| Choice | Reason |
|--------|--------|
| **Users as root collection** | Easy to query all users (admin) |
| **Businesses as subcollection** | Automatically scoped to user, no complex queries |
| **PlaceId as document ID** | Prevents duplicates, easy lookup |
| **Timestamps** | Track when data was created |

---

## TypeScript Interfaces

```typescript
// src/lib/firestore.ts

interface UserProfile {
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  plan: 'free' | 'pro';
}

interface SavedBusiness {
  placeId: string;
  name: string;
  address?: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
  addedAt: Timestamp;
}
```

---

## CRUD Operations

### Create User Profile

```typescript
import { createUserProfile } from '@/lib/firestore';

// Call this after user signs up
await createUserProfile(user.uid, user.email, user.displayName);
```

### Get User Profile

```typescript
import { getUserProfile } from '@/lib/firestore';

const profile = await getUserProfile(user.uid);
console.log(profile?.plan); // 'free' or 'pro'
```

### Save a Business

```typescript
import { saveBusiness } from '@/lib/firestore';

await saveBusiness(user.uid, {
  placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  name: 'Google Sydney',
  address: '48 Pirrama Rd, Pyrmont NSW',
  rating: 4.5,
  reviewCount: 1234,
  photoUrl: 'https://...',
});
```

### Get All Saved Businesses

```typescript
import { getSavedBusinesses } from '@/lib/firestore';

const businesses = await getSavedBusinesses(user.uid);
// Returns array sorted by addedAt (newest first)
```

### Delete a Business

```typescript
import { deleteBusiness } from '@/lib/firestore';

await deleteBusiness(user.uid, 'ChIJN1t_tDeuEmsRUsoyG83frY4');
```

### Check if Business Already Saved

```typescript
import { getBusinessByPlaceId } from '@/lib/firestore';

const existing = await getBusinessByPlaceId(user.uid, placeId);
if (existing) {
  console.log('Already saved!');
}
```

---

## Security Rules

### The Rules File

Copy these rules to **Firebase Console** → **Firestore** → **Rules**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // USERS COLLECTION
    // ============================================
    match /users/{userId} {

      // User can read/write their own document
      allow read, write: if isOwner(userId);

      // ============================================
      // BUSINESSES SUBCOLLECTION
      // ============================================
      match /businesses/{businessId} {
        // User can read/write their own businesses
        allow read, write: if isOwner(userId);
      }
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    // Check if the requester owns this document
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if a field exists in the request data
    function hasField(field) {
      return field in request.resource.data;
    }

    // Validate email format (basic)
    function isValidEmail(email) {
      return email.matches('.*@.*\\..*');
    }
  }
}
```

Click **Publish** to apply.

---

## Security Rules Explained

### Basic Concepts

| Concept | Explanation |
|---------|-------------|
| `request.auth` | The authenticated user making the request |
| `request.auth.uid` | The user's unique ID |
| `request.resource.data` | The data being written |
| `resource.data` | The existing data (for updates) |
| `match /path/{variable}` | Pattern matching with wildcards |

### Rule Types

```javascript
// READ operations
allow read;           // Allows both get and list
allow get;            // Single document read
allow list;           // Collection query

// WRITE operations
allow write;          // Allows create, update, delete
allow create;         // New document only
allow update;         // Existing document only
allow delete;         // Delete document
```

### Examples

```javascript
// Anyone can read (public data)
allow read: if true;

// Only authenticated users can read
allow read: if request.auth != null;

// Only the owner can read
allow read: if request.auth.uid == userId;

// Only owner can write, and email must exist
allow write: if request.auth.uid == userId
             && request.resource.data.email != null;

// Can only update, not delete
allow update: if request.auth.uid == userId;
allow delete: if false;
```

---

## Advanced Security Rules

### Validate Data on Write

```javascript
match /users/{userId} {
  allow create: if isOwner(userId)
                && hasField('email')
                && hasField('createdAt')
                && request.resource.data.plan in ['free', 'pro'];

  allow update: if isOwner(userId)
                && !('createdAt' in request.resource.data); // Can't change createdAt
}
```

### Rate Limiting (Basic)

```javascript
// Allow max 100 businesses per user
match /users/{userId}/businesses/{businessId} {
  allow create: if isOwner(userId)
                && getBusinessCount(userId) < 100;
}

function getBusinessCount(userId) {
  return get(/databases/$(database)/documents/users/$(userId)).data.businessCount;
}
```

### Time-Based Rules

```javascript
// Only allow writes during business hours (UTC)
allow write: if request.time.hours() >= 9
             && request.time.hours() <= 17;

// Prevent writes to documents older than 30 days
allow update: if resource.data.createdAt > request.time - duration.value(30, 'd');
```

---

## Testing Security Rules

### Firebase Emulator (Local Testing)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

### Rules Playground (Console)

1. Go to **Firestore** → **Rules** → **Rules Playground**
2. Select operation type (get, list, create, etc.)
3. Enter path: `/users/abc123`
4. Set authenticated user UID
5. Click **Run** to test

### Unit Tests

```javascript
// firestore.rules.test.js
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

describe('Firestore Rules', () => {
  it('allows users to read their own data', async () => {
    const db = getFirestore({ uid: 'user123' });
    await assertSucceeds(db.collection('users').doc('user123').get());
  });

  it('denies users from reading others data', async () => {
    const db = getFirestore({ uid: 'user123' });
    await assertFails(db.collection('users').doc('otherUser').get());
  });
});
```

---

## Common Patterns

### Create User on First Sign-In

```typescript
// In your AuthContext or after login
import { getUserProfile, createUserProfile } from '@/lib/firestore';

async function handleUserSignIn(user: User) {
  const profile = await getUserProfile(user.uid);

  if (!profile) {
    // First time sign-in, create profile
    await createUserProfile(user.uid, user.email!, user.displayName);
  }
}
```

### Check Plan Limits

```typescript
async function canAddMoreBusinesses(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  const businesses = await getSavedBusinesses(uid);

  const limits = {
    free: 5,
    pro: 100,
  };

  return businesses.length < limits[profile?.plan || 'free'];
}
```

---

## Firestore Pricing

| Operation | Free Tier | After Free Tier |
|-----------|-----------|-----------------|
| **Document reads** | 50,000/day | $0.06 per 100K |
| **Document writes** | 20,000/day | $0.18 per 100K |
| **Document deletes** | 20,000/day | $0.02 per 100K |
| **Stored data** | 1 GB | $0.18/GB/month |

### Cost Optimization Tips

1. **Use subcollections** - Avoid reading parent when you only need children
2. **Paginate queries** - Don't fetch all documents at once
3. **Cache locally** - Use React state/localStorage for repeated reads
4. **Batch writes** - Group multiple writes into one operation
5. **Use `select()` for partial reads** - Only fetch fields you need

---

## Indexes

### Automatic Indexes
Firestore automatically indexes every field. Single-field queries work without configuration.

### Composite Indexes
For queries with multiple conditions or ordering, you need composite indexes:

```typescript
// This query needs a composite index
const q = query(
  collection(db, 'users', uid, 'businesses'),
  where('rating', '>=', 4),
  orderBy('addedAt', 'desc')
);
```

Firebase will show an error link to create the index automatically.

### Creating Indexes Manually

**Firebase Console** → **Firestore** → **Indexes** → **Add Index**

Or in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "businesses",
      "fields": [
        { "fieldPath": "rating", "order": "ASCENDING" },
        { "fieldPath": "addedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Useful Links

- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Security Rules Reference](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Simulator](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Pricing Calculator](https://firebase.google.com/pricing)
