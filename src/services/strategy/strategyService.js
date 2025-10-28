/**
 * Strategy Service
 * Firestore 거래 전략 정보 관리
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
  startAfter,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS } from '../../firebase/collections.js';
import { nanoid } from 'nanoid';

/**
 * StrategyService Class
 * 거래 전략 생성, 조회, 수정, 삭제
 */
export class StrategyService {
  /**
   * 전략 생성
   * @param {string} traderId - 트레이더 UID
   * @param {string} traderName - 트레이더 이름
   * @param {Object} strategyData - 전략 정보
   * @returns {Promise<string>} 생성된 전략 ID
   */
  static async createStrategy(traderId, traderName, strategyData) {
    try {
      const strategyId = nanoid();
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);
      const now = Timestamp.now();

      await setDoc(strategyRef, {
        id: strategyId,
        traderId,
        traderName,
        name: strategyData.name,
        description: strategyData.description,
        category: strategyData.category, // momentum, contrarian, scalping, grid, hedging
        risk: strategyData.risk, // low, medium, high
        createdAt: now,
        updatedAt: now,
        execution: {
          smartContractAddress: strategyData.smartContractAddress || '',
          network: strategyData.network || 'solana',
          tvl: 0,
          supporterCount: 0,
          status: 'active' // active, paused, closed
        },
        performance: {
          currentROI: 0,
          roi30d: 0,
          roi90d: 0,
          winRate: 0,
          totalTrades: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          profitFactor: 0,
          lastUpdated: now
        },
        rules: strategyData.rules || {},
        backtesting: strategyData.backtesting || {}
      });

      console.log(`✅ Strategy created: ${strategyId}`);
      return strategyId;
    } catch (error) {
      console.error('Error creating strategy:', error);
      throw error;
    }
  }

  /**
   * 전략 조회
   * @param {string} strategyId - 전략 ID
   * @returns {Promise<Object|null>} 전략 정보 또는 null
   */
  static async getStrategy(strategyId) {
    try {
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);
      const docSnapshot = await getDoc(strategyRef);

      if (!docSnapshot.exists()) {
        console.log(`Strategy not found: ${strategyId}`);
        return null;
      }

      return docSnapshot.data();
    } catch (error) {
      console.error('Error getting strategy:', error);
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
   * 활성 전략 목록 조회 (홈페이지용, 페이지네이션)
   * @param {number} pageSize - 페이지당 항목 수
   * @param {string} sortBy - 정렬 기준 ('roi' | 'winRate' | 'sharpeRatio' | 'tvl')
   * @param {any} startAfterDoc - 페이지네이션 시작점
   * @returns {Promise<{strategies: Array, lastDoc: any}>} 전략 목록과 마지막 문서
   */
  static async getActiveStrategies(pageSize = 20, sortBy = 'roi', startAfterDoc = null) {
    try {
      const orderByField = `performance.${this.mapSortField(sortBy)}`;

      let q;
      if (startAfterDoc) {
        q = query(
          collection(db, COLLECTIONS.STRATEGIES),
          where('execution.status', '==', 'active'),
          orderBy(orderByField, 'desc'),
          startAfter(startAfterDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, COLLECTIONS.STRATEGIES),
          where('execution.status', '==', 'active'),
          orderBy(orderByField, 'desc'),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(q);
      const strategies = [];
      let lastDoc = null;

      querySnapshot.forEach((doc) => {
        strategies.push(doc.data());
        lastDoc = doc;
      });

      console.log(`✅ Fetched ${strategies.length} active strategies`);
      return { strategies, lastDoc };
    } catch (error) {
      console.error('Error getting active strategies:', error);
      throw error;
    }
  }

  /**
   * 카테고리별 전략 조회
   * @param {string} category - 카테고리 ('momentum' | 'contrarian' | 'scalping' | 'grid' | 'hedging')
   * @param {number} pageSize - 페이지당 항목 수
   * @returns {Promise<Array>} 전략 목록
   */
  static async getStrategiesByCategory(category, pageSize = 10) {
    try {
      const q = query(
        collection(db, COLLECTIONS.STRATEGIES),
        where('category', '==', category),
        where('execution.status', '==', 'active'),
        orderBy('performance.currentROI', 'desc'),
        limit(pageSize)
      );

      const querySnapshot = await getDocs(q);
      const strategies = [];

      querySnapshot.forEach((doc) => {
        strategies.push(doc.data());
      });

      console.log(`✅ Fetched ${strategies.length} strategies in category: ${category}`);
      return strategies;
    } catch (error) {
      console.error('Error getting strategies by category:', error);
      throw error;
    }
  }

  /**
   * 위험도별 전략 조회
   * @param {string} risk - 위험도 ('low' | 'medium' | 'high')
   * @returns {Promise<Array>} 전략 목록
   */
  static async getStrategiesByRisk(risk) {
    try {
      const q = query(
        collection(db, COLLECTIONS.STRATEGIES),
        where('risk', '==', risk),
        where('execution.status', '==', 'active'),
        orderBy('performance.winRate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const strategies = [];

      querySnapshot.forEach((doc) => {
        strategies.push(doc.data());
      });

      console.log(`✅ Fetched ${strategies.length} ${risk} risk strategies`);
      return strategies;
    } catch (error) {
      console.error('Error getting strategies by risk:', error);
      throw error;
    }
  }

  /**
   * 전략 성과 업데이트
   * @param {string} strategyId - 전략 ID
   * @param {Object} performanceData - 성과 데이터
   * @returns {Promise<void>}
   */
  static async updateStrategyPerformance(strategyId, performanceData) {
    try {
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);
      await updateDoc(strategyRef, {
        performance: {
          ...performanceData,
          lastUpdated: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Strategy performance updated: ${strategyId}`);
    } catch (error) {
      console.error('Error updating strategy performance:', error);
      throw error;
    }
  }

  /**
   * 전략 정보 업데이트
   * @param {string} strategyId - 전략 ID
   * @param {Object} data - 업데이트할 정보
   * @returns {Promise<void>}
   */
  static async updateStrategy(strategyId, data) {
    try {
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);
      await updateDoc(strategyRef, {
        ...data,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Strategy updated: ${strategyId}`);
    } catch (error) {
      console.error('Error updating strategy:', error);
      throw error;
    }
  }

  /**
   * 전략 상태 변경
   * @param {string} strategyId - 전략 ID
   * @param {string} status - 상태 ('active' | 'paused' | 'closed')
   * @returns {Promise<void>}
   */
  static async updateStrategyStatus(strategyId, status) {
    try {
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);
      await updateDoc(strategyRef, {
        'execution.status': status,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Strategy status updated: ${strategyId} -> ${status}`);
    } catch (error) {
      console.error('Error updating strategy status:', error);
      throw error;
    }
  }

  /**
   * 지원자 수 증가
   * @param {string} strategyId - 전략 ID
   * @param {number} amount - 증가 수량
   * @returns {Promise<void>}
   */
  static async incrementSupporterCount(strategyId, amount = 1) {
    try {
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);
      const strategyDoc = await getDoc(strategyRef);

      if (!strategyDoc.exists()) {
        throw new Error('Strategy not found');
      }

      const currentCount = strategyDoc.data().execution.supporterCount || 0;
      await updateDoc(strategyRef, {
        'execution.supporterCount': currentCount + amount,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Supporter count incremented: ${strategyId}`);
    } catch (error) {
      console.error('Error incrementing supporter count:', error);
      throw error;
    }
  }

  /**
   * TVL (Total Value Locked) 업데이트
   * @param {string} strategyId - 전략 ID
   * @param {number} amount - 변경액
   * @param {boolean} isAdd - 추가(true) 또는 감소(false)
   * @returns {Promise<void>}
   */
  static async updateTVL(strategyId, amount, isAdd = true) {
    try {
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);
      const strategyDoc = await getDoc(strategyRef);

      if (!strategyDoc.exists()) {
        throw new Error('Strategy not found');
      }

      const currentTVL = strategyDoc.data().execution.tvl || 0;
      const newTVL = isAdd ? currentTVL + amount : Math.max(0, currentTVL - amount);

      await updateDoc(strategyRef, {
        'execution.tvl': newTVL,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ TVL updated: ${strategyId} -> ${newTVL}`);
    } catch (error) {
      console.error('Error updating TVL:', error);
      throw error;
    }
  }

  /**
   * 전략 삭제
   * @param {string} strategyId - 전략 ID
   * @returns {Promise<void>}
   */
  static async deleteStrategy(strategyId) {
    try {
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);
      await deleteDoc(strategyRef);

      console.log(`✅ Strategy deleted: ${strategyId}`);
    } catch (error) {
      console.error('Error deleting strategy:', error);
      throw error;
    }
  }

  /**
   * 상위 성과 전략 조회
   * @param {number} limit_ - 조회할 개수
   * @param {string} metric - 메트릭 ('roi' | 'winRate' | 'sharpeRatio')
   * @returns {Promise<Array>} 전략 목록
   */
  static async getTopStrategies(limit_ = 10, metric = 'roi') {
    try {
      const orderByField = `performance.${this.mapSortField(metric)}`;

      const q = query(
        collection(db, COLLECTIONS.STRATEGIES),
        where('execution.status', '==', 'active'),
        orderBy(orderByField, 'desc'),
        limit(limit_)
      );

      const querySnapshot = await getDocs(q);
      const strategies = [];

      querySnapshot.forEach((doc) => {
        strategies.push(doc.data());
      });

      console.log(`✅ Fetched top ${strategies.length} strategies`);
      return strategies;
    } catch (error) {
      console.error('Error getting top strategies:', error);
      throw error;
    }
  }

  /**
   * Helper: 정렬 필드 매핑
   * @private
   */
  static mapSortField(sortBy) {
    const fieldMap = {
      'roi': 'currentROI',
      'winRate': 'winRate',
      'sharpeRatio': 'sharpeRatio',
      'tvl': 'tvl'
    };
    return fieldMap[sortBy] || 'currentROI';
  }
}

// Export convenience functions
export const createStrategy = StrategyService.createStrategy;
export const getStrategy = StrategyService.getStrategy;
export const getTraderStrategies = StrategyService.getTraderStrategies;
export const getActiveStrategies = StrategyService.getActiveStrategies;
export const getStrategiesByCategory = StrategyService.getStrategiesByCategory;
export const updateStrategyPerformance = StrategyService.updateStrategyPerformance;

export default StrategyService;
