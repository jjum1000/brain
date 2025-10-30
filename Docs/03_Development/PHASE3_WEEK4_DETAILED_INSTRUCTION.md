# Phase 3 Week 4 - 상세 작업 지시서

**작성일**: 2025-10-30
**목표**: Phase 3 마무리 및 배포 준비 (6일 작업)
**대상**: yoloseum-phase3-ui 프로젝트

---

## 📋 프로젝트 현황 분석

### 1. 실제 구현 상태

#### 완료된 항목 (100%)
- **Framework & Layout**: Vite + React 19 + TypeScript
- **Authentication**: Firebase Auth + useAuth 훅
- **9개 페이지**: Dashboard, Leaderboard, Traders, TraderDetail, Strategies, StrategyDetail, Portfolio, Profile, Settings
- **7개 커스텀 훅**: useAuth, useUserProfile, useTransactions, useLeaderboard, useTraders, useStrategies, use-toast
- **Type 정의**: firestore.ts (중앙화 타입 정의, 418줄)
- **Firebase 연동**: 실시간 Firestore 동기화

#### 부분 완료 항목 (70%)
- **Portfolio 페이지**: 기본 구조 완료, usePortfolio 훅 미구현
- **Profile 페이지**: 기본 표시 완료, 실시간 사용자 정보 동기화 필요
- **에러 처리**: 기본 구조만 있음, 사용자 친화적 메시지 필요
- **로딩 UI**: 로더만 있음, Skeleton 컴포넌트 미적용
- **성능 최적화**: 번들 크기 889KB (gzipped 235KB), 목표 800KB

#### 미구현 항목 (0%)
- Toast 알림 시스템 (use-toast만 있음, ToastProvider 미구현)
- 로딩 상태 Skeleton UI
- 이미지 최적화 컴포넌트
- Lighthouse 점수 최적화

---

## 🛠️ 의존성 및 구조

### 핵심 의존성
```
React 19.1.1
TypeScript 5.9.3
Firebase 12.4.0
Firestore (realtime database)
Tailwind CSS 3.4.1
shadcn/ui (40+ components)
React Router v7
Vite 7.1.7
```

