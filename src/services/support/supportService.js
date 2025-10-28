/**
 * Support Service
 * 사용자의 전략 투자(Support) 정보 관리
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
  deleteDoc,
  increment
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS } from '../../firebase/collections.js';
import { nanoid } from 'nanoid';

/**
 * SupportService Class
 * 사용자의 전략 투자 관리
 */
export class SupportService {
  /**
   * 전략 투자 생성 (Support 문서 생성)
   * @param {string} userId - 투자자 UID
   * @param {string} traderId - 트레이더 UID
   * @param {string} strategyId - 전략 ID
   * @param {Object} supportData - 투자 정보
   * @returns {Promise<string>} 생성된 Support ID
   */
  static async createSupport(userId, traderId, strategyId, supportData) {
    try {
      const supportId = nanoid();
      const supportRef = doc(db, COLLECTIONS.SUPPORTERS, supportId);
      const now = Timestamp.now();

      await setDoc(supportRef, {
        id: supportId,
        userId,
        traderId,
        strategyId,
        investmentAmount: supportData.investmentAmount,
        investedAt: now,
        currency: supportData.currency || 'USDC',
        status: 'active', // active, closed, exited
        returns: {
          earned: 0,
          roi: 0,
          realized: 0,
          unrealized: 0,
          lastUpdated: now
        },
        contract: {
          address: supportData.contractAddress || '',
          txHash: supportData.txHash || '',
          blockNumber: supportData.blockNumber || 0
        },
        notes: supportData.notes || ''
      });

      console.log(`✅ Support created: ${supportId}`);
      return supportId;
    } catch (error) {
      console.error('Error creating support:', error);
      throw error;
    }
  }

  /**
   * 투자 정보 조회
   * @param {string} supportId - Support ID
   * @returns {Promise<Object|null>} 투자 정보 또는 null
   */
  static async getSupport(supportId) {
    try {
      const supportRef = doc(db, COLLECTIONS.SUPPORTERS, supportId);
      const docSnapshot = await getDoc(supportRef);

      if (!docSnapshot.exists()) {
        console.log(`Support not found: ${supportId}`);
        return null;
      }

      return docSnapshot.data();
    } catch (error) {
      console.error('Error getting support:', error);
      throw error;
    }
  }

