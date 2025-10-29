# DAY 3: 사용자 피드백 시스템 구축 - 완전 독립 작업 지시서

> **작업 날짜**: Day 3
> **예상 소요 시간**: 6-8시간
> **난이도**: 중급
> **완료 조건**: Toast 알림, 로딩 상태, 에러 처리 완벽 구현

---

## 목차

1. [작업 환경 설정](#1-작업-환경-설정)
2. [Task 4: Toast 알림 시스템](#2-task-4-toast-알림-시스템)
3. [Task 5: 로딩 상태 UI (Skeleton)](#3-task-5-로딩-상태-ui-skeleton)
4. [Task 6: 에러 처리 개선](#4-task-6-에러-처리-개선)
5. [통합 테스트](#5-통합-테스트)
6. [문제 해결 가이드](#6-문제-해결-가이드)
7. [Git 커밋](#7-git-커밋)

---

## 1. 작업 환경 설정

### 1.1 작업 폴더 확인

```bash
# 현재 위치 확인
pwd
# 출력: d:\jjumV (또는 프로젝트 루트)

# yoloseum-phase3-ui 폴더로 이동
cd yoloseum-phase3-ui

# 폴더 구조 확인
ls -la
# 출력 예상:
# src/
# node_modules/
# package.json
# vite.config.ts
# tsconfig.json
```

### 1.2 의존성 확인

```bash
# Toast 관련 패키지 확인
npm list @radix-ui/react-toast
# 출력: @radix-ui/react-toast@1.2.15

npm list sonner
# 출력: sonner@2.0.7

# 개발 서버 실행 확인
npm run dev
# 출력:
# VITE v7.1.7  ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**의존성 설명:**
- `@radix-ui/react-toast`: Radix UI의 Toast 컴포넌트 (접근성 완벽 지원)
- `sonner`: React용 경량 Toast 라이브러리 (Toaster 대안)
- `lucide-react`: 아이콘 라이브러리
- `class-variance-authority`: 조건부 클래스 관리
- `tailwind-merge`: Tailwind CSS 클래스 충돌 해결

### 1.3 현재 프로젝트 상태 확인

```bash
# 기존 Toast 시스템 확인
ls src/hooks/use-toast.ts
# 출력: src/hooks/use-toast.ts (존재함)

ls src/components/ui/toast.tsx
# 출력: src/components/ui/toast.tsx (존재함)

ls src/components/ui/toaster.tsx
# 출력: src/components/ui/toaster.tsx (존재함)

# 페이지 파일 확인
ls src/components/pages/*.tsx
# 출력:
# Dashboard.tsx
# Leaderboard.tsx
# Traders.tsx
# TraderDetail.tsx
# Profile.tsx
# Settings.tsx
# Strategies.tsx
# StrategyDetail.tsx
# Portfolio.tsx
# NotFound.tsx
```

---

## 2. Task 4: Toast 알림 시스템

### 2.1 현재 Toast 시스템 분석

기존 파일:
- `yoloseum-phase3-ui/src/hooks/use-toast.ts` - 이미 존재
- `yoloseum-phase3-ui/src/components/ui/toast.tsx` - 이미 존재
- `yoloseum-phase3-ui/src/components/ui/toaster.tsx` - 이미 존재

**현재 상태:**
- Radix UI 기반 Toast 시스템이 이미 구현되어 있음
- `use-toast.ts`에서 `toast()` 함수와 `useToast()` 훅 제공

### 2.2 Toast 유틸리티 함수 생성

**파일 생성**: `yoloseum-phase3-ui/src/utils/toast-helpers.ts`

```typescript
/**
 * Toast 유틸리티 함수
 *
 * 프로젝트 전체에서 일관된 Toast 메시지를 표시하기 위한 헬퍼 함수들
 *
 * 의존성:
 * - @/hooks/use-toast: 기본 Toast 훅
 * - lucide-react: 아이콘
 */

import { toast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

/**
 * 성공 Toast 표시
 * @param title - 제목
 * @param description - 설명 (선택)
 * @example
 * showSuccessToast('저장 완료', '프로필이 업데이트되었습니다.');
 */
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'default',
    className: 'bg-green-900 border-green-700 text-white',
  });
};

/**
 * 에러 Toast 표시
 * @param title - 제목
 * @param description - 설명 (선택)
 * @example
 * showErrorToast('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
 */
export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'destructive',
    className: 'bg-red-900 border-red-700 text-white',
  });
};

/**
 * 경고 Toast 표시
 * @param title - 제목
 * @param description - 설명 (선택)
 * @example
 * showWarningToast('주의', '이 작업은 되돌릴 수 없습니다.');
 */
export const showWarningToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'default',
    className: 'bg-yellow-900 border-yellow-700 text-white',
  });
};

/**
 * 정보 Toast 표시
 * @param title - 제목
 * @param description - 설명 (선택)
 * @example
 * showInfoToast('알림', '새로운 업데이트가 있습니다.');
 */
export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'default',
    className: 'bg-blue-900 border-blue-700 text-white',
  });
};

/**
 * 로딩 Toast 표시 (자동으로 사라지지 않음)
 * @param title - 제목
 * @param description - 설명 (선택)
 * @returns Toast dismiss 함수
 * @example
 * const { dismiss } = showLoadingToast('데이터 로딩 중...');
 * // 작업 완료 후
 * dismiss();
 */
export const showLoadingToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: 'default',
    className: 'bg-slate-800 border-slate-700 text-white',
    duration: Infinity, // 자동으로 사라지지 않음
  });
};

/**
 * Firebase 에러를 사용자 친화적 메시지로 변환하여 Toast 표시
 * @param error - Firebase 에러 객체
 * @example
 * try {
 *   await signInWithEmailAndPassword(auth, email, password);
 * } catch (error) {
 *   showFirebaseErrorToast(error);
 * }
 */
