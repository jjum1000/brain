# 📋 Day 3: 사용자 피드백 시스템 구현 - 작업 지시서

**작업 기간**: 2025년 11월 2일
**상태**: 📌 준비 완료
**목표**: Toast 알림, 로딩 UI, 에러 처리 시스템 완성

---

## 🎯 Day 3 목표

```
✅ Toast 알림 시스템 구현 (Context API 기반)
✅ 로딩 상태 UI 개선 (Skeleton 컴포넌트)
✅ 에러 처리 시스템 개선 (사용자 친화적 메시지)
✅ 전체 페이지에 적용 및 테스트
```

---

## 📌 Task 4: Toast 알림 시스템

### 작업 위치
```
파일1: src/contexts/ToastContext.tsx
파일2: src/hooks/useToast.ts
상태: NEW (신규 생성)
```

### 작업 세부사항

#### 4-1. ToastContext 생성

```typescript
// src/contexts/ToastContext.tsx

import React, { createContext, useState, useCallback } from 'react';

// ✅ Type 정의
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ✅ ToastProvider 컴포넌트
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ✅ Task 4-1-A: Toast 추가 함수
  const addToast = useCallback(
    (message: string, type: ToastType, duration: number = 3000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { id, message, type, duration };

      // ✅ 최대 3개까지만 표시
      setToasts(prev => [...prev.slice(-2), newToast]);

      // ✅ 자동 닫기
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    []
  );

  // ✅ Task 4-1-B: Toast 제거 함수
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // ✅ Task 4-1-C: 전체 Toast 초기화
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
};
```

#### 4-2. useToast 훅 생성

```typescript
// src/hooks/useToast.ts

import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
};
```

#### 4-3. Toast 컴포넌트 생성

```typescript
// src/components/Toast/Toast.tsx

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  // ✅ Task 4-3-A: 타입별 스타일 정의
  const getStyles = (type: ToastType) => {
    const baseStyles = 'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border';

    switch (type) {
      case 'success':
        return {
          container: `${baseStyles} bg-green-50 border-green-200`,
          icon: 'text-green-600',
          text: 'text-green-800',
          button: 'text-green-600 hover:bg-green-100',
          icon: <CheckCircle className="w-5 h-5" />,
        };
      case 'error':
        return {
          container: `${baseStyles} bg-red-50 border-red-200`,
          icon: 'text-red-600',
          text: 'text-red-800',
          button: 'text-red-600 hover:bg-red-100',
          icon: <AlertCircle className="w-5 h-5" />,
        };
      case 'warning':
        return {
          container: `${baseStyles} bg-yellow-50 border-yellow-200`,
          icon: 'text-yellow-600',
          text: 'text-yellow-800',
          button: 'text-yellow-600 hover:bg-yellow-100',
          icon: <AlertTriangle className="w-5 h-5" />,
        };
      case 'info':
      default:
        return {
          container: `${baseStyles} bg-blue-50 border-blue-200`,
          icon: 'text-blue-600',
          text: 'text-blue-800',
          button: 'text-blue-600 hover:bg-blue-100',
          icon: <Info className="w-5 h-5" />,
        };
    }
  };

  const styles = getStyles(toast.type);

  // ✅ Task 4-3-B: Toast 렌더링
  return (
    <div className={styles.container}>
      <span className={styles.icon}>{styles.icon}</span>
      <span className={styles.text}>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className={`ml-auto p-1 rounded transition ${styles.button}`}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
```

#### 4-4. ToastContainer 컴포넌트

```typescript
// src/components/Toast/ToastContainer.tsx

import React from 'react';
import { Toast } from './Toast';
import { useToast } from '../../hooks/useToast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // ✅ Task 4-4-A: Toast 컨테이너 위치 고정
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};
```

### 체크리스트 - Task 4

