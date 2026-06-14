import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "tv-show-watchlist-e35de",
  appId: "1:110714217856:web:4eaf9f1067b715678e0d65",
  storageBucket: "tv-show-watchlist-e35de.firebasestorage.app",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "tv-show-watchlist-e35de.firebaseapp.com",
  messagingSenderId: "110714217856"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
