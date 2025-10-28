/**
 * Trader Service
 * Firestore 트레이더 프로필 및 정보 관리
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
  limit,
  getDocs,
  startAfter
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS } from '../../firebase/collections.js';

/**
 * TraderService Class
 * 트레이더 프로필, 검증, 성과 관리
 */
export class TraderService {
  /**
   * 트레이더 프로필 생성
   * 사용자가 트레이더 신청시 호출
   *
   * @param {string} uid - 트레이더 UID
   * @param {Object} userProfile - 사용자 프로필 정보
   * @param {Object} traderData - 트레이더 추가 정보
   * @returns {Promise<void>}
   */
  static async createTraderProfile(uid, userProfile, traderData) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, uid);
      const now = Timestamp.now();

      await setDoc(traderRef, {
        uid,
        displayName: userProfile.displayName,
        bio: traderData.bio || '',
        avatar: userProfile.photoURL || '',
        youtubeUrl: traderData.youtubeUrl || '',
        twitterUrl: traderData.twitterUrl || '',
        discordUsername: traderData.discordUsername || '',
        followerCount: 0,
        createdAt: now,
        verifiedAt: null,
        verification: {
          status: 'pending',
          submittedAt: now,
          rejectionReason: null
        },
        performance: {
          totalTrades: 0,
          totalWins: 0,
          totalLosses: 0,
          winRate: 0,
          avgROI: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          updatedAt: now
        },
        rating: {
          averageRating: 0,
          ratingCount: 0,
          communityScore: 0
        }
      });

      console.log(`✅ Trader profile created: ${uid}`);
    } catch (error) {
      console.error('Error creating trader profile:', error);
      throw error;
    }
  }

  /**
   * 트레이더 프로필 조회
   * @param {string} traderId - 트레이더 UID
   * @returns {Promise<Object|null>} 트레이더 프로필 또는 null
   */
  static async getTraderProfile(traderId) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);
      const docSnapshot = await getDoc(traderRef);

      if (!docSnapshot.exists()) {
        console.log(`Trader not found: ${traderId}`);
        return null;
      }

      return docSnapshot.data();
    } catch (error) {
      console.error('Error getting trader profile:', error);
      throw error;
    }
  }

  /**
   * 검증된 트레이더 목록 조회 (페이지네이션)
   * @param {number} pageSize - 페이지당 항목 수
   * @param {any} startAfterDoc - 페이지네이션 시작점
   * @returns {Promise<{traders: Array, lastDoc: any}>} 트레이더 목록과 마지막 문서
   */
  static async getVerifiedTraders(pageSize = 10, startAfterDoc = null) {
    try {
      let q;

      if (startAfterDoc) {
        q = query(
          collection(db, COLLECTIONS.TRADERS),
          where('verification.status', '==', 'verified'),
          orderBy('rating.communityScore', 'desc'),
          startAfter(startAfterDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, COLLECTIONS.TRADERS),
          where('verification.status', '==', 'verified'),
          orderBy('rating.communityScore', 'desc'),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(q);
      const traders = [];
      let lastDoc = null;

      querySnapshot.forEach((doc) => {
        traders.push(doc.data());
        lastDoc = doc;
      });

      console.log(`✅ Fetched ${traders.length} verified traders`);
      return { traders, lastDoc };
    } catch (error) {
      console.error('Error getting verified traders:', error);
      throw error;
    }
  }

  /**
   * 모든 대기 중인 트레이더 조회 (관리자용)
   * @returns {Promise<Array>} 대기 중인 트레이더 목록
   */
  static async getPendingTraders() {
    try {
      const q = query(
        collection(db, COLLECTIONS.TRADERS),
        where('verification.status', '==', 'pending'),
        orderBy('verification.submittedAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const traders = [];

      querySnapshot.forEach((doc) => {
        traders.push(doc.data());
      });

      console.log(`✅ Fetched ${traders.length} pending traders`);
      return traders;
    } catch (error) {
      console.error('Error getting pending traders:', error);
      throw error;
    }
  }

  /**
   * 트레이더별 전략 조회
   * @param {string} traderId - 트레이더 UID
   * @returns {Promise<Array>} 전략 목록
   */
  static async getTraderStrategies(traderId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.STRATEGIES),
        where('traderId', '==', traderId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const strategies = [];

      querySnapshot.forEach((doc) => {
        strategies.push(doc.data());
      });

      console.log(`✅ Fetched ${strategies.length} strategies for trader: ${traderId}`);
      return strategies;
    } catch (error) {
      console.error('Error getting trader strategies:', error);
      throw error;
    }
  }

  /**
   * 트레이더 성과 업데이트
   * @param {string} traderId - 트레이더 UID
   * @param {Object} performanceData - 성과 데이터
   * @returns {Promise<void>}
   */
  static async updateTraderPerformance(traderId, performanceData) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);
      await updateDoc(traderRef, {
        performance: {
          ...performanceData,
          updatedAt: Timestamp.now()
        }
      });

      console.log(`✅ Trader performance updated: ${traderId}`);
    } catch (error) {
      console.error('Error updating trader performance:', error);
      throw error;
    }
  }

  /**
   * 트레이더 평점 업데이트
   * @param {string} traderId - 트레이더 UID
   * @param {number} newRating - 새 평점
   * @returns {Promise<void>}
   */
  static async updateTraderRating(traderId, newRating) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);
      const traderDoc = await getDoc(traderRef);

      if (!traderDoc.exists()) {
        throw new Error('Trader not found');
      }

      const rating = traderDoc.data().rating;
      const totalRating = (rating.averageRating * rating.ratingCount) + newRating;
      const newCount = rating.ratingCount + 1;
      const newAverage = totalRating / newCount;

      await updateDoc(traderRef, {
        'rating.averageRating': newAverage,
        'rating.ratingCount': newCount
      });

      console.log(`✅ Trader rating updated: ${traderId}`);
    } catch (error) {
      console.error('Error updating trader rating:', error);
      throw error;
    }
  }

  /**
   * 트레이더 팔로워 수 증가
   * @param {string} traderId - 트레이더 UID
   * @returns {Promise<void>}
   */
  static async incrementFollowerCount(traderId) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);
      const traderDoc = await getDoc(traderRef);

      if (!traderDoc.exists()) {
        throw new Error('Trader not found');
      }

      const currentCount = traderDoc.data().followerCount || 0;
      await updateDoc(traderRef, {
        followerCount: currentCount + 1
      });

      console.log(`✅ Follower count incremented: ${traderId}`);
    } catch (error) {
      console.error('Error incrementing follower count:', error);
      throw error;
    }
  }

  /**
   * 트레이더 팔로워 수 감소
   * @param {string} traderId - 트레이더 UID
   * @returns {Promise<void>}
   */
  static async decrementFollowerCount(traderId) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);
      const traderDoc = await getDoc(traderRef);

      if (!traderDoc.exists()) {
        throw new Error('Trader not found');
      }

      const currentCount = traderDoc.data().followerCount || 0;
      await updateDoc(traderRef, {
        followerCount: Math.max(0, currentCount - 1)
      });

      console.log(`✅ Follower count decremented: ${traderId}`);
    } catch (error) {
      console.error('Error decrementing follower count:', error);
      throw error;
    }
  }

  /**
   * 트레이더 검증 (관리자)
   * @param {string} traderId - 트레이더 UID
   * @param {boolean} approved - 승인 여부
   * @param {string} rejectionReason - 거절 사유 (거절시에만)
   * @returns {Promise<void>}
   */
  static async verifyTrader(traderId, approved = true, rejectionReason = null) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);

      if (approved) {
        await updateDoc(traderRef, {
          'verification.status': 'verified',
          'verification.rejectionReason': null,
          verifiedAt: Timestamp.now()
        });
        console.log(`✅ Trader approved: ${traderId}`);
      } else {
        await updateDoc(traderRef, {
          'verification.status': 'rejected',
          'verification.rejectionReason': rejectionReason || '승인 거절',
          verifiedAt: null
        });
        console.log(`⛔ Trader rejected: ${traderId}`);
      }
    } catch (error) {
      console.error('Error verifying trader:', error);
      throw error;
    }
  }

  /**
   * 트레이더 정보 업데이트
   * @param {string} traderId - 트레이더 UID
   * @param {Object} data - 업데이트할 정보
   * @returns {Promise<void>}
   */
  static async updateTraderProfile(traderId, data) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);
      await updateDoc(traderRef, data);

      console.log(`✅ Trader profile updated: ${traderId}`);
    } catch (error) {
      console.error('Error updating trader profile:', error);
      throw error;
    }
  }

  /**
   * 랭킹순 트레이더 조회
   * @param {number} limit_ - 조회할 개수
   * @returns {Promise<Array>} 상위 트레이더 목록
   */
  static async getTopTraders(limit_ = 10) {
    try {
      const q = query(
        collection(db, COLLECTIONS.TRADERS),
        where('verification.status', '==', 'verified'),
        orderBy('performance.avgROI', 'desc'),
        limit(limit_)
      );

      const querySnapshot = await getDocs(q);
      const traders = [];

      querySnapshot.forEach((doc) => {
        traders.push(doc.data());
      });

      console.log(`✅ Fetched top ${traders.length} traders`);
      return traders;
    } catch (error) {
      console.error('Error getting top traders:', error);
      throw error;
    }
  }
}

// Export convenience functions
export const createTraderProfile = TraderService.createTraderProfile;
export const getTraderProfile = TraderService.getTraderProfile;
export const getVerifiedTraders = TraderService.getVerifiedTraders;
export const getPendingTraders = TraderService.getPendingTraders;
export const getTraderStrategies = TraderService.getTraderStrategies;
export const updateTraderPerformance = TraderService.updateTraderPerformance;
export const verifyTrader = TraderService.verifyTrader;

export default TraderService;
