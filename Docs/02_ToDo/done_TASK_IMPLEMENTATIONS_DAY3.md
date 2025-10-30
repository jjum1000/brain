# Day 3: Task 4-6 상세 구현 지시서

**기간**: Day 3 (사용자 피드백 시스템 구현)
**포함 태스크**: Task 4, Task 5, Task 6
**예상 시간**: 8-10시간

---

## Task 4: Toast 알림 시스템 구현

### 개요
Context API 기반 글로벌 Toast 알림 시스템. 모든 페이지에서 `useToast()` 훅으로 알림 표시 가능.

### 파일 생성 및 수정

#### 파일 1: `src/components/Toast/ToastProvider.tsx` (NEW)

```typescript
import { createContext, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastTypeStyles: Record<Toast['type'], { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-600/90',
    border: 'border-green-500',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-600/90',
    border: 'border-red-500',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-600/90',
    border: 'border-yellow-500',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-600/90',
    border: 'border-blue-500',
    icon: 'ℹ',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
      const id = Date.now().toString();
      const newToast: Toast = { id, message, type, duration };

      // 최대 3개까지만 표시
      setToasts((prev) => {
        const updated = [...prev, newToast];
        return updated.length > 3 ? updated.slice(-3) : updated;
      });

      // 자동 제거
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const style = toastTypeStyles[toast.type];
          return (
            <div
              key={toast.id}
              className={`${style.bg} ${style.border} border rounded-lg px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-300`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-lg font-bold flex-shrink-0">{style.icon}</span>
                  <p className="text-sm leading-relaxed break-words">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white/60 hover:text-white flex-shrink-0 mt-0.5"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
```

#### 파일 2: `src/hooks/useToast.ts` (UPDATE)

**기존 파일 내용 확인 후 다음 코드로 교체**:

```typescript
import { useContext } from 'react';
import { ToastContext, type ToastContextType } from '@/components/Toast/ToastProvider';

/**
 * Hook to use global Toast notification system
 * Must be used within ToastProvider
 *
 * @returns {ToastContextType} Toast context with addToast and removeToast functions
 *
 * @example
 * const { addToast } = useToast();
 * addToast('Success!', 'success');
 * addToast('Error occurred', 'error', 5000);
 *
 * @throws Error if used outside ToastProvider
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
```

#### 파일 3: `src/App.tsx` (UPDATE)

```typescript
// 기존 import들 위에 추가
import { ToastProvider } from '@/components/Toast/ToastProvider';

// 기존 BrowserRouter 감싸기
export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        {/* 기존 라우팅 코드 */}
      </BrowserRouter>
    </ToastProvider>
  );
}
```

### 사용 예시

```typescript
// 어디서든 이렇게 사용 가능:
import { useToast } from '@/hooks/useToast';

export function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('데이터를 저장했습니다', 'success');
  };

  const handleError = () => {
    addToast('오류가 발생했습니다. 다시 시도해주세요', 'error', 5000);
  };

  const handleWarning = () => {
    addToast('주의: 이 작업은 되돌릴 수 없습니다', 'warning');
  };

  const handleInfo = () => {
    addToast('정보: 이 기능은 준비 중입니다', 'info', 4000);
  };

  return (
    <div className="space-y-4">
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleWarning}>Warning</button>
      <button onClick={handleInfo}>Info</button>
    </div>
  );
}
```

### 통합 가능한 위치들

#### 1. usePortfolio 에러 시
```typescript
// src/hooks/usePortfolio.ts
const { addToast } = useToast();

catch (err) {
  const message = getErrorMessage(err);
  addToast(message, 'error');
}
```

#### 2. useTransactions 에러 시
```typescript
catch (err) {
  const message = getErrorMessage(err);
  addToast(message, 'error');
}
```

#### 3. 로그인 성공
```typescript
// AuthContext.tsx
login 함수에서:
addToast('로그인 성공했습니다', 'success');
```

#### 4. 로그아웃 성공
```typescript
logout 함수에서:
addToast('로그아웃되었습니다', 'info');
```

### 테스트 체크리스트
- [ ] ToastProvider 설정 완료
- [ ] useToast 훅 사용 가능
- [ ] 여러 Toast 동시 표시 (최대 3개)
- [ ] 자동 닫기 작동 (3초 기본)
- [ ] 수동 닫기 버튼 작동
- [ ] 타입별 색상 정확
- [ ] 애니메이션 부드러움

