/**
 * Authentication Service
 * Firebase Auth를 통한 사용자 인증 관리
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase.js';
import { COLLECTIONS } from '../../firebase/collections.js';

/**
 * AuthService Class
 * Firebase Authentication 관련 모든 작업 처리
 */
export class AuthService {
  /**
   * 이메일로 회원가입
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호 (6자 이상)
   * @param {string} displayName - 표시 이름
   * @returns {Promise<Object>} 생성된 사용자 정보
   */
  static async signUp(email, password, displayName) {
    try {
      // 이메일과 비밀번호로 Firebase Auth 계정 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Firebase Auth 프로필 업데이트
      await updateProfile(user, {
        displayName: displayName,
        photoURL: null
      });

      // Firestore에 사용자 프로필 생성
      await this.createUserProfile(user.uid, {
        email,
        displayName,
        photoURL: null,
        role: 'supporter' // 기본값
      });

      // 세션 유지 설정
      await setPersistence(auth, browserLocalPersistence);

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 이메일로 로그인
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} 로그인한 사용자 정보
   */
  static async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 세션 유지 설정
      await setPersistence(auth, browserLocalPersistence);

      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Google OAuth로 로그인
   * @returns {Promise<Object>} 로그인한 사용자 정보
   */
  static async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // 세션 유지 설정
      await setPersistence(auth, browserLocalPersistence);

      const user = userCredential.user;

      // 첫 가입인 경우 프로필 생성
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const docSnapshot = await getDoc(userRef);

      if (!docSnapshot.exists()) {
        await this.createUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'supporter'
        });
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 로그아웃
   * @returns {Promise<void>}
   */
  static async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 현재 로그인한 사용자 정보 조회
   * @returns {Object|null} 현재 사용자 또는 null
   */
  static getCurrentUser() {
    const user = auth.currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
  }

  /**
   * 사용자 인증 상태 변화 모니터링
   * @param {Function} callback - 상태 변화 콜백 함수
   * @returns {Function} 구독 해제 함수
   */
  static onAuthStateChanged(callback) {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        });
      } else {
        callback(null);
      }
    });
  }

  /**
   * Firestore에 사용자 프로필 생성
   * @private
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
        walletAddress: null,
        bio: '',
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

      console.log(`✅ User profile created for ${uid}`);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * 에러 처리 및 사용자 친화적 메시지 반환
   * @private
   * @param {Error} error - Firebase 에러
   * @returns {Error} 처리된 에러
   */
  static handleError(error) {
    const errorMessages = {
      'auth/email-already-in-use': '이미 가입된 이메일입니다',
      'auth/weak-password': '비밀번호는 6자 이상이어야 합니다',
      'auth/invalid-email': '유효하지 않은 이메일입니다',
      'auth/user-not-found': '가입되지 않은 사용자입니다',
      'auth/wrong-password': '잘못된 비밀번호입니다',
      'auth/operation-not-allowed': '이 작업은 허용되지 않습니다',
      'auth/too-many-requests': '너무 많은 시도를 했습니다. 잠시 후 다시 시도하세요',
      'auth/account-exists-with-different-credential': '이미 다른 방식으로 가입된 계정입니다',
      'auth/popup-closed-by-user': '사용자가 팝업을 닫았습니다',
      'auth/network-request-failed': '네트워크 오류가 발생했습니다'
    };

    const errorCode = error.code;
    const message = errorMessages[errorCode] || error.message || '알 수 없는 오류가 발생했습니다';

    const customError = new Error(message);
    customError.code = errorCode;
    customError.originalError = error;

    return customError;
  }
}

export default AuthService;
