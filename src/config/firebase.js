import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import logger from '../utils/logger';

// Get Firebase configuration from environment variables
// Fallback to hardcoded values for backward compatibility (should be removed in production)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD61P7XrHXLM_Y-TCB9fxex1y9oxVoZClc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "event-notificator.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://event-notificator-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "event-notificator",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "event-notificator.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "980621495948",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:980621495948:web:b575602261207e9d87b5a9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CNLH9DT83T"
};

// Validate that required environment variables are set (in production)
if (import.meta.env.PROD && !import.meta.env.VITE_FIREBASE_API_KEY) {
  logger.warn('Firebase configuration environment variables are not set. Please configure .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getDatabase(app); // Realtime Database
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    logger.warn('Analytics initialization failed:', error);
  }
}

export { db, app, auth, storage, functions, analytics };

