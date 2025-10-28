import React, { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider, discordProvider } from "@/lib/firebase";
import type { User, AuthContextType } from "@/types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: userDoc.data()?.createdAt?.toDate() || new Date(),
            lastLogin: new Date(),
          };

          setUser(userData);
        } else {
          setUser(null);
        }
        setError(null);
      } catch (err) {
        console.error("Auth state change error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update profile with display name
      if (displayName) {
        await updateProfile(firebaseUser, {
          displayName: displayName,
        });
      }

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || "",
        photoURL: firebaseUser.photoURL || null,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: "user",
        status: "active",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update last login time
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(
        userDocRef,
        { lastLogin: new Date() },
        { merge: true }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset email";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      // Check if user document exists
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date(),
          lastLogin: new Date(),
          role: "user",
          status: "active",
          authProvider: "google",
        });
      } else {
        // Update last login time
        await setDoc(
          userDocRef,
          { lastLogin: new Date() },
          { merge: true }
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Discord
  const signInWithDiscord = async () => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await signInWithPopup(auth, discordProvider);
      const firebaseUser = userCredential.user;

      // Check if user document exists
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date(),
          lastLogin: new Date(),
          role: "user",
          status: "active",
          authProvider: "discord",
        });
      } else {
        // Update last login time
        await setDoc(
          userDocRef,
          { lastLogin: new Date() },
          { merge: true }
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Discord";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithDiscord,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