export const showFirebaseErrorToast = (error: any) => {
  const errorCode = error?.code || 'unknown';

  const errorMessages: Record<string, { title: string; description: string }> = {
    'auth/user-not-found': {
      title: '사용자를 찾을 수 없습니다',
      description: '이메일을 확인해주세요.',
    },
    'auth/wrong-password': {
      title: '비밀번호가 올바르지 않습니다',
      description: '비밀번호를 다시 확인해주세요.',
    },
    'auth/email-already-in-use': {
      title: '이미 사용 중인 이메일입니다',
      description: '다른 이메일을 사용해주세요.',
    },
    'auth/weak-password': {
      title: '비밀번호가 너무 약합니다',
      description: '6자 이상의 비밀번호를 사용해주세요.',
    },
    'auth/invalid-email': {
      title: '유효하지 않은 이메일입니다',
      description: '이메일 형식을 확인해주세요.',
    },
    'auth/network-request-failed': {
      title: '네트워크 오류',
      description: '인터넷 연결을 확인해주세요.',
    },
    'permission-denied': {
      title: '권한이 없습니다',
      description: '이 작업을 수행할 권한이 없습니다.',
    },
    'not-found': {
      title: '데이터를 찾을 수 없습니다',
      description: '요청한 데이터가 존재하지 않습니다.',
    },
    'unavailable': {
      title: '서비스를 사용할 수 없습니다',
      description: '잠시 후 다시 시도해주세요.',
    },
  };

  const message = errorMessages[errorCode] || {
    title: '오류가 발생했습니다',
    description: error?.message || '알 수 없는 오류가 발생했습니다.',
  };

  showErrorToast(message.title, message.description);
};
```

**코드 설명:**

1. **Import 경로 분석:**
   - `@/hooks/use-toast`: `@`는 `src/` 디렉토리를 가리킴 (tsconfig.json에서 설정)
   - `lucide-react`: 아이콘 라이브러리 (package.json에 설치됨)

2. **함수별 역할:**
   - `showSuccessToast`: 초록색 배경의 성공 메시지
   - `showErrorToast`: 빨간색 배경의 에러 메시지
   - `showWarningToast`: 노란색 배경의 경고 메시지
   - `showInfoToast`: 파란색 배경의 정보 메시지
   - `showLoadingToast`: 회색 배경, 자동으로 사라지지 않음 (수동으로 dismiss 필요)
   - `showFirebaseErrorToast`: Firebase 에러 코드를 사용자 친화적 메시지로 변환

3. **variant 옵션:**
   - `default`: 일반 스타일
   - `destructive`: 빨간색 에러 스타일 (toast.tsx에서 정의)

### 2.3 App.tsx에 Toaster 추가

**파일 수정**: `yoloseum-phase3-ui/src/App.tsx`

기존 파일에서 import 추가:

```typescript
import { Toaster } from '@/components/ui/toaster';
```

`App` 컴포넌트 수정:

```typescript
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}
```

**전체 수정 예시:**

```typescript
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/pages/Dashboard';
import { Leaderboard } from '@/components/pages/Leaderboard';
import { Traders } from '@/components/pages/Traders';
import { TraderDetail } from '@/components/pages/TraderDetail';
import { Profile } from '@/components/pages/Profile';
import { Settings } from '@/components/pages/Settings';
import { Strategies } from '@/components/pages/Strategies';
import { StrategyDetail } from '@/components/pages/StrategyDetail';
import { Portfolio } from '@/components/pages/Portfolio';
import { NotFound } from '@/components/pages/NotFound';
import { Toaster } from '@/components/ui/toaster'; // 추가
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Target, Shield } from 'lucide-react';

// HomePage 컴포넌트는 동일...

function AppContent() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/traders" element={<Traders />} />
          <Route path="/trader/:id" element={<TraderDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/strategy/:id" element={<StrategyDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster /> {/* 추가 */}
    </AuthProvider>
  );
}
```

### 2.4 Toast 시스템 테스트 페이지 작성

**파일 생성**: `yoloseum-phase3-ui/src/components/pages/ToastTest.tsx`

```typescript
/**
 * Toast 테스트 페이지
 *
 * Toast 시스템이 정상적으로 작동하는지 테스트하기 위한 페이지
 * 개발 중에만 사용, 프로덕션에서는 제거 예정
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast,
  showFirebaseErrorToast,
} from '@/utils/toast-helpers';
import { useState } from 'react';

export function ToastTest() {
  const [loadingToastDismiss, setLoadingToastDismiss] = useState<(() => void) | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Toast 시스템 테스트</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 기본 Toast */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">기본 Toast</CardTitle>
            <CardDescription>성공, 에러, 경고, 정보 Toast 테스트</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => showSuccessToast('성공!', '작업이 완료되었습니다.')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              성공 Toast
            </Button>

            <Button
              onClick={() => showErrorToast('에러 발생', '문제가 발생했습니다.')}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              에러 Toast
            </Button>

            <Button
              onClick={() => showWarningToast('주의', '이 작업은 되돌릴 수 없습니다.')}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              경고 Toast
            </Button>

            <Button
              onClick={() => showInfoToast('알림', '새로운 메시지가 있습니다.')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              정보 Toast
            </Button>
          </CardContent>
        </Card>

        {/* 로딩 Toast */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">로딩 Toast</CardTitle>
            <CardDescription>자동으로 사라지지 않는 로딩 Toast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                const { dismiss } = showLoadingToast('데이터 로딩 중...', '잠시만 기다려주세요.');
                setLoadingToastDismiss(() => dismiss);
              }}
              className="w-full"
            >
              로딩 Toast 표시
            </Button>

            <Button
              onClick={() => {
                if (loadingToastDismiss) {
                  loadingToastDismiss();
                  setLoadingToastDismiss(null);
                  showSuccessToast('로딩 완료!');
                }
              }}
              variant="outline"
              className="w-full"
              disabled={!loadingToastDismiss}
            >
              로딩 Toast 닫기
            </Button>
          </CardContent>
        </Card>

        {/* Firebase 에러 Toast */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Firebase 에러 Toast</CardTitle>
            <CardDescription>Firebase 에러 메시지 테스트</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => showFirebaseErrorToast({ code: 'auth/user-not-found' })}
              className="w-full"
              variant="outline"
            >
              사용자 없음 에러
            </Button>

            <Button
              onClick={() => showFirebaseErrorToast({ code: 'auth/wrong-password' })}
              className="w-full"
              variant="outline"
            >
              비밀번호 오류
            </Button>

            <Button
              onClick={() => showFirebaseErrorToast({ code: 'auth/email-already-in-use' })}
              className="w-full"
              variant="outline"
            >
              이메일 중복 에러
            </Button>

            <Button
              onClick={() => showFirebaseErrorToast({ code: 'permission-denied' })}
              className="w-full"
              variant="outline"
            >
              권한 없음 에러
            </Button>
          </CardContent>
        </Card>

        {/* 연속 Toast */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">연속 Toast</CardTitle>
            <CardDescription>여러 Toast 동시 표시</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                showInfoToast('1단계', '프로세스 시작');
                setTimeout(() => showInfoToast('2단계', '데이터 처리 중'), 500);
                setTimeout(() => showInfoToast('3단계', '거의 완료'), 1000);
                setTimeout(() => showSuccessToast('완료!', '모든 작업이 완료되었습니다.'), 1500);
              }}
              className="w-full"
            >
              순차적 Toast 표시
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### 2.5 Toast 테스트 라우트 추가

**파일 수정**: `yoloseum-phase3-ui/src/App.tsx`

Import 추가:

```typescript
import { ToastTest } from '@/components/pages/ToastTest';
```

Routes에 추가:

```typescript
<Route path="/toast-test" element={<ToastTest />} />
```

