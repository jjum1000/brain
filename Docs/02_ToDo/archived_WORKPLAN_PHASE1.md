# YOLOSEUM - Phase 1 상세 작업 계획
## Firebase 기반 설계 & 구현 (Week 1-2)

---

## 📋 Phase 1 목표

```
Week 1: Firebase 데이터 구조 & 인증 시스템 설계
Week 2: 핵심 Service Layer 구현
결과: Firebase를 통한 기본 CRUD 동작 완성
```

---

## 🎯 Week 1: 설계 & 인증 구현

### Day 1-2: Firestore 데이터 모델 최종 확정

#### Task 1.1: Collections 정의
```javascript
// firestore/collections.js
export const COLLECTIONS = {
  USERS: 'users',
  TRADERS: 'traders',
  STRATEGIES: 'strategies',
  LEADERBOARD: 'leaderboard',
  SUPPORTERS: 'supporters',
  TRANSACTIONS: 'transactions',
  RANKINGS: 'rankings',
  REVIEWS: 'reviews'
};

export const SUB_COLLECTIONS = {
  // /traders/{traderId}/performance
  PERFORMANCE: 'performance',
  // /strategies/{strategyId}/trades
  TRADES: 'trades',
  // /strategies/{strategyId}/metrics
  METRICS: 'metrics'
};
```