---

## Task 5: 로딩 상태 UI 개선

### 개요
Skeleton 컴포넌트를 사용하여 데이터 로딩 중 사용자에게 더 나은 UX 제공.

### 파일 생성

#### 파일 1: `src/components/common/Skeletons.tsx` (NEW)

```typescript
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Skeleton loader for stat cards
 * Shows placeholder while data is loading
 */
export function StatsSkeleton() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-24 bg-slate-700" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 bg-slate-700" />
          <Skeleton className="h-3 w-24 bg-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for table rows
 * Shows placeholder for multiple rows
 */
export function TableRowSkeleton() {
  return (
    <TableRow className="border-slate-700">
      <TableCell>
        <Skeleton className="h-4 w-16 bg-slate-700" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20 bg-slate-700" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-slate-700" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20 bg-slate-700" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16 bg-slate-700" />
      </TableCell>
    </TableRow>
  );
}

/**
 * Skeleton loader for table section
 * Shows header + multiple skeleton rows
 */
export function TableSkeleton({ rowCount = 5 }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <Skeleton className="h-6 w-40 bg-slate-700 mb-2" />
        <Skeleton className="h-4 w-60 bg-slate-700" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead>
                  <Skeleton className="h-4 w-16 bg-slate-700" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20 bg-slate-700" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24 bg-slate-700" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20 bg-slate-700" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16 bg-slate-700" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(rowCount)
                .fill(0)
                .map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for card grid
 * Shows multiple card placeholders
 */
export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <StatsSkeleton key={i} />
        ))}
    </div>
  );
}

/**
 * Skeleton loader for card list
 * Shows vertical list of cards
 */
export function CardListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-slate-700" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-slate-700" />
                <Skeleton className="h-4 w-5/6 bg-slate-700" />
                <Skeleton className="h-4 w-4/6 bg-slate-700" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
```

### 적용 위치별 구현

#### 1. Dashboard.tsx 적용
```typescript
import { CardGridSkeleton, TableSkeleton } from '@/components/common/Skeletons';

export function Dashboard() {
  // ... 기존 코드
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { transactions, loading: txLoading } = useTransactions(10);

  if (profileLoading || txLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

          {/* Skeleton 통계 카드 */}
          <CardGridSkeleton count={4} />

          {/* Skeleton 테이블 */}
          <TableSkeleton rowCount={5} />
        </div>
      </div>
    );
  }

  // ... 기존 렌더링 코드
}
```

#### 2. Leaderboard.tsx 적용
```typescript
import { TableSkeleton } from '@/components/common/Skeletons';

export function Leaderboard() {
  // ... 기존 코드
  const { leaderboard, loading } = useLeaderboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">Leaderboard</h1>
          <TableSkeleton rowCount={10} />
        </div>
      </div>
    );
  }

  // ... 기존 렌더링 코드
}
```

#### 3. Traders.tsx 적용
```typescript
import { CardGridSkeleton } from '@/components/common/Skeletons';

export function Traders() {
  // ... 기존 코드
  const { traders, loading } = useTraders(50);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">Traders</h1>
          <CardGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  // ... 기존 렌더링 코드
}
```

#### 4. Strategies.tsx 적용
```typescript
import { CardGridSkeleton } from '@/components/common/Skeletons';

export function Strategies() {
  // ... 기존 코드
  const { strategies, loading } = useStrategies(50);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">Strategies</h1>
          <CardGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  // ... 기존 렌더링 코드
}
```

#### 5. Portfolio.tsx 적용
```typescript
import { CardGridSkeleton, TableSkeleton } from '@/components/common/Skeletons';

export function Portfolio() {
  // ... 기존 코드
  const loading = portfolioLoading || txLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">Portfolio</h1>
          <CardGridSkeleton count={4} />
          <TableSkeleton rowCount={5} />
        </div>
      </div>
    );
  }

  // ... 기존 렌더링 코드
}
```

### 테스트 체크리스트
- [ ] Skeleton 컴포넌트들 로드됨
- [ ] 각 페이지에서 Skeleton 표시됨
- [ ] 데이터 로드 완료 후 Skeleton 제거
- [ ] 애니메이션 부드러움
- [ ] 색상 및 스타일 일관성
- [ ] 반응형 레이아웃 유지

