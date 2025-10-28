/**
 * useLeaderboard Hook
 * 리더보드 데이터 관리 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { LeaderboardService } from '../services/leaderboard/leaderboardService.js';

/**
 * useLeaderboard Hook
 * 리더보드 데이터 조회 및 실시간 갱신
 *
 * @param {string} period - 기간 ('weekly' | 'monthly' | 'realtime')
 * @returns {Object} 리더보드 데이터 및 메서드
 *
 * 사용 예시:
 * ```jsx
 * function Leaderboard() {
 *   const { leaderboard, rankings, loading, error, refresh } = useLeaderboard('weekly');
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>Weekly Leaderboard</h1>
 *       <table>
 *         <tbody>
 *           {rankings.map(trader => (
 *             <tr key={trader.traderId}>
 *               <td>{trader.rank}</td>
 *               <td>{trader.traderName}</td>
 *               <td>{trader.roi}%</td>
 *             </tr>
 *           ))}
 *         </tbody>
 *       </table>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLeaderboard(period = 'realtime') {
  const [leaderboard, setLeaderboard] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 리더보드 데이터 로드
   */
  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data;

      switch (period) {
        case 'weekly':
          data = await LeaderboardService.getLatestWeeklyLeaderboard();
          break;
        case 'monthly':
          data = await LeaderboardService.getLatestMonthlyLeaderboard();
          break;
        case 'realtime':
        default:
          const realtimeRankings = await LeaderboardService.generateRealtimeLeaderboard();
          setRankings(realtimeRankings);
          return;
      }

      if (data) {
        setLeaderboard(data);
        setRankings(data.rankings || []);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  /**
   * 초기 로드
   */
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  /**
   * 리더보드 새로고침
   */
  const refresh = useCallback(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  /**
   * 특정 순위 트레이더 조회
   */
  const getRanking = useCallback((rank) => {
    return rankings.find(r => r.rank === rank);
  }, [rankings]);

  /**
   * 트레이더 순위 조회
   */
  const getTraderRank = useCallback((traderId) => {
    return rankings.find(r => r.traderId === traderId);
  }, [rankings]);

  /**
   * 상위 N명 조회
   */
  const getTopRankings = useCallback((limit) => {
    return rankings.slice(0, limit);
  }, [rankings]);

  /**
   * 평균 ROI 계산
   */
  const getAverageROI = useCallback(() => {
    if (rankings.length === 0) return 0;
    const totalROI = rankings.reduce((sum, r) => sum + (r.roi || 0), 0);
    return (totalROI / rankings.length).toFixed(2);
  }, [rankings]);

  /**
   * 평균 승률 계산
   */
  const getAverageWinRate = useCallback(() => {
    if (rankings.length === 0) return 0;
    const totalWinRate = rankings.reduce((sum, r) => sum + (r.winRate || 0), 0);
    return (totalWinRate / rankings.length).toFixed(2);
  }, [rankings]);

  return {
    // 데이터
    leaderboard,
    rankings,
    loading,
    error,

    // 메서드
    refresh,
    getRanking,
    getTraderRank,
    getTopRankings,
    getAverageROI,
    getAverageWinRate,

    // 편의 속성
    isLoading: loading,
    isEmpty: rankings.length === 0,
    totalRankings: rankings.length,
    firstPlace: rankings[0] || null,
    lastPlace: rankings[rankings.length - 1] || null
  };
}

/**
 * useLeaderboardHistory Hook
 * 과거 리더보드 데이터 조회
 *
 * @param {string} period - 기간 ('weekly' | 'monthly' | 'seasonal')
 * @returns {Object} 리더보드 히스토리 데이터
 *
 * 사용 예시:
 * ```jsx
 * function LeaderboardHistory() {
 *   const { leaderboards, loading } = useLeaderboardHistory('weekly');
 *
 *   return (
 *     <div>
 *       {leaderboards.map(lb => (
 *         <div key={lb.id}>{lb.period.startDate}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLeaderboardHistory(period = 'weekly') {
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 리더보드 히스토리 로드
   */
  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await LeaderboardService.getLeaderboardsByPeriod(period);
      setLeaderboards(data);
    } catch (err) {
      console.error('Error loading leaderboard history:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  /**
   * 초기 로드
   */
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /**
   * 히스토리 새로고침
   */
  const refresh = useCallback(() => {
    loadHistory();
  }, [loadHistory]);

  /**
   * 특정 기간의 리더보드 조회
   */
  const getLeaderboardById = useCallback((id) => {
    return leaderboards.find(lb => lb.id === id);
  }, [leaderboards]);

  /**
   * 최신 N개 리더보드 조회
   */
  const getLatestLeaderboards = useCallback((limit) => {
    return leaderboards.slice(0, limit);
  }, [leaderboards]);

  return {
    // 데이터
    leaderboards,
    loading,
    error,

    // 메서드
    refresh,
    getLeaderboardById,
    getLatestLeaderboards,

    // 편의 속성
    isLoading: loading,
    isEmpty: leaderboards.length === 0,
    totalCount: leaderboards.length,
    latest: leaderboards[0] || null
  };
}

export default useLeaderboard;
