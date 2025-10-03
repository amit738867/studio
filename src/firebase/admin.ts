import admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

let firebaseAdmin: admin.app.App;
let db: FirebaseFirestore.Firestore | null = null;
let storage: admin.storage.Storage | null = null;

try {
  // Try to initialize Firebase Admin SDK
  if (!admin.apps.length) {
    // Check if we have service account credentials
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        storageBucket: firebaseConfig.storageBucket || `${firebaseConfig.projectId}.firebasestorage.app`
      });
      console.log('Firebase Admin initialized with service account');
    } else {
      // Try to initialize with explicit project ID for Firebase App Hosting
      try {
        firebaseAdmin = admin.initializeApp({
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket || `${firebaseConfig.projectId}.firebasestorage.app`
        });
        console.log('Firebase Admin initialized with explicit project ID');
      } catch (defaultError) {
        console.warn('Failed to initialize Firebase Admin with explicit project ID:', defaultError);
        throw new Error('Firebase Admin credentials not available');
      }
    }
  } else {
    firebaseAdmin = admin.app();
  }
  
  db = admin.firestore();
  storage = admin.storage();
  
  // Test the connection
  db.settings({ ignoreUndefinedProperties: true });
  console.log('Firebase Admin SDK initialized successfully');
  
} catch (error) {
  console.warn('Firebase Admin initialization failed:', error);
  console.warn('Running in development mode with in-memory storage');
  db = null;
  storage = null;
}

export { firebaseAdmin, db, storage };