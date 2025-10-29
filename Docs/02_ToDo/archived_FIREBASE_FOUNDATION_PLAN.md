# YOLOSEUM - Firebase 기반 작업 계획 🚀

## 📋 프로젝트 개요

**프로젝트명**: YOLOSEUM (욜로세움)
**플랫폼**: Firebase (Firestore, Authentication, Storage, Realtime DB)
**목표**: 유튜버 트레이더 검증 & 랭킹 경쟁 플랫폼
**상태**: Firebase 환경 설정 완료 → **기반 작업 시작 단계**

---

## 🎯 Firebase 기반 작업의 핵심

### Firebase가 담당할 것
```
✅ 사용자 인증 (Authentication)
✅ 데이터 저장 (Firestore)
✅ 실시간 데이터 동기화 (Realtime Database)
✅ 파일 저장 (Storage - 프로필 이미지, 차트 등)
✅ 호스팅 (Firebase Hosting)
✅ 함수 (Cloud Functions - 자동화)
✅ 이메일 발송 (Firebase Email)
```

---

## 📊 기반 작업 Roadmap

### Phase 1: Firebase 구조 설계 (Week 1)
```
1.1 Firestore 데이터 모델 설계
1.2 Authentication 전략 수립
1.3 Storage 구조 설계
1.4 Realtime Data 구조 설계
1.5 Cloud Functions 리스트 정의
```

### Phase 2: 핵심 모듈 구현 (Week 2-3)
```
2.1 Firebase 설정 파일 완성
2.2 User 관리 시스템
2.3 Trader 관리 시스템
2.4 Strategy 관리 시스템
2.5 Ranking 시스템 구현
2.6 Real-time Leaderboard
```

### Phase 3: 기반 서비스 구현 (Week 4)
```
3.1 인증 플로우 완성
3.2 데이터 동기화 파이프라인
3.3 보안 규칙 설정
3.4 Error Handling & Logging
3.5 모니터링 대시보드
```

---

## 🗂️ Firebase Firestore 데이터 구조

### Collection: `users` (사용자)
```javascript
/users/{uid}
├── profile
│   ├── email
│   ├── displayName
│   ├── photoURL
│   ├── role (supporter/trader/spectator)
│   └── createdAt
├── wallet
│   ├── address
│   ├── network (solana/ethereum)
│   └── verified
├── preferences
│   ├── notifications
│   ├── theme
│   └── language
└── stats
    ├── totalInvested
    ├── totalEarnings
    ├── favoriteTraders (array)
    └── lastLogin
```

### Collection: `traders` (트레이더)
```javascript
/traders/{traderId}
├── profile
│   ├── youtubeUrl
│   ├── displayName
│   ├── bio
│   ├── avatar
│   ├── followerCount
│   └── verifiedAt
├── performance
│   ├── totalWins
│   ├── totalLosses
│   ├── winRate
│   ├── avgROI
│   ├── totalTrades
│   └── updatedAt
├── strategies (subcollection reference)
│   └── [strategyId]
├── contact
│   ├── email
│   ├── twitter
│   └── discord
└── verification
    ├── status (pending/verified/rejected)
    ├── submittedAt
    ├── verifiedAt
    └── verifier
```

### Collection: `strategies` (전략)
```javascript
/strategies/{strategyId}
├── basic
│   ├── traderId
│   ├── name
│   ├── description
│   ├── category (momentum/contrarian/scalping/etc)
│   └── createdAt
├── performance
│   ├── currentROI
│   ├── winRate
│   ├── totalTrades
│   ├── maxDrawdown
│   ├── sharpeRatio
│   └── lastUpdated
├── execution
│   ├── smartContractAddress
│   ├── network
│   ├── tvl (total value locked)
│   ├── supporterCount
│   └── status (active/paused/closed)
├── rules
│   ├── entryCondition
│   ├── exitCondition
│   ├── riskManagement
│   └── leverage
└── backtesting
    ├── period
    ├── results
    ├── accuracy
    └── timestamp
```