- [ ] `ToastContext.tsx` 파일 생성
- [ ] `useToast.ts` 훅 생성
- [ ] `Toast.tsx` 컴포넌트 생성
- [ ] `ToastContainer.tsx` 컴포넌트 생성
- [ ] Type 정의 완료 (ToastType, Toast, ToastContextType)
- [ ] Context API 기반 상태 관리 구현
- [ ] 4가지 타입 스타일 적용 (success, error, warning, info)
- [ ] 자동 닫기 기능 (3초) 구현
- [ ] 최대 3개 토스트 스택 관리
- [ ] App.tsx에 ToastProvider 및 ToastContainer 추가

---

## 📌 Task 5: 로딩 상태 UI 개선

### 작업 위치
```
여러 페이지: Dashboard, Leaderboard, Traders, Portfolio 등
상태: UPDATE (기존 페이지 수정)
```

### 작업 세부사항

#### 5-1. 각 페이지별 Skeleton 적용

```typescript
// src/components/pages/Dashboard.tsx (예시)

import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const Dashboard: React.FC = () => {
  const { stats, loading, error } = useDashboard();

  // ✅ Task 5-1-A: 로딩 상태 Skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        {/* 통계 카드 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 차트 스켈레톤 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        {/* 테이블 스켈레톤 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Task 5-1-B: 실제 콘텐츠 렌더링
  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="총 자산" value={stats.totalAssets} />
        {/* ... 다른 카드들 */}
      </div>
      {/* ... 다른 콘텐츠 */}
    </div>
  );
};
```

#### 5-2. 페이지별 적용 목록

```typescript
// 다음 페이지들에 Skeleton 적용

// ✅ Task 5-2: Leaderboard 페이지
// src/components/pages/Leaderboard.tsx
- 테이블 행 스켈레톤 (5줄)
- 헤더 스켈레톤

// ✅ Task 5-2: Traders 페이지
// src/components/pages/Traders.tsx
- 트레이더 카드 스켈레톤 (6개)
- 검색/필터 스켈레톤

// ✅ Task 5-2: Portfolio 페이지
// src/components/pages/Portfolio.tsx
- 통계 카드 스켈레톤 (4개)
- 투자 목록 테이블 스켈레톤

// ✅ Task 5-2: Strategies 페이지
// src/components/pages/Strategies.tsx
- 전략 카드 스켈레톤 (8개)
```

### 체크리스트 - Task 5

- [ ] Skeleton 컴포넌트 shadcn/ui에서 import 확인
- [ ] Dashboard 로딩 상태 적용
- [ ] Leaderboard 로딩 상태 적용
- [ ] Traders 로딩 상태 적용
- [ ] Portfolio 로딩 상태 적용
- [ ] Strategies 로딩 상태 적용
- [ ] 각 페이지에서 `if (loading) { return <Skeleton...> }` 패턴 적용
- [ ] 모바일 화면에서 Skeleton 표시 확인
- [ ] TypeScript 컴파일 에러 없음

---

## 📌 Task 6: 에러 처리 개선

### 작업 위치
```
파일1: src/utils/errorHandler.ts
파일2: 모든 페이지의 에러 UI
상태: NEW & UPDATE
```

### 작업 세부사항

#### 6-1. 에러 핸들러 유틸 생성