### 2.6 Toast 시스템 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 접속
# http://localhost:5173/toast-test
```

**테스트 체크리스트:**

1. [ ] 성공 Toast가 초록색 배경으로 표시됨
2. [ ] 에러 Toast가 빨간색 배경으로 표시됨
3. [ ] 경고 Toast가 노란색 배경으로 표시됨
4. [ ] 정보 Toast가 파란색 배경으로 표시됨
5. [ ] 로딩 Toast가 자동으로 사라지지 않음
6. [ ] 로딩 Toast 닫기 버튼이 작동함
7. [ ] Firebase 에러 Toast가 사용자 친화적 메시지로 표시됨
8. [ ] 연속 Toast가 순차적으로 표시됨
9. [ ] Toast가 화면 우측 상단에 표시됨 (기본 위치)
10. [ ] Toast 애니메이션이 부드럽게 동작함

**예상 결과:**

```
✅ 성공 Toast 클릭 시:
- 제목: "성공!"
- 설명: "작업이 완료되었습니다."
- 배경색: 초록색 (bg-green-900)
- 위치: 화면 우측 상단
- 자동 사라짐: 5초 후

✅ Firebase 에러 Toast (auth/user-not-found) 클릭 시:
- 제목: "사용자를 찾을 수 없습니다"
- 설명: "이메일을 확인해주세요."
- 배경색: 빨간색 (bg-red-900)
```

---

## 3. Task 5: 로딩 상태 UI (Skeleton)

### 3.1 Skeleton 컴포넌트 확인

```bash
# Skeleton 컴포넌트 존재 확인
ls src/components/ui/skeleton.tsx
# 출력: src/components/ui/skeleton.tsx (존재함)
```

**파일 내용 확인**: `yoloseum-phase3-ui/src/components/ui/skeleton.tsx`

이미 shadcn/ui에서 설치된 Skeleton 컴포넌트가 있습니다.

### 3.2 페이지별 Skeleton 컴포넌트 생성

**파일 생성**: `yoloseum-phase3-ui/src/components/skeletons/DashboardSkeleton.tsx`

```typescript
/**
 * Dashboard 페이지 로딩 Skeleton
 *
 * Dashboard 페이지의 레이아웃과 동일한 Skeleton 구조
 * 데이터 로딩 중에 표시됨
 *
 * 의존성:
 * - @/components/ui/skeleton: shadcn/ui Skeleton 컴포넌트
 * - @/components/ui/card: 카드 레이아웃
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 헤더 Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-slate-700" />
        <Skeleton className="h-4 w-96 bg-slate-700" />
      </div>

      {/* 통계 카드 Skeleton (4개) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Skeleton className="h-4 w-24 bg-slate-700" />
              <Skeleton className="h-8 w-32 bg-slate-700 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-16 bg-slate-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 차트 영역 Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-slate-700" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-slate-700" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-slate-700" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-slate-700" />
          </CardContent>
        </Card>
      </div>

      {/* 테이블 Skeleton */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-slate-700" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-slate-700" />
                  <Skeleton className="h-3 w-48 bg-slate-700" />
                </div>
                <Skeleton className="h-4 w-20 bg-slate-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**파일 생성**: `yoloseum-phase3-ui/src/components/skeletons/LeaderboardSkeleton.tsx`

```typescript
/**
 * Leaderboard 페이지 로딩 Skeleton
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function LeaderboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-64 bg-slate-700" />
        <Skeleton className="h-4 w-96 bg-slate-700" />
      </div>

      {/* 필터 탭 */}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 bg-slate-700" />
        ))}
      </div>

      {/* 순위 리스트 */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* 순위 */}
                <Skeleton className="h-12 w-12 rounded-full bg-slate-700" />

                {/* 트레이더 정보 */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 bg-slate-700" />
                  <Skeleton className="h-3 w-32 bg-slate-700" />
                </div>

                {/* 통계 */}
                <div className="hidden md:flex gap-8">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-slate-700" />
                    <Skeleton className="h-4 w-20 bg-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-slate-700" />
                    <Skeleton className="h-4 w-20 bg-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-slate-700" />
                    <Skeleton className="h-4 w-20 bg-slate-700" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**파일 생성**: `yoloseum-phase3-ui/src/components/skeletons/TradersSkeleton.tsx`

```typescript
/**
 * Traders 페이지 로딩 Skeleton
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function TradersSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-64 bg-slate-700" />
        <Skeleton className="h-4 w-96 bg-slate-700" />
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-md bg-slate-700" />
        <Skeleton className="h-10 w-32 bg-slate-700" />
        <Skeleton className="h-10 w-32 bg-slate-700" />
      </div>

      {/* 트레이더 그리드 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32 bg-slate-700" />
                  <Skeleton className="h-3 w-24 bg-slate-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 통계 */}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-slate-700" />
                    <Skeleton className="h-4 w-20 bg-slate-700" />
                  </div>
                ))}
              </div>

              {/* 버튼 */}
              <Skeleton className="h-10 w-full bg-slate-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**파일 생성**: `yoloseum-phase3-ui/src/components/skeletons/StrategiesSkeleton.tsx`