### Collection: `leaderboard` (리더보드)
```javascript
/leaderboard/{periodId} (주별/월별/시즌별)
├── period
│   ├── startDate
│   ├── endDate
│   └── season
├── rankings (array)
│   ├── [0]
│   │   ├── traderId
│   │   ├── strategyId
│   │   ├── rank
│   │   ├── winRate
│   │   ├── roi
│   │   ├── tvl
│   │   └── communityScore
│   └── [...]
└── updatedAt
```

### Collection: `supporters` (지원자 기록)
```javascript
/supporters/{supportId}
├── userId
├── traderId
├── strategyId
├── investment
│   ├── amount
│   ├── investedAt
│   ├── currency
│   └── status (active/closed)
├── returns
│   ├── earned
│   ├── roi
│   └── lastUpdated
└── metadata
    ├── contract
    ├── txHash
    └── notes
```

### Collection: `transactions` (거래 기록)
```javascript
/transactions/{txId}
├── type (deposit/withdraw/profit_share)
├── userId
├── strategyId
├── amount
├── currency
├── status (pending/completed/failed)
├── timestamp
└── metadata
    ├── walletAddress
    ├── txHash
    └── gasUsed
```

---

## 🔐 Firebase Security Rules

### Firestore Security Rules 전략
```javascript
// 1. 사용자는 자신의 문서만 수정 가능
match /users/{userId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == userId;
  allow update, delete: if request.auth.uid == userId;
}

// 2. 트레이더는 공개 (검증됨)
match /traders/{traderId} {
  allow read: if true; // 공개
  allow write: if request.auth.uid == traderId
               && get(/databases/$(database)/documents/traders/$(traderId)).data.verified == true;
}

// 3. 전략은 공개 읽기, 트레이더만 수정
match /strategies/{strategyId} {
  allow read: if true;
  allow write: if request.auth.uid == resource.data.traderId;
}

// 4. 리더보드는 공개 읽기 (시스템이 쓰기)
match /leaderboard/{document=**} {
  allow read: if true;
  allow write: if false; // Cloud Functions에서만 쓰기
}

// 5. 지원자 기록은 개인 정보
match /supporters/{supportId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}

// 6. 거래 기록은 개인 정보
match /transactions/{txId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}
```

---

## 🔑 Authentication 전략

### 지원 방식
```
✅ Email/Password
✅ Google OAuth
✅ Discord OAuth (커뮤니티)
✅ Wallet Connect (향후)
```

### User Roles
```
👤 Spectator (관객)
  - 무료, 로그인 불필요
  - 읽기만 가능
  - 투표 & 커뮤니티 가능

👥 Supporter (지원자)
  - 로그인 필수
  - 트레이더 지원 가능
  - 자신의 포트폴리오 관리

🎤 Trader (트레이더/유튜버)
  - 검증 필수
  - 전략 생성 & 관리
  - 성과 데이터 제공

🔧 Admin (관리자)
  - 모든 권한
  - 트레이더 검증
  - 시스템 관리
```

---

## 📊 Real-time 구현 전략

### Realtime Database 사용 케이스
```
1. 라이브 거래 실행 데이터
   /live/{strategyId}/
   ├── currentPrice
   ├── position
   ├── pnl
   └── status

2. 실시간 알림
   /notifications/{userId}/
   ├── strategyAlert
   ├── performanceUpdate
   └── communityMessage

3. 라이브 채팅 (향후)
   /chat/{roomId}/
   ├── messages
   └── users
```

### Firestore 사용 케이스
```
1. 영구 데이터 저장
   - 사용자 정보
   - 전략 정보
   - 거래 기록

2. 복잡한 쿼리
   - 랭킹 검색
   - 필터링
   - 집계

3. 트랜잭션 관리
```

---

## 🛠️ Cloud Functions 목록

### 필요한 Functions

| Function | Trigger | 역할 |
|----------|---------|------|
| `updateLeaderboard` | Pub/Sub (1시간마다) | 랭킹 갱신 |
| `calculateROI` | Firestore Write | ROI 계산 |
| `distributeProfit` | Scheduler (일일) | 수익 배분 |
| `validateTrader` | HTTP | 트레이더 검증 |
| `sendNotification` | Firestore Write | 알림 발송 |
| `backupData` | Scheduler (일일) | 데이터 백업 |
| `archiveOldData` | Scheduler (월별) | 오래된 데이터 정리 |

