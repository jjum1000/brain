/**
 * Firestore Initialization
 * Emulator 지원 및 환경별 설정
 */

import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';
import { app, auth } from '../firebase.js';

let db = null;
let isEmulatorConnected = false;

/**
 * Firestore 초기화
 * - Development: Firebase Emulator Suite 사용
 * - Production: 실제 Firebase 사용
 */
export function initializeDB() {
  try {
    if (db) {
      console.log('Firestore already initialized');
      return db;
    }

    if (import.meta.env.MODE === 'development') {
      // 개발 환경: Emulator 사용
      console.log('🔥 Initializing Firestore with Emulator');

      db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true
      });

      // Emulator 연결 (이미 실행 중인 경우 에러 무시)
      if (!isEmulatorConnected) {
        try {
          connectFirestoreEmulator(db, 'localhost', 8080);
          console.log('✅ Firestore Emulator connected');
          isEmulatorConnected = true;
        } catch (error) {
          if (error.code === 'failed-precondition') {
            console.warn('⚠️ Firestore Emulator already connected');
          } else {
            console.error('❌ Firestore Emulator connection failed:', error);
          }
        }
      }

      // Auth Emulator 연결
      if (!auth.emulatorConfig) {
        try {
          connectAuthEmulator(auth, 'http://localhost:9099', {
            disableWarnings: true
          });
          console.log('✅ Auth Emulator connected');
        } catch (error) {
          if (error.code === 'auth/emulator-config-failed') {
            console.warn('⚠️ Auth Emulator already connected');
          } else {
            console.error('❌ Auth Emulator connection failed:', error);
          }
        }
      }
    } else {
      // 프로덕션 환경: 실제 Firebase 사용
      console.log('🌍 Initializing Firestore with production config');
      db = initializeFirestore(app, {
        ignoreUndefinedProperties: true
      });
      console.log('✅ Firestore Production initialized');
    }

    return db;
  } catch (error) {
    console.error('❌ Firestore initialization error:', error);
    throw error;
  }
}

/**
 * Firestore DB 인스턴스 조회
 * @returns {Firestore} Firestore 인스턴스
 * @throws {Error} Firestore가 초기화되지 않은 경우
 */
export function getDB() {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeDB() first.');
  }
  return db;
}

/**
 * Auth 인스턴스 조회
 * @returns {Auth} Auth 인스턴스
 */
export function getAuth() {
  return auth;
}

/**
 * Emulator 상태 확인
 * @returns {boolean} Emulator 연결 여부
 */
export function isEmulatorMode() {
  return import.meta.env.MODE === 'development' && isEmulatorConnected;
}

export default {
  initializeDB,
  getDB,
  getAuth,
  isEmulatorMode
};
