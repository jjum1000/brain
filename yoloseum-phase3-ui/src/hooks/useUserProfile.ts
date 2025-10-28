import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import type { DocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/firestore";

interface UseUserProfileReturn {
  userProfile: User | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and listen to the authenticated user's profile from Firestore
 * Real-time updates enabled using onSnapshot
 *
 * @returns {UseUserProfileReturn} User profile data, loading state, and error
 *
 * @example
 * const { userProfile, loading, error } = useUserProfile();
 *
 * if (loading) return <div>Loading profile...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!userProfile) return <div>No profile found</div>;
 *
 * return <div>{userProfile.displayName}</div>;
 */
export const useUserProfile = (): UseUserProfileReturn => {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!authUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Reference to user's Firestore document
      const userDocRef = doc(db, "users", authUser.id);

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        userDocRef,
        (snapshot: DocumentSnapshot) => {
          if (snapshot.exists()) {
            // Document found, set user profile
            const data = snapshot.data();
            setUserProfile(data as User);
            setError(null);
          } else {
            // Document doesn't exist
            setUserProfile(null);
            setError(new Error("User profile not found"));
          }
          setLoading(false);
        },
        (err) => {
          // Error fetching document
          console.error("Error fetching user profile:", err);
          setError(err instanceof Error ? err : new Error("Failed to fetch user profile"));
          setLoading(false);
        }
      );

      // Cleanup: unsubscribe from real-time updates when component unmounts
      return unsubscribe;
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(errorMessage);
      setLoading(false);
    }
  }, [authUser]);

  return {
    userProfile,
    loading,
    error,
  };
};