```typescript
/**
 * Strategies 페이지 로딩 Skeleton
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function StrategiesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-64 bg-slate-700" />
        <Skeleton className="h-4 w-96 bg-slate-700" />
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-24 bg-slate-700" />
        ))}
      </div>

      {/* 전략 리스트 */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48 bg-slate-700" />
                  <Skeleton className="h-4 w-full max-w-2xl bg-slate-700" />
                </div>
                <Skeleton className="h-8 w-24 bg-slate-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-1">
                    <Skeleton className="h-3 w-20 bg-slate-700" />
                    <Skeleton className="h-5 w-24 bg-slate-700" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**파일 생성**: `yoloseum-phase3-ui/src/components/skeletons/PortfolioSkeleton.tsx`

```typescript
/**
 * Portfolio 페이지 로딩 Skeleton
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function PortfolioSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 헤더 */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 bg-slate-700" />
        <Skeleton className="h-4 w-96 bg-slate-700" />
      </div>

      {/* 포트폴리오 요약 카드 */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Skeleton className="h-4 w-24 bg-slate-700" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-32 bg-slate-700" />
              <Skeleton className="h-3 w-20 bg-slate-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 차트 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-slate-700" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full bg-slate-700" />
        </CardContent>
      </Card>

      {/* 투자 리스트 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-slate-700" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-slate-700 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 bg-slate-700" />
                  <Skeleton className="h-3 w-32 bg-slate-700" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-5 w-24 bg-slate-700 ml-auto" />
                  <Skeleton className="h-3 w-20 bg-slate-700 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**파일 생성**: `yoloseum-phase3-ui/src/components/skeletons/ProfileSkeleton.tsx`

```typescript
/**
 * Profile 페이지 로딩 Skeleton
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 프로필 헤더 */}
      <Card className="bg-slate-800 border-slate-700 mb-8">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full bg-slate-700" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48 bg-slate-700" />
              <Skeleton className="h-4 w-64 bg-slate-700" />
              <Skeleton className="h-4 w-32 bg-slate-700" />
            </div>
            <Skeleton className="h-10 w-32 bg-slate-700" />
          </div>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-20 bg-slate-700" />
              <Skeleton className="h-6 w-24 bg-slate-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 탭 */}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-32 bg-slate-700" />
        ))}
      </div>

      {/* 컨텐츠 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-slate-700" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 p-4 border border-slate-700 rounded-lg">
              <Skeleton className="h-5 w-full max-w-md bg-slate-700" />
              <Skeleton className="h-4 w-full bg-slate-700" />
              <Skeleton className="h-4 w-3/4 bg-slate-700" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3.3 Skeleton 컴포넌트 index 파일 생성

**파일 생성**: `yoloseum-phase3-ui/src/components/skeletons/index.ts`

```typescript
/**
 * Skeleton 컴포넌트 export 모음
 *
 * 모든 Skeleton 컴포넌트를 한 곳에서 import 할 수 있도록 re-export
 */

export { DashboardSkeleton } from './DashboardSkeleton';
export { LeaderboardSkeleton } from './LeaderboardSkeleton';
export { TradersSkeleton } from './TradersSkeleton';
export { StrategiesSkeleton } from './StrategiesSkeleton';
export { PortfolioSkeleton } from './PortfolioSkeleton';
export { ProfileSkeleton } from './ProfileSkeleton';
```

### 3.4 페이지에 로딩 상태 적용 예시

**파일 수정 예시**: `yoloseum-phase3-ui/src/components/pages/Dashboard.tsx`

기존 코드에 로딩 상태 추가:

```typescript
import { useState, useEffect } from 'react';
import { DashboardSkeleton } from '@/components/skeletons';

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Firebase에서 데이터 로딩
        // const result = await fetchDashboardData();
        // setData(result);

        // 임시: 2초 후 로딩 완료
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 실제 Dashboard 컨텐츠 */}
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      {/* ... 나머지 코드 ... */}
    </div>
  );
}
```

### 3.5 Skeleton 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 각 페이지 접속
# http://localhost:5173/dashboard
# http://localhost:5173/leaderboard
# http://localhost:5173/traders
# http://localhost:5173/strategies
# http://localhost:5173/portfolio
# http://localhost:5173/profile
```

**테스트 체크리스트:**

1. [ ] Dashboard Skeleton이 실제 레이아웃과 유사함
2. [ ] Leaderboard Skeleton이 순위 리스트 구조를 반영함
3. [ ] Traders Skeleton이 그리드 레이아웃을 반영함
4. [ ] Strategies Skeleton이 리스트 레이아웃을 반영함
5. [ ] Portfolio Skeleton이 차트와 투자 리스트를 반영함
6. [ ] Profile Skeleton이 프로필 헤더와 탭 구조를 반영함
7. [ ] Skeleton 애니메이션이 부드럽게 동작함 (pulse 효과)
8. [ ] 2초 후 실제 컨텐츠로 전환됨
9. [ ] 색상이 다크 테마와 일치함 (bg-slate-700)
10. [ ] 반응형 디자인이 모바일에서도 정상 작동함

---

## 4. Task 6: 에러 처리 개선

### 4.1 에러 핸들러 유틸리티 생성

**파일 생성**: `yoloseum-phase3-ui/src/utils/errorHandler.ts`

