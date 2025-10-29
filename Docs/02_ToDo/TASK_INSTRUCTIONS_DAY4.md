# 📋 Day 4: 성능 최적화 - 작업 지시서

**작업 기간**: 2025년 11월 3일
**상태**: 📌 준비 완료
**목표**: 번들 크기, 이미지, 쿼리 최적화 완성

---

## 🎯 Day 4 목표

```
✅ 번들 크기 최적화 (< 800KB)
✅ 이미지 최적화 (WebP, Lazy Loading)
✅ 쿼리 최적화 (Firestore 인덱싱)
✅ 성능 메트릭 측정 및 문서화
```

---

## 📌 Task 7: 번들 크기 최적화

### 작업 위치
```
파일: package.json, vite.config.ts
상태: OPTIMIZE & ANALYZE
```

### 작업 세부사항

#### 7-1. 현재 번들 크기 분석

```bash
# ✅ Task 7-1-A: 번들 빌드 및 크기 확인
npm run build

# 출력 예시:
# dist/index.html                0.89 kb
# dist/assets/index.js            889 kb (gzipped: 235 kb)
# dist/assets/index.css           45 kb (gzipped: 12 kb)
```

#### 7-2. 불필요한 패키지 제거

```bash
# ✅ Task 7-2-A: 사용하지 않는 패키지 확인
npm ls

# 불필요한 패키지 제거 (예시)
npm uninstall @mui/icons-material  # shadcn/ui 사용하므로 불필요
npm uninstall lodash              # 개별 유틸리티 사용으로 대체
npm uninstall moment              # date-fns 사용으로 대체
npm uninstall axios               # fetch API 사용으로 대체
```

#### 7-3. Tree Shaking 확인

```typescript
// ✅ Task 7-3: 정확한 import 사용

// ❌ 좋지 않음 (전체 라이브러리 번들)
import * as React from 'react';
import _ from 'lodash';

// ✅ 좋음 (필요한 것만 번들)
import { useState, useEffect } from 'react';
import { debounce } from 'lodash-es';

// ✅ 최적 (개별 함수)
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
```

#### 7-4. 동적 import (코드 스플리팅)

```typescript
// src/components/pages/index.ts (라우트 기반 코드 스플리팅)

import React from 'react';

// ✅ Task 7-4-A: 페이지를 동적으로 import
export const Dashboard = React.lazy(() => import('./Dashboard'));
export const Leaderboard = React.lazy(() => import('./Leaderboard'));
export const Traders = React.lazy(() => import('./Traders'));
export const Strategies = React.lazy(() => import('./Strategies'));
export const Portfolio = React.lazy(() => import('./Portfolio'));
export const Profile = React.lazy(() => import('./Profile'));

// src/App.tsx
import { Suspense } from 'react';
import { Dashboard, Leaderboard, Traders } from './components/pages';
import { Skeleton } from './components/ui/skeleton';

// ✅ Task 7-4-B: Suspense로 감싸기
export const App = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<Skeleton />}>
            <Dashboard />
          </Suspense>
        }
      />
      {/* 다른 라우트들 */}
    </Routes>
  );
};
```

#### 7-5. vite.config.ts 최적화

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    // ✅ Task 7-5-A: 번들 최적화 설정
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true,
      },
    },
    // ✅ Task 7-5-B: 청크 크기 제한
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### 체크리스트 - Task 7

- [ ] 현재 번들 크기 측정 (`npm run build`)
- [ ] 불필요한 패키지 확인 및 제거
- [ ] Tree shaking을 위한 import 수정 (모든 파일 확인)
- [ ] 동적 import (코드 스플리팅) 적용
- [ ] vite.config.ts 최적화 설정 추가
- [ ] `npm run build` 실행 및 번들 크기 확인 (< 800KB 목표)
- [ ] visualizer로 번들 분석 (`npm run visualize`)
- [ ] 최적화 전/후 비교 문서화

---

## 📌 Task 8: 이미지 최적화

