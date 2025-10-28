import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider
} from "firebase/auth";
import type {
  Auth,
} from "firebase/auth";
import {
  getFirestore,
} from "firebase/firestore";
import type {
  Firestore
} from "firebase/firestore";
import {
  getStorage,
} from "firebase/storage";
import type {
  FirebaseStorage
} from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize OAuth providers
export const googleProvider = new GoogleAuthProvider();
export const discordProvider = new OAuthProvider("oidc.discord");

// Configure OAuth providers
googleProvider.setCustomParameters({
  prompt: "select_account",
});

discordProvider.addScope("identify");
discordProvider.addScope("email");

export default app;