```typescript
/**
 * 에러 처리 유틸리티
 *
 * Firebase 에러, 네트워크 에러, 일반 에러를 처리하고
 * 사용자 친화적인 에러 메시지를 생성
 *
 * 의존성:
 * - firebase: Firebase SDK (에러 타입 확인용)
 */

import { FirebaseError } from 'firebase/app';

/**
 * 에러 타입 정의
 */
export type AppError = {
  code: string;
  message: string;
  title: string;
  userMessage: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
};

/**
 * Firebase 에러 코드를 사용자 친화적 메시지로 매핑
 */
const FIREBASE_ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  // Authentication 에러
  'auth/user-not-found': {
    title: '사용자를 찾을 수 없습니다',
    message: '등록되지 않은 이메일입니다. 이메일을 확인하거나 회원가입을 진행해주세요.',
  },
  'auth/wrong-password': {
    title: '비밀번호가 올바르지 않습니다',
    message: '입력하신 비밀번호가 일치하지 않습니다. 다시 시도해주세요.',
  },
  'auth/email-already-in-use': {
    title: '이미 사용 중인 이메일입니다',
    message: '다른 이메일 주소를 사용하거나 로그인을 진행해주세요.',
  },
  'auth/weak-password': {
    title: '비밀번호가 너무 약합니다',
    message: '6자 이상의 강력한 비밀번호를 사용해주세요.',
  },
  'auth/invalid-email': {
    title: '유효하지 않은 이메일입니다',
    message: '올바른 이메일 형식으로 입력해주세요.',
  },
  'auth/user-disabled': {
    title: '계정이 비활성화되었습니다',
    message: '관리자에게 문의해주세요.',
  },
  'auth/too-many-requests': {
    title: '너무 많은 요청',
    message: '잠시 후 다시 시도해주세요.',
  },
  'auth/network-request-failed': {
    title: '네트워크 오류',
    message: '인터넷 연결을 확인하고 다시 시도해주세요.',
  },
  'auth/invalid-credential': {
    title: '인증 정보가 유효하지 않습니다',
    message: '이메일과 비밀번호를 다시 확인해주세요.',
  },

  // Firestore 에러
  'permission-denied': {
    title: '권한이 없습니다',
    message: '이 작업을 수행할 권한이 없습니다. 로그인 상태를 확인해주세요.',
  },
  'not-found': {
    title: '데이터를 찾을 수 없습니다',
    message: '요청하신 데이터가 존재하지 않거나 삭제되었습니다.',
  },
  'already-exists': {
    title: '이미 존재하는 데이터입니다',
    message: '동일한 데이터가 이미 존재합니다.',
  },
  'resource-exhausted': {
    title: '할당량 초과',
    message: '일일 사용 한도를 초과했습니다. 내일 다시 시도해주세요.',
  },
  'failed-precondition': {
    title: '작업 조건이 충족되지 않았습니다',
    message: '필요한 조건을 확인하고 다시 시도해주세요.',
  },
  'aborted': {
    title: '작업이 중단되었습니다',
    message: '다시 시도해주세요.',
  },
  'out-of-range': {
    title: '범위를 벗어났습니다',
    message: '유효한 범위 내의 값을 입력해주세요.',
  },
  'unimplemented': {
    title: '지원하지 않는 기능입니다',
    message: '이 기능은 아직 구현되지 않았습니다.',
  },
  'internal': {
    title: '서버 내부 오류',
    message: '서버에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  'unavailable': {
    title: '서비스를 사용할 수 없습니다',
    message: '일시적인 문제입니다. 잠시 후 다시 시도해주세요.',
  },
  'data-loss': {
    title: '데이터 손실',
    message: '데이터가 손실되었습니다. 관리자에게 문의해주세요.',
  },
  'unauthenticated': {
    title: '인증되지 않았습니다',
    message: '로그인이 필요한 서비스입니다.',
  },
};

/**
 * 네트워크 에러 메시지
 */
const NETWORK_ERROR_MESSAGES = {
  title: '네트워크 오류',
  message: '인터넷 연결을 확인하고 다시 시도해주세요.',
};

/**
 * 기본 에러 메시지
 */
const DEFAULT_ERROR_MESSAGE = {
  title: '오류가 발생했습니다',
  message: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

/**
 * Firebase 에러인지 확인
 */
function isFirebaseError(error: any): error is FirebaseError {
  return error && typeof error === 'object' && 'code' in error && error.code.includes('/');
}

/**
 * 네트워크 에러인지 확인
 */
function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.code === 'ERR_NETWORK'
  );
}

/**
 * 에러 심각도 판단
 */
function getErrorSeverity(errorCode: string): AppError['severity'] {
  const criticalErrors = ['data-loss', 'internal', 'unauthenticated'];
  const warningErrors = ['permission-denied', 'resource-exhausted', 'too-many-requests'];

  if (criticalErrors.some((code) => errorCode.includes(code))) {
    return 'critical';
  }
  if (warningErrors.some((code) => errorCode.includes(code))) {
    return 'warning';
  }
  return 'error';
}

/**
 * 에러를 AppError 형태로 변환
 */
export function parseError(error: unknown): AppError {
  // Firebase 에러 처리
  if (isFirebaseError(error)) {
    const errorCode = error.code;
    const errorMessage = FIREBASE_ERROR_MESSAGES[errorCode] || DEFAULT_ERROR_MESSAGE;

    return {
      code: errorCode,
      message: error.message,
      title: errorMessage.title,
      userMessage: errorMessage.message,
      severity: getErrorSeverity(errorCode),
    };
  }

  // 네트워크 에러 처리
  if (isNetworkError(error)) {
    return {
      code: 'network-error',
      message: error instanceof Error ? error.message : 'Network error',
      title: NETWORK_ERROR_MESSAGES.title,
      userMessage: NETWORK_ERROR_MESSAGES.message,
      severity: 'warning',
    };
  }

  // 일반 Error 객체 처리
  if (error instanceof Error) {
    return {
      code: 'unknown',
      message: error.message,
      title: DEFAULT_ERROR_MESSAGE.title,
      userMessage: error.message || DEFAULT_ERROR_MESSAGE.message,
      severity: 'error',
    };
  }

  // 문자열 에러 처리
  if (typeof error === 'string') {
    return {
      code: 'unknown',
      message: error,
      title: DEFAULT_ERROR_MESSAGE.title,
      userMessage: error,
      severity: 'error',
    };
  }

  // 그 외 모든 경우
  return {
    code: 'unknown',
    message: JSON.stringify(error),
    title: DEFAULT_ERROR_MESSAGE.title,
    userMessage: DEFAULT_ERROR_MESSAGE.message,
    severity: 'error',
  };
}

/**
 * 에러 로깅 (개발 환경에서만)
 */
export function logError(error: AppError, context?: string) {
  if (import.meta.env.DEV) {
    console.group(`🔴 Error ${context ? `(${context})` : ''}`);
    console.error('Code:', error.code);
    console.error('Title:', error.title);
    console.error('Message:', error.message);
    console.error('User Message:', error.userMessage);
    console.error('Severity:', error.severity);
    console.groupEnd();
  }
}

/**
 * 에러 처리 헬퍼 함수
 * Toast와 함께 사용
 */
export function handleError(error: unknown, context?: string): AppError {
  const appError = parseError(error);
  logError(appError, context);
  return appError;
}
```

**코드 설명:**

1. **Firebase 에러 매핑**: 모든 Firebase 에러 코드를 사용자 친화적 메시지로 변환
2. **네트워크 에러 감지**: `TypeError`, `fetch` 에러를 네트워크 문제로 판단
3. **에러 심각도**: `info` < `warning` < `error` < `critical` (4단계)
4. **타입 가드**: `isFirebaseError()`, `isNetworkError()`로 에러 타입 안전하게 판단
5. **로깅**: 개발 환경에서만 콘솔에 상세 에러 정보 출력

### 4.2 ErrorBoundary 컴포넌트 생성

**파일 생성**: `yoloseum-phase3-ui/src/components/common/ErrorBoundary.tsx`

```typescript
/**
 * Error Boundary 컴포넌트
 *
 * React 컴포넌트 트리에서 발생하는 에러를 포착하여
 * 전체 앱이 크래시되는 것을 방지
 *
 * React 18+에서는 클래스 컴포넌트로만 구현 가능
 *
 * 의존성:
 * - react: React 18+
 * - @/components/ui/card: 에러 UI 카드
 * - @/components/ui/button: 재시도 버튼
 * - lucide-react: 아이콘
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary 클래스 컴포넌트
 *
 * 사용법:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * 에러 발생 시 호출되는 라이프사이클 메서드
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * 에러 정보를 받아 처리하는 라이프사이클 메서드
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 상태 업데이트
    this.setState({
      error,
      errorInfo,
    });

    // 부모 컴포넌트에서 제공한 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * 에러 상태 초기화 (재시도)
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * 홈으로 이동
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback UI가 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-900/20 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">
                    문제가 발생했습니다
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    죄송합니다. 예상치 못한 오류가 발생했습니다.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 에러 메시지 (개발 환경에서만 표시) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <p className="text-red-400 font-mono text-sm mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-slate-400 text-xs overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  다시 시도
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  홈으로 가기
                </Button>
              </div>

              {/* 도움말 */}
              <div className="text-center text-sm text-slate-400">
                <p>문제가 계속되면 페이지를 새로고침하거나</p>
                <p>관리자에게 문의해주세요.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 간단한 에러 메시지 컴포넌트
 * inline 에러 표시용
 */
export function ErrorMessage({
  error,
  onRetry
}: {
  error: string | Error;
  onRetry?: () => void;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="bg-red-900/10 border border-red-900/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-400 text-sm">{errorMessage}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-3 border-red-900/50 text-red-400 hover:bg-red-900/20"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              다시 시도
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 빈 상태 컴포넌트
 * 데이터가 없을 때 표시
 */
export function EmptyState({
  title = '데이터가 없습니다',
  description = '표시할 항목이 없습니다.',
  icon: Icon = AlertCircle,
}: {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
        <Icon className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
```

### 4.3 App.tsx에 ErrorBoundary 적용

**파일 수정**: `yoloseum-phase3-ui/src/App.tsx`