### 핵심 파일 구조
```
yoloseum-phase3-ui/
├── src/
│   ├── components/
│   │   ├── pages/ (9개 페이지)
│   │   ├── ui/ (40+ shadcn/ui)
│   │   ├── charts/ (LineChart, BarChart)
│   │   ├── auth/ (LoginDialog, SignupDialog, ForgotPasswordDialog)
│   │   └── Layout.tsx
│   ├── hooks/ (7개 훅)
│   ├── context/ (AuthContext)
│   ├── types/ (firestore.ts, auth.ts)
│   ├── lib/
│   │   ├── firebase.ts (Firebase 초기화)
│   │   └── validations/ (Zod schemas)
│   ├── routes/ (ProtectedRoute, index.tsx)
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 📅 일별 작업 계획

### **Day 1-2: 실시간 데이터 동기화 완성 (Task 1-3)**

#### Task 1: usePortfolio 훅 구현

**목표**: supporters 컬렉션을 실시간으로 구독하고 포트폴리오 통계 계산

**파일**: `src/hooks/usePortfolio.ts` (NEW)

**구현 요구사항**:
1. **Hook Signature**
   - 입력: `limitCount: number = 50` (기본값 50)
   - 반환: `UsePortfolioReturn` interface
   ```typescript
   interface UsePortfolioReturn {
     investments: Support[];  // Support[] from Firestore
     statistics: {
       totalInvested: number;     // 전체 투자액
       activeInvestments: number; // 활성 투자 수
       totalROI: number;          // %
       totalEarned: number;       // 총 수익액
       totalRealizedProfit: number; // 현실화된 수익
     };
     loading: boolean;
     error: Error | null;
   }
   ```

2. **실시간 구독 로직**
   - Collection: `/supporters`
   - Filter: `userId == authUser.id`
   - Sort: `investedAt` desc (최신순)
   - Limit: limitCount (기본 50)

3. **통계 계산**
   ```typescript
   // totalInvested: investmentAmount 합계
   // activeInvestments: status == "active" 개수
   // totalROI: (totalEarned / totalInvested) * 100
   // totalEarned: 모든 investments의 returns.earned 합계
   // totalRealizedProfit: 모든 investments의 returns.realized 합계
   ```

4. **에러 처리**
   - 인증되지 않은 사용자: 빈 배열 반환
   - Firestore 에러: setError로 캡처
   - 에러 상황에서 로딩 false 설정

5. **Cleanup**
   - 컴포넌트 언마운트 시 unsubscribe 반환
   - 의존성 배열: `[authUser, limitCount]`

**참고 코드**: [useTransactions.ts](yoloseum-phase3-ui/src/hooks/useTransactions.ts)와 동일한 패턴 사용

---

#### Task 2: Portfolio 페이지 데이터 연동

**목표**: usePortfolio 훅을 Portfolio 페이지에 통합하여 실시간 데이터 표시

**파일**: `src/components/pages/Portfolio.tsx` (UPDATE)

**현재 상태**:
- useTransactions만 사용 중 (거래 이력)
- usePortfolio 미구현

**변경 사항**:
1. **usePortfolio 훅 추가**
   ```typescript
   const { investments, statistics, loading, error } = usePortfolio(100);
   ```

2. **새로운 통계 카드 추가** (기존 카드 위에)
   ```
   - 활성 투자: activeInvestments 수 표시
   - 총 ROI: statistics.totalROI 표시
   - 총 수익: statistics.totalEarned 표시
   ```

3. **새로운 테이블 추가**: "투자 목록" 섹션
   - Columns: 전략명, 투자액, 현재 수익, ROI%, 상태
   - Data: investments 배열 렌더링
   - 빈 상태: "투자 기록이 없습니다"

4. **로딩/에러 상태**
   - loading && useTransactions loading일 때 전체 로딩 표시
   - error (usePortfolio or useTransactions) 표시

---

#### Task 3: Profile 페이지 사용자 정보 동기화

**목표**: useUserProfile 훅으로 실시간 사용자 정보 표시 및 업데이트

**파일**: `src/components/pages/Profile.tsx` (UPDATE)

**현재 상태**:
- useUserProfile 훅 사용 중
- 기본 정보만 표시 (displayName, email, bio)
- 실시간 동기화 일부 미흡

**변경 사항**:
1. **사용자 정보 섹션 확장**
   ```
   기본 정보:
   - Avatar + 이름
   - Email
   - Wallet Address (복사 버튼 포함)
   - Bio/소개글

   통계:
   - 가입일
   - 팔로우 수
   - 검증 상태 (verified badge)
   ```

2. **지갑 주소 표시**
   - Copy to clipboard 기능
   - 짧은 형태로 표시 (앞 6자 + 뒤 4자)

3. **관심 트레이더 목록**
   - userProfile.stats.favoriteTraders 표시
   - 트레이더 카드로 렌더링

4. **설정 기본값 업데이트**
   - form defaultValues를 userProfile로 초기화
   - useEffect 사용하여 변경 감지 시 업데이트

---

### **Day 3: 사용자 피드백 시스템 구현 (Task 4-6)**

#### Task 4: Toast 알림 시스템 구현

**목표**: Context API 기반 글로벌 Toast 알림 시스템 구현

**파일들**:
- `src/components/Toast/ToastProvider.tsx` (NEW)
- `src/hooks/useToast.ts` (UPDATE - 있으면 수정)
- `src/App.tsx` (UPDATE - ToastProvider 추가)

**Toast 시스템 요구사항**:

1. **ToastProvider 컴포넌트**
   ```typescript
   interface Toast {
     id: string;
     message: string;
     type: 'success' | 'error' | 'warning' | 'info';
     duration?: number; // 기본 3000ms
   }

   interface ToastContextType {
     toasts: Toast[];
     addToast: (message: string, type: Toast['type'], duration?: number) => void;
     removeToast: (id: string) => void;
   }
   ```

2. **기능**
   - Context로 toasts 상태 관리
   - 자동 닫기: 기본 3초 후 자동 제거
   - 스택 관리: 최대 3개 toast 표시
   - 각 토스트는 고유 ID 필요

3. **UI**
   - Toast 컴포넌트는 shadcn/ui의 toast 사용 (이미 설치됨)
   - 우측 상단에 고정 위치 표시
   - 타입별 색상: success (green), error (red), warning (yellow), info (blue)

4. **사용 예**
   ```typescript
   const { addToast } = useToast();
   addToast('데이터를 저장했습니다', 'success');
   addToast('오류가 발생했습니다', 'error', 5000);
   ```

5. **App.tsx 통합**
   ```typescript
   <ToastProvider>
     <BrowserRouter>
       {/* 기존 코드 */}
     </BrowserRouter>
   </ToastProvider>
   ```

---

#### Task 5: 로딩 상태 UI 개선

**목표**: Skeleton 컴포넌트를 이용한 로딩 상태 UI 개선

**파일**: 각 페이지별 (UPDATE)

**적용 대상**:
1. **Dashboard.tsx**
   - 통계 카드: StatsSkeleton (4개)
   - 거래 테이블: TableSkeleton (5행)

2. **Leaderboard.tsx**
   - 순위 테이블: TableSkeleton (10행)

3. **Traders.tsx**
   - 트레이더 카드: CardSkeleton (6개)

4. **Strategies.tsx**
   - 전략 카드: CardSkeleton (8개)

5. **Portfolio.tsx**
   - 통계 카드: StatsSkeleton (4개)
   - 투자 목록 테이블: TableSkeleton (5행)

**Skeleton 컴포넌트**:
- shadcn/ui Skeleton 사용 (이미 설치됨)
- 파일: `src/components/common/Skeletons.tsx` (NEW)

```typescript
// StatsSkeleton
export function StatsSkeleton() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  );
}

