# 🔍 작업지시서 vs 실제 프로젝트 구조 - 대응 가이드

**작성일**: 2025년 10월 30일
**목적**: 작업지시서의 가상 경로와 실제 프로젝트 구조의 매핑
**중요**: 모든 작업은 `yoloseum-phase3-ui` 폴더에서만 진행!

---

## ⚠️ 중요 알림

### 현재 프로젝트 구조
```
d:\jjumV\
├─ yoloseum-phase3-ui/     ← ✅ 실제 개발 폴더
│  └─ src/
│     ├─ components/
│     ├─ hooks/
│     ├─ context/
│     ├─ types/
│     ├─ lib/
│     ├─ routes/
│     └─ App.tsx
│
├─ firebase-phase2-dashboard/  ← ❌ 목업 (참고만 함)
├─ solana-trading-mockup/      ← ❌ 목업 (참고만 함)
└─ Docs/
   └─ 02_ToDo/
      └─ TASK_INSTRUCTIONS_*.md  ← 작업지시서
```

---

## 📋 작업지시서의 가상 경로 vs 실제 경로

### Task 1: usePortfolio 훅 구현

#### 지시서에 명시된 경로
```typescript
파일: src/hooks/usePortfolio.ts
상태: NEW (신규 생성)
```

#### 실제 프로젝트 경로
```typescript
파일: yoloseum-phase3-ui/src/hooks/usePortfolio.ts
상태: NEW (신규 생성) ✅

참고:
- 이미 존재하는 훅들:
  ✅ useAuth.ts
  ✅ useUserProfile.ts
  ✅ useTransactions.ts
  ✅ useLeaderboard.ts
  ✅ useTraders.ts
  ✅ useStrategies.ts
  ✅ use-toast.ts (토스트 이미 있음!)

- usePortfolio 추가 가능 여부: ✅ YES
  현재 Portfolio.tsx가 있으므로 필요함
```

---

### Task 2: Portfolio 페이지 데이터 연동

#### 지시서에 명시된 경로
```typescript
파일: src/components/pages/Portfolio.tsx
상태: UPDATE (기존 페이지 수정)
```

#### 실제 프로젝트 경로
```typescript
파일: yoloseum-phase3-ui/src/components/pages/Portfolio.tsx
상태: UPDATE ✅

확인:
- 파일 존재 여부: ✅ YES (이미 구현됨)
- 현재 상태: 부분 구현됨
- 수정 필요: usePortfolio 훅 연동 추가
```

---

### Task 3: Profile 페이지 사용자 정보 동기화

#### 지시서에 명시된 경로
```typescript
파일: src/components/pages/Profile.tsx
상태: UPDATE (기존 페이지 수정)
```

#### 실제 프로젝트 경로
```typescript
파일: yoloseum-phase3-ui/src/components/pages/Profile.tsx
상태: UPDATE ✅

확인:
- 파일 존재 여부: ✅ YES (이미 494줄 구현됨)
- 현재 상태: 충분히 구현됨
- 수정 필요: 최소 (사용자 정보는 이미 표시 중)
```

---

### Task 4-6: Toast, Loading UI, Error Handling

#### 지시서에 명시된 경로
```typescript
파일1: src/contexts/ToastContext.tsx (NEW)
파일2: src/hooks/useToast.ts (NEW)
파일3: src/components/Toast/Toast.tsx (NEW)
파일4: src/components/Toast/ToastContainer.tsx (NEW)
파일5: src/utils/errorHandler.ts (NEW)
파일6: src/components/common/ErrorBoundary.tsx (NEW)
```