  /**
   * 사용자의 모든 투자 조회
   * @param {string} userId - 투자자 UID
   * @param {string} status - 필터링할 상태 ('active' | 'closed' | 'exited' | 'all')
   * @returns {Promise<Array>} 투자 목록
   */
  static async getUserSupports(userId, status = 'active') {
    try {
      let q;

      if (status === 'all') {
        q = query(
          collection(db, COLLECTIONS.SUPPORTERS),
          where('userId', '==', userId),
          orderBy('investedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, COLLECTIONS.SUPPORTERS),
          where('userId', '==', userId),
          where('status', '==', status),
          orderBy('investedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const supports = [];

      querySnapshot.forEach((doc) => {
        supports.push(doc.data());
      });

      console.log(`✅ Fetched ${supports.length} supports for user: ${userId}`);
      return supports;
    } catch (error) {
      console.error('Error getting user supports:', error);
      throw error;
    }
  }

  /**
   * 트레이더의 모든 지원자 조회
   * @param {string} traderId - 트레이더 UID
   * @returns {Promise<Array>} 지원자 목록
   */
  static async getTraderSupporters(traderId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.SUPPORTERS),
        where('traderId', '==', traderId),
        where('status', '==', 'active'),
        orderBy('investmentAmount', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const supporters = [];

      querySnapshot.forEach((doc) => {
        supporters.push(doc.data());
      });

      console.log(`✅ Fetched ${supporters.length} supporters for trader: ${traderId}`);
      return supporters;
    } catch (error) {
      console.error('Error getting trader supporters:', error);
      throw error;
    }
  }

  /**
   * 전략의 모든 투자자 조회
   * @param {string} strategyId - 전략 ID
   * @returns {Promise<Array>} 투자자 목록
   */
  static async getStrategyInvestors(strategyId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.SUPPORTERS),
        where('strategyId', '==', strategyId),
        where('status', '==', 'active'),
        orderBy('investmentAmount', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const investors = [];

      querySnapshot.forEach((doc) => {
        investors.push(doc.data());
      });

      console.log(`✅ Fetched ${investors.length} investors for strategy: ${strategyId}`);
      return investors;
    } catch (error) {
      console.error('Error getting strategy investors:', error);
      throw error;
    }
  }

  /**
   * 투자 수익 업데이트
   * @param {string} supportId - Support ID
   * @param {Object} returnsData - 수익 데이터
   * @returns {Promise<void>}
   */
  static async updateReturns(supportId, returnsData) {
    try {
      const supportRef = doc(db, COLLECTIONS.SUPPORTERS, supportId);
      await updateDoc(supportRef, {
        returns: {
          earned: returnsData.earned,
          roi: returnsData.roi,
          realized: returnsData.realized,
          unrealized: returnsData.unrealized,
          lastUpdated: Timestamp.now()
        }
      });

      console.log(`✅ Support returns updated: ${supportId}`);
    } catch (error) {
      console.error('Error updating returns:', error);
      throw error;
    }
  }

  /**
   * 투자 상태 변경
   * @param {string} supportId - Support ID
   * @param {string} status - 상태 ('active' | 'closed' | 'exited')
   * @returns {Promise<void>}
   */
  static async updateSupportStatus(supportId, status) {
    try {
      const supportRef = doc(db, COLLECTIONS.SUPPORTERS, supportId);
      await updateDoc(supportRef, {
        status: status
      });

      console.log(`✅ Support status updated: ${supportId} -> ${status}`);
    } catch (error) {
      console.error('Error updating support status:', error);
      throw error;
    }
  }

  /**
   * 투자 액수 증가 (Realize 수익)
   * @param {string} supportId - Support ID
   * @param {number} amount - 증가액
   * @returns {Promise<void>}
   */
  static async incrementEarnings(supportId, amount) {
    try {
      const supportRef = doc(db, COLLECTIONS.SUPPORTERS, supportId);
      const supportDoc = await getDoc(supportRef);

      if (!supportDoc.exists()) {
        throw new Error('Support not found');
      }

      const currentReturns = supportDoc.data().returns;
      const newEarned = (currentReturns.earned || 0) + amount;
      const roi = ((newEarned / supportDoc.data().investmentAmount) * 100).toFixed(2);

      await updateDoc(supportRef, {
        'returns.earned': newEarned,
        'returns.roi': parseFloat(roi),
        'returns.lastUpdated': Timestamp.now()
      });

      console.log(`✅ Support earnings incremented: ${supportId}`);
    } catch (error) {
      console.error('Error incrementing earnings:', error);
      throw error;
    }
  }

  /**
   * 미실현 수익 업데이트
   * @param {string} supportId - Support ID
   * @param {number} unrealizedAmount - 미실현 수익
   * @returns {Promise<void>}
   */
  static async updateUnrealizedGains(supportId, unrealizedAmount) {
    try {
      const supportRef = doc(db, COLLECTIONS.SUPPORTERS, supportId);
      const supportDoc = await getDoc(supportRef);

      if (!supportDoc.exists()) {
        throw new Error('Support not found');
      }

      const investmentAmount = supportDoc.data().investmentAmount;
      const totalReturn = (supportDoc.data().returns.realized || 0) + unrealizedAmount;
      const roi = ((totalReturn / investmentAmount) * 100).toFixed(2);

      await updateDoc(supportRef, {
        'returns.unrealized': unrealizedAmount,
        'returns.roi': parseFloat(roi),
        'returns.lastUpdated': Timestamp.now()
      });

      console.log(`✅ Unrealized gains updated: ${supportId}`);
    } catch (error) {
      console.error('Error updating unrealized gains:', error);
      throw error;
    }
  }

  /**
   * 투자 정보 업데이트
   * @param {string} supportId - Support ID
   * @param {Object} data - 업데이트할 정보
   * @returns {Promise<void>}
   */
  static async updateSupport(supportId, data) {
    try {
      const supportRef = doc(db, COLLECTIONS.SUPPORTERS, supportId);
      await updateDoc(supportRef, data);

      console.log(`✅ Support updated: ${supportId}`);
    } catch (error) {
      console.error('Error updating support:', error);
      throw error;
    }
  }

  /**
   * 투자 삭제
   * @param {string} supportId - Support ID
   * @returns {Promise<void>}
   */
  static async deleteSupport(supportId) {
    try {
      const supportRef = doc(db, COLLECTIONS.SUPPORTERS, supportId);
      await deleteDoc(supportRef);

      console.log(`✅ Support deleted: ${supportId}`);
    } catch (error) {
      console.error('Error deleting support:', error);
      throw error;
    }
  }

  /**
   * 사용자의 총 투자액 계산
   * @param {string} userId - 사용자 UID
   * @returns {Promise<number>} 총 투자액
   */
  static async getTotalInvestedAmount(userId) {
    try {
      const supports = await this.getUserSupports(userId, 'all');
      const total = supports.reduce((sum, support) => {
        return sum + (support.investmentAmount || 0);
      }, 0);

      return total;
    } catch (error) {
      console.error('Error calculating total invested amount:', error);
      throw error;
    }
  }

  /**
   * 사용자의 총 수익 계산
   * @param {string} userId - 사용자 UID
   * @returns {Promise<number>} 총 수익
   */
  static async getTotalEarnings(userId) {
    try {
      const supports = await this.getUserSupports(userId, 'all');
      const total = supports.reduce((sum, support) => {
        return sum + (support.returns?.earned || 0);
      }, 0);

      return total;
    } catch (error) {
      console.error('Error calculating total earnings:', error);
      throw error;
    }
  }

  /**
   * 사용자의 평균 ROI 계산
   * @param {string} userId - 사용자 UID
   * @returns {Promise<number>} 평균 ROI
   */
  static async getAverageROI(userId) {
    try {
      const supports = await this.getUserSupports(userId, 'all');

      if (supports.length === 0) {
        return 0;
      }

      const totalROI = supports.reduce((sum, support) => {
        return sum + (support.returns?.roi || 0);
      }, 0);

      return (totalROI / supports.length).toFixed(2);
    } catch (error) {
      console.error('Error calculating average ROI:', error);
      throw error;
    }
  }

  /**
   * 트레이더의 총 받은 투자액 계산
   * @param {string} traderId - 트레이더 UID
   * @returns {Promise<number>} 총 투자액
   */
  static async getTraderTotalTVL(traderId) {
    try {
      const supporters = await this.getTraderSupporters(traderId);
      const total = supporters.reduce((sum, support) => {
        return sum + (support.investmentAmount || 0);
      }, 0);

      return total;
    } catch (error) {
      console.error('Error calculating trader total TVL:', error);
      throw error;
    }
  }

  /**
   * 성과가 우수한 투자 목록 조회
   * @param {number} limit_ - 조회할 개수
   * @returns {Promise<Array>} 투자 목록
   */
  static async getTopInvestments(limit_ = 10) {
    try {
      const q = query(
        collection(db, COLLECTIONS.SUPPORTERS),
        where('status', '==', 'active'),
        orderBy('returns.roi', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const supports = [];
      let count = 0;

      querySnapshot.forEach((doc) => {
        if (count < limit_) {
          supports.push(doc.data());
          count++;
        }
      });

      return supports;
    } catch (error) {
      console.error('Error getting top investments:', error);
      throw error;
    }
  }
}

// Export convenience functions
export const createSupport = SupportService.createSupport;
export const getSupport = SupportService.getSupport;
export const getUserSupports = SupportService.getUserSupports;
export const getTraderSupporters = SupportService.getTraderSupporters;
export const updateReturns = SupportService.updateReturns;

export default SupportService;