// TableSkeleton
export function TableSkeleton({ rows = 5 }) {
  return (
    <>
      {Array(rows).fill(0).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}
```

**적용 패턴**:
```typescript
if (loading) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatsSkeleton />
      <StatsSkeleton />
      <StatsSkeleton />
      <StatsSkeleton />
    </div>
  );
}
```

---

#### Task 6: 에러 처리 개선

**목표**: Firestore 에러를 사용자 친화적 메시지로 변환

**파일**: `src/lib/errorHandler.ts` (NEW)

**에러 맵핑**:
```typescript
export const firebaseErrorMessages: Record<string, string> = {
  // Authentication errors
  'auth/user-not-found': '등록되지 않은 사용자입니다',
  'auth/wrong-password': '잘못된 비밀번호입니다',
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다',
  'auth/weak-password': '비밀번호가 너무 약합니다',
  'auth/invalid-email': '잘못된 이메일 형식입니다',

  // Firestore errors
  'permission-denied': '이 데이터에 접근할 권한이 없습니다',
  'not-found': '요청한 데이터를 찾을 수 없습니다',
  'already-exists': '이미 존재하는 데이터입니다',
  'failed-precondition': '작업을 수행하기 위한 조건이 충족되지 않았습니다',
  'aborted': '작업이 중단되었습니다. 다시 시도해주세요',
  'unavailable': '서비스를 일시적으로 이용할 수 없습니다',
  'unauthenticated': '로그인이 필요합니다',

  // Network errors
  'network-error': '네트워크 연결을 확인해주세요',
  'timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요',
};

