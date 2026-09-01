const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });
  } else {
    console.warn("Firebase credentials not fully provided. Firebase Admin not initialized properly. Please update your .env file.");
    admin.initializeApp(); // May fail or work in very limited capacity without creds
  }
} catch (error) {
  console.error("Firebase initialization error", error);
}

// Don't crash immediately if bucket is not configured
const db = admin.firestore();
let storage;
try {
  storage = admin.storage().bucket();
} catch (e) {
  console.warn("Storage bucket not initialized (missing credentials). Media uploads will fail.");
  storage = {
    file: () => ({
      save: () => { throw new Error("Firebase storage is not configured. Check your .env file."); },
      makePublic: () => {}
    }),
    name: 'unconfigured_bucket'
  };
}

module.exports = { admin, db, storage };
