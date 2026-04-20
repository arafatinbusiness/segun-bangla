# How to Apply Firebase Security Rules to Your Project

## Overview

The Firebase Security Rules control who can access what data in your Firestore database and Cloud Storage. The project includes two rule files:
- `firestore.rules` - Firestore database access control
- `storage.rules` - Cloud Storage access control

## Prerequisites

1. Firebase Admin SDK configured (you already have this)
2. Access to Firebase Console
3. Project ID: `segun-bangla-newspaper`

## Step 1: Deploy Firestore Rules

### Option A: Using Firebase Console (Easiest)

1. Go to https://console.firebase.google.com
2. Select project `segun-bangla-newspaper`
3. Navigate to **Firestore Database** → **Rules** tab
4. Click **Edit Rules**
5. Delete all existing content
6. Open the `firestore.rules` file in this project
7. Copy the entire content (from `rules_version = '2';` to the last `}`)
8. Paste into Firebase Console rules editor
9. Click **Publish**

### Option B: Using Firebase CLI

```bash
# If not installed, install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy rules
firebase deploy --only firestore:rules
```

## Step 2: Deploy Storage Rules

### Option A: Using Firebase Console

1. Go to https://console.firebase.google.com
2. Select project `segun-bangla-newspaper`
3. Navigate to **Storage** → **Rules** tab
4. Click **Edit Rules**
5. Delete all existing content
6. Open the `storage.rules` file in this project
7. Copy the entire content
8. Paste into Firebase Console rules editor
9. Click **Publish**

### Option B: Using Firebase CLI

```bash
firebase deploy --only storage
```

## Understanding the Rules

### Collections in Your Project

```
users/              - User profiles and authentication data
  {userId}/
    uid
    email
    displayName
    role (user, author, admin)
    createdAt
    lastLogin
    photoURL

articles/           - News articles
  {articleId}/
    title
    slug
    content
    excerpt
    imageUrl
    categoryId
    authorId
    publishedAt
    viewCount
    isFeatured
    isSpecial
    isLead

categories/         - Article categories
  {categoryId}/
    name
    slug
    description
    subcategories/
      {subcategoryId}/
        name
        slug
```

### Security Rules Breakdown

#### Users Collection
- **Public**: Can create their own profile during signup
- **Own User**: Can read and update their own profile
- **Admins**: Can read all profiles, change user roles, delete users

#### Articles Collection
- **Public**: Can read published articles (publishedAt <= now)
- **Authors**: Can read/write their own articles, create new ones
- **Admins**: Can read all articles, edit/delete any article
- **Status Updates**: Only admins can mark articles as featured/special/lead

#### Categories Collection
- **Public**: Can read all categories and subcategories
- **Admins**: Can create/edit/delete categories and subcategories

## Testing the Rules

### In Firebase Console

1. Go to **Firestore Database** → **Rules** tab
2. Click **Rules Simulator** (next to Publish button)
3. Test scenarios:
   ```
   Path: /articles/{articleId}
   Request: read
   Auth Context: (empty - anonymous)
   Result: Should be allowed if article is published
   
   Path: /users/{userId}
   Request: write
   Auth Context: userId different from path
   Result: Should be denied
   ```

### Using the App

Login with test credentials:
- Email: `razzakgorfotu@gmail.com`
- Password: `gorfotu2026`

Verify:
- Can access admin dashboard
- Can read articles
- Can create/edit articles
- Can see analytics

## Rule Features Explained

### Helper Functions

```javascript
// Check if user is logged in
function isSignedIn() {
  return request.auth != null;
}

// Check if user is admin
function isAdmin() {
  return isSignedIn() && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// Check if article is published
function isPublished(article) {
  return article.publishedAt <= request.time.toMillis();
}
```

### Access Levels

- **Public** (everyone): Read published articles, read categories
- **Authenticated** (logged-in users): Create articles, read own profile
- **Authors**: Edit own articles, create new articles
- **Admins**: Full access to manage all content and users

## Troubleshooting

### Rules Not Applying

1. Check you're in the correct project (`segun-bangla-newspaper`)
2. Wait 5 seconds after publishing (cache update)
3. Refresh the app or clear browser cache
4. Check browser console for error messages

### Permission Denied Errors

1. Verify user is logged in
2. Check user role in Firestore (`users` collection)
3. Verify article is published (if reading article)
4. Check rule syntax in console (should show no errors)

### Common Issues

**Issue**: "Permission denied" when creating articles
- **Solution**: Ensure user has `author` or `admin` role

**Issue**: Can't read articles
- **Solution**: For public access, article must have `publishedAt <= now()`

**Issue**: Can't delete user profile
- **Solution**: Only admins can delete users

## Best Practices

1. **Backup Rules**: Keep copies of working rules
2. **Test Before Publishing**: Use Rule Simulator
3. **Role Management**: Carefully assign admin/author roles
4. **Date Publishing**: Set `publishedAt` timestamp before making public
5. **Monitor**: Check Firebase Console for rule violations

## Custom Claims for Advanced Security

For advanced scenarios, you can set custom claims on user tokens:

```javascript
// Add custom claims via Firebase Admin SDK
admin.auth().setCustomUserClaims(uid, {
  admin: true,
  role: 'admin'
}).then(() => {
  // Custom claims updated
});

// Then use in rules:
allow read: if request.auth.token.admin == true;
```

## Next Steps

1. Apply both `firestore.rules` and `storage.rules`
2. Test with the admin credentials
3. Create test articles and verify access
4. Monitor Firebase Console for any issues
5. Gradually roll out to users

## Security Reminder

These rules enforce:
- ✅ Users can only access/modify their own data
- ✅ Public articles are readable by anyone
- ✅ Only authors can create articles
- ✅ Only admins can publish/manage content
- ✅ Articles are draft until explicitly published
- ✅ Images are readable publicly but write-protected

Your application data is now secure!