### 작업 위치
```
파일: src/components/common/OptimizedImage.tsx
상태: NEW (신규 생성)
```

### 작업 세부사항

#### 8-1. OptimizedImage 컴포넌트 생성

```typescript
// src/components/common/OptimizedImage.tsx

import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  placeholder = 'bg-gray-200',
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ Task 8-1-A: 이미지 로드 감지
  useEffect(() => {
    const img = new Image();

    // ✅ Task 8-1-B: WebP 지원 확인
    const webpSrc = src.replace(/\.[^/.]+$/, '.webp');

    // WebP 지원 확인
    const canvas = document.createElement('canvas');
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

    const finalSrc = supportsWebP ? webpSrc : src;

    img.onload = () => {
      setImageSrc(finalSrc);
      setIsLoaded(true);
    };

    img.onerror = () => {
      // WebP 실패 시 원본 src 사용
      setImageSrc(src);
      setIsLoaded(true);
    };

    img.src = finalSrc;
  }, [src]);

  // ✅ Task 8-1-C: Responsive image (srcset)
  const generateSrcSet = () => {
    return [
      `${src} 1x`,
      `${src.replace(/\.[^/.]+$/, '@2x.webp')} 2x`,
    ].join(', ');
  };

  return (
    <picture>
      {/* ✅ Task 8-1-D: WebP 포맷 지원 */}
      <source
        srcSet={generateSrcSet()}
        type="image/webp"
      />
      {/* ✅ Task 8-1-E: Fallback 이미지 */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${
          isLoaded ? 'opacity-100' : 'opacity-50'
        } transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};
```

#### 8-2. 이미지 변환 가이드

```bash
# ✅ Task 8-2-A: JPG/PNG를 WebP로 변환

# ImageMagick 설치
npm install -g imagemagick

# 또는 온라인 도구 사용
# https://convertio.co/jpg-webp/
# https://cloudconvert.com/

# 배치 변환 스크립트
for file in public/images/*.{jpg,png}; do
  if [ -f "$file" ]; then
    convert "$file" "${file%.*}.webp"
  fi
done
```

#### 8-3. Lighthouse 이미지 최적화 확인

```bash
# ✅ Task 8-3: 이미지 최적화 확인
# Chrome DevTools > Lighthouse > Run Lighthouse

# 확인 사항:
# - "Serve images in next-gen formats" - WebP 제안 없어야 함
# - "Properly size images" - 적절한 크기 확인
# - "Defer offscreen images" - Lazy loading 적용됨
```

### 체크리스트 - Task 8

- [ ] `OptimizedImage.tsx` 컴포넌트 생성
- [ ] WebP 형식 지원 구현
- [ ] Responsive image (srcset) 구현
- [ ] Lazy loading 적용 (loading="lazy")
- [ ] 플레이스홀더 처리 구현
- [ ] 이미지 파일 WebP로 변환
- [ ] 모든 프로필 이미지에 OptimizedImage 적용
- [ ] 모든 전략 이미지에 OptimizedImage 적용
- [ ] Lighthouse 이미지 최적화 점수 확인

---

## 📌 Task 9: 쿼리 최적화

### 작업 위치
```
파일1: src/hooks/useTraders.ts
파일2: src/hooks/useStrategies.ts
상태: OPTIMIZE
```

### 작업 세부사항

#### 9-1. Firestore 인덱싱 추가

```typescript
// src/hooks/useTraders.ts (최적화)

import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';

export const useTraders = (options?: TraderQueryOptions) => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Task 9-1-A: 쿼리 최적화 (limit 추가)
    const buildQuery = () => {
      let baseQuery = collection(db, 'traders');

      // 필터링 조건 추가
      const conditions = [];

      if (options?.minROI) {
        conditions.push(where('roi', '>=', options.minROI));
      }

      if (options?.minSubscribers) {
        conditions.push(where('subscribers', '>=', options.minSubscribers));
      }

      // ✅ Task 9-1-B: limit 추가 (페이지네이션)
      conditions.push(limit(options?.pageSize || 20));

      return query(baseQuery, ...conditions);
    };

    const unsubscribe = onSnapshot(
      buildQuery(),
      (snapshot) => {
        setTraders(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })));
        setError(null);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        setError('데이터를 불러올 수 없습니다');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [options]);

  return { traders, loading, error };
};
```

