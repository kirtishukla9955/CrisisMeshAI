import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

function envOr(key, fallback) {
  const val = import.meta.env[key];
  return val && val.length > 0 ? val : fallback;
}

const firebaseConfig = {
  apiKey: envOr("VITE_FIREBASE_API_KEY", "AIzaSyAgUbsv2oDZPJ9moxUmOj46rRuvD-KFvdU"),
  authDomain: envOr("VITE_FIREBASE_AUTH_DOMAIN", "crisismesh-b698c.firebaseapp.com"),
  projectId: envOr("VITE_FIREBASE_PROJECT_ID", "crisismesh-b698c"),
  storageBucket: envOr("VITE_FIREBASE_STORAGE_BUCKET", "crisismesh-b698c.firebasestorage.app"),
  messagingSenderId: envOr("VITE_FIREBASE_MESSAGING_SENDER_ID", "76896192606"),
  appId: envOr("VITE_FIREBASE_APP_ID", "1:76896192606:web:712a9dc1963c28261fcccf"),
};

console.log("[Firebase] Initializing with project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export { collection, onSnapshot, doc, setDoc };