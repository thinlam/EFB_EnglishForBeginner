// scripts/firebase.ts
import { Platform } from 'react-native';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

import {
  browserLocalPersistence,
  getAuth,
  indexedDBLocalPersistence,
  onAuthStateChanged
} from 'firebase/auth';

import { getFirestore } from "firebase/firestore"; // ✔ ONLY THIS
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCkzWTb7SS_qN0YzDWZnP-02W4rpc3MSMk",
  authDomain: "efb-app-77bd0.firebaseapp.com",
  projectId: "efb-app-77bd0",
  storageBucket: "efb-app-77bd0.firebasestorage.app",
  messagingSenderId: "10598642218",
  appId: "1:10598642218:web:d0d85b71a367edcd5ec953",
  measurementId: "G-JVH99Q8K1F",
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// AUTH
let auth = getAuth(app);
if (Platform.OS === "web") {
  auth.setPersistence(indexedDBLocalPersistence)
    .catch(() => auth.setPersistence(browserLocalPersistence));
}

// FIRESTORE ✔ FIX
const db = getFirestore(app);

// STORAGE
const storage = getStorage(app);

export { app, auth, db, onAuthStateChanged, storage };