#### 실제 프로젝트 현황
```typescript
✅ Toast 시스템
- 파일: src/hooks/use-toast.ts (이미 구현됨!)
- 상태: 기본 구현 완료
- 개선 필요: Context API 기반 통합 (선택 사항)

⚠️ Loading UI (Skeleton)
- shadcn/ui에서 제공하는 Skeleton 사용 가능
- 위치: src/components/ui/ (40+ 컴포넌트 있음)
- 적용: 각 페이지에서 필요한 부분에 추가

❌ ErrorBoundary
- 파일: 없음
- 생성 필요: src/components/common/ErrorBoundary.tsx

❌ errorHandler.ts
- 파일: 없음
- 생성 필요: src/utils/errorHandler.ts
```

---

### Task 7-9: 성능 최적화

#### 지시서에 명시된 경로
```typescript
파일1: vite.config.ts (UPDATE)
파일2: src/components/common/OptimizedImage.tsx (NEW)
파일3: src/hooks/useTraders.ts (OPTIMIZE)
파일4: src/hooks/useStrategies.ts (OPTIMIZE)
```

#### 실제 프로젝트 경로
```typescript
✅ vite.config.ts
- 위치: yoloseum-phase3-ui/vite.config.ts
- 상태: 이미 구성됨
- 수정 가능: YES

❌ OptimizedImage.tsx
- 위치: yoloseum-phase3-ui/src/components/common/OptimizedImage.tsx
- 상태: 없음 (생성 필요)

✅ useTraders.ts
- 위치: yoloseum-phase3-ui/src/hooks/useTraders.ts
- 상태: 이미 구현됨
- 최적화: 가능 (limit, 페이지네이션 추가)

✅ useStrategies.ts
- 위치: yoloseum-phase3-ui/src/hooks/useStrategies.ts
- 상태: 이미 구현됨
- 최적화: 가능 (limit, 페이지네이션 추가)
```

---

### Task 10-12: 모바일 & 접근성

#### 지시서에 명시된 경로
```
모든 페이지: src/components/pages/
- Dashboard.tsx
- Leaderboard.tsx
- Traders.tsx
- Strategies.tsx
- Portfolio.tsx
- Profile.tsx
```

#### 실제 프로젝트 경로
```typescript
✅ 모든 페이지 존재
위치: yoloseum-phase3-ui/src/components/pages/

파일 목록:
├─ Dashboard.tsx        (300+ lines, 실시간 연동 ✅)
├─ Leaderboard.tsx      (실시간 순위 ✅)
├─ Traders.tsx          (트레이더 목록 ✅)
├─ TraderDetail.tsx     (상세 페이지 ✅)
├─ Strategies.tsx       (전략 목록 ✅)
├─ StrategyDetail.tsx   (상세 페이지 ✅)
├─ Portfolio.tsx        (투자 현황 ✅)
├─ Profile.tsx          (494 lines, 프로필 ✅)
├─ Settings.tsx         (639 lines, 설정 ✅)
└─ NotFound.tsx         (404 페이지)

상태: 대부분 구현 완료
테스트: 필요
```

---

### Task 13-15: 최종 점검 & 배포

#### 지시서에 명시된 경로
```
문서 생성: Docs/배포 관련 문서들
- DEPLOYMENT_CHECKLIST.md
- USER_MANUAL.md
- TROUBLESHOOTING.md
- CHANGELOG.md
```

#### 실제 생성 위치
```typescript
✅ 생성 위치: yoloseum-phase3-ui/ 루트 또는 Docs/

권장 위치:
- yoloseum-phase3-ui/DEPLOYMENT_CHECKLIST.md
- yoloseum-phase3-ui/USER_MANUAL.md
- yoloseum-phase3-ui/TROUBLESHOOTING.md
- yoloseum-phase3-ui/CHANGELOG.md

또는:

- Docs/01_Deployment/DEPLOYMENT_CHECKLIST.md
- Docs/01_Deployment/USER_MANUAL.md
- Docs/01_Deployment/TROUBLESHOOTING.md
- Docs/01_Deployment/CHANGELOG.md
```

---

## 🛠️ 작업지시서 사용 시 경로 수정 규칙

