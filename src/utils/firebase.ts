import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCtj9XvTW2aiumZhrR3OXQk3U3sh01ffRQ",
  authDomain: "bematch-f168d.firebaseapp.com",
  databaseURL: "https://bematch-f168d-default-rtdb.firebaseio.com",
  projectId: "bematch-f168d",
  storageBucket: "bematch-f168d.firebasestorage.app",
  messagingSenderId: "137528078260",
  appId: "1:137528078260:web:9bbd45115bd2aaf8200ce1",
  measurementId: "G-B9HD1ESD1H"
};

// Initialize Firebase (prevent re-init on hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