export function getErrorMessage(error: any): string {
  if (error instanceof Error) {
    const errorCode = error.message;
    for (const [code, message] of Object.entries(firebaseErrorMessages)) {
      if (errorCode.includes(code)) {
        return message;
      }
    }
    return error.message;
  }
  return '예기치 않은 오류가 발생했습니다';
}
```

**훅에 적용**:
```typescript
catch (err) {
  const message = getErrorMessage(err);
  setError(new Error(message));
}
```

---

### **Day 4: 성능 최적화 (Task 7-9)**

#### Task 7: 번들 크기 최적화

**목표**: 번들 크기를 889KB에서 800KB 이하로 감소

**현재 상태**: 889KB (gzipped 235KB)

**최적화 항목**:

1. **불필요한 패키지 제거**
   - package.json 검토
   - 미사용 의존성 확인
   ```bash
   npm ls
   ```

2. **Tree shaking 확인**
   ```typescript
   // ❌ 나쁜 예: 전체 라이브러리 import
   import _ from 'lodash';

   // ✅ 좋은 예: 필요한 함수만 import
   import { debounce } from 'lodash';
   ```

3. **동적 import (Code Splitting)**
   - 각 페이지를 lazy load
   ```typescript
   import { lazy, Suspense } from 'react';

   const Dashboard = lazy(() => import('@/components/pages/Dashboard'));
   const Portfolio = lazy(() => import('@/components/pages/Portfolio'));

   // Route에 적용
   <Suspense fallback={<Loader />}>
     <Dashboard />
   </Suspense>
   ```

4. **빌드 분석**
   ```bash
   npm run build
   # dist/ 폴더 크기 확인
   # npm install --save-dev rollup-plugin-visualizer 사용하여 분석 가능
   ```

**성공 기준**:
- 최종 번들 크기 < 800KB
- gzipped < 200KB

---

#### Task 8: 이미지 최적화

**목표**: 이미지 로딩 최적화 및 WebP 지원

**파일**: `src/components/common/OptimizedImage.tsx` (NEW)

**컴포넌트**:
```typescript
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // true면 lazy loading 안 함
}

