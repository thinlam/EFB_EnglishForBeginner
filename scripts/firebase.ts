// scripts/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCkzWTb7SS_qN0YzDWZnP-02W4rpc3MSMk",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "efb-app-77bd0.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "efb-app-77bd0",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "efb-app-77bd0.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "10598642218",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:10598642218:web:d0d85b71a367edcd5ec953",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-JVH99Q8K1F",
};

// cảnh báo biến thiếu (không crash)
for (const [k, v] of Object.entries(firebaseConfig)) {
  if (!v) console.warn(`[Firebase] Missing env: ${k}`);
}

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ---- Auth setup (web vs native) ----
let auth = getAuth(app);

if (Platform.OS === 'web') {
  // Web: set persistence trình duyệt
  auth.setPersistence(indexedDBLocalPersistence).catch(() => {
    auth.setPersistence(browserLocalPersistence).catch(() => {});
  });
} else {
  // Native: chỉ 'require' khi chạy native để Metro không cần resolve subpath trên web
  let getReactNativePersistence: any | null = null;
  try {
    // một số version SDK không có subpath này -> try/catch để không crash
    getReactNativePersistence =
       
      require('firebase/auth/react-native').getReactNativePersistence;
  } catch {}

  if (getReactNativePersistence) {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(app);
    }
  } else {
    // fallback nếu subpath không tồn tại trên phiên bản firebase hiện tại
    auth = getAuth(app);
  }
}

// ---- Firestore & Storage ----
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

