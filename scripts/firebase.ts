// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyCkzWTb7SS_qN0YzDWZnP-02W4rpc3MSMk",
  authDomain: "efb-app-77bd0.firebaseapp.com",
  projectId: "efb-app-77bd0",
  storageBucket: "efb-app-77bd0.firebasestorage.app",
  messagingSenderId: "10598642218",
  appId: "1:10598642218:web:d0d85b71a367edcd5ec953",
  measurementId: "G-JVH99Q8K1F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);