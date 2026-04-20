# Firebase Authentication Setup Guide

This guide walks you through setting up Firebase Authentication for the Segun Bangla news portal.

## Overview

The authentication system includes:
- User registration and login with email/password
- Role-based access control (admin, author, user)
- User profile management
- Protected admin dashboard
- Firebase Firestore for user profiles

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "Segun Bangla"
4. Accept terms and create

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Select "Email/Password" as the sign-in method
4. Enable it and save

### 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location (closest to Bangladesh or Asia)
5. Click "Create"

### 4. Set Firestore Security Rules

Replace the default security rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /articles/{document=**} {
      allow read;
    }
    match /categories/{document=**} {
      allow read;
    }
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow create: if request.auth.uid != null;
    }
    match /admin/{document=**} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 5. Get Firebase Credentials

1. Go to Project Settings (gear icon at top)
2. Click "Service Accounts"
3. Click "Generate New Private Key" (save for backend if needed)
4. In "General" tab, find your web app config
5. Copy the config object

### 6. Set Environment Variables

Create `.env.local` in the project root with your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Features

### Registration

- New users can register at `/register`
- Users start with "user" role
- Profile is automatically created in Firestore

### Login

- Users login at `/login`
- Last login time is tracked
- Redirects to admin dashboard if admin role

### User Profile

- View profile at `/profile`
- See role, email, and account creation date
- Logout from profile page
- Admin users can access admin dashboard

### Admin Protection

- Admin dashboard at `/admin` is protected
- Only users with "admin" role can access
- Non-authenticated users are redirected to login
- Non-admin users are redirected to home

## User Roles

- **admin**: Full access to admin dashboard, article management, analytics
- **author**: Can create and edit articles (future feature)
- **user**: Can read articles and view profile (default)

## To Promote a User to Admin

1. In Firebase Console, go to Firestore Database
2. Find the user document in `users` collection
3. Edit the `role` field from "user" to "admin"
4. User will have admin access after next login/page refresh

## Creating Test Users

### Create Admin User

1. Register a new account at `/register`
2. In Firebase Console, open Firestore → users collection
3. Find the newly created user document
4. Change the `role` field to "admin"
5. The account now has admin access

### Create Author User

1. Register a new account
2. In Firestore, change their role to "author"

## Frontend Components

### `useAuth()` Hook

Get current authentication state anywhere in your app:

```tsx
import { useAuth } from '@/lib/auth-context'

export function MyComponent() {
  const { user, profile, isAdmin, isAuthenticated, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return <div>Welcome {profile?.displayName}</div>
}
```

### `ProtectedRoute` Component

Wrap components that need authentication:

```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### Authentication Service Functions

```tsx
import { loginUser, registerUser, logoutUser, getUserProfile } from '@/lib/services/auth'

// Register
const profile = await registerUser(email, password, displayName, 'user')

// Login
const profile = await loginUser(email, password)

// Logout
await logoutUser()

// Get profile
const profile = await getUserProfile(userId)
```

## API Routes for Future Enhancement

Future versions can add:

- `/api/auth/login` - REST API login
- `/api/auth/register` - REST API registration
- `/api/users/[id]` - User profile endpoints
- `/api/admin/users` - Admin user management

## Troubleshooting

### Can't login/register

1. Check Firebase credentials in `.env.local`
2. Verify Firebase authentication is enabled
3. Check browser console for detailed errors
4. Ensure Firestore is created and accessible

### Admin dashboard shows access denied

1. Verify user role is "admin" in Firestore
2. Log out and log back in to refresh token
3. Check browser console for auth errors

### User profile not showing

1. Check Firestore `users` collection exists
2. Verify user document exists for logged-in user
3. Check Firestore rules allow reading user documents

## Next Steps

- Add email verification
- Add password reset functionality
- Add OAuth providers (Google, GitHub)
- Add user roles management UI to admin dashboard
- Add audit logging for admin actions