#### 9-2. Firestore 콘솔에서 인덱싱 설정

```
Firestore Console > Indexes > Create Index

✅ Task 9-2-A: 다음 인덱스 생성

1. traders 컬렉션
   - Collection: traders
   - Fields: roi (Descending), subscribers (Descending)

2. strategies 컬렉션
   - Collection: strategies
   - Fields: roi (Descending), tvl (Descending)

3. supporters 컬렉션
   - Collection: supporters
   - Fields: supporterId (Ascending), investedDate (Descending)

4. reviews 컬렉션
   - Collection: reviews
   - Fields: traderId (Ascending), createdAt (Descending)
```

#### 9-3. 페이지네이션 개선

```typescript
// src/components/pages/Traders.tsx (페이지네이션)

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Traders: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // ✅ Task 9-3-A: 페이지네이션 옵션
  const { traders, loading } = useTraders({
    pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const totalPages = Math.ceil(traders.length / pageSize);

  return (
    <div>
      {/* 트레이더 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {traders.map(trader => (
          <TraderCard key={trader.id} trader={trader} />
        ))}
      </div>

      {/* ✅ Task 9-3-B: 페이지네이션 컨트롤 */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2 border rounded"
        >
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>

        <span className="text-gray-600">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2 border rounded"
        >
          다음
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
```

#### 9-4. 실시간 리스너 최적화

```typescript
// ✅ Task 9-4: 구독 해제 확인 (메모리 누수 방지)

export const useTraders = () => {
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'traders'), limit(20)),
      (snapshot) => {
        // 데이터 처리
      }
    );

    // ✅ Task 9-4-A: cleanup 함수에서 구독 해제
    return () => {
      console.log('Unsubscribing from traders');
      unsubscribe();
    };
  }, []);
};

// ✅ Task 9-4-B: 불필요한 실시간 리스너 제거
// 예: 목록 페이지에서는 실시간 업데이트 필요 없음
// → getDoc() 사용 (한 번만 로드)

// 실시간 필요한 경우만 onSnapshot 사용:
// - Dashboard (통계 실시간 업데이트)
// - Portfolio (수익 실시간 계산)
// - Leaderboard (순위 실시간 변경)
```

### 체크리스트 - Task 9

- [ ] useTraders 쿼리 최적화 (limit 추가)
- [ ] useStrategies 쿼리 최적화 (limit 추가)
- [ ] Firestore 콘솔에서 4개 인덱스 생성
- [ ] 페이지네이션 컨트롤 추가
- [ ] 구독 해제 (cleanup) 함수 확인
- [ ] 불필요한 실시간 리스너 제거
- [ ] 쿼리 성능 테스트 (Chrome DevTools)
- [ ] 메모리 누수 확인

---

## 📊 성능 메트릭 측정

### 성능 테스트 방법

```bash
# ✅ Task 성능-1: Lighthouse 점수 측정
npm run build
npx serve dist

# Chrome 열기 → DevTools → Lighthouse 실행

# 각 페이지별로:
# - Performance (성능): > 80
# - Accessibility (접근성): > 90
# - Best Practices (모범 사례): > 90
# - SEO: > 90
```

### 성능 메트릭 문서화

```markdown
# PERFORMANCE_METRICS.md 작성

## 최적화 전/후 비교

### 번들 크기
- 최적화 전: 889 KB (gzipped: 235 KB)
- 최적화 후: [측정값] KB (gzipped: [측정값] KB)
- 개선율: [%]

### 로딩 시간
- Dashboard: [ms]
- Leaderboard: [ms]
- Traders: [ms]
- Portfolio: [ms]

### Lighthouse 점수
- Performance: [점수]
- Accessibility: [점수]
- Best Practices: [점수]
- SEO: [점수]

### 최적화 항목
- [ ] 번들 크기 최적화
- [ ] 이미지 최적화
- [ ] 쿼리 최적화
```

