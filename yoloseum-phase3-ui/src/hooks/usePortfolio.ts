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
import type { Support } from "@/types/firestore";

interface PortfolioStatistics {
  totalInvested: number;           // 전체 투자액 (USD)
  activeInvestments: number;       // 활성 투자 개수
  totalROI: number;                // 총 ROI (%)
  totalEarned: number;             // 총 수익액 (USD)
  totalRealizedProfit: number;     // 현실화된 수익 (USD)
}

interface UsePortfolioReturn {
  investments: Support[];
  statistics: PortfolioStatistics;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and listen to user's investments (supporters) from Firestore
 * Calculates portfolio statistics in real-time
 *
 * @param {number} [limitCount=50] - Number of investments to fetch (default: 50)
 * @returns {UsePortfolioReturn} Array of investments, statistics, loading state, and error
 *
 * @example
 * const { investments, statistics, loading, error } = usePortfolio(100);
 *
 * if (loading) return <div>Loading portfolio...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     <p>Total Invested: ${statistics.totalInvested}</p>
 *     <p>Total ROI: {statistics.totalROI}%</p>
 *     {investments.map(inv => (
 *       <div key={inv.id}>{inv.strategyId}: ${inv.investmentAmount}</div>
 *     ))}
 *   </div>
 * );
 */
export const usePortfolio = (limitCount: number = 50): UsePortfolioReturn => {
  const { user: authUser } = useAuth();
  const [investments, setInvestments] = useState<Support[]>([]);
  const [statistics, setStatistics] = useState<PortfolioStatistics>({
    totalInvested: 0,
    activeInvestments: 0,
    totalROI: 0,
    totalEarned: 0,
    totalRealizedProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate statistics from investments
  const calculateStatistics = (invs: Support[]): PortfolioStatistics => {
    let totalInvested = 0;
    let activeCount = 0;
    let totalEarned = 0;
    let totalRealizedProfit = 0;

    invs.forEach((inv) => {
      totalInvested += inv.investmentAmount;

      if (inv.status === "active") {
        activeCount++;
      }

      totalEarned += inv.returns.earned;
      totalRealizedProfit += inv.returns.realized;
    });

    const totalROI = totalInvested > 0
      ? parseFloat(((totalEarned / totalInvested) * 100).toFixed(2))
      : 0;

    return {
      totalInvested,
      activeInvestments: activeCount,
      totalROI,
      totalEarned,
      totalRealizedProfit,
    };
  };

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!authUser) {
      setInvestments([]);
      setStatistics({
        totalInvested: 0,
        activeInvestments: 0,
        totalROI: 0,
        totalEarned: 0,
        totalRealizedProfit: 0,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query investments for the authenticated user
      // Ordered by investedAt descending (most recent first)
      const supportersRef = collection(db, "supporters");
      const q = query(
        supportersRef,
        where("userId", "==", authUser.id),
        orderBy("investedAt", "desc"),
        limit(limitCount)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          try {
            const invs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            } as Support));

            setInvestments(invs);
            const stats = calculateStatistics(invs);
            setStatistics(stats);
            setError(null);
            setLoading(false);
          } catch (err) {
            console.error("Error processing investments:", err);
            const errorMessage = err instanceof Error
              ? err
              : new Error("Failed to process investments");
            setError(errorMessage);
            setLoading(false);
          }
        },
        (err) => {
          // Error querying investments
          console.error("Error fetching investments:", err);
          setError(err instanceof Error
            ? err
            : new Error("Failed to fetch investments"));
          setLoading(false);
        }
      );

      // Cleanup: unsubscribe from real-time updates when component unmounts
      return unsubscribe;
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
        : new Error("Unknown error occurred");
      setError(errorMessage);
      setLoading(false);
    }
  }, [authUser, limitCount]);

  return {
    investments,
    statistics,
    loading,
    error,
  };
};
