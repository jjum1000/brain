import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Trader } from "@/types/firestore";

interface UseTradeReturn {
  traders: Trader[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and listen to trader profiles from Firestore
 * Retrieves verified traders sorted by performance metrics
 * Real-time updates enabled using onSnapshot
 * Optimized with default limit of 20 for better performance
 *
 * @param {number} [limitCount=20] - Number of traders to fetch (default: 20 for performance)
 * @param {boolean} [verifiedOnly=true] - Only show verified traders
 * @returns {UseTradeReturn} Array of traders, loading state, and error
 *
 * @example
 * const { traders, loading, error } = useTraders(10, true);
 *
 * if (loading) return <div>Loading traders...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     {traders.map(trader => (
 *       <div key={trader.uid}>{trader.displayName} - {trader.performance.winRate}%</div>
 *     ))}
 *   </div>
 * );
 */
export const useTraders = (limitCount: number = 20, verifiedOnly: boolean = true): UseTradeReturn => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Query traders collection
      // Note: Firestore doesn't support complex filtering easily,
      // so we fetch all and filter on client if needed
      const tradersRef = collection(db, "traders");
      const q = query(
        tradersRef,
        orderBy("performance.avgROI", "desc"),
        limit(limitCount)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          try {
            let docs = snapshot.docs.map((doc) => {
              const data = doc.data() as Omit<Trader, 'uid'>;
              return {
                uid: doc.id,
                ...data,
              } as Trader;
            });

            // Filter verified traders if specified
            if (verifiedOnly) {
              docs = docs.filter((trader) => trader.verification.status === "verified");
            }

            setTraders(docs);
            setError(null);
            setLoading(false);
          } catch (err) {
            console.error("Error processing traders:", err);
            const errorMessage = err instanceof Error ? err : new Error("Failed to process traders");
            setError(errorMessage);
            setLoading(false);
          }
        },
        (err) => {
          // Error querying traders
          console.error("Error fetching traders:", err);
          setError(err instanceof Error ? err : new Error("Failed to fetch traders"));
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
  }, [limitCount, verifiedOnly]);

  return {
    traders,
    loading,
    error,
  };
};