#### Task 1.2: Document 스키마 정의
```javascript
// firestore/schemas.js

export const UserSchema = {
  uid: String,           // Firebase Auth UID
  email: String,         // 이메일
  displayName: String,   // 표시 이름
  photoURL: String,      // 프로필 사진
  role: String,          // 'supporter' | 'trader' | 'spectator'
  walletAddress: String, // Solana 지갑
  bio: String,           // 자기소개
  createdAt: Timestamp,  // 가입 날짜
  updatedAt: Timestamp,  // 수정 날짜
  stats: {
    totalInvested: Number,   // 총 투자액
    totalEarnings: Number,   // 총 수익
    favoriteTraders: Array,  // 즐겨찾기
    followingCount: Number,  // 팔로우 수
  },
  preferences: {
    notifications: Boolean,
    theme: String,
    language: String
  },
  verified: Boolean,
  verifiedAt: Timestamp,
  kycStatus: String      // 'pending' | 'approved' | 'rejected'
};

export const TraderSchema = {
  uid: String,               // User UID
  displayName: String,       // 트레이더 이름
  bio: String,               // 소개
  avatar: String,            // 프로필 이미지
  youtubeUrl: String,        // 유튜브 채널
  twitterUrl: String,        // 트위터
  discordUsername: String,   // 디스코드
  followerCount: Number,     // 팔로워 수
  createdAt: Timestamp,      // 등록 날짜
  verifiedAt: Timestamp,     // 검증 날짜
  verification: {
    status: String,          // 'pending' | 'verified' | 'rejected'
    submittedAt: Timestamp,
    rejectionReason: String
  },
  performance: {
    totalTrades: Number,      // 총 거래수
    totalWins: Number,        // 승리 수
    totalLosses: Number,      // 패배 수
    winRate: Number,          // 승률 (0-100)
    avgROI: Number,           // 평균 ROI
    maxDrawdown: Number,      // 최대 낙폭
    sharpeRatio: Number,      // 샤프 지수
    updatedAt: Timestamp
  },
  rating: {
    averageRating: Number,    // 평균 평점 (1-5)
    ratingCount: Number,      // 평점 받은 수
    communityScore: Number    // 커뮤니티 점수
  }
};

export const StrategySchema = {
  id: String,              // Strategy ID
  traderId: String,        // 트레이더 UID
  traderName: String,      // 트레이더 이름
  name: String,            // 전략 이름
  description: String,     // 설명
  category: String,        // 'momentum' | 'contrarian' | 'scalping' | 'grid' | 'hedging'
  risk: String,            // 'low' | 'medium' | 'high'
  createdAt: Timestamp,    // 생성 날짜
  updatedAt: Timestamp,    // 수정 날짜
  execution: {
    smartContractAddress: String,  // SC 주소
    network: String,               // 'solana' | 'ethereum'
    tvl: Number,                   // Total Value Locked (달러)
    supporterCount: Number,        // 지원자 수
    status: String                 // 'active' | 'paused' | 'closed'
  },
  performance: {
    currentROI: Number,      // 현재 ROI (%)
    roi30d: Number,          // 30일 ROI
    roi90d: Number,          // 90일 ROI
    winRate: Number,         // 승률 (%)
    totalTrades: Number,     // 거래 수
    maxDrawdown: Number,     // 최대 낙폭
    sharpeRatio: Number,     // 샤프 지수
    profitFactor: Number,    // 손익비
    lastUpdated: Timestamp
  },
  rules: {
    entryCondition: String,   // 진입 조건 (JSON)
    exitCondition: String,    // 청산 조건 (JSON)
    stopLoss: Number,         // 손절 (%)
    takeProfit: Number,       // 익절 (%)
    maxPosition: Number       // 최대 포지션 크기
  },
  backtesting: {
    period: String,           // '1y' | '6m' | '3m' | '1m'
    accuracy: Number,         // 정확도 (%)
    results: Object,          // 백테스트 결과 (JSON)
    timestamp: Timestamp
  }
};

export const SupportSchema = {
  id: String,              // Support ID
  userId: String,          // 지원자 UID
  traderId: String,        // 트레이더 UID
  strategyId: String,      // 전략 ID
  investmentAmount: Number, // 투자액 (달러)
  investedAt: Timestamp,   // 투자 날짜
  currency: String,        // 'SOL' | 'USDC' | 'USD'
  status: String,          // 'active' | 'closed' | 'exited'
  returns: {
    earned: Number,        // 벌어들인 수익
    roi: Number,           // ROI (%)
    realized: Number,      // 실현 수익
    unrealized: Number,    // 미실현 수익
    lastUpdated: Timestamp
  },
  contract: {
    address: String,       // 컨트랙트 주소
    txHash: String,        // 트랜잭션 해시
    blockNumber: Number
  },
  notes: String            // 메모
};

export const LeaderboardSchema = {
  id: String,              // Period ID (week_2025_01 등)
  period: {
    type: String,          // 'weekly' | 'monthly' | 'seasonal'
    startDate: Timestamp,
    endDate: Timestamp,
    season: String         // (선택) 시즌 이름
  },
  rankings: Array,         // 배열로 저장 (변경 용이)
  totalStrategies: Number,
  totalTraders: Number,
  totalSupporters: Number,
  totalVolume: Number,     // 총 거래액
  updatedAt: Timestamp
};
```

#### Task 1.3: Firestore 초기화 스크립트
```javascript
// firestore/init.js
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { app } from './config.js';

let db;

export function initializeDB() {
  if (import.meta.env.MODE === 'development') {
    // 로컬 Emulator 사용
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } else {
    // 실제 Firebase 사용
    db = initializeFirestore(app);
  }
  return db;
}

export function getDB() {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
}
```

### Day 3: Authentication 구현