### 규칙 1: 모든 경로에 `yoloseum-phase3-ui/` 접두사 추가

```
❌ 잘못된 경로
src/hooks/usePortfolio.ts

✅ 올바른 경로
yoloseum-phase3-ui/src/hooks/usePortfolio.ts
```

### 규칙 2: 절대 경로 사용

```bash
❌ 상대 경로
./src/hooks/usePortfolio.ts

✅ 절대 경로
d:\jjumV\yoloseum-phase3-ui\src\hooks\usePortfolio.ts

또는 VSCode 내에서:
yoloseum-phase3-ui/src/hooks/usePortfolio.ts
```

### 규칙 3: 파일명 확인

```typescript
❌ 지시서에 명시: usePortfolio.ts
✅ 생성 시: usePortfolio.ts (정확히 동일)

⚠️ 특별한 경우:
use-toast.ts  (대시 사용 - 기존 파일)
useAuth.ts    (Camel case - 기존 파일)
```

---

## 📁 실제 프로젝트 구조 상세

### src 폴더 구조

```
yoloseum-phase3-ui/src/
│
├─ components/
│  ├─ auth/                    ← 인증 컴포넌트
│  │  ├─ LoginForm.tsx
│  │  ├─ SignUpForm.tsx
│  │  └─ ...
│  │
│  ├─ pages/                   ← 페이지 컴포넌트 ✅ (8개)
│  │  ├─ Dashboard.tsx         (300+ lines)
│  │  ├─ Leaderboard.tsx
│  │  ├─ Traders.tsx
│  │  ├─ TraderDetail.tsx
│  │  ├─ Strategies.tsx
│  │  ├─ StrategyDetail.tsx
│  │  ├─ Portfolio.tsx
│  │  ├─ Profile.tsx           (494 lines)
│  │  ├─ Settings.tsx          (639 lines)
│  │  └─ NotFound.tsx
│  │
│  ├─ charts/                  ← 차트 컴포넌트
│  │  └─ PerformanceChart.tsx
│  │
│  ├─ ui/                      ← shadcn/ui 컴포넌트 (40+)
│  │  ├─ button.tsx
│  │  ├─ card.tsx
│  │  ├─ dialog.tsx
│  │  ├─ dropdown-menu.tsx
│  │  ├─ skeleton.tsx           ← 로딩 UI 용
│  │  └─ ... (많음)
│  │
│  ├─ common/                  ← 공통 컴포넌트
│  │  └─ (ErrorBoundary 생성 예정)
│  │
│  └─ Layout.tsx
│
├─ hooks/                       ← 커스텀 훅 (7개)
│  ├─ useAuth.ts              ✅
│  ├─ useUserProfile.ts        ✅
│  ├─ useTransactions.ts       ✅
│  ├─ useLeaderboard.ts        ✅
│  ├─ useTraders.ts            ✅
│  ├─ useStrategies.ts         ✅
│  ├─ use-toast.ts             ✅
│  └─ (usePortfolio 생성 예정)
│
├─ context/                     ← Context API
│  └─ AuthContext.tsx          ✅
│     (ToastContext 생성 예정)
│
├─ types/                       ← 타입 정의
│  ├─ firestore.ts             ✅ (중앙화)
│  ├─ auth.ts
│  └─ index.ts
│
├─ lib/                         ← 라이브러리
│  ├─ firebase.ts              ✅ (Firebase 초기화)
│  └─ validations/
│     └─ (Zod 스키마)
│
├─ routes/                      ← 라우팅
│  ├─ index.tsx                ✅
│  └─ ProtectedRoute.tsx        ✅
│
├─ assets/                      ← 이미지, 아이콘
│
├─ App.tsx                      ✅ (메인 라우팅)
├─ main.tsx                     ✅
├─ index.css                    ✅
├─ firebase.js                  ✅
└─ App.tsx.backup
```

---

## ✅ Task별 실제 작업 체크리스트

### Day 1-2: 실시간 데이터 동기화

