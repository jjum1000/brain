/**
 * User Service
 * Firestore 사용자 정보 CRUD 관리
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
  getDocs,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { COLLECTIONS } from '../../firebase/collections.js';

/**
 * UserService Class
 * 사용자 프로필 및 정보 관리
 */
export class UserService {
  /**
   * 사용자 프로필 생성
   * @param {string} uid - 사용자 UID
   * @param {Object} data - 사용자 정보
   * @returns {Promise<void>}
   */
  static async createUserProfile(uid, data) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const now = Timestamp.now();

      await setDoc(userRef, {
        uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL || null,
        role: data.role || 'supporter',
        walletAddress: data.walletAddress || null,
        bio: data.bio || '',
        createdAt: now,
        updatedAt: now,
        stats: {
          totalInvested: 0,
          totalEarnings: 0,
          favoriteTraders: [],
          followingCount: 0
        },
        preferences: {
          notifications: true,
          theme: 'dark',
          language: 'ko'
        },
        verified: false,
        kycStatus: 'pending'
      });

      console.log(`✅ User profile created: ${uid}`);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * 사용자 프로필 조회
   * @param {string} uid - 사용자 UID
   * @returns {Promise<Object>} 사용자 프로필
   */
  static async getUserProfile(uid) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const docSnapshot = await getDoc(userRef);

      if (!docSnapshot.exists()) {
        throw new Error(`User profile not found: ${uid}`);
      }

      return docSnapshot.data();
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * 사용자 프로필 업데이트
   * @param {string} uid - 사용자 UID
   * @param {Object} data - 업데이트할 정보
   * @returns {Promise<void>}
   */
  static async updateUserProfile(uid, data) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      await updateDoc(userRef, updateData);
      console.log(`✅ User profile updated: ${uid}`);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * 사용자 지갑 주소 업데이트
   * @param {string} uid - 사용자 UID
   * @param {string} walletAddress - Solana 지갑 주소
   * @returns {Promise<void>}
   */
  static async updateWalletAddress(uid, walletAddress) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        walletAddress,
        updatedAt: Timestamp.now()
      });
      console.log(`✅ Wallet address updated: ${uid}`);
    } catch (error) {
      console.error('Error updating wallet address:', error);
      throw error;
    }
  }

  /**
   * 즐겨찾기 트레이더 추가
   * @param {string} uid - 사용자 UID
   * @param {string} traderId - 트레이더 UID
   * @returns {Promise<void>}
   */
  static async addFavoriteTrader(uid, traderId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        'stats.favoriteTraders': arrayUnion(traderId),
        updatedAt: Timestamp.now()
      });
      console.log(`✅ Favorite trader added: ${traderId}`);
    } catch (error) {
      console.error('Error adding favorite trader:', error);
      throw error;
    }
  }

  /**
   * 즐겨찾기 트레이더 제거
   * @param {string} uid - 사용자 UID
   * @param {string} traderId - 트레이더 UID
   * @returns {Promise<void>}
   */
  static async removeFavoriteTrader(uid, traderId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        'stats.favoriteTraders': arrayRemove(traderId),
        updatedAt: Timestamp.now()
      });
      console.log(`✅ Favorite trader removed: ${traderId}`);
    } catch (error) {
      console.error('Error removing favorite trader:', error);
      throw error;
    }
  }

  /**
   * 팔로우 카운트 증가
   * @param {string} uid - 사용자 UID
   * @returns {Promise<void>}
   */
  static async incrementFollowingCount(uid) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentCount = userDoc.data().stats.followingCount || 0;
      await updateDoc(userRef, {
        'stats.followingCount': currentCount + 1,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error incrementing following count:', error);
      throw error;
    }
  }

  /**
   * 팔로우 카운트 감소
   * @param {string} uid - 사용자 UID
   * @returns {Promise<void>}
   */
  static async decrementFollowingCount(uid) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentCount = userDoc.data().stats.followingCount || 0;
      await updateDoc(userRef, {
        'stats.followingCount': Math.max(0, currentCount - 1),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error decrementing following count:', error);
      throw error;
    }
  }

  /**
   * 이메일로 사용자 검색 (관리자용)
   * @param {string} email - 이메일
   * @returns {Promise<Object|null>} 사용자 정보 또는 null
   */
  static async getUserByEmail(email) {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log(`User not found: ${email}`);
        return null;
      }

      return querySnapshot.docs[0].data();
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * 통계 업데이트 (투자액, 수익)
   * @param {string} uid - 사용자 UID
   * @param {number} investmentAmount - 투자액
   * @param {number} earnings - 수익
   * @returns {Promise<void>}
   */
  static async updateStats(uid, investmentAmount = 0, earnings = 0) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const stats = userDoc.data().stats;
      await updateDoc(userRef, {
        'stats.totalInvested': (stats.totalInvested || 0) + investmentAmount,
        'stats.totalEarnings': (stats.totalEarnings || 0) + earnings,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Stats updated for user: ${uid}`);
    } catch (error) {
      console.error('Error updating stats:', error);
      throw error;
    }
  }

  /**
   * KYC 상태 업데이트
   * @param {string} uid - 사용자 UID
   * @param {string} status - KYC 상태 ('pending' | 'approved' | 'rejected')
   * @returns {Promise<void>}
   */
  static async updateKYCStatus(uid, status) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        kycStatus: status,
        verified: status === 'approved',
        verifiedAt: status === 'approved' ? Timestamp.now() : null,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ KYC status updated: ${uid} -> ${status}`);
    } catch (error) {
      console.error('Error updating KYC status:', error);
      throw error;
    }
  }

  /**
   * 사용자 선호도 업데이트
   * @param {string} uid - 사용자 UID
   * @param {Object} preferences - 선호도 설정
   * @returns {Promise<void>}
   */
  static async updatePreferences(uid, preferences) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        preferences: {
          notifications: preferences.notifications ?? true,
          theme: preferences.theme ?? 'dark',
          language: preferences.language ?? 'ko'
        },
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Preferences updated: ${uid}`);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }
}

// Export convenience functions
export const createUserProfile = UserService.createUserProfile;
export const getUserProfile = UserService.getUserProfile;
export const updateUserProfile = UserService.updateUserProfile;
export const updateWalletAddress = UserService.updateWalletAddress;
export const addFavoriteTrader = UserService.addFavoriteTrader;
export const removeFavoriteTrader = UserService.removeFavoriteTrader;

export default UserService;
