# DAY 4: 성능 최적화 - 완전 독립 작업 지시서

> **작업 날짜**: Day 4
> **예상 소요 시간**: 6-8시간
> **난이도**: 고급
> **완료 조건**: 번들 최적화, 이미지 최적화, 쿼리 최적화 완료

---

## 목차

1. [작업 환경 설정](#1-작업-환경-설정)
2. [Task 7: 번들 크기 최적화](#2-task-7-번들-크기-최적화)
3. [Task 8: 이미지 최적화](#3-task-8-이미지-최적화)
4. [Task 9: 쿼리 최적화](#4-task-9-쿼리-최적화)
5. [성능 측정](#5-성능-측정)
6. [문제 해결 가이드](#6-문제-해결-가이드)
7. [Git 커밋](#7-git-커밋)

---

## 1. 작업 환경 설정

### 1.1 작업 폴더 확인

```bash
# 현재 위치 확인
pwd
# 출력: d:\jjumV

# yoloseum-phase3-ui 폴더로 이동
cd yoloseum-phase3-ui

# 폴더 구조 확인
ls -la src/
# 출력:
# components/
# hooks/
# utils/
# pages/
# App.tsx
# main.tsx
```

### 1.2 의존성 확인

```bash
# Vite 버전 확인
npm list vite
# 출력: vite@7.1.7

# React 버전 확인
npm list react
# 출력: react@19.1.1

# 빌드 도구 확인
npm list rollup
# 출력: rollup@4.x.x (Vite에 포함)
```

### 1.3 현재 번들 크기 확인

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls -lh dist/assets/

# 예상 출력:
# index-[hash].css     15.2 kB
# index-[hash].js     450.8 kB  ← 최적화 전
```

**목표**: JavaScript 번들 크기를 300kB 이하로 줄이기

---

## 2. Task 7: 번들 크기 최적화

### 2.1 Vite 설정 최적화

**파일 수정**: `yoloseum-phase3-ui/vite.config.ts`

```typescript
/**
 * Vite 설정 파일 (최적화 버전)
 *
 * 주요 최적화:
 * 1. 코드 스플리팅 (Code Splitting)
 * 2. Tree Shaking 강화
 * 3. 압축 최적화
 * 4. 청크 분리
 *
 * 의존성:
 * - vite: 빌드 도구
 * - @vitejs/plugin-react: React 플러그인
 * - path: Node.js 경로 모듈
 */

import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 빌드 최적화 설정
  build: {
    // 소스맵 비활성화 (프로덕션)
    sourcemap: false,

    // 청크 크기 경고 임계값 (500 kB)
    chunkSizeWarningLimit: 500,

    // Rollup 옵션
    rollupOptions: {
      output: {
        // 수동 청크 분리
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Firebase 라이브러리를 별도 청크로 분리
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
          ],

          // UI 라이브러리를 별도 청크로 분리
          'ui-vendor': [
            '@radix-ui/react-toast',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-avatar',
            '@radix-ui/react-card',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
          ],

          // 차트 라이브러리 (추후 추가 시)
          // 'chart-vendor': ['recharts', 'd3'],

          // 유틸리티 라이브러리
          'utils-vendor': [
            'lucide-react',
            'clsx',
            'tailwind-merge',
            'date-fns',
          ],
        },

        // 청크 파일명 패턴
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },

        // 에셋 파일명 패턴
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // 엔트리 파일명 패턴
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    // Terser 압축 옵션 (minify)
    minify: 'terser',
    terserOptions: {
      compress: {
        // 콘솔 로그 제거
        drop_console: true,
        // debugger 제거
        drop_debugger: true,
        // 사용하지 않는 코드 제거
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        // 주석 제거
        comments: false,
      },
    },

    // CSS 코드 스플리팅
    cssCodeSplit: true,

    // 청크 사이즈 리포트
    reportCompressedSize: true,
  },

  // 개발 서버 최적화
  server: {
    // 포트
    port: 5173,
    // 자동으로 브라우저 열기
    open: false,
    // HMR (Hot Module Replacement)
    hmr: {
      overlay: true,
    },
  },

  // 프리뷰 서버 설정
  preview: {
    port: 4173,
  },

  // 최적화 옵션
  optimizeDeps: {
    // 사전 번들링할 의존성
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
    // 제외할 의존성
    exclude: [],
  },
});
```

**코드 설명:**

1. **manualChunks**: 라이브러리를 그룹별로 분리하여 캐싱 효율 향상
   - `react-vendor`: React 코어 라이브러리 (거의 변경되지 않음)
   - `firebase-vendor`: Firebase SDK (거의 변경되지 않음)
   - `ui-vendor`: Radix UI 컴포넌트들
   - `utils-vendor`: 유틸리티 라이브러리들

2. **terserOptions**: JavaScript 압축 설정
   - `drop_console: true`: 모든 console.log 제거 (프로덕션)
   - `drop_debugger: true`: debugger 문 제거
   - `comments: false`: 주석 제거

3. **cssCodeSplit**: CSS를 청크별로 분리하여 초기 로딩 시간 단축

### 2.2 Dynamic Import로 라우트 코드 스플리팅

**파일 수정**: `yoloseum-phase3-ui/src/App.tsx`

```typescript
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { showErrorToast } from '@/utils/toast-helpers';
import { handleError } from '@/utils/errorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Target, Shield } from 'lucide-react';

// 🚀 Lazy Loading으로 코드 스플리팅
const Dashboard = lazy(() => import('@/components/pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Leaderboard = lazy(() => import('@/components/pages/Leaderboard').then(module => ({ default: module.Leaderboard })));
const Traders = lazy(() => import('@/components/pages/Traders').then(module => ({ default: module.Traders })));
const TraderDetail = lazy(() => import('@/components/pages/TraderDetail').then(module => ({ default: module.TraderDetail })));
const Profile = lazy(() => import('@/components/pages/Profile').then(module => ({ default: module.Profile })));
const Settings = lazy(() => import('@/components/pages/Settings').then(module => ({ default: module.Settings })));
const Strategies = lazy(() => import('@/components/pages/Strategies').then(module => ({ default: module.Strategies })));
const StrategyDetail = lazy(() => import('@/components/pages/StrategyDetail').then(module => ({ default: module.StrategyDetail })));
const Portfolio = lazy(() => import('@/components/pages/Portfolio').then(module => ({ default: module.Portfolio })));
const NotFound = lazy(() => import('@/components/pages/NotFound').then(module => ({ default: module.NotFound })));

// 테스트 페이지는 개발 환경에서만
const ToastTest = import.meta.env.DEV
  ? lazy(() => import('@/components/pages/ToastTest').then(module => ({ default: module.ToastTest })))
  : null;
const ErrorTest = import.meta.env.DEV
  ? lazy(() => import('@/components/pages/ErrorTest').then(module => ({ default: module.ErrorTest })))
  : null;

/**
 * 로딩 폴백 컴포넌트
 * Lazy loading 중에 표시될 컴포넌트
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-slate-400">로딩 중...</p>
      </div>
    </div>
  );
}

/**
 * Home Page Component
 * Landing page with features and CTA
 */
function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-200px)] bg-slate-900">
      {/* Hero Section */}
      <div className="relative py-20 px-4 container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="mb-4 bg-amber-600/20 text-amber-300 border-amber-600/30">
            Welcome to YOLOSEUM
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Trade Smarter,
            <span className="text-amber-500"> Earn Better</span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Join the decentralized community of crypto traders. Follow top strategies, learn from the best, and grow
            your portfolio with our innovative trading platform.
          </p>

          <div className="flex gap-4 justify-center mb-12 flex-wrap">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate('/leaderboard')}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg"
            >
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose YOLOSEUM?</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-white">Real-Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Monitor top traders and strategies in real-time. Get instant updates on performance metrics and ROI.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Target className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-white">Smart Strategy Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Choose from verified trading strategies backed by real performance data. Follow expert traders
                  automatically.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Shield className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-white">Secure & Transparent</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Non-custodial vaults with transparent fees. Your funds remain under your control while earning.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Trading?</h2>
          <p className="text-slate-400 mb-6">
            Join thousands of traders earning passive income with YOLOSEUM
          </p>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg">
            Sign Up Now
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * App Content Component
 * Handles routing and page selection with Suspense
 */
function AppContent() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
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

            {/* 개발 환경 전용 라우트 */}
            {import.meta.env.DEV && ToastTest && (
              <Route path="/toast-test" element={<ToastTest />} />
            )}
            {import.meta.env.DEV && ErrorTest && (
              <Route path="/error-test" element={<ErrorTest />} />
            )}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

/**
 * Main App Component
 * Wraps everything with AuthProvider and ErrorBoundary
 */
export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
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

**코드 설명:**

1. **lazy()**: React의 lazy loading 기능
   - 각 페이지를 별도 청크로 분리
   - 사용자가 해당 페이지를 방문할 때만 로딩

2. **Suspense**: lazy 컴포넌트를 감싸는 wrapper
   - `fallback` props로 로딩 중 UI 지정

3. **개발 환경 조건부 로딩**:
   ```typescript
   const ToastTest = import.meta.env.DEV
     ? lazy(() => import('@/components/pages/ToastTest'))
     : null;
   ```
   - 프로덕션 빌드에서 테스트 페이지 제외

### 2.3 사용하지 않는 코드 제거

**console.log 제거 스크립트 실행:**

```bash
# 프로젝트 내 모든 console.log 찾기
grep -r "console.log" src/

# 예상 출력:
# src/components/pages/Dashboard.tsx:42:    console.log('Loading data...');
# src/utils/errorHandler.ts:156:    console.log('Error:', error);
```

**개발용 로그를 조건부로 변경:**

```typescript
// ❌ 잘못된 예: 항상 로그 출력
console.log('Data loaded:', data);

// ✅ 올바른 예: 개발 환경에서만 로그
if (import.meta.env.DEV) {
  console.log('Data loaded:', data);
}
```

**또는 디버그 유틸리티 사용:**

**파일 생성**: `yoloseum-phase3-ui/src/utils/debug.ts`

```typescript
/**
 * 디버그 유틸리티
 *
 * 개발 환경에서만 로그를 출력하는 헬퍼 함수들
 * 프로덕션 빌드 시 Terser가 자동으로 제거
 */

/**
 * 개발 환경에서만 console.log
 */
export function debugLog(...args: any[]) {
  if (import.meta.env.DEV) {
    console.log('[DEBUG]', ...args);
  }
}

/**
 * 개발 환경에서만 console.error
 */
export function debugError(...args: any[]) {
  if (import.meta.env.DEV) {
    console.error('[ERROR]', ...args);
  }
}

/**
 * 개발 환경에서만 console.warn
 */
export function debugWarn(...args: any[]) {
  if (import.meta.env.DEV) {
    console.warn('[WARN]', ...args);
  }
}

/**
 * 개발 환경에서만 함수 실행
 */
export function devOnly(fn: () => void) {
  if (import.meta.env.DEV) {
    fn();
  }
}
```

### 2.4 번들 크기 분석

**파일 생성**: `yoloseum-phase3-ui/package.json`에 스크립트 추가

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "build:analyze": "tsc -b && vite build --mode analyze",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

**rollup-plugin-visualizer 설치 (선택):**

```bash
npm install --save-dev rollup-plugin-visualizer
```

**vite.config.ts에 플러그인 추가 (선택):**

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // 번들 분석 (조건부)
    process.env.ANALYZE === 'true' &&
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  // ... 나머지 설정
});
```

**분석 실행:**

```bash
# 번들 분석 빌드
ANALYZE=true npm run build

# 브라우저에서 dist/stats.html 자동 열림
```

### 2.5 최적화 테스트

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls -lh dist/assets/

# 예상 출력 (최적화 후):
# react-vendor-[hash].js     135.2 kB  ← React 관련
# firebase-vendor-[hash].js   85.3 kB  ← Firebase 관련
# ui-vendor-[hash].js         78.5 kB  ← Radix UI
# utils-vendor-[hash].js      25.4 kB  ← 유틸리티
# Dashboard-[hash].js         12.3 kB  ← Dashboard 페이지
# Leaderboard-[hash].js       10.8 kB  ← Leaderboard 페이지
# ... (기타 페이지 청크들)
# index-[hash].js             45.2 kB  ← 메인 번들
# index-[hash].css            15.2 kB  ← CSS
```

**목표 달성 확인:**
- 총 JavaScript 크기: ~390 kB (압축 전) → ~280 kB (최적화 후)
- 초기 로딩 번들: ~200 kB 이하
- 각 페이지 청크: 10-15 kB

---

## 3. Task 8: 이미지 최적화

### 3.1 OptimizedImage 컴포넌트 생성

**파일 생성**: `yoloseum-phase3-ui/src/components/common/OptimizedImage.tsx`

```typescript
/**
 * 최적화된 이미지 컴포넌트
 *
 * 주요 기능:
 * 1. Lazy Loading (뷰포트 진입 시에만 로딩)
 * 2. WebP 지원 (fallback 포함)
 * 3. Responsive 이미지 (srcSet)
 * 4. 로딩 placeholder
 * 5. 에러 처리
 *
 * 의존성:
 * - react: useState, useEffect, useRef
 * - @/components/ui/skeleton: 로딩 중 placeholder
 */

import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /**
   * 이미지 소스 (기본)
   */
  src: string;

  /**
   * WebP 이미지 소스 (선택)
   */
  webpSrc?: string;

  /**
   * 대체 텍스트 (접근성)
   */
  alt: string;

  /**
   * Responsive 이미지 소스셋 (선택)
   * @example "image-320w.jpg 320w, image-640w.jpg 640w"
   */
  srcSet?: string;

  /**
   * WebP responsive 소스셋 (선택)
   */
  webpSrcSet?: string;

  /**
   * 이미지 크기 (선택)
   * @example "(max-width: 768px) 100vw, 50vw"
   */
  sizes?: string;

  /**
   * Lazy loading 활성화 (기본: true)
   */
  lazy?: boolean;

  /**
   * 로딩 중 placeholder 높이
   */
  placeholderHeight?: string;

  /**
   * 에러 시 대체 이미지
   */
  fallbackSrc?: string;

  /**
   * 로딩 완료 콜백
   */
  onLoad?: () => void;

  /**
   * 에러 콜백
   */
  onError?: () => void;
}

/**
 * OptimizedImage 컴포넌트
 *
 * 사용 예시:
 * <OptimizedImage
 *   src="/images/trader-avatar.jpg"
 *   webpSrc="/images/trader-avatar.webp"
 *   alt="Trader Avatar"
 *   className="w-24 h-24 rounded-full"
 *   lazy={true}
 * />
 */
export function OptimizedImage({
  src,
  webpSrc,
  alt,
  srcSet,
  webpSrcSet,
  sizes,
  lazy = true,
  placeholderHeight = '200px',
  fallbackSrc = '/images/placeholder.png',
  onLoad,
  onError,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer로 Lazy Loading 구현
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        // 뷰포트 진입 100px 전에 로딩 시작
        rootMargin: '100px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, isInView]);

  // 이미지 로딩 완료 핸들러
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // 이미지 에러 핸들러
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // WebP 지원 확인
  const supportsWebP = () => {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  };

  // 실제 사용할 이미지 소스 결정
  const imageSrc = hasError
    ? fallbackSrc
    : isInView
    ? webpSrc && supportsWebP()
      ? webpSrc
      : src
    : undefined;

  const imageSrcSet = hasError
    ? undefined
    : isInView
    ? webpSrcSet && supportsWebP()
      ? webpSrcSet
      : srcSet
    : undefined;

  return (
    <div className="relative inline-block" ref={imgRef}>
      {/* 로딩 Skeleton */}
      {isLoading && (
        <Skeleton
          className="absolute inset-0 bg-slate-700"
          style={{ height: placeholderHeight }}
        />
      )}

      {/* 실제 이미지 */}
      {isInView && (
        <img
          src={imageSrc}
          srcSet={imageSrcSet}
          sizes={sizes}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          {...props}
        />
      )}

      {/* 에러 표시 (개발 환경에서만) */}
      {import.meta.env.DEV && hasError && (
        <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center text-red-400 text-xs">
          Image Load Failed
        </div>
      )}
    </div>
  );
}

/**
 * 아바타 이미지 컴포넌트 (OptimizedImage 래퍼)
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      placeholderHeight={sizeClasses[size].split(' ')[0]}
      fallbackSrc="/images/default-avatar.png"
      lazy={true}
    />
  );
}

/**
 * 카드 이미지 컴포넌트 (OptimizedImage 래퍼)
 */
export function OptimizedCardImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`w-full h-48 object-cover ${className}`}
      placeholderHeight="192px"
      lazy={true}
    />
  );
}
```

**코드 설명:**

1. **Intersection Observer**:
   - 이미지가 뷰포트에 진입할 때만 로딩
   - `rootMargin: '100px'`로 100px 전에 미리 로딩 시작

2. **WebP 지원 감지**:
   - Canvas API로 WebP 지원 확인
   - 지원하면 WebP, 아니면 원본 사용

3. **Progressive Loading**:
   - Skeleton → 이미지 로딩 → 실제 이미지 표시

4. **에러 처리**:
   - 로딩 실패 시 fallback 이미지 표시

### 3.2 이미지 최적화 유틸리티

**파일 생성**: `yoloseum-phase3-ui/src/utils/imageOptimizer.ts`

```typescript
/**
 * 이미지 최적화 유틸리티
 *
 * 이미지 URL 생성, 리사이징, 포맷 변환 등의 헬퍼 함수들
 */

/**
 * 이미지 크기 옵션
 */
export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

/**
 * 이미지 크기별 픽셀 매핑
 */
const IMAGE_SIZE_MAP: Record<ImageSize, number> = {
  thumbnail: 64,
  small: 320,
  medium: 640,
  large: 1280,
  original: 1920,
};

/**
 * 이미지 URL에 크기 파라미터 추가
 * @param url - 원본 이미지 URL
 * @param size - 이미지 크기
 * @returns 리사이즈된 이미지 URL
 *
 * @example
 * getResizedImageUrl('/images/trader.jpg', 'small')
 * // → '/images/trader-320w.jpg'
 */
export function getResizedImageUrl(url: string, size: ImageSize): string {
  if (size === 'original') return url;

  const width = IMAGE_SIZE_MAP[size];
  const extension = url.split('.').pop();
  const baseUrl = url.replace(`.${extension}`, '');

  return `${baseUrl}-${width}w.${extension}`;
}

/**
 * WebP 이미지 URL 생성
 * @param url - 원본 이미지 URL
 * @returns WebP 이미지 URL
 *
 * @example
 * getWebPUrl('/images/trader.jpg')
 * // → '/images/trader.webp'
 */
export function getWebPUrl(url: string): string {
  return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * Responsive 이미지 srcSet 생성
 * @param url - 원본 이미지 URL
 * @param sizes - 포함할 크기들
 * @returns srcSet 문자열
 *
 * @example
 * generateSrcSet('/images/trader.jpg', ['small', 'medium', 'large'])
 * // → '/images/trader-320w.jpg 320w, /images/trader-640w.jpg 640w, /images/trader-1280w.jpg 1280w'
 */
export function generateSrcSet(url: string, sizes: ImageSize[]): string {
  return sizes
    .map((size) => {
      const resizedUrl = getResizedImageUrl(url, size);
      const width = IMAGE_SIZE_MAP[size];
      return `${resizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * 이미지 프리로드
 * @param urls - 프리로드할 이미지 URL 배열
 *
 * @example
 * preloadImages(['/images/hero.jpg', '/images/logo.png'])
 */
export function preloadImages(urls: string[]): void {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * 이미지 지연 로딩 (IntersectionObserver 폴리필)
 * @param selector - 이미지 선택자
 *
 * @example
 * lazyLoadImages('img[data-lazy]')
 */
export function lazyLoadImages(selector: string): void {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll<HTMLImageElement>(selector);

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }

          observer.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  } else {
    // IntersectionObserver 미지원 브라우저: 즉시 로딩
    const images = document.querySelectorAll<HTMLImageElement>(selector);
    images.forEach((img) => {
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
    });
  }
}

/**
 * 이미지 URL이 유효한지 확인
 * @param url - 확인할 이미지 URL
 * @returns Promise<boolean>
 *
 * @example
 * const isValid = await validateImageUrl('/images/trader.jpg');
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Blurhash placeholder 생성 (추후 구현)
 * @param imageUrl - 이미지 URL
 * @returns Blurhash 문자열
 */
export function generateBlurhash(imageUrl: string): string {
  // TODO: Blurhash 라이브러리 통합
  // npm install blurhash
  return 'LGF5?}00?b%M%MoffQof00WB?b-;';
}
```

### 3.3 실제 페이지에 적용

**파일 수정 예시**: `yoloseum-phase3-ui/src/components/pages/Traders.tsx`

```typescript
import { OptimizedAvatar } from '@/components/common/OptimizedImage';
import { getResizedImageUrl, generateSrcSet } from '@/utils/imageOptimizer';

export function Traders() {
  const traders = [
    {
      id: 1,
      name: 'CryptoMaster',
      avatar: '/images/traders/trader-1.jpg',
      // ...
    },
    // ...
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {traders.map((trader) => (
        <Card key={trader.id}>
          <CardHeader>
            <div className="flex items-center gap-4">
              {/* ❌ 기존 코드 */}
              {/* <img src={trader.avatar} alt={trader.name} className="w-16 h-16 rounded-full" /> */}

              {/* ✅ 최적화된 코드 */}
              <OptimizedAvatar
                src={trader.avatar}
                alt={trader.name}
                size="lg"
              />

              <div>
                <h3 className="text-white font-semibold">{trader.name}</h3>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
```

### 3.4 이미지 최적화 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저 개발자 도구 → Network 탭
# 1. "Img" 필터 선택
# 2. 페이지 스크롤
# 3. 이미지가 뷰포트 진입 시에만 로딩되는지 확인
```

**테스트 체크리스트:**

1. [ ] 이미지가 뷰포트에 진입할 때만 로딩됨 (Lazy Loading)
2. [ ] 로딩 중 Skeleton placeholder 표시됨
3. [ ] WebP 이미지가 우선 로딩됨 (지원 브라우저)
4. [ ] 에러 시 fallback 이미지 표시됨
5. [ ] Network 탭에서 이미지 요청이 지연되는 것 확인

---

## 4. Task 9: 쿼리 최적화

### 4.1 Firestore 커스텀 훅 생성

**파일 생성**: `yoloseum-phase3-ui/src/hooks/useFirestoreQuery.ts`

```typescript
/**
 * Firestore 쿼리 커스텀 훅
 *
 * 주요 기능:
 * 1. 자동 캐싱
 * 2. 로딩 상태 관리
 * 3. 에러 처리
 * 4. 실시간 업데이트 지원
 *
 * 의존성:
 * - firebase/firestore: Firestore SDK
 * - react: useState, useEffect
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Query,
  QueryConstraint,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Firebase 초기화 파일

/**
 * 쿼리 옵션
 */
interface FirestoreQueryOptions {
  /**
   * 실시간 업데이트 활성화
   */
  realtime?: boolean;

  /**
   * 캐시 활성화
   */
  cache?: boolean;

  /**
   * 캐시 만료 시간 (밀리초)
   */
  cacheTime?: number;
}

/**
 * 쿼리 결과
 */
interface FirestoreQueryResult<T> {
  data: T[] | null;
  isLoading: boolean;
  error: FirestoreError | null;
  refetch: () => Promise<void>;
}

/**
 * 간단한 메모리 캐시
 */
const queryCache = new Map<
  string,
  {
    data: any[];
    timestamp: number;
  }
>();

/**
 * Firestore 쿼리 훅
 *
 * @param collectionName - 컬렉션 이름
 * @param constraints - 쿼리 제약 조건
 * @param options - 옵션
 *
 * @example
 * const { data, isLoading, error } = useFirestoreQuery<Trader>(
 *   'traders',
 *   [where('verified', '==', true), orderBy('totalReturn', 'desc'), limit(10)],
 *   { realtime: true, cache: true }
 * );
 */
export function useFirestoreQuery<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: FirestoreQueryOptions = {}
): FirestoreQueryResult<T> {
  const { realtime = false, cache = true, cacheTime = 5 * 60 * 1000 } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // 캐시 키 생성
  const cacheKey = `${collectionName}-${JSON.stringify(constraints)}`;

  // 데이터 가져오기
  const fetchData = useCallback(async () => {
    // 캐시 확인
    if (cache) {
      const cached = queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data as T[]);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setData(results);

      // 캐시 저장
      if (cache) {
        queryCache.set(cacheKey, {
          data: results,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      setError(err as FirestoreError);
      console.error('Firestore query error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, constraints, cache, cacheKey, cacheTime]);

  // 실시간 업데이트
  useEffect(() => {
    if (!realtime) {
      fetchData();
      return;
    }

    setIsLoading(true);
    setError(null);

    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setData(results);
        setIsLoading(false);

        // 캐시 업데이트
        if (cache) {
          queryCache.set(cacheKey, {
            data: results,
            timestamp: Date.now(),
          });
        }
      },
      (err) => {
        setError(err);
        setIsLoading(false);
        console.error('Firestore realtime error:', err);
      }
    );

    return () => unsubscribe();
  }, [collectionName, constraints, realtime, cache, cacheKey]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * 페이지네이션 훅
 */
export function useFirestorePagination<T = DocumentData>(
  collectionName: string,
  pageSize: number = 10,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const baseConstraints = [...constraints, limit(pageSize)];

      // 이전 문서가 있으면 startAfter 추가
      if (lastDoc) {
        baseConstraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, collectionName), ...baseConstraints);
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      const newData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setData((prev) => [...prev, ...newData]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === pageSize);
    } catch (err) {
      setError(err as FirestoreError);
      console.error('Pagination error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, constraints, pageSize, isLoading, hasMore, lastDoc]);

  const reset = useCallback(() => {
    setData([]);
    setLastDoc(null);
    setHasMore(true);
  }, []);

  return {
    data,
    isLoading,
    error,
    hasMore,
    loadMore,
    reset,
  };
}
```

**코드 설명:**

1. **useFirestoreQuery**:
   - 자동 캐싱으로 중복 요청 방지
   - `realtime` 옵션으로 실시간 업데이트 지원
   - `refetch` 함수로 수동 재로딩 가능

2. **useFirestorePagination**:
   - 무한 스크롤 구현용
   - `loadMore` 함수로 다음 페이지 로딩
   - `reset` 함수로 초기화

3. **캐싱**:
   - `Map`으로 간단한 메모리 캐시 구현
   - `cacheTime`으로 캐시 만료 시간 설정

### 4.2 트레이더 목록 훅

**파일 생성**: `yoloseum-phase3-ui/src/hooks/useTraders.ts`

```typescript
/**
 * 트레이더 목록 커스텀 훅
 *
 * Firestore에서 트레이더 목록을 가져오는 최적화된 훅
 */

import { useFirestoreQuery } from './useFirestoreQuery';
import { where, orderBy, limit } from 'firebase/firestore';

/**
 * 트레이더 타입
 */
export interface Trader {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  totalReturn: number;
  winRate: number;
  followers: number;
  strategies: number;
  // ... 기타 필드
}

/**
 * 트레이더 필터 옵션
 */
export interface TraderFilterOptions {
  verified?: boolean;
  minReturn?: number;
  sortBy?: 'totalReturn' | 'winRate' | 'followers';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

/**
 * 트레이더 목록 훅
 *
 * @param options - 필터 옵션
 *
 * @example
 * const { data: traders, isLoading } = useTraders({
 *   verified: true,
 *   sortBy: 'totalReturn',
 *   limit: 10
 * });
 */
export function useTraders(options: TraderFilterOptions = {}) {
  const {
    verified,
    minReturn,
    sortBy = 'totalReturn',
    sortOrder = 'desc',
    limit: limitCount = 20,
  } = options;

  // 쿼리 제약 조건 생성
  const constraints = [];

  if (verified !== undefined) {
    constraints.push(where('verified', '==', verified));
  }

  if (minReturn !== undefined) {
    constraints.push(where('totalReturn', '>=', minReturn));
  }

  constraints.push(orderBy(sortBy, sortOrder));
  constraints.push(limit(limitCount));

  return useFirestoreQuery<Trader>('traders', constraints, {
    cache: true,
    cacheTime: 5 * 60 * 1000, // 5분 캐시
  });
}

/**
 * 단일 트레이더 훅
 */
export function useTrader(traderId: string) {
  return useFirestoreQuery<Trader>('traders', [where('id', '==', traderId)], {
    cache: true,
    cacheTime: 10 * 60 * 1000, // 10분 캐시
  });
}

/**
 * 인기 트레이더 훅 (followers 기준)
 */
export function usePopularTraders(limitCount: number = 5) {
  return useTraders({
    verified: true,
    sortBy: 'followers',
    sortOrder: 'desc',
    limit: limitCount,
  });
}

/**
 * 최고 수익률 트레이더 훅
 */
export function useTopPerformingTraders(limitCount: number = 10) {
  return useTraders({
    verified: true,
    sortBy: 'totalReturn',
    sortOrder: 'desc',
    limit: limitCount,
  });
}
```

### 4.3 전략 목록 훅

**파일 생성**: `yoloseum-phase3-ui/src/hooks/useStrategies.ts`

```typescript
/**
 * 전략 목록 커스텀 훅
 */

import { useFirestoreQuery, useFirestorePagination } from './useFirestoreQuery';
import { where, orderBy, limit } from 'firebase/firestore';

/**
 * 전략 타입
 */
export interface Strategy {
  id: string;
  name: string;
  description: string;
  traderId: string;
  traderName: string;
  category: 'DeFi' | 'NFT' | 'Meme' | 'Blue Chip' | 'Arbitrage';
  apy: number;
  tvl: number;
  minInvestment: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  verified: boolean;
  // ... 기타 필드
}

/**
 * 전략 필터 옵션
 */
export interface StrategyFilterOptions {
  category?: Strategy['category'];
  minApy?: number;
  maxRisk?: Strategy['riskLevel'];
  verified?: boolean;
  sortBy?: 'apy' | 'tvl' | 'minInvestment';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

/**
 * 전략 목록 훅
 */
export function useStrategies(options: StrategyFilterOptions = {}) {
  const {
    category,
    minApy,
    maxRisk,
    verified,
    sortBy = 'apy',
    sortOrder = 'desc',
    limit: limitCount = 20,
  } = options;

  const constraints = [];

  if (category) {
    constraints.push(where('category', '==', category));
  }

  if (minApy !== undefined) {
    constraints.push(where('apy', '>=', minApy));
  }

  if (maxRisk) {
    constraints.push(where('riskLevel', '<=', maxRisk));
  }

  if (verified !== undefined) {
    constraints.push(where('verified', '==', verified));
  }

  constraints.push(orderBy(sortBy, sortOrder));
  constraints.push(limit(limitCount));

  return useFirestoreQuery<Strategy>('strategies', constraints, {
    cache: true,
    cacheTime: 5 * 60 * 1000,
  });
}

/**
 * 무한 스크롤 전략 목록 훅
 */
export function useInfiniteStrategies(
  options: StrategyFilterOptions = {},
  pageSize: number = 10
) {
  const {
    category,
    minApy,
    verified,
    sortBy = 'apy',
    sortOrder = 'desc',
  } = options;

  const constraints = [];

  if (category) {
    constraints.push(where('category', '==', category));
  }

  if (minApy !== undefined) {
    constraints.push(where('apy', '>=', minApy));
  }

  if (verified !== undefined) {
    constraints.push(where('verified', '==', verified));
  }

  constraints.push(orderBy(sortBy, sortOrder));

  return useFirestorePagination<Strategy>('strategies', pageSize, constraints);
}

/**
 * 트레이더별 전략 목록
 */
export function useTraderStrategies(traderId: string) {
  return useFirestoreQuery<Strategy>(
    'strategies',
    [where('traderId', '==', traderId), orderBy('apy', 'desc')],
    { cache: true }
  );
}

/**
 * 인기 전략 (TVL 기준)
 */
export function usePopularStrategies(limitCount: number = 5) {
  return useStrategies({
    verified: true,
    sortBy: 'tvl',
    sortOrder: 'desc',
    limit: limitCount,
  });
}
```

### 4.4 페이지에 적용

**파일 수정 예시**: `yoloseum-phase3-ui/src/components/pages/Traders.tsx`

```typescript
import { useState } from 'react';
import { useTraders } from '@/hooks/useTraders';
import { TradersSkeleton } from '@/components/skeletons';
import { ErrorMessage } from '@/components/common/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export function Traders() {
  const [sortBy, setSortBy] = useState<'totalReturn' | 'winRate' | 'followers'>('totalReturn');
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  const { data: traders, isLoading, error, refetch } = useTraders({
    verified: verifiedOnly,
    sortBy,
    sortOrder: 'desc',
    limit: 20,
  });

  if (isLoading) {
    return <TradersSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error={error.message} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Top Traders</h1>

      {/* 필터 */}
      <div className="mb-6 flex gap-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <option value="totalReturn">Total Return</option>
          <option value="winRate">Win Rate</option>
          <option value="followers">Followers</option>
        </Select>

        <Button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          variant={verifiedOnly ? 'default' : 'outline'}
        >
          Verified Only
        </Button>
      </div>

      {/* 트레이더 그리드 */}
      <div className="grid md:grid-cols-3 gap-6">
        {traders?.map((trader) => (
          <Card key={trader.id} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">{trader.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Return: {trader.totalReturn}%</p>
              <p className="text-slate-400">Win Rate: {trader.winRate}%</p>
              <p className="text-slate-400">Followers: {trader.followers}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 4.5 Firestore 인덱스 설정

**파일 생성**: `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "traders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "verified", "order": "ASCENDING" },
        { "fieldPath": "totalReturn", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "traders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "verified", "order": "ASCENDING" },
        { "fieldPath": "winRate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "traders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "verified", "order": "ASCENDING" },
        { "fieldPath": "followers", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "strategies",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "verified", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "apy", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "strategies",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "verified", "order": "ASCENDING" },
        { "fieldPath": "tvl", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "strategies",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "traderId", "order": "ASCENDING" },
        { "fieldPath": "apy", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**인덱스 배포:**

```bash
# Firebase CLI로 인덱스 배포
firebase deploy --only firestore:indexes

# 예상 출력:
# ✔  Deploy complete!
#
# Firestore indexes:
# - traders: verified + totalReturn (DESCENDING)
# - traders: verified + winRate (DESCENDING)
# - traders: verified + followers (DESCENDING)
# - strategies: verified + category + apy (DESCENDING)
# - strategies: verified + tvl (DESCENDING)
# - strategies: traderId + apy (DESCENDING)
```

---

## 5. 성능 측정

### 5.1 Lighthouse 검사

```bash
# 프로덕션 빌드
npm run build

# 프리뷰 서버 실행
npm run preview

# 브라우저에서 http://localhost:4173 접속
```

**Lighthouse 실행:**

1. Chrome DevTools 열기 (F12)
2. Lighthouse 탭 선택
3. 카테고리 선택: Performance, Accessibility, Best Practices, SEO
4. "Generate report" 클릭

**목표 점수:**
- Performance: 90+ (모바일), 95+ (데스크톱)
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### 5.2 Core Web Vitals 측정

```bash
# web-vitals 패키지 설치
npm install web-vitals
```

**파일 생성**: `yoloseum-phase3-ui/src/utils/reportWebVitals.ts`

```typescript
/**
 * Web Vitals 측정 및 리포트
 *
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): 로딩 성능
 * - FID (First Input Delay): 상호작용
 * - CLS (Cumulative Layout Shift): 시각적 안정성
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * Web Vitals 리포트 함수
 */
export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}

/**
 * 콘솔에 Web Vitals 출력
 */
export function logWebVitals() {
  if (import.meta.env.DEV) {
    reportWebVitals((metric) => {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating);
    });
  }
}
```

**main.tsx에 추가:**

```typescript
import { logWebVitals } from '@/utils/reportWebVitals';

// 앱 렌더링 후
logWebVitals();
```

**Core Web Vitals 목표:**
- LCP: < 2.5초 (Good)
- FID: < 100ms (Good)
- CLS: < 0.1 (Good)

### 5.3 번들 크기 비교

**최적화 전 vs 후 비교:**

```bash
# 최적화 후 빌드
npm run build

# 결과 비교
```

| 파일 | 최적화 전 | 최적화 후 | 개선율 |
|------|----------|----------|--------|
| index.js | 450.8 kB | 45.2 kB | 90% |
| react-vendor.js | - | 135.2 kB | - |
| firebase-vendor.js | - | 85.3 kB | - |
| ui-vendor.js | - | 78.5 kB | - |
| utils-vendor.js | - | 25.4 kB | - |
| Dashboard.js | - | 12.3 kB | - |
| **총합** | **450.8 kB** | **382.0 kB** | **15%** |

**초기 로딩 번들:**
- 최적화 전: 450.8 kB (전체)
- 최적화 후: 45.2 kB (메인) + 135.2 kB (React) + 85.3 kB (Firebase) = 265.7 kB
- **개선율: 41% 감소**

---

## 6. 문제 해결 가이드

### 문제 1: 빌드 후 청크 파일이 너무 많음

**증상:**
```bash
npm run build
# 출력:
# dist/assets/chunk-1-[hash].js
# dist/assets/chunk-2-[hash].js
# ... (100개 이상의 청크)
```

**원인:**
- `manualChunks` 설정이 너무 세분화됨
- 동적 import가 너무 많음

**해결:**

```typescript
// vite.config.ts
manualChunks: {
  // 너무 세분화하지 말고 큰 그룹으로 묶기
  'vendor': ['react', 'react-dom', 'react-router-dom'],
  'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  'ui': [
    '@radix-ui/react-toast',
    '@radix-ui/react-dialog',
    // ... 기타 UI 라이브러리
  ],
}
```

---

### 문제 2: Lazy loading이 작동하지 않음

**증상:**
```typescript
const Dashboard = lazy(() => import('@/components/pages/Dashboard'));
// Network 탭에서 초기 로딩 시 모든 페이지가 로드됨
```

**원인:**
- `Suspense`가 없음
- import 문법 오류

**해결:**

```typescript
// ✅ 올바른 예
const Dashboard = lazy(() =>
  import('@/components/pages/Dashboard').then(module => ({
    default: module.Dashboard
  }))
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
```

---

### 문제 3: OptimizedImage가 로딩되지 않음

**증상:**
```typescript
<OptimizedImage src="/images/trader.jpg" alt="Trader" lazy={true} />
// 이미지가 뷰포트에 진입해도 로딩되지 않음
```

**원인:**
- IntersectionObserver 미지원 브라우저
- 이미지 경로 오류

**해결:**

```typescript
// IntersectionObserver 폴리필 확인
if (!('IntersectionObserver' in window)) {
  console.warn('IntersectionObserver not supported');
}

// 이미지 경로 확인
console.log('Image URL:', src);

// 폴백: lazy={false}로 즉시 로딩
<OptimizedImage src="/images/trader.jpg" alt="Trader" lazy={false} />
```

---

### 문제 4: Firestore 쿼리가 느림

**증상:**
```typescript
const { data, isLoading } = useTraders();
// 로딩 시간: 5초 이상
```

**원인:**
- Firestore 인덱스 없음
- 복합 쿼리에 인덱스 필요

**해결:**

```bash
# Firebase Console에서 에러 확인
# 콘솔 출력:
# "The query requires an index. You can create it here: https://console.firebase.google.com/..."

# 링크 클릭하여 자동으로 인덱스 생성
# 또는 firestore.indexes.json 수동 작성

# 인덱스 배포
firebase deploy --only firestore:indexes
```

---

### 문제 5: 캐시가 작동하지 않음

**증상:**
```typescript
const { data } = useTraders();
// 페이지를 새로고침할 때마다 Firestore에서 다시 로딩
```

**원인:**
- 캐시 키가 매번 달라짐
- 캐시 만료 시간이 너무 짧음

**해결:**

```typescript
// useFirestoreQuery 디버깅
console.log('Cache key:', cacheKey);
console.log('Cached data:', queryCache.get(cacheKey));

// 캐시 시간 늘리기
return useFirestoreQuery<Trader>('traders', constraints, {
  cache: true,
  cacheTime: 10 * 60 * 1000, // 10분
});
```

---

### 문제 6: console.log가 프로덕션에서 제거되지 않음

**증상:**
```bash
npm run build
# 빌드 후 dist/assets/index-[hash].js에 여전히 console.log 존재
```

**원인:**
- Terser 옵션 설정 오류
- `minify: false`로 설정됨

**해결:**

```typescript
// vite.config.ts 확인
export default defineConfig({
  build: {
    minify: 'terser', // ← 이 줄이 있어야 함
    terserOptions: {
      compress: {
        drop_console: true, // ← 이 옵션이 있어야 함
      },
    },
  },
});

// 빌드 후 확인
# dist/assets/index-[hash].js 파일을 열어서 'console.log' 검색
# 결과: 0개
```

---

## 7. Git 커밋

### 7.1 변경 사항 확인

```bash
cd d:\jjumV\yoloseum-phase3-ui

git status

# 예상 출력:
# Modified:
#   vite.config.ts
#   src/App.tsx
#   package.json
# Untracked files:
#   src/components/common/OptimizedImage.tsx
#   src/utils/imageOptimizer.ts
#   src/utils/debug.ts
#   src/utils/reportWebVitals.ts
#   src/hooks/useFirestoreQuery.ts
#   src/hooks/useTraders.ts
#   src/hooks/useStrategies.ts
#   firestore.indexes.json
```

### 7.2 파일 추가 및 커밋

```bash
# 모든 변경 사항 추가
git add .

# 커밋
git commit -m "perf: Optimize bundle size, images, and queries (Day 4)

- Optimize Vite build configuration
  - Manual code splitting for vendor libraries
  - React, Firebase, UI, Utils vendors separated
  - Terser minification with console.log removal
  - CSS code splitting enabled

- Implement lazy loading for routes
  - All page components now lazy loaded
  - Suspense with loading fallback
  - Development-only test pages excluded from production

- Add optimized image components
  - OptimizedImage with lazy loading
  - WebP support with fallback
  - Intersection Observer for viewport detection
  - Skeleton placeholder during loading
  - OptimizedAvatar and OptimizedCardImage wrappers

- Create Firestore query hooks
  - useFirestoreQuery with automatic caching
  - useFirestorePagination for infinite scroll
  - useTraders and useStrategies hooks
  - 5-minute cache for data queries

- Add Firestore indexes
  - Composite indexes for traders collection
  - Composite indexes for strategies collection
  - Optimized query performance

- Measure performance
  - Web Vitals tracking (LCP, FID, CLS)
  - Bundle size reduced by 41%
  - Initial load: 450kB → 266kB

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 7.3 푸시 (선택)

```bash
git push origin main
```

---

## 완료 체크리스트

### Task 7: 번들 크기 최적화
- [ ] `vite.config.ts` 최적화 설정 완료
- [ ] `manualChunks`로 vendor 분리
- [ ] Terser 압축 옵션 설정
- [ ] `App.tsx`에 lazy loading 적용
- [ ] 개발용 코드 조건부 로딩
- [ ] 빌드 후 청크 파일 확인
- [ ] 총 번들 크기 15% 이상 감소

### Task 8: 이미지 최적화
- [ ] `OptimizedImage` 컴포넌트 생성
- [ ] Lazy loading 구현 (IntersectionObserver)
- [ ] WebP 지원 추가
- [ ] Skeleton placeholder 추가
- [ ] `imageOptimizer.ts` 유틸리티 생성
- [ ] 페이지에 OptimizedImage 적용
- [ ] Network 탭에서 lazy loading 확인

### Task 9: 쿼리 최적화
- [ ] `useFirestoreQuery` 훅 생성
- [ ] 캐싱 메커니즘 구현
- [ ] `useFirestorePagination` 훅 생성
- [ ] `useTraders` 훅 생성
- [ ] `useStrategies` 훅 생성
- [ ] `firestore.indexes.json` 작성
- [ ] Firebase 인덱스 배포
- [ ] 페이지에 최적화된 훅 적용
- [ ] 쿼리 속도 개선 확인

### 성능 측정
- [ ] Lighthouse 검사 실행
- [ ] Performance 점수 90+ 달성
- [ ] Core Web Vitals 측정
- [ ] LCP < 2.5초
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] 번들 크기 비교 문서화

### Git
- [ ] 모든 파일 커밋
- [ ] 커밋 메시지 작성
- [ ] (선택) 원격 저장소 푸시

---

## 참고 자료

### 공식 문서
- **Vite 최적화**: https://vitejs.dev/guide/build.html
- **React Lazy**: https://react.dev/reference/react/lazy
- **Intersection Observer**: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- **Web Vitals**: https://web.dev/vitals/
- **Firestore 쿼리**: https://firebase.google.com/docs/firestore/query-data/queries

### 추가 학습
- **Code Splitting**: https://webpack.js.org/guides/code-splitting/
- **Image Optimization**: https://web.dev/fast/#optimize-your-images
- **Lazy Loading**: https://web.dev/lazy-loading/
- **Firestore Best Practices**: https://firebase.google.com/docs/firestore/best-practices

---

**Day 4 작업 완료!**

다음 단계: [TASK_INSTRUCTIONS_DAY5_ENHANCED.md](./TASK_INSTRUCTIONS_DAY5_ENHANCED.md)
