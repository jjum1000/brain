/**
 * Leaderboard Service
 * 주간/월간 리더보드 관리
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS } from '../../firebase/collections.js';
import { TraderService } from '../trader/traderService.js';

/**
 * LeaderboardService Class
 * 리더보드 생성, 업데이트, 조회
 */
export class LeaderboardService {
  /**
   * 주간 리더보드 생성 (매주 월요일 실행)
   * @param {Array} rankings - 랭킹 데이터 배열
   * @param {Object} stats - 통계 정보
   * @returns {Promise<string>} 생성된 리더보드 ID
   */
  static async createWeeklyLeaderboard(rankings, stats) {
    try {
      const weekId = this.generateWeekId();
      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARD, weekId);
      const now = Timestamp.now();

      // 주간 시작 및 종료 날짜 계산
      const startDate = this.getWeekStart(new Date());
      const endDate = this.getWeekEnd(new Date());

      await setDoc(leaderboardRef, {
        id: weekId,
        period: {
          type: 'weekly',
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          season: null
        },
        rankings: this.formatRankings(rankings),
        totalStrategies: stats.totalStrategies || 0,
        totalTraders: stats.totalTraders || 0,
        totalSupporters: stats.totalSupporters || 0,
        totalVolume: stats.totalVolume || 0,
        updatedAt: now
      });

      console.log(`✅ Weekly leaderboard created: ${weekId}`);
      return weekId;
    } catch (error) {
      console.error('Error creating weekly leaderboard:', error);
      throw error;
    }
  }

  /**
   * 월간 리더보드 생성 (매월 1일 실행)
   * @param {Array} rankings - 랭킹 데이터 배열
   * @param {Object} stats - 통계 정보
   * @returns {Promise<string>} 생성된 리더보드 ID
   */
  static async createMonthlyLeaderboard(rankings, stats) {
    try {
      const monthId = this.generateMonthId();
      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARD, monthId);
      const now = Timestamp.now();

      // 월간 시작 및 종료 날짜 계산
      const startDate = this.getMonthStart(new Date());
      const endDate = this.getMonthEnd(new Date());

      await setDoc(leaderboardRef, {
        id: monthId,
        period: {
          type: 'monthly',
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          season: null
        },
        rankings: this.formatRankings(rankings),
        totalStrategies: stats.totalStrategies || 0,
        totalTraders: stats.totalTraders || 0,
        totalSupporters: stats.totalSupporters || 0,
        totalVolume: stats.totalVolume || 0,
        updatedAt: now
      });

      console.log(`✅ Monthly leaderboard created: ${monthId}`);
      return monthId;
    } catch (error) {
      console.error('Error creating monthly leaderboard:', error);
      throw error;
    }
  }

  /**
   * 시즌 리더보드 생성
   * @param {string} seasonName - 시즌 이름
   * @param {Array} rankings - 랭킹 데이터 배열
   * @param {Object} stats - 통계 정보
   * @returns {Promise<string>} 생성된 리더보드 ID
   */
  static async createSeasonalLeaderboard(seasonName, rankings, stats) {
    try {
      const seasonId = `season_${seasonName}_${Date.now()}`;
      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARD, seasonId);
      const now = Timestamp.now();

      await setDoc(leaderboardRef, {
        id: seasonId,
        period: {
          type: 'seasonal',
          startDate: now,
          endDate: null,
          season: seasonName
        },
        rankings: this.formatRankings(rankings),
        totalStrategies: stats.totalStrategies || 0,
        totalTraders: stats.totalTraders || 0,
        totalSupporters: stats.totalSupporters || 0,
        totalVolume: stats.totalVolume || 0,
        updatedAt: now
      });

      console.log(`✅ Seasonal leaderboard created: ${seasonId}`);
      return seasonId;
    } catch (error) {
      console.error('Error creating seasonal leaderboard:', error);
      throw error;
    }
  }

  /**
   * 리더보드 조회
   * @param {string} leaderboardId - 리더보드 ID
   * @returns {Promise<Object|null>} 리더보드 정보 또는 null
   */
  static async getLeaderboard(leaderboardId) {
    try {
      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARD, leaderboardId);
      const docSnapshot = await getDoc(leaderboardRef);

      if (!docSnapshot.exists()) {
        console.log(`Leaderboard not found: ${leaderboardId}`);
        return null;
      }

      return docSnapshot.data();
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * 최신 주간 리더보드 조회
   * @returns {Promise<Object|null>} 최신 주간 리더보드
   */
  static async getLatestWeeklyLeaderboard() {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEADERBOARD),
        where('period.type', '==', 'weekly'),
        orderBy('period.startDate', 'desc')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No weekly leaderboard found');
        return null;
      }

      const leaderboard = querySnapshot.docs[0].data();
      console.log(`✅ Latest weekly leaderboard retrieved`);
      return leaderboard;
    } catch (error) {
      console.error('Error getting latest weekly leaderboard:', error);
      throw error;
    }
  }

  /**
   * 최신 월간 리더보드 조회
   * @returns {Promise<Object|null>} 최신 월간 리더보드
   */
  static async getLatestMonthlyLeaderboard() {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEADERBOARD),
        where('period.type', '==', 'monthly'),
        orderBy('period.startDate', 'desc')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No monthly leaderboard found');
        return null;
      }

      const leaderboard = querySnapshot.docs[0].data();
      console.log(`✅ Latest monthly leaderboard retrieved`);
      return leaderboard;
    } catch (error) {
      console.error('Error getting latest monthly leaderboard:', error);
      throw error;
    }
  }

  /**
   * 모든 리더보드 조회
   * @param {string} period - 기간 ('weekly' | 'monthly' | 'seasonal')
   * @returns {Promise<Array>} 리더보드 목록
   */
  static async getLeaderboardsByPeriod(period) {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEADERBOARD),
        where('period.type', '==', period),
        orderBy('period.startDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const leaderboards = [];

      querySnapshot.forEach((doc) => {
        leaderboards.push(doc.data());
      });

      console.log(`✅ Fetched ${leaderboards.length} ${period} leaderboards`);
      return leaderboards;
    } catch (error) {
      console.error('Error getting leaderboards by period:', error);
      throw error;
    }
  }

  /**
   * 리더보드 업데이트 (새로운 데이터로 갱신)
   * @param {string} leaderboardId - 리더보드 ID
   * @param {Array} rankings - 새로운 랭킹 데이터
   * @param {Object} stats - 통계 정보
   * @returns {Promise<void>}
   */
  static async updateLeaderboard(leaderboardId, rankings, stats) {
    try {
      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARD, leaderboardId);

      await updateDoc(leaderboardRef, {
        rankings: this.formatRankings(rankings),
        totalStrategies: stats.totalStrategies || 0,
        totalTraders: stats.totalTraders || 0,
        totalSupporters: stats.totalSupporters || 0,
        totalVolume: stats.totalVolume || 0,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Leaderboard updated: ${leaderboardId}`);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }
  }

  /**
   * 리더보드 삭제
   * @param {string} leaderboardId - 리더보드 ID
   * @returns {Promise<void>}
   */
  static async deleteLeaderboard(leaderboardId) {
    try {
      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARD, leaderboardId);
      await deleteDoc(leaderboardRef);

      console.log(`✅ Leaderboard deleted: ${leaderboardId}`);
    } catch (error) {
      console.error('Error deleting leaderboard:', error);
      throw error;
    }
  }

  /**
   * 현재 실시간 리더보드 생성 (홈페이지용)
   * 모든 활성 트레이더의 현재 성과를 기반으로
   * @returns {Promise<Array>} 상위 트레이더 목록
   */
  static async generateRealtimeLeaderboard(limit_ = 100) {
    try {
      const topTraders = await TraderService.getTopTraders(limit_);

      const rankings = topTraders.map((trader, index) => ({
        rank: index + 1,
        traderId: trader.uid,
        traderName: trader.displayName,
        avatar: trader.avatar,
        roi: trader.performance.avgROI,
        winRate: trader.performance.winRate,
        sharpeRatio: trader.performance.sharpeRatio,
        totalTrades: trader.performance.totalTrades,
        followerCount: trader.followerCount,
        rating: trader.rating.averageRating,
        communityScore: trader.rating.communityScore
      }));

      console.log(`✅ Realtime leaderboard generated with ${rankings.length} traders`);
      return rankings;
    } catch (error) {
      console.error('Error generating realtime leaderboard:', error);
      throw error;
    }
  }

  /**
   * Helper: 랭킹 데이터 포맷팅
   * @private
   */
  static formatRankings(rankings) {
    return rankings.map((trader, index) => ({
      rank: index + 1,
      traderId: trader.uid || trader.traderId,
      traderName: trader.displayName || trader.traderName,
      avatar: trader.avatar,
      roi: trader.performance?.avgROI || trader.roi || 0,
      winRate: trader.performance?.winRate || trader.winRate || 0,
      sharpeRatio: trader.performance?.sharpeRatio || trader.sharpeRatio || 0,
      totalTrades: trader.performance?.totalTrades || trader.totalTrades || 0,
      followerCount: trader.followerCount || 0,
      rating: trader.rating?.averageRating || trader.rating || 0,
      communityScore: trader.rating?.communityScore || 0
    }));
  }

  /**
   * Helper: 주 ID 생성 (week_YYYY_WW 형식)
   * @private
   */
  static generateWeekId() {
    const now = new Date();
    const year = now.getFullYear();
    const week = this.getWeekNumber(now);
    return `week_${year}_${String(week).padStart(2, '0')}`;
  }

  /**
   * Helper: 월 ID 생성 (month_YYYY_MM 형식)
   * @private
   */
  static generateMonthId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `month_${year}_${month}`;
  }

  /**
   * Helper: 주 번호 계산
   * @private
   */
  static getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Helper: 주의 시작 날짜
   * @private
   */
  static getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  /**
   * Helper: 주의 종료 날짜
   * @private
   */
  static getWeekEnd(date) {
    const start = this.getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return end;
  }

  /**
   * Helper: 월의 시작 날짜
   * @private
   */
  static getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Helper: 월의 종료 날짜
   * @private
   */
  static getMonthEnd(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }
}

// Export convenience functions
export const getLeaderboard = LeaderboardService.getLeaderboard;
export const getLatestWeeklyLeaderboard = LeaderboardService.getLatestWeeklyLeaderboard;
export const getLatestMonthlyLeaderboard = LeaderboardService.getLatestMonthlyLeaderboard;
export const generateRealtimeLeaderboard = LeaderboardService.generateRealtimeLeaderboard;

export default LeaderboardService;