### 체크리스트 - 성능 메트릭

- [ ] Lighthouse 측정 (모든 주요 페이지)
- [ ] Bundle 크기 측정
- [ ] 로딩 시간 측정
- [ ] 메모리 사용량 측정
- [ ] PERFORMANCE_METRICS.md 작성

---

## 🧪 테스트 체크리스트 - Day 4

### Task 7 (번들 최적화) 테스트
```bash
npm run build
# 출력 확인: 총 크기 < 800KB
```

- [ ] 번들 빌드 에러 없음
- [ ] 번들 크기 측정 및 기록
- [ ] Tree shaking 확인 (불필요한 코드 없음)
- [ ] 동적 import 정상 작동
- [ ] 콘솔에서 console.log 제거됨 확인

### Task 8 (이미지 최적화) 테스트
- [ ] WebP 이미지 생성 확인
- [ ] 브라우저에서 이미지 로드 확인
- [ ] Lazy loading 작동 확인 (DevTools Network)
- [ ] Lighthouse 이미지 최적화 점수 개선 확인

### Task 9 (쿼리 최적화) 테스트
- [ ] Firestore 쿼리 시간 단축 확인 (DevTools)
- [ ] 페이지네이션 정상 작동
- [ ] 메모리 누수 없음 (DevTools Memory)
- [ ] 구독 해제 정상 작동

---

## 📝 완료 체크리스트

### Task 7 완료 시
- [ ] 불필요한 패키지 제거 완료
- [ ] Tree shaking 설정 완료
- [ ] 동적 import (코드 스플리팅) 적용
- [ ] vite.config.ts 최적화 설정 추가
- [ ] 번들 크기 < 800KB 달성

### Task 8 완료 시
- [ ] OptimizedImage 컴포넌트 생성
- [ ] WebP 변환 완료
- [ ] 모든 이미지에 OptimizedImage 적용
- [ ] Lighthouse 이미지 최적화 점수 개선

### Task 9 완료 시
- [ ] useTraders 쿼리 최적화
- [ ] useStrategies 쿼리 최적화
- [ ] Firestore 인덱싱 설정
- [ ] 페이지네이션 구현
- [ ] 메모리 누수 제거

### Day 4 최종 완료
- [ ] 번들 크기 < 800KB
- [ ] 모든 주요 페이지 Lighthouse > 80점
- [ ] PERFORMANCE_METRICS.md 작성
- [ ] TypeScript 컴파일 에러 0개
- [ ] Git 커밋 완료

---

## 💡 개발 팁

### 빠른 성능 테스트
```bash
# 1. 빌드 및 분석
npm run build
npm run visualize  # 번들 시각화

# 2. Lighthouse 테스트
npm run dev
# DevTools > Lighthouse > Run Lighthouse

# 3. 네트워크 성능 테스트
# DevTools > Network > Throttling: "Slow 3G"
```

### 번들 분석 해석
```
visualizer 결과:
- 제일 큰 청크: React, Firebase
- 제거할 수 있는 것: 불필요한 UI 라이브러리
- 최적화 기회: 동적 import로 청크 분할
```

---

## 🎯 다음 단계

Day 4 완료 후:
1. ✅ Task 7-9 모두 완료 및 테스트
2. ➡️ Day 5로 진행: 모바일 테스트 및 반응형 완성
3. 📌 커밋 메시지: `perf: Complete Day 4 performance optimization (Bundle, Images, Queries)`

---

**작성일**: 2025년 10월 30일
**예상 완료**: 2025년 11월 3일
**담당자**: 개발팀

🚀 **Day 4를 성공적으로 완료하자!**
