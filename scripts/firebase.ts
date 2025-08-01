// firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import {
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCkzWTb7SS_qN0YzDWZnP-02W4rpc3MSMk",
  authDomain: "efb-app-77bd0.firebaseapp.com",
  projectId: "efb-app-77bd0",
  storageBucket: "efb-app-77bd0.firebasestorage.app",
  messagingSenderId: "10598642218",
  appId: "1:10598642218:web:d0d85b71a367edcd5ec953",
  measurementId: "G-JVH99Q8K1F"
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Auth with AsyncStorage (for React Native)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Analytics (optional, and safe)
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  } else {
    console.log('Analytics not supported in this environment');
  }
});

export { analytics, app };