---

## Task 6: 에러 처리 개선

### 개요
Firestore 에러를 사용자 친화적 메시지로 변환하여 UX 개선.

### 파일 생성

#### 파일: `src/lib/errorHandler.ts` (NEW)

```typescript
import { FirebaseError } from 'firebase/app';

/**
 * Firebase/Firestore 에러 코드를 사용자 친화적 메시지로 매핑
 */
export const firebaseErrorMessages: Record<string, string> = {
  // Authentication errors
  'auth/user-not-found': '등록되지 않은 사용자입니다',
  'auth/wrong-password': '잘못된 비밀번호입니다',
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다',
  'auth/weak-password': '비밀번호가 너무 약합니다 (최소 6자)',
  'auth/invalid-email': '잘못된 이메일 형식입니다',
  'auth/user-disabled': '비활성화된 계정입니다',
  'auth/too-many-requests': '너무 많은 시도가 있었습니다. 나중에 다시 시도해주세요',
  'auth/operation-not-allowed': '이 로그인 방식은 사용할 수 없습니다',
  'auth/invalid-api-key': '설정 오류가 있습니다. 관리자에게 문의해주세요',

  // Firestore errors
  'permission-denied': '이 데이터에 접근할 권한이 없습니다',
  'not-found': '요청한 데이터를 찾을 수 없습니다',
  'already-exists': '이미 존재하는 데이터입니다',
  'failed-precondition': '작업을 수행하기 위한 조건이 충족되지 않았습니다',
  'aborted': '작업이 중단되었습니다. 다시 시도해주세요',
  'unavailable': '서비스를 일시적으로 이용할 수 없습니다. 나중에 다시 시도해주세요',
  'unauthenticated': '로그인이 필요합니다. 다시 로그인해주세요',
  'invalid-argument': '잘못된 요청입니다. 입력값을 확인해주세요',
  'out-of-range': '범위를 초과한 값입니다',
  'deadline-exceeded': '요청 시간이 초과되었습니다. 다시 시도해주세요',
  'resource-exhausted': '리소스가 부족합니다. 나중에 다시 시도해주세요',
  'internal': '서버 오류가 발생했습니다. 나중에 다시 시도해주세요',

  // Network errors
  'network-error': '네트워크 연결을 확인해주세요',
  'timeout': '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요',
  'connection-error': '서버에 연결할 수 없습니다',
};

/**
 * Firebase 에러를 사용자 친화적 메시지로 변환
 *
 * @param error - Firebase 에러 또는 일반 Error
 * @param defaultMessage - 매칭되지 않을 때 기본 메시지
 * @returns 사용자 친화적 에러 메시지
 *
 * @example
 * try {
 *   // Firebase 작업
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   addToast(message, 'error');
 * }
 */
export function getErrorMessage(
  error: any,
  defaultMessage: string = '예기치 않은 오류가 발생했습니다'
): string {
  // Firebase 에러
  if (error instanceof FirebaseError) {
    // 정확한 코드 매칭
    if (firebaseErrorMessages[error.code]) {
      return firebaseErrorMessages[error.code];
    }

    // 부분 매칭 (예: 'auth/user-not-found'에서 'user-not-found' 찾기)
    for (const [code, message] of Object.entries(firebaseErrorMessages)) {
      if (error.code.includes(code)) {
        return message;
      }
    }

    // Firebase 에러 메시지 직접 사용
    return error.message || defaultMessage;
  }

  // 일반 Error
  if (error instanceof Error) {
    const errorMsg = error.message;

    // 에러 메시지에서 키워드 찾기
    for (const [code, message] of Object.entries(firebaseErrorMessages)) {
      if (errorMsg.toLowerCase().includes(code.toLowerCase())) {
        return message;
      }
    }

    return errorMsg || defaultMessage;
  }

  // 문자열 에러
  if (typeof error === 'string') {
    for (const [code, message] of Object.entries(firebaseErrorMessages)) {
      if (error.toLowerCase().includes(code.toLowerCase())) {
        return message;
      }
    }
    return error;
  }

  return defaultMessage;
}

/**
 * 에러 로깅 (개발/프로덕션 모드)
 */
export function logError(
  error: any,
  context: string = 'Unknown'
): void {
  console.error(`[${context}]`, error);

  // 프로덕션 환경에서는 외부 서비스로 전송 가능
  // Sentry, LogRocket, etc.
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // 예: Sentry.captureException(error);
  }
}

/**
 * 특정 에러 타입 확인
 */
export const errorChecks = {
  isNetworkError: (error: any): boolean => {
    if (error instanceof FirebaseError) {
      return error.code === 'unavailable' || error.code === 'connection-error';
    }
    return error?.message?.toLowerCase().includes('network');
  },

  isAuthError: (error: any): boolean => {
    if (error instanceof FirebaseError) {
      return error.code.startsWith('auth/');
    }
    return false;
  },

  isPermissionError: (error: any): boolean => {
    if (error instanceof FirebaseError) {
      return error.code === 'permission-denied';
    }
    return false;
  },

  isNotFoundError: (error: any): boolean => {
    if (error instanceof FirebaseError) {
      return error.code === 'not-found';
    }
    return false;
  },
};
```

