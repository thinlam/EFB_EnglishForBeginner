// scripts/firebase.ts
import { Platform } from "react-native";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

import {
  browserLocalPersistence,
  getAuth,
  indexedDBLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore"; // ✔ ONLY THIS
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// AUTH
let auth = getAuth(app);
if (Platform.OS === "web") {
  auth
    .setPersistence(indexedDBLocalPersistence)
    .catch(() => auth.setPersistence(browserLocalPersistence));
}

// FIRESTORE ✔ FIX
const db = getFirestore(app);

// STORAGE
const storage = getStorage(app);

export { app, auth, db, onAuthStateChanged, storage };