```typescript
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { showErrorToast } from '@/utils/toast-helpers';
import { handleError } from '@/utils/errorHandler';

// ... 기존 imports ...

export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 에러 발생 시 처리
        const appError = handleError(error, 'App');
        showErrorToast(appError.title, appError.userMessage);
      }}
    >
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### 4.4 페이지에 에러 처리 적용 예시

**파일 수정 예시**: `yoloseum-phase3-ui/src/components/pages/Dashboard.tsx`

```typescript
import { useState, useEffect } from 'react';
import { DashboardSkeleton } from '@/components/skeletons';
import { ErrorMessage } from '@/components/common/ErrorBoundary';
import { handleError } from '@/utils/errorHandler';
import { showErrorToast } from '@/utils/toast-helpers';

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Firebase에서 데이터 로딩
      // const result = await fetchDashboardData();
      // setData(result);

      // 임시: 2초 후 로딩 완료
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      const appError = handleError(err, 'Dashboard');
      setError(new Error(appError.userMessage));
      showErrorToast(appError.title, appError.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 로딩 상태
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // 에러 상태
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error={error} onRetry={loadData} />
      </div>
    );
  }

  // 정상 렌더링
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      {/* ... 나머지 코드 ... */}
    </div>
  );
}
```

### 4.5 에러 처리 테스트

**파일 생성**: `yoloseum-phase3-ui/src/components/pages/ErrorTest.tsx`

```typescript
/**
 * 에러 처리 테스트 페이지
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary, ErrorMessage, EmptyState } from '@/components/common/ErrorBoundary';
import { handleError } from '@/utils/errorHandler';
import { showErrorToast, showFirebaseErrorToast } from '@/utils/toast-helpers';
import { Inbox, AlertTriangle } from 'lucide-react';

function ErrorThrower() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('테스트 에러: 컴포넌트에서 에러가 발생했습니다!');
  }

  return (
    <Button onClick={() => setShouldThrow(true)} variant="destructive">
      컴포넌트 에러 발생시키기
    </Button>
  );
}

export function ErrorTest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">에러 처리 테스트</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ErrorBoundary 테스트 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">ErrorBoundary 테스트</CardTitle>
            <CardDescription>컴포넌트 에러 포착</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              <ErrorThrower />
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* Firebase 에러 테스트 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Firebase 에러 Toast</CardTitle>
            <CardDescription>Firebase 에러 처리</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => showFirebaseErrorToast({ code: 'permission-denied' })}
              className="w-full"
              variant="outline"
            >
              권한 없음 에러
            </Button>
            <Button
              onClick={() => showFirebaseErrorToast({ code: 'not-found' })}
              className="w-full"
              variant="outline"
            >
              데이터 없음 에러
            </Button>
            <Button
              onClick={() => showFirebaseErrorToast({ code: 'unavailable' })}
              className="w-full"
              variant="outline"
            >
              서비스 불가 에러
            </Button>
          </CardContent>
        </Card>

        {/* ErrorMessage 컴포넌트 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">ErrorMessage 컴포넌트</CardTitle>
            <CardDescription>Inline 에러 표시</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ErrorMessage
              error="파일을 업로드할 수 없습니다."
              onRetry={() => alert('재시도!')}
            />
            <ErrorMessage
              error={new Error('네트워크 연결이 끊어졌습니다.')}
            />
          </CardContent>
        </Card>

        {/* EmptyState 컴포넌트 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">EmptyState 컴포넌트</CardTitle>
            <CardDescription>빈 상태 표시</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="검색 결과가 없습니다"
              description="다른 검색어를 시도해보세요."
              icon={Inbox}
            />
          </CardContent>
        </Card>

        {/* handleError 유틸리티 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">handleError 유틸리티</CardTitle>
            <CardDescription>에러 파싱 및 로깅</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => {
                try {
                  throw new Error('일반 에러 테스트');
                } catch (err) {
                  const appError = handleError(err, 'ErrorTest');
                  showErrorToast(appError.title, appError.userMessage);
                }
              }}
              className="w-full"
              variant="outline"
            >
              일반 에러 처리
            </Button>
            <Button
              onClick={() => {
                try {
                  // Firebase 에러 시뮬레이션
                  const firebaseError = {
                    code: 'auth/invalid-email',
                    message: 'The email address is badly formatted.',
                  };
                  throw firebaseError;
                } catch (err) {
                  const appError = handleError(err, 'ErrorTest');
                  showErrorToast(appError.title, appError.userMessage);
                }
              }}
              className="w-full"
              variant="outline"
            >
              Firebase 에러 처리
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

테스트 라우트 추가 (`App.tsx`):

```typescript
import { ErrorTest } from '@/components/pages/ErrorTest';

// Routes에 추가
<Route path="/error-test" element={<ErrorTest />} />
```

---

## 5. 통합 테스트

### 5.1 TypeScript 타입 체크

```bash
cd yoloseum-phase3-ui

# TypeScript 컴파일 체크
npm run build

# 예상 출력:
# vite v7.1.7 building for production...
# ✓ 150 modules transformed.
# dist/index.html                   0.50 kB │ gzip:  0.30 kB
# dist/assets/index-[hash].css     12.34 kB │ gzip:  3.45 kB
# dist/assets/index-[hash].js     234.56 kB │ gzip: 78.90 kB
# ✓ built in 3.45s
```

**에러가 발생하면:**

```bash
# 타입 에러 확인
npx tsc --noEmit

# 예상 에러 예시:
# src/utils/toast-helpers.ts:15:5 - error TS2322: Type 'string' is not assignable to type 'number'.
```

### 5.2 ESLint 검사

```bash
npm run lint

# 예상 출력:
# ✔ No ESLint warnings or errors
```

**경고/에러가 있으면 수정:**

```bash
# 자동 수정 가능한 항목 수정
npx eslint . --fix
```

### 5.3 개발 서버 테스트

```bash
npm run dev

# 브라우저에서 접속
# http://localhost:5173/
```

**테스트 체크리스트:**

#### Toast 시스템
1. [ ] `/toast-test` 페이지에서 모든 Toast 타입 테스트
2. [ ] 성공/에러/경고/정보 Toast 색상 확인
3. [ ] 로딩 Toast가 수동으로만 닫히는지 확인
4. [ ] Firebase 에러 메시지가 사용자 친화적인지 확인

#### Skeleton 로딩
1. [ ] Dashboard 페이지 로딩 시 Skeleton 표시 확인
2. [ ] Leaderboard 페이지 로딩 시 Skeleton 표시 확인
3. [ ] Traders 페이지 로딩 시 Skeleton 표시 확인
4. [ ] Strategies 페이지 로딩 시 Skeleton 표시 확인
5. [ ] Portfolio 페이지 로딩 시 Skeleton 표시 확인
6. [ ] Profile 페이지 로딩 시 Skeleton 표시 확인
7. [ ] Skeleton 애니메이션 부드러움 확인

#### 에러 처리
1. [ ] `/error-test` 페이지에서 ErrorBoundary 테스트
2. [ ] 컴포넌트 에러 발생 시 전체 앱이 크래시되지 않는지 확인
3. [ ] ErrorMessage 컴포넌트가 올바르게 표시되는지 확인
4. [ ] EmptyState 컴포넌트가 올바르게 표시되는지 확인
5. [ ] handleError 유틸리티가 에러를 올바르게 파싱하는지 확인
6. [ ] 개발자 콘솔에 에러 로그가 출력되는지 확인

#### 통합 테스트
1. [ ] Dashboard에서 데이터 로딩 실패 시 ErrorMessage 표시
2. [ ] Leaderboard에서 네트워크 에러 시 Toast 표시
3. [ ] Traders 페이지에서 로딩 -> 에러 -> 재시도 플로우 확인
4. [ ] 모든 페이지에서 Toaster가 우측 상단에 표시되는지 확인

### 5.4 브라우저 콘솔 확인

```javascript
// 브라우저 개발자 도구 콘솔에서

// Toast 함수 테스트
import { showSuccessToast } from '@/utils/toast-helpers';
showSuccessToast('테스트', '콘솔에서 호출');

// 에러 핸들러 테스트
import { handleError } from '@/utils/errorHandler';
const error = new Error('테스트 에러');
const appError = handleError(error, 'Console');
console.log(appError);
```

**예상 콘솔 출력:**

```
🔴 Error (Console)
Code: unknown
Title: 오류가 발생했습니다
Message: 테스트 에러
User Message: 테스트 에러
Severity: error
```

---

## 6. 문제 해결 가이드

### 문제 1: Toast가 표시되지 않음

**증상:**
```typescript
showSuccessToast('성공!', '완료되었습니다.');
// Toast가 화면에 나타나지 않음
```

**원인:**
- `<Toaster />` 컴포넌트가 App.tsx에 추가되지 않음
- `use-toast.ts` 파일이 없거나 경로 오류

**해결:**

```bash
# 1. Toaster 컴포넌트 확인
ls src/components/ui/toaster.tsx

# 2. App.tsx 확인
grep -n "Toaster" src/App.tsx
# 출력: 3:import { Toaster } from '@/components/ui/toaster';
#       162:      <Toaster />

# 3. 없으면 추가
```

```typescript
// src/App.tsx
import { Toaster } from '@/components/ui/toaster';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster /> {/* 이 줄이 있어야 함 */}
    </AuthProvider>
  );
}
```

---

### 문제 2: Skeleton 애니메이션이 작동하지 않음

**증상:**
```typescript
<Skeleton className="h-8 w-48 bg-slate-700" />
// 회색 박스는 나타나지만 pulse 애니메이션 없음
```

**원인:**
- Tailwind CSS `animate-pulse` 유틸리티 누락
- `skeleton.tsx` 파일의 className 설정 오류

**해결:**

```bash
# skeleton.tsx 파일 확인
cat src/components/ui/skeleton.tsx
```

정상적인 skeleton.tsx:

```typescript
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-900/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