### 훅에 통합

#### 1. usePortfolio.ts 적용
```typescript
import { getErrorMessage, logError } from '@/lib/errorHandler';

// onSnapshot 에러 핸들러
(err) => {
  logError(err, 'usePortfolio');
  const message = getErrorMessage(err, 'Failed to fetch investments');
  setError(new Error(message));
  setLoading(false);
}
```

#### 2. useTransactions.ts 적용
```typescript
import { getErrorMessage, logError } from '@/lib/errorHandler';

(err) => {
  logError(err, 'useTransactions');
  const message = getErrorMessage(err, 'Failed to fetch transactions');
  setError(new Error(message));
  setLoading(false);
}
```

#### 3. useTraders.ts, useStrategies.ts, useLeaderboard.ts 등도 동일하게 적용

### 페이지에서 사용

```typescript
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/errorHandler';

export function MyPage() {
  const { addToast } = useToast();
  const { data, error } = useSomeHook();

  useEffect(() => {
    if (error) {
      const message = getErrorMessage(error);
      addToast(message, 'error');
    }
  }, [error, addToast]);

  // ... 렌더링
}
```

### 테스트 시나리오

```typescript
// 테스트 1: Firebase 에러
import { FirebaseError } from 'firebase/app';

const fbError = new FirebaseError('auth/user-not-found', 'User not found');
console.log(getErrorMessage(fbError));
// 출력: "등록되지 않은 사용자입니다"

// 테스트 2: 일반 에러
const generalError = new Error('permission-denied');
console.log(getErrorMessage(generalError));
// 출력: "이 데이터에 접근할 권한이 없습니다"

// 테스트 3: 문자열 에러
console.log(getErrorMessage('unavailable'));
// 출력: "서비스를 일시적으로 이용할 수 없습니다. 나중에 다시 시도해주세요"
```

### 테스트 체크리스트
- [ ] 에러 메시지 정상 변환
- [ ] 매칭되지 않는 에러 기본 메시지
- [ ] 모든 타입의 에러 처리
- [ ] Toast와 통합 작동
- [ ] 로깅 함수 작동
- [ ] 에러 체크 함수들 정확

---

## 📝 작업 완료 체크리스트

### Task 4 완료 시
- [ ] ToastProvider.tsx 생성
- [ ] useToast.ts 수정
- [ ] App.tsx에 ToastProvider 추가
- [ ] Toast 여러 개 동시 표시 확인
- [ ] 자동 닫기 작동
- [ ] 타입별 스타일 정확

### Task 5 완료 시
- [ ] Skeletons.tsx 생성
- [ ] 5개 페이지에 적용
- [ ] 로딩 상태 UI 표시 확인
- [ ] 데이터 로드 후 제거
- [ ] 반응형 레이아웃 유지

### Task 6 완료 시
- [ ] errorHandler.ts 생성
- [ ] 모든 훅에 통합
- [ ] 에러 메시지 한국화 완료
- [ ] Toast 알림과 함께 작동
- [ ] 에러 로깅 함수 작동

---

## 🚀 다음 단계

모든 Task 4-6 완료 후:
1. `npm run build` - 타입 체크
2. `npm run dev` - 개발 서버 실행
3. 각 페이지에서 에러 상황 테스트
4. Toast 알림 정상 표시 확인
5. Skeleton 로딩 UI 확인
6. Git 커밋

