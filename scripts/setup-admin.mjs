import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
if (!serviceAccountPath) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set')
  console.log('To get your service account:')
  console.log('1. Go to Firebase Console: https://console.firebase.google.com')
  console.log('2. Project Settings > Service Accounts > Generate new private key')
  console.log('3. Save the JSON file and set FIREBASE_SERVICE_ACCOUNT_PATH to its path')
  process.exit(1)
}

let serviceAccount
try {
  const fs = await import('fs')
  const fileContent = fs.readFileSync(serviceAccountPath, 'utf8')
  serviceAccount = JSON.parse(fileContent)
} catch (error) {
  console.error(`Error reading service account file: ${serviceAccountPath}`)
  console.error(error.message)
  process.exit(1)
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  })
} catch (error) {
  if (!error.message.includes('already initialized')) {
    throw error
  }
}

const db = admin.firestore()
const auth = admin.auth()

const ADMIN_USERS = [
  {
    email: 'razzakgorfotu@gmail.com',
    password: 'gorfotu2026',
    displayName: 'রাজ্জাক গোরফোটু',
  },
  {
    email: 'arafatinbusiness@gmail.com',
    password: 'gorfotu2026',
    displayName: 'আরাফাত ইন বিজনেস',
  },
]

async function setupAdmins() {
  console.log('সেগুন বাংলা - অ্যাডমিন সেটআপ স্ক্রিপ্ট\n')
  console.log('অ্যাডমিন ব্যবহারকারী সেটআপ করছি...\n')

  for (const adminUser of ADMIN_USERS) {
    try {
      console.log(`ইমেইল: ${adminUser.email}`)
      
      // Check if user exists
      let user
      try {
        user = await auth.getUserByEmail(adminUser.email)
        console.log('  → ব্যবহারকারী ইতিমধ্যে বিদ্যমান (Auth)')
      } catch (error) {
        // User doesn't exist, create it
        user = await auth.createUser({
          email: adminUser.email,
          password: adminUser.password,
          displayName: adminUser.displayName,
        })
        console.log('  → নতুন ব্যবহারকারী তৈরি করা হয়েছে')
      }

      // Set admin role in Firestore
      const userRef = db.collection('users').doc(user.uid)
      const userDoc = await userRef.get()

      if (!userDoc.exists) {
        // Create new user profile
        await userRef.set({
          uid: user.uid,
          email: adminUser.email,
          displayName: adminUser.displayName,
          role: 'admin',
          createdAt: Date.now(),
          lastLogin: null,
        })
        console.log('  → অ্যাডমিন প্রোফাইল তৈরি করা হয়েছে')
      } else {
        // Update existing profile with admin role
        await userRef.update({
          role: 'admin',
          displayName: adminUser.displayName,
        })
        console.log('  → অ্যাডমিন রোল যুক্ত করা হয়েছে')
      }

      console.log(`  ✓ সেটআপ সম্পন্ন\n`)
    } catch (error) {
      console.error(`  ✗ ত্রুটি: ${error.message}\n`)
    }
  }

  console.log('সেটআপ সম্পন্ন!')
  console.log('\nলগইন করতে পারেন:')
  ADMIN_USERS.forEach((user) => {
    console.log(`  ইমেইল: ${user.email}`)
    console.log(`  পাসওয়ার্ড: ${user.password}\n`)
  })

  process.exit(0)
}

setupAdmins().catch((error) => {
  console.error('সেটআপ ব্যর্থ:', error)
  process.exit(1)
})
