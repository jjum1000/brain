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
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/types/firestore";

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and listen to user's transactions from Firestore
 * Retrieves the most recent transactions in real-time
 *
 * @param {number} [limitCount=50] - Number of transactions to fetch (default: 50)
 * @returns {UseTransactionsReturn} Array of transactions, loading state, and error
 *
 * @example
 * const { transactions, loading, error } = useTransactions(20);
 *
 * if (loading) return <div>Loading transactions...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <ul>
 *     {transactions.map(tx => (
 *       <li key={tx.id}>{tx.amount} - {tx.status}</li>
 *     ))}
 *   </ul>
 * );
 */
export const useTransactions = (limitCount: number = 50): UseTransactionsReturn => {
  const { user: authUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!authUser) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query transactions for the authenticated user
      // Ordered by createdAt descending (most recent first)
      const transactionsRef = collection(db, "transactions");
      const q = query(
        transactionsRef,
        where("userId", "==", authUser.id),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          try {
            const txs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            } as Transaction));

            setTransactions(txs);
            setError(null);
            setLoading(false);
          } catch (err) {
            console.error("Error processing transactions:", err);
            const errorMessage = err instanceof Error ? err : new Error("Failed to process transactions");
            setError(errorMessage);
            setLoading(false);
          }
        },
        (err) => {
          // Error querying transactions
          console.error("Error fetching transactions:", err);
          setError(err instanceof Error ? err : new Error("Failed to fetch transactions"));
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
  }, [authUser, limitCount]);

  return {
    transactions,
    loading,
    error,
  };
};