#### Task 1.4: Authentication Service
```javascript
// services/auth/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../firebase/config.js';
import { createUserProfile } from '../user/userService.js';

export class AuthService {
  // 이메일로 가입
  static async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Firestore에 사용자 프로필 생성
      await createUserProfile(userCredential.user.uid, {
        email,
        displayName,
        photoURL: null,
        role: 'supporter'  // 기본값
      });

      return userCredential.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 이메일로 로그인
  static async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Google로 로그인
  static async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // 첫 가입인 경우 프로필 생성
      const user = userCredential.user;
      const docSnapshot = await getDoc(doc(db, 'users', user.uid));

      if (!docSnapshot.exists()) {
        await createUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'supporter'
        });
      }

      return user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 로그아웃
  static async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 현재 사용자 가져오기
  static getCurrentUser() {
    return auth.currentUser;
  }

  // 사용자 상태 모니터링
  static onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }

  // 에러 처리
  static handleError(error) {
    const errorCode = error.code;
    const errorMessage = {
      'auth/email-already-in-use': '이미 가입된 이메일입니다',
      'auth/weak-password': '비밀번호는 6자 이상이어야 합니다',
      'auth/invalid-email': '유효하지 않은 이메일입니다',
      'auth/user-not-found': '가입되지 않은 사용자입니다',
      'auth/wrong-password': '잘못된 비밀번호입니다'
    }[errorCode] || error.message;

    return new Error(errorMessage);
  }
}
```

#### Task 1.5: Auth Context
```javascript
// services/auth/authContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from './authService.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // Firestore에서 사용자 프로필 로드
        // TODO: getUserProfile 구현
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Day 4-5: 핵심 Service Layer

#### Task 1.6: User Service
```javascript
// services/user/userService.js

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { COLLECTIONS } from '../../firebase/schemas.js';

export class UserService {
  // 사용자 프로필 생성
  static async createUserProfile(uid, data) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await setDoc(userRef, {
        uid,
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // 사용자 프로필 조회
  static async getUserProfile(uid) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const docSnapshot = await getDoc(userRef);

      if (!docSnapshot.exists()) {
        throw new Error('User profile not found');
      }

      return docSnapshot.data();
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // 사용자 프로필 업데이트
  static async updateUserProfile(uid, data) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // 즐겨찾기 트레이더 추가
  static async addFavoriteTrader(uid, traderId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userDoc = await getDoc(userRef);
      const favorites = userDoc.data().stats.favoriteTraders || [];

      if (!favorites.includes(traderId)) {
        favorites.push(traderId);
        await updateDoc(userRef, {
          'stats.favoriteTraders': favorites
        });
      }
    } catch (error) {
      console.error('Error adding favorite trader:', error);
      throw error;
    }
  }

  // 이메일로 사용자 검색 (관리자용)
  static async getUserByEmail(email) {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data();
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }
}

export const createUserProfile = UserService.createUserProfile;
export const getUserProfile = UserService.getUserProfile;
export const updateUserProfile = UserService.updateUserProfile;
```

#### Task 1.7: Trader Service
```javascript
// services/trader/traderService.js

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
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { COLLECTIONS } from '../../firebase/schemas.js';

export class TraderService {
  // 트레이더 프로필 생성 (사용자가 트레이더 신청)
  static async createTraderProfile(uid, userProfile, traderData) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, uid);
      await setDoc(traderRef, {
        uid,
        displayName: userProfile.displayName,
        bio: traderData.bio || '',
        avatar: userProfile.photoURL || '',
        youtubeUrl: traderData.youtubeUrl || '',
        twitterUrl: traderData.twitterUrl || '',
        discordUsername: traderData.discordUsername || '',
        followerCount: 0,
        createdAt: Timestamp.now(),
        verifiedAt: null,
        verification: {
          status: 'pending',
          submittedAt: Timestamp.now(),
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
          updatedAt: Timestamp.now()
        },
        rating: {
          averageRating: 0,
          ratingCount: 0,
          communityScore: 0
        }
      });
    } catch (error) {
      console.error('Error creating trader profile:', error);
      throw error;
    }
  }

  // 트레이더 프로필 조회
  static async getTraderProfile(traderId) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);
      const docSnapshot = await getDoc(traderRef);

      if (!docSnapshot.exists()) {
        return null;
      }

      return docSnapshot.data();
    } catch (error) {
      console.error('Error getting trader profile:', error);
      throw error;
    }
  }

  // 검증된 트레이더 목록 (페이지네이션)
  static async getVerifiedTraders(pageSize = 10, startAfter = null) {
    try {
      let q = query(
        collection(db, COLLECTIONS.TRADERS),
        where('verification.status', '==', 'verified'),
        orderBy('rating.communityScore', 'desc'),
        limit(pageSize)
      );

      if (startAfter) {
        q = query(
          collection(db, COLLECTIONS.TRADERS),
          where('verification.status', '==', 'verified'),
          orderBy('rating.communityScore', 'desc'),
          startAfter(startAfter),
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

      return { traders, lastDoc };
    } catch (error) {
      console.error('Error getting verified traders:', error);
      throw error;
    }
  }

  // 트레이더 성과 업데이트 (자동 또는 관리자)
  static async updateTraderPerformance(traderId, performanceData) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);
      await updateDoc(traderRef, {
        performance: {
          ...performanceData,
          updatedAt: Timestamp.now()
        }
      });
    } catch (error) {
      console.error('Error updating trader performance:', error);
      throw error;
    }
  }

  // 트레이더 검증 (관리자)
  static async verifyTrader(traderId, approved = true, rejectionReason = null) {
    try {
      const traderRef = doc(db, COLLECTIONS.TRADERS, traderId);
      await updateDoc(traderRef, {
        'verification.status': approved ? 'verified' : 'rejected',
        'verification.rejectionReason': rejectionReason,
        verifiedAt: approved ? Timestamp.now() : null
      });
    } catch (error) {
      console.error('Error verifying trader:', error);
      throw error;
    }
  }
}

