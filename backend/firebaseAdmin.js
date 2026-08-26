// server/firebaseAdmin.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

module.exports = { admin, db };