```typescript
// src/utils/errorHandler.ts

// ✅ Type 정의
export type FirestoreErrorCode =
  | 'permission-denied'
  | 'not-found'
  | 'already-exists'
  | 'invalid-argument'
  | 'deadline-exceeded'
  | 'unauthenticated'
  | 'unknown';

interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
}

// ✅ Task 6-1-A: Firestore 에러 메시지 매핑
export const getFirestoreErrorMessage = (error: any): ErrorMessage => {
  const code = error?.code || 'unknown';

  switch (code) {
    case 'permission-denied':
      return {
        title: '접근 권한 없음',
        message: '이 데이터에 접근할 권한이 없습니다',
        action: '관리자에게 문의하세요',
      };

    case 'not-found':
      return {
        title: '데이터를 찾을 수 없음',
        message: '요청하신 데이터가 존재하지 않습니다',
        action: '목록으로 돌아가기',
      };

    case 'already-exists':
      return {
        title: '이미 존재함',
        message: '같은 이름의 항목이 이미 존재합니다',
        action: '다른 이름으로 시도하세요',
      };

    case 'invalid-argument':
      return {
        title: '잘못된 요청',
        message: '입력한 데이터가 올바르지 않습니다',
        action: '입력값을 확인하세요',
      };

    case 'deadline-exceeded':
      return {
        title: '요청 시간 초과',
        message: '서버 응답이 너무 오래 걸렸습니다',
        action: '나중에 다시 시도하세요',
      };

    case 'unauthenticated':
      return {
        title: '인증 필요',
        message: '로그인이 필요합니다',
        action: '로그인 페이지로 이동',
      };

    default:
      return {
        title: '오류 발생',
        message: '데이터를 불러올 수 없습니다. 나중에 다시 시도해주세요',
        action: '다시 시도하기',
      };
  }
};

// ✅ Task 6-1-B: 네트워크 에러 메시지
export const getNetworkErrorMessage = (error: any): ErrorMessage => {
  if (!navigator.onLine) {
    return {
      title: '네트워크 연결 끊김',
      message: '인터넷 연결을 확인해주세요',
      action: '다시 시도하기',
    };
  }

  return {
    title: '네트워크 오류',
    message: '서버에 연결할 수 없습니다',
    action: '다시 시도하기',
  };
};

// ✅ Task 6-1-C: 일반 에러 메시지
export const getErrorMessage = (error: any): ErrorMessage => {
  if (error?.code) {
    return getFirestoreErrorMessage(error);
  }

  if (error instanceof TypeError) {
    return getNetworkErrorMessage(error);
  }

  return {
    title: '예상치 못한 오류',
    message: error?.message || '문제가 발생했습니다',
    action: '다시 시도하기',
  };
};
```

#### 6-2. 에러 UI 컴포넌트

```typescript
// src/components/common/ErrorBoundary.tsx

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { getErrorMessage } from '../../utils/errorHandler';

interface ErrorBoundaryProps {
  error: any;
  onRetry?: () => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error, onRetry }) => {
  const errorMsg = getErrorMessage(error);

  // ✅ Task 6-2-A: 에러 UI 렌더링
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-600" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-800">{errorMsg.title}</h3>
        <p className="text-red-700 mt-2">{errorMsg.message}</p>
        {errorMsg.action && (
          <p className="text-sm text-red-600 mt-3">{errorMsg.action}</p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};
```

#### 6-3. 페이지에서 에러 처리

```typescript
// src/components/pages/Traders.tsx (예시)

import { ErrorBoundary } from '../common/ErrorBoundary';

export const Traders: React.FC = () => {
  const { traders, loading, error, refresh } = useTraders();

  // ✅ Task 6-3: 에러 상태 처리
  if (error) {
    return <ErrorBoundary error={error} onRetry={refresh} />;
  }

  return (
    <div>
      {/* 컨텐츠 */}
    </div>
  );
};
```

### 체크리스트 - Task 6

- [ ] `errorHandler.ts` 유틸 파일 생성
- [ ] Firestore 에러 코드 매핑 완료
- [ ] 네트워크 에러 처리 추가
- [ ] 일반 에러 처리 추가
- [ ] `ErrorBoundary.tsx` 컴포넌트 생성
- [ ] 모든 페이지에 에러 UI 추가
- [ ] 한국어 메시지 확인
- [ ] 다시 시도 버튼 기능 테스트
- [ ] TypeScript 컴파일 에러 없음

---

## 🧪 테스트 체크리스트 - Day 3

### Task 4 (Toast) 테스트
- [ ] `npm run dev` 실행 후 에러 없음
- [ ] 버튼 클릭 시 Toast 표시 확인
- [ ] success 타입 토스트 색상 확인 (녹색)
- [ ] error 타입 토스트 색상 확인 (빨강)
- [ ] warning 타입 토스트 색상 확인 (노랑)
- [ ] info 타입 토스트 색상 확인 (파랑)
- [ ] 3초 후 자동 닫기 확인
- [ ] 닫기 버튼 클릭 시 즉시 닫기 확인
- [ ] 3개 이상 토스트 시 오래된 것 제거 확인