export const createTraderProfile = TraderService.createTraderProfile;
export const getTraderProfile = TraderService.getTraderProfile;
export const getVerifiedTraders = TraderService.getVerifiedTraders;
```

### Day 6: Security Rules & Testing

#### Task 1.8: Firestore Security Rules
```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 기본 규칙: 인증된 사용자만 접근
    function isAuth() {
      return request.auth != null;
    }

    function isUser(uid) {
      return request.auth.uid == uid;
    }

    function isAdmin() {
      return request.auth.uid in get(/databases/$(database)/documents/admin/users).data.admins;
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isAuth() && (isUser(userId) || isAdmin());
      allow create: if isUser(userId);
      allow update, delete: if isUser(userId) || isAdmin();
    }

    // Traders Collection (검증된 트레이더는 공개)
    match /traders/{traderId} {
      allow read: if true; // 공개
      allow create: if isAuth();
      allow update: if isUser(traderId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Strategies Collection (공개 읽기)
    match /strategies/{strategyId} {
      allow read: if true;
      allow create: if isAuth();
      allow update: if isUser(resource.data.traderId) || isAdmin();
      allow delete: if isUser(resource.data.traderId) || isAdmin();
    }

    // Leaderboard (공개 읽기, 시스템만 쓰기)
    match /leaderboard/{document=**} {
      allow read: if true;
      allow write: if isAdmin() || request.auth.token.firebase.sign_in_provider == 'custom';
    }

    // Supporters (개인 정보)
    match /supporters/{supportId} {
      allow read, write: if isUser(resource.data.userId) || isAdmin();
    }

    // Transactions (개인 정보)
    match /transactions/{txId} {
      allow read, write: if isUser(resource.data.userId) || isAdmin();
    }
  }
}
```

#### Task 1.9: 로컬 테스트
```javascript
// tests/auth.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../services/auth/authService.js';
import { UserService } from '../services/user/userService.js';