```
Task 1: usePortfolio 훅
[ ] 파일 생성: yoloseum-phase3-ui/src/hooks/usePortfolio.ts
[ ] 기존 훅들 참고: useAuth.ts, useUserProfile.ts
[ ] Firestore onSnapshot 구독 구현
[ ] Portfolio 페이지에서 import

Task 2: Portfolio 페이지
[ ] 파일 수정: yoloseum-phase3-ui/src/components/pages/Portfolio.tsx
[ ] 기존 구현 확인 (이미 부분 구현됨)
[ ] usePortfolio 훅 추가
[ ] 실시간 업데이트 확인

Task 3: Profile 페이지
[ ] 파일 수정: yoloseum-phase3-ui/src/components/pages/Profile.tsx
[ ] 기존 구현 확인 (이미 494줄 구현됨)
[ ] useUserProfile 확인
[ ] 필요시 추가 개선
```

### Day 3: 사용자 피드백 시스템

```
Task 4: Toast 알림
[ ] 확인: src/hooks/use-toast.ts (이미 있음!)
[ ] 선택 사항: Context API로 통합 개선
[ ] 생성: src/components/Toast/Toast.tsx (필요시)
[ ] 생성: src/components/Toast/ToastContainer.tsx (필요시)

Task 5: 로딩 UI
[ ] Skeleton 확인: src/components/ui/skeleton.tsx
[ ] 모든 페이지에 적용
[ ] 위치: yoloseum-phase3-ui/src/components/pages/

Task 6: 에러 처리
[ ] 생성: yoloseum-phase3-ui/src/utils/errorHandler.ts
[ ] 생성: yoloseum-phase3-ui/src/components/common/ErrorBoundary.tsx
[ ] 모든 페이지에 적용
```

### Day 4: 성능 최적화

```
Task 7: 번들 최적화
[ ] 수정: yoloseum-phase3-ui/vite.config.ts
[ ] npm run build 테스트

Task 8: 이미지 최적화
[ ] 생성: yoloseum-phase3-ui/src/components/common/OptimizedImage.tsx
[ ] 적용: 모든 이미지 태그

Task 9: 쿼리 최적화
[ ] 수정: yoloseum-phase3-ui/src/hooks/useTraders.ts
[ ] 수정: yoloseum-phase3-ui/src/hooks/useStrategies.ts
[ ] Firestore 인덱싱 설정
```

### Day 5: 모바일 & 접근성

```
테스트 범위:
[ ] 모든 pages 폴더의 파일들
[ ] 반응형 확인
[ ] Lighthouse 검사
[ ] 접근성 검사

위치:
yoloseum-phase3-ui/src/components/pages/
```

### Day 6: 최종 점검 & 배포

```
[ ] 모든 페이지 테스트
[ ] Git 커밋
[ ] 배포 문서 생성
[ ] Firebase 배포
```

---

## 🎯 실제 시작하는 방법

### Step 1: 프로젝트 폴더로 이동
```bash
cd d:\jjumV\yoloseum-phase3-ui
```

### Step 2: 의존성 확인
```bash
npm install
npm list react firebase  # 필수 패키지 확인
```

### Step 3: 개발 서버 실행
```bash
npm run dev
# http://localhost:5173 접속
```

### Step 4: 작업지시서에 따라 개발
```
1. TASK_INSTRUCTIONS_DAY1-2.md 열기
2. Task 1부터 순차 진행
3. 파일 경로를 아래와 같이 수정:

   지시서: src/hooks/usePortfolio.ts
   실제:   yoloseum-phase3-ui/src/hooks/usePortfolio.ts

4. 코드 작성 및 테스트
5. npm run build로 빌드 확인
6. git add . && git commit
```

---

## 🔗 기존 파일 참고

작업지시서의 코드 예시를 수정할 때 다음 파일들을 참고하세요:

