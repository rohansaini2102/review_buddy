# Firestore Security Rules - Quick Reference

## Current Rules for Review Buddy

Copy this to **Firebase Console** → **Firestore** → **Rules**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - each user can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Businesses subcollection
      match /businesses/{businessId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Rule Breakdown

### What Each Part Means

```javascript
rules_version = '2';
// ^ Always use version 2 (latest)

service cloud.firestore {
// ^ These rules apply to Firestore

  match /databases/{database}/documents {
  // ^ Match all documents in the database

    match /users/{userId} {
    // ^ Match documents in the "users" collection
    // ^ {userId} is a wildcard that captures the document ID

      allow read, write: if request.auth != null && request.auth.uid == userId;
      // ^ Allow read/write ONLY if:
      //   1. User is logged in (request.auth != null)
      //   2. User's ID matches the document ID (request.auth.uid == userId)

      match /businesses/{businessId} {
      // ^ Match subcollection documents

        allow read, write: if request.auth != null && request.auth.uid == userId;
        // ^ Same rule - user can only access their own businesses
      }
    }
  }
}
```

---

## Security Rule Cheat Sheet

### Operators

| Operator | Example | Meaning |
|----------|---------|---------|
| `==` | `uid == userId` | Equal to |
| `!=` | `status != 'deleted'` | Not equal to |
| `&&` | `a && b` | AND |
| `\|\|` | `a \|\| b` | OR |
| `!` | `!isAdmin` | NOT |
| `in` | `role in ['admin', 'mod']` | Value in list |

### Common Conditions

```javascript
// User is logged in
request.auth != null

// User owns this document
request.auth.uid == userId

// Email is verified
request.auth.token.email_verified == true

// User has specific email domain
request.auth.token.email.matches('.*@company.com')

// Document field matches user
resource.data.ownerId == request.auth.uid

// Field exists in incoming data
'fieldName' in request.resource.data

// Field has specific value
request.resource.data.status == 'active'

// Size limits
request.resource.data.name.size() <= 100

// Array contains value
'admin' in resource.data.roles
```

### Request vs Resource

| Object | What It Is | When Available |
|--------|------------|----------------|
| `request.auth` | Authenticated user | Always (null if not logged in) |
| `request.resource.data` | Data being written | create, update |
| `resource.data` | Existing document data | read, update, delete |

---

## Common Rule Patterns

### 1. Owner-Only Access

```javascript
match /posts/{postId} {
  allow read, write: if request.auth.uid == resource.data.authorId;
}
```

### 2. Public Read, Owner Write

```javascript
match /posts/{postId} {
  allow read: if true;
  allow write: if request.auth.uid == resource.data.authorId;
}
```

### 3. Authenticated Users Only

```javascript
match /posts/{postId} {
  allow read, write: if request.auth != null;
}
```

### 4. Admin Only

```javascript
match /admin/{document=**} {
  allow read, write: if request.auth.token.admin == true;
}
```

### 5. Create Only (No Update/Delete)

```javascript
match /logs/{logId} {
  allow create: if request.auth != null;
  allow read: if request.auth.uid == resource.data.userId;
  allow update, delete: if false;
}
```

### 6. Validate Required Fields

```javascript
match /posts/{postId} {
  allow create: if request.auth != null
                && 'title' in request.resource.data
                && 'content' in request.resource.data
                && request.resource.data.title.size() > 0;
}
```

### 7. Prevent Field Modification

```javascript
match /users/{userId} {
  allow update: if request.auth.uid == userId
                && request.resource.data.createdAt == resource.data.createdAt
                && request.resource.data.email == resource.data.email;
}
```

---

## Testing Your Rules

### Quick Test in Console

1. Go to **Firestore** → **Rules** → **Rules Playground**
2. Set **Simulation type**: `get`, `list`, `create`, `update`, or `delete`
3. Set **Location**: `/users/abc123`
4. Toggle **Authenticated** and enter a UID
5. Click **Run**

### What to Test

| Test | Expected Result |
|------|-----------------|
| Unauthenticated read `/users/abc` | ❌ Denied |
| User `abc` reads `/users/abc` | ✅ Allowed |
| User `abc` reads `/users/xyz` | ❌ Denied |
| User `abc` writes to `/users/abc/businesses/place1` | ✅ Allowed |
| User `abc` writes to `/users/xyz/businesses/place1` | ❌ Denied |

---

## Debugging Rules

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing or insufficient permissions` | Rule denied the request | Check your conditions |
| `null value in expression` | Accessing undefined field | Add null checks |
| `Resource does not exist` | Document doesn't exist on create | Use `request.resource` for creates |

### Debug Tips

1. **Start permissive, then restrict**
   ```javascript
   // Start with this to test your app works
   allow read, write: if true;

   // Then add restrictions one by one
   allow read, write: if request.auth != null;
   allow read, write: if request.auth.uid == userId;
   ```

2. **Check Firebase Console logs**
   - Go to **Firestore** → **Usage** → View denied requests

3. **Use the emulator**
   ```bash
   firebase emulators:start
   ```
   Better error messages locally!

---

## Security Checklist

Before going to production:

- [ ] No `allow read, write: if true;` rules
- [ ] All user data protected by `request.auth.uid == userId`
- [ ] Test mode expiration removed
- [ ] Required fields validated on create
- [ ] Sensitive fields can't be modified after creation
- [ ] No wildcard `{document=**}` with write access
- [ ] Tested all CRUD operations in Rules Playground