### Task 5 (로딩 UI) 테스트
```bash
# 느린 인터넷 시뮬레이션 (Chrome DevTools)
1. DevTools > Network 탭
2. Throttling: "Slow 3G" 선택
3. 각 페이지 로드 시 Skeleton 표시 확인
```

- [ ] Dashboard 로딩 상태 Skeleton 표시
- [ ] Leaderboard 로딩 상태 Skeleton 표시
- [ ] Traders 로딩 상태 Skeleton 표시
- [ ] Portfolio 로딩 상태 Skeleton 표시
- [ ] 모바일 화면에서 Skeleton 레이아웃 확인
- [ ] 데이터 로드 후 실제 콘텐츠로 전환 확인

### Task 6 (에러 처리) 테스트
```javascript
// 에러 시뮬레이션 (DevTools Console)
// 다음 코드를 콘솔에서 실행하여 에러 상황 테스트

// 1. 네트워크 에러 시뮬레이션
// DevTools > Network 탭 > Offline 선택

// 2. Firestore 권한 에러
// Firestore Console > Rules 수정
// allow read, write: if false;

// 3. 각 에러 타입별 메시지 확인
```

- [ ] 권한 없음 에러 메시지 확인
- [ ] 데이터 없음 에러 메시지 확인
- [ ] 네트워크 연결 끊김 메시지 확인
- [ ] 다시 시도 버튼 기능 확인
- [ ] 모든 에러 메시지가 한국어임 확인

---

## 📝 완료 체크리스트

### Task 4 완료 시
- [ ] Toast/ToastContext.tsx 생성
- [ ] Toast/Toast.tsx 컴포넌트 생성
- [ ] Toast/ToastContainer.tsx 컴포넌트 생성
- [ ] hooks/useToast.ts 훅 생성
- [ ] App.tsx에 ToastProvider 감싸기
- [ ] App.tsx에 ToastContainer 추가
- [ ] 테스트 완료

### Task 5 완료 시
- [ ] Dashboard 로딩 상태 UI 추가
- [ ] Leaderboard 로딩 상태 UI 추가
- [ ] Traders 로딩 상태 UI 추가
- [ ] Portfolio 로딩 상태 UI 추가
- [ ] Strategies 로딩 상태 UI 추가
- [ ] 테스트 완료

### Task 6 완료 시
- [ ] utils/errorHandler.ts 생성
- [ ] common/ErrorBoundary.tsx 생성
- [ ] 모든 페이지에 에러 UI 적용
- [ ] 한국어 메시지 확인
- [ ] 테스트 완료

### Day 3 최종 완료
- [ ] TypeScript 컴파일 에러 0개
- [ ] 모든 페이지에서 Toast 사용 가능
- [ ] 모든 페이지에서 로딩 상태 표시
- [ ] 모든 페이지에서 에러 메시지 표시
- [ ] Git 커밋 완료

---

## 💡 개발 팁

### Toast 사용 예시
```typescript
import { useToast } from '../../hooks/useToast';

function MyComponent() {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showToast('저장되었습니다', 'success');
    } catch (error) {
      showToast('저장에 실패했습니다', 'error');
    }
  };

  return <button onClick={handleSave}>저장</button>;
}
```

### 빠른 테스트
```bash
# Toast 테스트
npm run dev
# 브라우저에서 콘솔 실행:
// import { useToast } from './hooks/useToast';

# Skeleton 테스트
# Chrome DevTools > Network > Throttling: "Slow 3G"

# 에러 처리 테스트
# Chrome DevTools > Network > Offline
```

---

## 🎯 다음 단계

Day 3 완료 후:
1. ✅ Task 4-6 모두 완료 및 테스트
2. ➡️ Day 4로 진행: 성능 최적화 (Task 7-9)
3. 📌 커밋 메시지: `feat: Complete Day 3 user feedback system (Toast, Loading UI, Error Handling)`

---

**작성일**: 2025년 10월 30일
**예상 완료**: 2025년 11월 2일
**담당자**: 개발팀

🚀 **Day 3을 성공적으로 완료하자!**