export function OptimizedImage({
  src,
  alt,
  width = 200,
  height = 200,
  priority = false,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      className="rounded-lg object-cover"
    />
  );
}
```

**적용 위치**:
- Dashboard: 트레이더 아바타
- Traders 페이지: 트레이더 카드 이미지
- TraderDetail: 프로필 이미지
- Profile: 사용자 아바타

---

#### Task 9: Firestore 쿼리 최적화

**목표**: 대규모 데이터 조회 시 성능 개선

**최적화 항목**:

1. **useTraders 훅 검토**
   - 현재 limit(50) 확인
   - 필요시 페이지네이션 구현
   - 실시간 리스너 필요 여부 검토

2. **useStrategies 훅 검토**
   - 전략 목록 조회 limit 확인
   - 카테고리별 필터링 추가 시 인덱스 필요

3. **메모리 누수 방지**
   - 모든 onSnapshot 구독에 unsubscribe 반환 확인
   - useEffect cleanup 함수 검토

4. **Firestore 인덱싱** (필요시)
   - Firestore console에서 복합 인덱스 생성
   - 예: where + orderBy 조합

**검토 체크리스트**:
- [ ] 모든 훅의 limit 설정 확인
- [ ] 불필요한 실시간 구독 제거
- [ ] unsubscribe cleanup 반환 확인
- [ ] 의존성 배열 최소화

---

### **Day 5: 모바일 테스트 및 반응형 완성 (Task 10-12)**

#### Task 10: 모바일 반응형 테스트

**목표**: 모든 기기에서 완벽한 반응형 레이아웃 확인

**테스트 기기**:
- iPhone 12 (390px)
- iPhone 14 Pro (393px)
- Samsung Galaxy S21 (360px)
- iPad Air (768px)
- iPad Pro (1024px)

**테스트 항목**:
1. **레이아웃**
   - 모든 페이지 가로/세로 방향 전환 확인
   - 텍스트 오버플로우 없음
   - 이미지 제대로 표시됨

2. **가독성**
   - 최소 텍스트 크기 12px
   - 줄간격 1.5 이상
   - 색상 대비 충분함

3. **상호작용**
   - 버튼 최소 44x44px (터치 영역)
   - 모달/드롭다운이 화면 범위 내
   - 네비게이션 메뉴 접근성

4. **입력 필드**
   - 입력 필드 자동 줌 방지 (font-size >= 16px)
   - 키보드 표시 시 내용 가려지지 않음
   - 모바일 키보드 유형 적절함 (email, number, etc)

**DevTools 검사**:
```bash
F12 → Device Emulation → 다양한 기기 테스트
```

---

#### Task 11: Lighthouse 성능 검사

**목표**: 주요 페이지 Lighthouse 점수 > 80점 달성

**테스트 대상**:
1. Dashboard
2. Leaderboard
3. Traders
4. Portfolio

**성능 지표**:
- Performance > 80점
- Accessibility > 80점
- Best Practices > 80점
- SEO > 80점

**주요 점검 항목**:
1. **CLS (누적 레이아웃 이동)** < 0.1
   - 로딩 중 레이아웃 이동 최소화
   - 이미지/광고에 width/height 지정

2. **LCP (가장 큰 콘텐츠 칠하기)** < 2.5초
   - 주요 이미지/텍스트 빠른 로드
   - 번들 크기 최적화

3. **FID (첫 입력 지연)** < 100ms
   - JavaScript 메인 스레드 블로킹 최소화
   - 무거운 계산 Web Worker 사용 고려

**실행**:
```bash
npm run dev
# 개발 서버 실행 후
lighthouse http://localhost:5173 --view
```

---

#### Task 12: 접근성(a11y) 검사

**목표**: WCAG AA 기준 준수

**검사 항목**:

1. **색상 대비**
   - 일반 텍스트: 4.5:1 이상
   - 큰 텍스트: 3:1 이상
   - 도구: axe DevTools, WAVE

2. **키보드 네비게이션**
   - Tab으로 모든 버튼/링크 접근 가능
   - 포커스 표시 명확함 (outline 또는 box-shadow)
   - Shift+Tab으로 역순 이동 가능

3. **스크린 리더 지원**
   - 모든 이미지에 alt 텍스트
   - 폼 라벨과 입력 필드 연결
   - 섹션 제목에 heading 사용

4. **ARIA 라벨**
   ```typescript
   <Button aria-label="메뉴 열기" />
   <div role="alert" aria-live="polite">알림</div>
   ```

5. **포커스 관리**
   - 모달 열 때 포커스 이동
   - ESC 키로 모달 닫기 가능
   - 돌아갈 요소로 포커스 복귀

**브라우저 확장 설치**:
- axe DevTools
- WAVE
- Lighthouse (Chrome DevTools)

---

### **Day 6: 최종 점검 및 배포 준비 (Task 13-15)**

#### Task 13: 전체 기능 테스트

**목표**: 모든 사용자 플로우 정상 동작 확인

**테스트 시나리오**:

1. **인증 플로우**
   ```
   비로그인 → 회원가입 → 로그인 → 대시보드 접근 성공
   로그아웃 → 로그인 페이지로 리다이렉트
   ```

2. **트레이더 팔로우 플로우**
   ```
   Traders 페이지 → 트레이더 선택 → 팔로우 → Profile 업데이트 확인
   ```

3. **전략 투자 플로우** (시뮬레이션)
   ```
   Strategies 페이지 → 전략 선택 → 상세 확인 → Portfolio에 반영
   ```

4. **리더보드 필터링**
   ```
   주간/월간 탭 전환 → 정렬 변경 → 데이터 업데이트 확인
   ```

5. **프로필 편집**
   ```
   Profile 페이지 → Edit 클릭 → 정보 수정 → 저장 → 실시간 업데이트 확인
   ```

**엣지 케이스 테스트**:

1. **네트워크 오류**
   ```
   DevTools Network 탭 → Offline 모드 → 페이지 새로고침
   → 에러 메시지 표시 확인
   ```

2. **데이터 없음**
   ```
   새 사용자 계정 → Portfolio 접근 → "투자 기록이 없습니다" 표시
   ```

3. **로딩 지연** (시뮬레이션)
   ```
   DevTools Network 탭 → Slow 3G 설정 → 페이지 로드
   → Skeleton 로딩 표시 확인
   ```

4. **권한 에러** (403)
   ```
   다른 사용자의 Profile URL 직접 접근 → 권한 에러 메시지
   ```

5. **페이지 미존재** (404)
   ```
   잘못된 URL 접근 → NotFound 페이지 표시
   ```

---

#### Task 14: Git 최종 커밋

**목표**: 모든 변경사항을 체계적으로 커밋

**커밋 전 체크리스트**:
```
[ ] npm run build 성공
[ ] TypeScript 에러 없음 (tsc -b)
[ ] ESLint 경고 없음 (npm run lint)
[ ] 번들 크기 < 800KB
[ ] 모든 페이지 정상 작동
[ ] console.log 제거
[ ] 테스트 완료
```

**커밋 항목**:
1. usePortfolio 훅 추가
2. Portfolio 페이지 데이터 연동
3. Profile 페이지 동기화
4. Toast 알림 시스템
5. Skeleton 로딩 UI
6. 에러 처리 개선
7. 번들 최적화
8. 이미지 최적화
9. Firestore 쿼리 최적화
10. 모바일 반응형 완성
11. 성능 최적화 (Lighthouse)
12. 접근성 개선

**커밋 메시지 예**:
```
feat: Implement real-time data sync and UI improvements

