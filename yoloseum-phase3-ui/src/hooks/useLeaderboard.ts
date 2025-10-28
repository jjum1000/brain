import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Leaderboard, LeaderboardRankingEntry } from "@/types/firestore";

type LeaderboardPeriod = "weekly" | "monthly" | "seasonal";

interface UseLeaderboardReturn {
  rankings: LeaderboardRankingEntry[];
  leaderboardData: Leaderboard | null;
  loading: boolean;
  error: Error | null;
  currentPeriod: LeaderboardPeriod;
  setPeriod: (period: LeaderboardPeriod) => void;
}

/**
 * Hook to fetch and listen to leaderboard rankings from Firestore
 * Supports filtering by period (weekly, monthly, seasonal)
 * Real-time updates enabled using onSnapshot
 *
 * @param {LeaderboardPeriod} [initialPeriod="weekly"] - Initial leaderboard period
 * @returns {UseLeaderboardReturn} Leaderboard data, loading state, and period setter
 *
 * @example
 * const { rankings, loading, error, currentPeriod, setPeriod } = useLeaderboard("monthly");
 *
 * if (loading) return <div>Loading leaderboard...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     <select value={currentPeriod} onChange={(e) => setPeriod(e.target.value as LeaderboardPeriod)}>
 *       <option value="weekly">Weekly</option>
 *       <option value="monthly">Monthly</option>
 *       <option value="seasonal">Seasonal</option>
 *     </select>
 *     <table>
 *       <tbody>
 *         {rankings.map(entry => (
 *           <tr key={entry.traderId}>
 *             <td>{entry.rank}</td>
 *             <td>{entry.traderName}</td>
 *             <td>{entry.roi}%</td>
 *           </tr>
 *         ))}
 *       </tbody>
 *     </table>
 *   </div>
 * );
 */
export const useLeaderboard = (initialPeriod: LeaderboardPeriod = "weekly"): UseLeaderboardReturn => {
  const [rankings, setRankings] = useState<LeaderboardRankingEntry[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<LeaderboardPeriod>(initialPeriod);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Query leaderboard for the specified period
      // Note: In production, you might want to query for the current period more intelligently
      const leaderboardRef = collection(db, "leaderboard");
      const q = query(leaderboardRef, where("period.type", "==", currentPeriod));

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          try {
            if (snapshot.empty) {
              // No leaderboard found for this period
              setRankings([]);
              setLeaderboardData(null);
              setError(new Error(`No leaderboard found for ${currentPeriod} period`));
              setLoading(false);
              return;
            }

            // Get the most recent leaderboard for this period
            // (In case there are multiple, take the first one)
            const leaderboardDoc = snapshot.docs[0];
            const data = leaderboardDoc.data() as Leaderboard;

            // Sort rankings by rank (should already be sorted in Firestore)
            const sortedRankings = [...(data.rankings || [])].sort((a, b) => a.rank - b.rank);

            setLeaderboardData({
              ...data,
              rankings: sortedRankings,
            });
            setRankings(sortedRankings);
            setError(null);
            setLoading(false);
          } catch (err) {
            console.error("Error processing leaderboard:", err);
            const errorMessage = err instanceof Error ? err : new Error("Failed to process leaderboard");
            setError(errorMessage);
            setLoading(false);
          }
        },
        (err) => {
          // Error querying leaderboard
          console.error("Error fetching leaderboard:", err);
          setError(err instanceof Error ? err : new Error("Failed to fetch leaderboard"));
          setLoading(false);
        }
      );

      // Cleanup: unsubscribe from real-time updates when component unmounts or period changes
      return unsubscribe;
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(errorMessage);
      setLoading(false);
    }
  }, [currentPeriod]);

  const setPeriod = (period: LeaderboardPeriod) => {
    setCurrentPeriod(period);
  };

  return {
    rankings,
    leaderboardData,
    loading,
    error,
    currentPeriod,
    setPeriod,
  };
};