### 훅 작성 참고
```typescript
// 기존 훅 구조를 참고하세요
yoloseum-phase3-ui/src/hooks/useAuth.ts          ← 패턴 참고
yoloseum-phase3-ui/src/hooks/useUserProfile.ts   ← Firebase 사용법
yoloseum-phase3-ui/src/hooks/useTraders.ts       ← 쿼리 최적화
```

### Context 작성 참고
```typescript
// 기존 Context 구조를 참고하세요
yoloseum-phase3-ui/src/context/AuthContext.tsx   ← 패턴 참고
```

### 페이지 작성 참고
```typescript
// 기존 페이지 구조를 참고하세요
yoloseum-phase3-ui/src/components/pages/Dashboard.tsx  ← 구조 참고
yoloseum-phase3-ui/src/components/pages/Profile.tsx    ← 상세 구현
```

### UI 컴포넌트 사용
```typescript
// shadcn/ui 컴포넌트를 활용하세요
yoloseum-phase3-ui/src/components/ui/
├─ button.tsx
├─ card.tsx
├─ skeleton.tsx    ← 로딩 UI
└─ ... (40+ 컴포넌트)
```

---

## 📊 현재 진행 상황

```
✅ 완료된 부분:
├─ 9개 페이지 구현
├─ 7개 데이터 훅
├─ Firebase 인증 시스템
├─ Firestore 실시간 동기화
├─ 7개 Cloud Functions
└─ 타입 안정성 100%

⚠️ 추가 필요:
├─ usePortfolio 훅 (Task 1)
├─ Toast 시스템 개선 (Task 4)
├─ ErrorBoundary (Task 6)
├─ 이미지 최적화 (Task 8)
└─ 배포 문서 (Task 15)

🎯 진행률: 약 70% 완료 → 100% 완성
```

---

## 💡 주의사항

### ⚠️ 하지 말아야 할 것

```
❌ firebase-phase2-dashboard/ 폴더에서 작업
❌ solana-trading-mockup/ 폴더에서 작업
❌ src/ (루트의 src) 폴더에서 작업
❌ 잘못된 경로로 파일 생성
```

### ✅ 해야 할 것

```
✅ yoloseum-phase3-ui/ 폴더에서만 작업
✅ 절대 경로 사용
✅ 기존 코드 구조 따르기
✅ 각 Task마다 테스트
✅ npm run build로 빌드 확인
```

---

## 📞 문제 발생 시

### 파일을 찾을 수 없음
```
→ 경로가 yoloseum-phase3-ui/로 시작하는지 확인
→ 파일 확장자(.ts, .tsx) 확인
```

### import 에러
```
→ 상대 경로가 올바른지 확인
→ 파일이 실제로 존재하는지 확인
→ VSCode에서 파일 생성 후 다시 import
```

### npm 에러
```bash
→ cd yoloseum-phase3-ui 확인
→ npm install 실행
→ npm run dev 다시 실행
```

---

## ✨ 최종 요약

| 항목 | 지시서 경로 | 실제 경로 |
|------|-----------|---------|
| 모든 작업 | src/... | yoloseum-phase3-ui/src/... |
| 훅 작성 | src/hooks/ | yoloseum-phase3-ui/src/hooks/ |
| 페이지 | src/components/pages/ | yoloseum-phase3-ui/src/components/pages/ |
| 컴포넌트 | src/components/ | yoloseum-phase3-ui/src/components/ |
| Context | src/context/ | yoloseum-phase3-ui/src/context/ |
| 유틸 | src/utils/ | yoloseum-phase3-ui/src/utils/ |
| 설정 | vite.config.ts | yoloseum-phase3-ui/vite.config.ts |

---

**작성일**: 2025년 10월 30일
**목적**: 작업지시서와 실제 프로젝트 구조 매핑
**상태**: 📌 매핑 완료 - 작업 준비 완료

🎯 **이제 정확한 경로로 작업을 시작하세요!**