**확인 사항:**
- `animate-pulse` 클래스가 있는지 확인
- Tailwind CSS가 올바르게 빌드되었는지 확인

---

### 문제 3: ErrorBoundary가 에러를 포착하지 못함

**증상:**
```typescript
<ErrorBoundary>
  <ComponentThatThrowsError />
</ErrorBoundary>
// 에러가 발생하지만 ErrorBoundary UI가 표시되지 않음
```

**원인:**
- 비동기 에러는 ErrorBoundary가 포착하지 못함
- 이벤트 핸들러 내부의 에러는 포착하지 못함

**해결:**

```typescript
// ❌ 잘못된 예: 비동기 에러 (포착 안 됨)
function BadComponent() {
  useEffect(() => {
    setTimeout(() => {
      throw new Error('This will not be caught');
    }, 1000);
  }, []);

  return <div>Component</div>;
}

// ✅ 올바른 예: try-catch 사용
function GoodComponent() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 비동기 작업
        await someAsyncFunction();
      } catch (err) {
        setError(err); // 상태로 에러 관리
      }
    };

    loadData();
  }, []);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return <div>Component</div>;
}
```

**ErrorBoundary가 포착하는 에러:**
- 렌더링 중 발생하는 에러
- 라이프사이클 메서드 내부의 에러
- 자식 컴포넌트 생성자 내부의 에러

**ErrorBoundary가 포착하지 못하는 에러:**
- 이벤트 핸들러 (`onClick` 등)
- 비동기 코드 (`setTimeout`, `Promise`)
- 서버 사이드 렌더링 에러
- ErrorBoundary 자체에서 발생하는 에러

---

### 문제 4: import 경로 에러 (`Cannot find module '@/...'`)

**증상:**
```typescript
import { showSuccessToast } from '@/utils/toast-helpers';
// Error: Cannot find module '@/utils/toast-helpers'
```

**원인:**
- `@/` alias가 tsconfig.json에 설정되지 않음
- vite.config.ts에 alias 설정 누락

**해결:**

```bash
# 1. tsconfig.json 확인
cat tsconfig.json
```

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```bash
# 2. vite.config.ts 확인
cat vite.config.ts
```

```typescript
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**수정 후:**
```bash
# 개발 서버 재시작
npm run dev
```

---

### 문제 5: Firebase 에러 메시지가 영어로 표시됨

**증상:**
```typescript
showFirebaseErrorToast(error);
// Toast: "The email address is badly formatted."
// 한글 메시지가 표시되지 않음
```

**원인:**
- `errorHandler.ts`의 에러 코드 매핑이 잘못됨
- Firebase 에러 코드가 예상과 다름

**해결:**

```typescript
// 디버깅: 에러 코드 확인
try {
  // Firebase 작업
} catch (error) {
  console.log('Error code:', error.code); // 실제 에러 코드 확인
  console.log('Error message:', error.message);
  showFirebaseErrorToast(error);
}
```

**에러 코드 확인 후 `errorHandler.ts` 업데이트:**

```typescript
const FIREBASE_ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  // 확인한 에러 코드 추가
  'auth/your-new-error-code': {
    title: '한글 제목',
    message: '한글 설명',
  },
  // ... 기존 코드 ...
};
```

---

### 문제 6: TypeScript 에러 (`Type 'unknown' is not assignable to...`)

**증상:**
```bash
npm run build

# Error:
# src/components/pages/Dashboard.tsx:25:7 - error TS2322
# Type 'unknown' is not assignable to type 'Error | null'
```

**원인:**
- `catch (err)` 블록에서 `err`의 타입이 `unknown`
- TypeScript 4.4+에서는 catch 에러가 `unknown` 타입

**해결:**

```typescript
// ❌ 잘못된 예
try {
  // ...
} catch (err) {
  setError(err); // Type error!
}

// ✅ 올바른 예: handleError 사용
try {
  // ...
} catch (err) {
  const appError = handleError(err, 'Dashboard');
  setError(new Error(appError.userMessage));
}

