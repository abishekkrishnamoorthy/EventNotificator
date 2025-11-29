import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import logger from '../utils/logger';

// Get Firebase configuration from environment variables
// Fallback to hardcoded values for backward compatibility (should be removed in production)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCGO2CP8Hh0mgq1qINNwkeuoNHJ9vphX-Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "event-notifi-8adfe.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "event-notifi-8adfe",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "event-notifi-8adfe.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "884405281206",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:884405281206:web:480c71f88ce75073ed2117",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-P40MS20HHG",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://event-notifi-8adfe-default-rtdb.firebaseio.com/"
};

// Validate that required environment variables are set (in production)
if (import.meta.env.PROD && !import.meta.env.VITE_FIREBASE_API_KEY) {
  logger.warn('Firebase configuration environment variables are not set. Please configure .env file.');
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { db, app, auth, storage, functions };