---

## 🔍 모니터링 & Logging

### Firebase Monitoring
```
✅ Firestore 사용량 모니터링
✅ Authentication 로그
✅ Cloud Functions 실행 로그
✅ Error Reporting
✅ Performance Monitoring
✅ Crashlytics (모바일 앱 시)
```

### Custom Logging
```javascript
// 중요한 이벤트 로깅
- 트레이더 검증
- 대액 거래
- 보안 관련 이벤트
- 시스템 에러
```

---

## 📱 개발 환경 설정

### Firebase Emulator Suite (로컬 개발)
```bash
# 설치
npm install -g firebase-tools

# Emulator 시작
firebase emulators:start

# 포트
- Firestore: 8080
- Auth: 9099
- Realtime DB: 9000
- Storage: 4000
```

### 환경별 설정
```
로컬: firebase-emulator (production 데이터와 분리)
개발: dev-project-id (테스트용)
프로덕션: yolosseum-3bebc (실제 서비스)
```

---

## 🚀 기반 작업 체크리스트

### Phase 1: 설계 (Week 1)
- [ ] Firestore 컬렉션 구조 확정
- [ ] Authentication 전략 확정
- [ ] Security Rules 초안 작성
- [ ] Cloud Functions 리스트 확정
- [ ] Data Model Diagram 작성
- [ ] API 설계 (SDK 함수)

### Phase 2: 구현 (Week 2-3)
- [ ] Firebase 설정 파일 정리
- [ ] 기본 Utils 함수 구현
  - [ ] `authService.js` (로그인/가입)
  - [ ] `userService.js` (사용자 관리)
  - [ ] `traderService.js` (트레이더 관리)
  - [ ] `strategyService.js` (전략 관리)
  - [ ] `leaderboardService.js` (랭킹)
  - [ ] `supportService.js` (지원 관리)
- [ ] Firestore 초기화 스크립트
- [ ] Security Rules 배포
- [ ] Cloud Functions 배포

### Phase 3: 통합 (Week 4)
- [ ] Error Handling
- [ ] Logging 시스템
- [ ] 성능 최적화
- [ ] 보안 감사
- [ ] E2E 테스트
- [ ] 모니터링 대시보드

---

## 📂 프로젝트 구조

```
src/
├── firebase/
│   ├── config.js (환경변수 로드)
│   ├── init.js (Firebase 초기화)
│   └── emulator.js (로컬 개발용)
├── services/
│   ├── auth/
│   │   ├── authService.js
│   │   └── authContext.js
│   ├── user/
│   │   ├── userService.js
│   │   └── userQueries.js
│   ├── trader/
│   │   ├── traderService.js
│   │   └── traderQueries.js
│   ├── strategy/
│   │   ├── strategyService.js
│   │   └── strategyQueries.js
│   ├── leaderboard/
│   │   ├── leaderboardService.js
│   │   └── leaderboardListener.js
│   ├── support/
│   │   ├── supportService.js
│   │   └── supportQueries.js
│   └── transaction/
│       ├── transactionService.js
│       └── transactionQueries.js
├── hooks/
│   ├── useAuth.js
│   ├── useFirestore.js
│   ├── useRealtime.js
│   └── useLeaderboard.js
├── utils/
│   ├── errorHandler.js
│   ├── logger.js
│   ├── validator.js
│   └── formatter.js
└── config/
    ├── constants.js
    ├── errorMessages.js
    └── permissions.js
```

---

## 🎯 다음 작업 (즉시 시작)

### 1단계: 기반 파일 생성
```
1. src/firebase/ 구조 생성
2. authService.js 작성
3. userService.js 작성
4. Firestore 보안 규칙 설정
```

### 2단계: 핵심 기능 구현
```
1. 사용자 가입/로그인
2. 프로필 관리
3. 트레이더 프로필 생성
4. 전략 등록
```

### 3단계: 리더보드 구현
```
1. 실시간 랭킹 계산
2. 성과 데이터 업데이트
3. 커뮤니티 투표 시스템
```

---

**작성일**: 2025년 10월 28일
**버전**: 1.0
**상태**: 기반 작업 준비 완료