describe('Authentication Flow', () => {
  const testEmail = 'test@yoloseum.io';
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  it('should sign up a new user', async () => {
    const user = await AuthService.signUp(testEmail, testPassword, testName);
    expect(user.email).toBe(testEmail);
  });

  it('should sign in with email', async () => {
    const user = await AuthService.signInWithEmail(testEmail, testPassword);
    expect(user.email).toBe(testEmail);
  });

  it('should get user profile', async () => {
    const profile = await UserService.getUserProfile(user.uid);
    expect(profile.displayName).toBe(testName);
  });

  it('should sign out', async () => {
    await AuthService.logout();
    const currentUser = AuthService.getCurrentUser();
    expect(currentUser).toBeNull();
  });
});
```

---

## 🎯 Week 2: 핵심 Service 구현

### Day 1: Strategy Service

```javascript
// services/strategy/strategyService.js

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
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { COLLECTIONS } from '../../firebase/schemas.js';
import { nanoid } from 'nanoid';

export class StrategyService {
  // 전략 생성
  static async createStrategy(traderId, traderName, strategyData) {
    try {
      const strategyId = nanoid();
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);

      await setDoc(strategyRef, {
        id: strategyId,
        traderId,
        traderName,
        name: strategyData.name,
        description: strategyData.description,
        category: strategyData.category, // momentum, contrarian 등
        risk: strategyData.risk,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        execution: {
          smartContractAddress: strategyData.smartContractAddress || '',
          network: 'solana',
          tvl: 0,
          supporterCount: 0,
          status: 'active'
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
          lastUpdated: Timestamp.now()
        },
        rules: strategyData.rules || {},
        backtesting: strategyData.backtesting || {}
      });

      return strategyId;
    } catch (error) {
      console.error('Error creating strategy:', error);
      throw error;
    }
  }

  // 전략 조회
  static async getStrategy(strategyId) {
    try {
      const strategyRef = doc(db, COLLECTIONS.STRATEGIES, strategyId);
      const docSnapshot = await getDoc(strategyRef);

      if (!docSnapshot.exists()) {
        return null;
      }

      return docSnapshot.data();
    } catch (error) {
      console.error('Error getting strategy:', error);
      throw error;
    }
  }

  // 트레이더별 전략 조회
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

      return strategies;
    } catch (error) {
      console.error('Error getting trader strategies:', error);
      throw error;
    }
  }

  // 활성 전략 목록 (홈페이지용)
  static async getActiveStrategies(pageSize = 20, orderBy = 'roi') {
    try {
      const q = query(
        collection(db, COLLECTIONS.STRATEGIES),
        where('execution.status', '==', 'active'),
        orderBy(`performance.${orderBy}`, 'desc'),
        limit(pageSize)
      );

      const querySnapshot = await getDocs(q);
      const strategies = [];

      querySnapshot.forEach((doc) => {
        strategies.push(doc.data());
      });

      return strategies;
    } catch (error) {
      console.error('Error getting active strategies:', error);
      throw error;
    }
  }

  // 전략 성과 업데이트
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
    } catch (error) {
      console.error('Error updating strategy performance:', error);
      throw error;
    }
  }
}
```

### Day 2-3: Leaderboard & Support Service

### Day 4: Custom Hooks

```javascript
// hooks/useAuth.js
// hooks/useFirestore.js
// hooks/useRealtime.js
// hooks/useLeaderboard.js
```

### Day 5: Error Handling & Logging

```javascript
// utils/errorHandler.js
// utils/logger.js
```

### Day 6: Integration Testing

---

## 📊 체크리스트

### Week 1
- [ ] Firestore Collections 정의
- [ ] Document Schemas 정의
- [ ] Firebase 초기화 스크립트
- [ ] AuthService 구현
- [ ] AuthContext 구현
- [ ] UserService 구현
- [ ] TraderService 구현
- [ ] Security Rules 작성
- [ ] 로컬 테스트 완료
- [ ] Emulator 설정 완료

### Week 2
- [ ] StrategyService 구현
- [ ] SupportService 구현
- [ ] LeaderboardService 구현
- [ ] Custom Hooks 구현
- [ ] Error Handling 구현
- [ ] Logging 시스템 구현
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 문서화 완료

---

**다음 단계**: Day 1부터 즉시 시작 준비!

