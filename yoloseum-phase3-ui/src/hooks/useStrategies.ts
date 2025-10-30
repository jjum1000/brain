import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Strategy } from "@/types/firestore";

interface UseStrategiesReturn {
  strategies: Strategy[];
  loading: boolean;
  error: Error | null;
}

interface StrategyFilters {
  traderId?: string;
  category?: "momentum" | "contrarian" | "scalping" | "grid" | "hedging";
  risk?: "low" | "medium" | "high";
  status?: "active" | "paused" | "closed";
}

/**
 * Hook to fetch and listen to trading strategies from Firestore
 * Supports filtering by trader, category, risk, and status
 * Real-time updates enabled using onSnapshot
 * Optimized with default limit of 20 for better performance
 *
 * @param {StrategyFilters} [filters={}] - Filters for strategies
 * @param {number} [limitCount=20] - Number of strategies to fetch (default: 20 for performance)
 * @returns {UseStrategiesReturn} Array of strategies, loading state, and error
 *
 * @example
 * const { strategies, loading, error } = useStrategies(
 *   { status: 'active', risk: 'medium' },
 *   20
 * );
 *
 * if (loading) return <div>Loading strategies...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     {strategies.map(strategy => (
 *       <div key={strategy.id}>
 *         <h3>{strategy.name}</h3>
 *         <p>ROI: {strategy.performance.currentROI}%</p>
 *       </div>
 *     ))}
 *   </div>
 * );
 */
export const useStrategies = (
  filters: StrategyFilters = {},
  limitCount: number = 20
): UseStrategiesReturn => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Build query with filters
      const strategiesRef = collection(db, "strategies");
      const constraints = [];

      // Add filters to query
      if (filters.traderId) {
        constraints.push(where("traderId", "==", filters.traderId));
      }

      if (filters.status) {
        constraints.push(where("execution.status", "==", filters.status));
      }

      // Note: For category and risk filtering, we'll do client-side filtering
      // since Firestore doesn't support nested field queries in the same document easily

      constraints.push(orderBy("performance.currentROI", "desc"));
      constraints.push(limit(limitCount));

      const q = query(strategiesRef, ...constraints);

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          try {
            let docs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            } as Strategy));

            // Client-side filtering for category and risk
            if (filters.category) {
              docs = docs.filter((strategy) => strategy.category === filters.category);
            }

            if (filters.risk) {
              docs = docs.filter((strategy) => strategy.risk === filters.risk);
            }

            setStrategies(docs);
            setError(null);
            setLoading(false);
          } catch (err) {
            console.error("Error processing strategies:", err);
            const errorMessage = err instanceof Error ? err : new Error("Failed to process strategies");
            setError(errorMessage);
            setLoading(false);
          }
        },
        (err) => {
          // Error querying strategies
          console.error("Error fetching strategies:", err);
          setError(err instanceof Error ? err : new Error("Failed to fetch strategies"));
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
  }, [filters, limitCount]);

  return {
    strategies,
    loading,
    error,
  };
};