// ✅ 올바른 예: 타입 가드 사용
try {
  // ...
} catch (err) {
  if (err instanceof Error) {
    setError(err);
  } else {
    setError(new Error('Unknown error'));
  }
}
```

---

### 문제 7: Toast가 너무 빨리 사라짐

**증상:**
```typescript
showInfoToast('알림', '중요한 메시지입니다.');
// 1초도 안 되어 사라짐
```

**원인:**
- `use-toast.ts`의 `TOAST_REMOVE_DELAY` 값이 너무 작음

**해결:**

```bash
# use-toast.ts 확인
grep -n "TOAST_REMOVE_DELAY" src/hooks/use-toast.ts
# 출력: 9:const TOAST_REMOVE_DELAY = 1000000
```

정상 값:
```typescript
const TOAST_REMOVE_DELAY = 5000; // 5초
```

**또는 개별 Toast에서 duration 지정:**

```typescript
toast({
  title: '알림',
  description: '이 메시지는 10초간 표시됩니다.',
  duration: 10000, // 10초
});
```

---

### 문제 8: 빌드 에러 (`vite build` 실패)

**증상:**
```bash
npm run build

# Error:
# [vite]: Rollup failed to resolve import "@/utils/toast-helpers"
```

**원인:**
- 파일이 실제로 존재하지 않음
- 파일 이름 대소문자 오류 (Windows는 구분 안 하지만 Linux는 구분)

**해결:**

```bash
# 1. 파일 존재 확인
ls src/utils/toast-helpers.ts
# 파일이 없으면: No such file or directory

# 2. 파일 생성 (위의 코드 복사)

# 3. 대소문자 확인
# 잘못된 예: src/utils/Toast-Helpers.ts
# 올바른 예: src/utils/toast-helpers.ts

# 4. 다시 빌드
npm run build
```

---

## 7. Git 커밋

### 7.1 변경 사항 확인

```bash
cd d:\jjumV\yoloseum-phase3-ui

# Git 상태 확인
git status

# 예상 출력:
# On branch main
# Untracked files:
#   src/utils/toast-helpers.ts
#   src/utils/errorHandler.ts
#   src/components/common/ErrorBoundary.tsx
#   src/components/skeletons/
#   src/components/pages/ToastTest.tsx
#   src/components/pages/ErrorTest.tsx
# Modified:
#   src/App.tsx
```

### 7.2 파일 추가

```bash
# 새 파일 추가
git add src/utils/toast-helpers.ts
git add src/utils/errorHandler.ts
git add src/components/common/ErrorBoundary.tsx
git add src/components/skeletons/
git add src/components/pages/ToastTest.tsx
git add src/components/pages/ErrorTest.tsx

# 수정된 파일 추가
git add src/App.tsx

# 또는 한 번에:
git add .
```

### 7.3 커밋

```bash
git commit -m "feat: Implement user feedback system (Day 3)

- Add Toast notification system with helper functions
  - Success, error, warning, info, loading toasts
  - Firebase error message mapping
  - Toast helper utilities in src/utils/toast-helpers.ts

- Add loading state UI with Skeleton components
  - DashboardSkeleton
  - LeaderboardSkeleton
  - TradersSkeleton
  - StrategiesSkeleton
  - PortfolioSkeleton
  - ProfileSkeleton

- Improve error handling
  - Error handler utilities in src/utils/errorHandler.ts
  - ErrorBoundary component for catching React errors
  - ErrorMessage and EmptyState components
  - Firebase error code to user-friendly message mapping

- Add test pages for Toast and Error systems
  - /toast-test: Test all Toast types
  - /error-test: Test ErrorBoundary and error handling

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 7.4 푸시 (선택)

```bash
# 원격 저장소에 푸시 (필요시)
git push origin main
```

---

## 완료 체크리스트

### Task 4: Toast 알림 시스템
- [ ] `src/utils/toast-helpers.ts` 파일 생성
- [ ] `App.tsx`에 `<Toaster />` 추가
- [ ] `ToastTest.tsx` 페이지 생성
- [ ] 모든 Toast 타입 테스트 완료
- [ ] Firebase 에러 메시지 한글화 확인

### Task 5: 로딩 상태 UI (Skeleton)
- [ ] `src/components/skeletons/DashboardSkeleton.tsx` 생성
- [ ] `src/components/skeletons/LeaderboardSkeleton.tsx` 생성
- [ ] `src/components/skeletons/TradersSkeleton.tsx` 생성
- [ ] `src/components/skeletons/StrategiesSkeleton.tsx` 생성
- [ ] `src/components/skeletons/PortfolioSkeleton.tsx` 생성
- [ ] `src/components/skeletons/ProfileSkeleton.tsx` 생성
- [ ] `src/components/skeletons/index.ts` 생성
- [ ] 모든 페이지에 로딩 상태 적용
- [ ] Skeleton 애니메이션 확인

### Task 6: 에러 처리 개선
- [ ] `src/utils/errorHandler.ts` 파일 생성
- [ ] `src/components/common/ErrorBoundary.tsx` 생성
- [ ] `ErrorMessage` 컴포넌트 생성
- [ ] `EmptyState` 컴포넌트 생성
- [ ] `App.tsx`에 ErrorBoundary 적용
- [ ] `ErrorTest.tsx` 페이지 생성
- [ ] 모든 에러 케이스 테스트 완료

### 통합 테스트
- [ ] `npm run build` 성공
- [ ] `npm run lint` 에러 없음
- [ ] 모든 페이지 로딩 확인
- [ ] Toast 시스템 정상 작동
- [ ] Skeleton 로딩 정상 작동
- [ ] 에러 처리 정상 작동
- [ ] 브라우저 콘솔 에러 없음

### Git
- [ ] 모든 파일 `git add`
- [ ] 커밋 메시지 작성
- [ ] 커밋 완료

---

## 참고 자료

### 공식 문서
- **Radix UI Toast**: https://www.radix-ui.com/primitives/docs/components/toast
- **shadcn/ui Skeleton**: https://ui.shadcn.com/docs/components/skeleton
- **React Error Boundaries**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- **Firebase 에러 코드**: https://firebase.google.com/docs/reference/js/auth#autherrorcodes

### 추가 학습
- **Toast 디자인 패턴**: https://uxdesign.cc/toast-notification-design-patterns-8f6c0f6a3c3e
- **Skeleton Screen 가이드**: https://www.nngroup.com/articles/skeleton-screens/
- **에러 처리 Best Practices**: https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react

### 코드 예시
- **Radix UI 예시**: https://github.com/radix-ui/primitives/tree/main/packages/react/toast
- **shadcn/ui 소스**: https://github.com/shadcn-ui/ui/tree/main/apps/www/registry

---

**Day 3 작업 완료!**

다음 단계: [TASK_INSTRUCTIONS_DAY4_ENHANCED.md](./TASK_INSTRUCTIONS_DAY4_ENHANCED.md)