- Add usePortfolio hook with real-time Firestore subscription
- Integrate Portfolio and Profile pages with user data
- Implement global Toast notification system
- Add Skeleton loading UI for better UX
- Improve error handling with user-friendly messages
- Optimize bundle size to < 800KB
- Implement lazy loading for images
- Optimize Firestore queries
- Complete mobile responsive testing
- Achieve Lighthouse scores > 80
- Improve accessibility (WCAG AA)

BREAKING CHANGE: None
```

---

#### Task 15: 배포 준비 문서

**목표**: 배포 전 필요한 모든 문서 작성

**생성 문서**:

1. **DEPLOYMENT_CHECKLIST.md**
   ```
   배포 전 확인사항 (50개 항목)
   - 환경 변수 설정
   - Firebase 프로젝트 설정
   - 배포 명령어
   ```

2. **PERFORMANCE_METRICS.md**
   ```
   성능 지표 요약
   - 번들 크기: 800KB (gzipped 200KB)
   - Lighthouse 점수: 각 85점 이상
   - 페이지 로드 시간: < 2.5초
   ```

3. **USER_MANUAL.md**
   ```
   사용자 매뉴얼
   - 회원가입 방법
   - 트레이더 팔로우 방법
   - 포트폴리오 보기
   - 설정 변경
   ```

4. **TROUBLESHOOTING.md**
   ```
   문제 해결 가이드
   - 로그인 안 됨 → 해결책
   - 데이터 안 보임 → 해결책
   - 느린 성능 → 해결책
   ```

---

## ⚡ 빠른 참고

### 자주 사용하는 명령어
```bash
# 개발 서버 실행
npm run dev

# 타입 확인
npx tsc -b

# 빌드
npm run build

# 린트 확인
npm run lint
```

### Firebase Collections 구조
```
/users/{uid}                    # 사용자 정보
/traders/{uid}                  # 트레이더 정보
/strategies/{id}                # 거래 전략
/supporters/{supportId}         # 사용자 투자 정보
/transactions/{txId}            # 거래 내역
/leaderboard/{periodId}        # 리더보드
/reviews/{reviewId}             # 리뷰
```

### 타입 정의 위치
- 모든 Firestore 타입: [firestore.ts](yoloseum-phase3-ui/src/types/firestore.ts)
- 인증 관련 타입: [auth.ts](yoloseum-phase3-ui/src/types/auth.ts)

### 현재 인증 방식
- Firebase Authentication
- Email/Password
- Google OAuth
- Discord OAuth (준비 중)

---

## 🎯 성공 기준

**Phase 3 Week 4 완료 조건**:
- [ ] TypeScript 에러 0개
- [ ] 번들 크기 < 800KB
- [ ] Lighthouse 모든 점수 > 80
- [ ] 모바일 완벽 지원
- [ ] 모든 페이지 실시간 데이터 연동
- [ ] Toast 알림 시스템 작동
- [ ] 에러 메시지 사용자 친화적
- [ ] Git 커밋 완료
- [ ] 배포 문서 작성 완료

---

**다음 단계**: Phase 4 (실시간 기능, WebSocket, 3주)

🚀 **6일 동안 Phase 3 마무리 후 배포 준비 완료!**

