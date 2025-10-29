# 📋 Day 1-2: 실시간 데이터 동기화 완성 - 작업 지시서 (완전 독립 버전)

**작업 기간**: 2025년 10월 31일 ~ 11월 1일
**상태**: 📌 준비 완료
**목표**: usePortfolio 훅 및 Portfolio, Profile 페이지 데이터 연동

---

## ⚠️ 중요: 이 문서로만 작업 가능

이 지시서는 **다른 문서를 참고할 필요 없이** 완전히 독립적으로 작업을 진행할 수 있도록 작성되었습니다.

### 📁 작업 폴더
```
모든 작업은 여기서만 진행:
👉 d:\jjumV\yoloseum-phase3-ui\
```

### 📦 의존성 확인 및 실행

```bash
# 1단계: 프로젝트 폴더로 이동
cd d:\jjumV\yoloseum-phase3-ui

# 2단계: 필수 패키지 확인
npm list react firebase react-router-dom
# 출력 예시:
# react@19.0.0 ✅
# firebase@10.x.x ✅
# react-router-dom@6.x.x ✅

# 3단계: 개발 서버 실행
npm run dev
# 출력: ➜  Local:   http://localhost:5173/
```

**필수 의존성:**
- ✅ react@19.0.0 (이미 설치)
- ✅ firebase@^10.0.0 (이미 설치)
- ✅ react-router-dom@^6.0.0 (이미 설치)

---

## 🎯 Day 1-2 최종 목표

```
✅ usePortfolio 훅 완성 (신규 생성)
✅ Portfolio 페이지 실시간 데이터 연동
✅ Profile 페이지 사용자 정보 동기화
✅ 로딩/에러 상태 처리
✅ 모든 파일 TypeScript 컴파일 에러 0개
✅ npm run build 성공
```

---

## 📌 Task 1: usePortfolio 훅 추가 구현

### 작업 위치
```
파일명: usePortfolio.ts
경로: yoloseum-phase3-ui/src/hooks/usePortfolio.ts
상태: NEW (신규 생성)
```

### 현재 프로젝트의 훅 구조 이해

**현재 존재하는 훅들:**
```
✅ yoloseum-phase3-ui/src/hooks/
├─ useAuth.ts              (인증 상태)
├─ useUserProfile.ts       (사용자 정보 - 이것을 참고!)
├─ useTransactions.ts      (거래 이력)
├─ useLeaderboard.ts       (랭킹 데이터)
├─ useTraders.ts           (트레이더 목록)
├─ useStrategies.ts        (전략 목록)
└─ use-toast.ts            (알림)
```

### useUserProfile.ts의 구조 (참고할 코드)

usePortfolio를 만들 때 `useUserProfile.ts`의 패턴을 따릅니다:

```typescript
// yoloseum-phase3-ui/src/hooks/useUserProfile.ts (기존 파일 참고)
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import type { DocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/firestore";

interface UseUserProfileReturn {
  userProfile: User | null;
  loading: boolean;
  error: Error | null;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!authUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userDocRef = doc(db, "users", authUser.id);

      const unsubscribe = onSnapshot(
        userDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as User);
            setError(null);
          } else {
            setUserProfile(null);
            setError(new Error("User profile not found"));
          }
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching user profile:", err);
          setError(err instanceof Error ? err : new Error("Failed to fetch"));
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error("Unknown error");
      setError(errorMessage);
      setLoading(false);
    }
  }, [authUser]);

  return { userProfile, loading, error };
};
```

**이 패턴의 핵심:**
1. `useAuth()` 훅으로 현재 사용자 확인
2. `onSnapshot()`으로 실시간 리스너 설정
3. cleanup 함수에서 구독 해제 (`return unsubscribe`)
4. 타입 안정성 (`as User`, `Error | null`)

### 1-1. usePortfolio 훅 전체 코드

**파일:** `yoloseum-phase3-ui/src/hooks/usePortfolio.ts` (신규 생성)

```typescript
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/types/firestore";

// ===== Type 정의 =====
/**
 * 사용자의 개별 투자 항목
 * supporters 컬렉션에서 가져온 데이터
 */
interface Investment {
  id: string;                    // 투자 ID (Firestore doc ID)
  traderId: string;              // 트레이더 ID
  strategyId: string;            // 전략 ID
  traderName: string;            // 트레이더 이름
  strategyName: string;          // 전략 이름
  investedAmount: number;        // 투자액 (USD)
  currentValue: number;          // 현재 평가액 (USD)
  roi: number;                   // 수익률 (%)
  investedDate: Date;            // 투자 일자
  lastUpdated: Date;             // 마지막 업데이트 날짜
}

/**
 * 포트폴리오 전체 통계
 */
interface PortfolioStats {
  totalInvested: number;         // 총 투자액
  totalValue: number;            // 현재 총 평가액
  totalROI: number;              // 전체 수익률 (%)
  activeStrategies: number;      // 활성 전략 수
  unrealizedProfit: number;      // 미실현 이익 (USD)
}

/**
 * usePortfolio 훅의 반환값
 */
interface UsePortfolioReturn {
  investments: Investment[];
  stats: PortfolioStats;
  loading: boolean;
  error: Error | null;
  refreshData: () => void;
}

// ===== Custom Hook =====
/**
 * 사용자의 포트폴리오 데이터를 실시간으로 가져오는 훅
 *
 * @returns {UsePortfolioReturn} 투자 목록, 통계, 로딩 상태, 에러
 *
 * @example
 * const { investments, stats, loading, error } = usePortfolio();
 *
 * if (loading) return <Skeleton />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     <StatCard label="총 투자액" value={stats.totalInvested} />
 *     <InvestmentTable investments={investments} />
 *   </div>
 * );
 */
export const usePortfolio = (): UsePortfolioReturn => {
  // ===== State Management =====
  const { user: authUser } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalValue: 0,
    totalROI: 0,
    activeStrategies: 0,
    unrealizedProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ===== Real-time Listener Setup =====
  useEffect(() => {
    // 단계 1: 사용자 확인
    if (!authUser) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 단계 2: Firestore 쿼리 구성
      // 'supporters' 컬렉션에서 현재 사용자의 투자 기록 조회
      // 📌 참고: Firestore 컬렉션 구조
      // firestore/
      //   └─ supporters/
      //      ├─ {docId}
      //      │  ├─ supporterId: "user123"     (현재 사용자)
      //      │  ├─ traderId: "trader456"
      //      │  ├─ strategyId: "strategy789"
      //      │  ├─ investedAmount: 1000
      //      │  ├─ currentValue: 1250
      //      │  └─ investedDate: Timestamp

      const portfolioQuery = query(
        collection(db, "supporters"),
        where("supporterId", "==", authUser.id),
        orderBy("investedDate", "desc")  // 최신 투자부터
      );

      // 단계 3: 실시간 리스너 설정
      const unsubscribe = onSnapshot(
        portfolioQuery,
        (snapshot) => {
          // ✅ 성공: 데이터 수신
          const investmentsList: Investment[] = snapshot.docs.map((doc) => {
            const data = doc.data();

            // Timestamp를 Date로 변환
            const investedDate = data.investedDate?.toDate?.() || new Date();
            const lastUpdated = data.lastUpdated?.toDate?.() || new Date();

            // ROI 계산: ((현재가 - 투자액) / 투자액) * 100
            const roi =
              data.investedAmount > 0
                ? ((data.currentValue - data.investedAmount) / data.investedAmount) * 100
                : 0;

            return {
              id: doc.id,
              traderId: data.traderId,
              strategyId: data.strategyId,
              traderName: data.traderName,
              strategyName: data.strategyName,
              investedAmount: data.investedAmount,
              currentValue: data.currentValue,
              roi,
              investedDate,
              lastUpdated,
            };
          });

          // 단계 4: 포트폴리오 통계 계산
          const totalInvested = investmentsList.reduce(
            (sum, inv) => sum + inv.investedAmount,
            0
          );
          const totalValue = investmentsList.reduce(
            (sum, inv) => sum + inv.currentValue,
            0
          );
          const totalROI =
            totalInvested > 0
              ? ((totalValue - totalInvested) / totalInvested) * 100
              : 0;
          const activeStrategies = new Set(
            investmentsList.map((inv) => inv.strategyId)
          ).size;
          const unrealizedProfit = totalValue - totalInvested;

          const calculatedStats: PortfolioStats = {
            totalInvested,
            totalValue,
            totalROI,
            activeStrategies,
            unrealizedProfit,
          };

          // 단계 5: State 업데이트
          setInvestments(investmentsList);
          setStats(calculatedStats);
          setError(null);
          setLoading(false);
        },
        (err) => {
          // ❌ 에러: 데이터 수신 실패
          console.error("Portfolio 데이터 로드 실패:", err);
          setError(
            err instanceof Error
              ? err
              : new Error("포트폴리오 데이터를 불러올 수 없습니다")
          );
          setLoading(false);
        }
      );

      // 단계 6: Cleanup - 컴포넌트 언마운트 시 구독 해제
      return () => {
        unsubscribe();
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다");
      setError(errorMessage);
      setLoading(false);
    }
  }, [authUser?.id]);

  // ===== Refresh Function =====
  const refreshData = () => {
    // 재로드가 필요한 경우 수동으로 로딩 상태 재설정
    setLoading(true);
  };

  return {
    investments,
    stats,
    loading,
    error,
    refreshData,
  };
};
```

### 1-2. 파일 생성 절차

**Step 1: VSCode에서 파일 생성**
```
1. 좌측 Explorer에서 src/hooks 폴더 우클릭
2. "New File" 클릭
3. 파일명: usePortfolio.ts
4. 위의 전체 코드 복사-붙여넣기
5. Ctrl+S 저장
```

**Step 2: 타입 체크**
```bash
# 터미널에서
npx tsc --noEmit

# 오류 없으면:
# ✅ 성공 (출력 없음)

# 오류가 있으면:
# ❌ src/hooks/usePortfolio.ts(45): error TS...
# → 오류 메시지 읽고 수정
```

**Step 3: 브라우저 확인**
```bash
# 개발 서버가 실행 중이면 자동 새로고침
# http://localhost:5173 확인
# 콘솔 에러 없는지 확인 (F12)
```

### 체크리스트 - Task 1

- [ ] `yoloseum-phase3-ui/src/hooks/usePortfolio.ts` 파일 생성
- [ ] 전체 코드 복사-붙여넣기 완료
- [ ] `npx tsc --noEmit` 에러 0개
- [ ] 파일이 `src/hooks/` 폴더에 있는지 확인
- [ ] 다른 훅들과 함께 나열되는지 확인
  ```bash
  ls src/hooks/
  # useAuth.ts
  # usePortfolio.ts ← 새로 생성된 파일
  # useUserProfile.ts
  # ... 등등
  ```

---

## 📌 Task 2: Portfolio 페이지 데이터 연동

### 작업 위치
```
파일: yoloseum-phase3-ui/src/components/pages/Portfolio.tsx
상태: UPDATE (기존 파일 수정)
```

### 현재 Portfolio.tsx 확인

먼저 기존 파일의 구조를 확인하세요:

```bash
# 파일 존재 확인
test -f "d:\jjumV\yoloseum-phase3-ui\src\components\pages\Portfolio.tsx" && echo "파일 존재" || echo "파일 없음"
```

**현재 Portfolio.tsx의 구조:**
```typescript
// yoloseum-phase3-ui/src/components/pages/Portfolio.tsx
export const Portfolio: React.FC = () => {
  // 기존 구현...
  return (
    <div className="...">
      {/* 기존 내용 */}
    </div>
  );
};
```

### 2-1. Portfolio 페이지에 usePortfolio 훅 통합

**기존 파일 수정:**

```typescript
// yoloseum-phase3-ui/src/components/pages/Portfolio.tsx

import { usePortfolio } from "@/hooks/usePortfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export const Portfolio: React.FC = () => {
  // ✅ Task 2-1-A: usePortfolio 훅 사용
  const { investments, stats, loading, error } = usePortfolio();

  // ✅ Task 2-1-B: 로딩 상태 UI
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 테이블 스켈레톤 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Task 2-1-C: 에러 상태 UI
  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <div>
          <h3 className="font-semibold text-red-800">오류 발생</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // ✅ Task 2-1-D: 통계 카드 렌더링
  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 카드 1: 총 투자액 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              총 투자액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalInvested.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </div>
          </CardContent>
        </Card>

        {/* 카드 2: 현재 평가액 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              현재 평가액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.totalValue.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </div>
            <p
              className={`text-sm mt-1 ${
                stats.totalROI >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.totalROI >= 0 ? "+" : ""}
              {stats.totalROI.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        {/* 카드 3: 실현 수익 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              실현 수익
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.unrealizedProfit >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ${stats.unrealizedProfit.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </div>
          </CardContent>
        </Card>

        {/* 카드 4: 활성 전략 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              활성 전략
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.activeStrategies}
            </div>
            <p className="text-sm text-gray-500 mt-1">개</p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Task 2-1-E: 투자 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>투자 현황</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-medium">투자한 전략이 없습니다</p>
              <p className="text-sm mt-2">
                <a href="/strategies" className="text-blue-600 hover:underline">
                  전략 둘러보기
                </a>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      전략명
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      트레이더
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      투자액
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      현재 평가
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      ROI
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      투자일
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 font-medium">{inv.strategyName}</td>
                      <td className="py-3 px-4">{inv.traderName}</td>
                      <td className="py-3 px-4 text-right">
                        ${inv.investedAmount.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        ${inv.currentValue.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-semibold ${
                          inv.roi >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {inv.roi >= 0 ? "+" : ""}
                        {inv.roi.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4">
                        {inv.investedDate.toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

### 2-2. 수정 절차

**Step 1: Portfolio.tsx 파일 열기**
```
1. VSCode에서 src/components/pages/Portfolio.tsx 열기
2. 기존 코드 대체 (위의 코드로)
3. Ctrl+S 저장
```

**Step 2: 타입 체크 및 테스트**
```bash
# 타입 확인
npx tsc --noEmit

# 에러 없으면 브라우저에서 확인
# http://localhost:5173/portfolio
# (로그인 후 확인)
```

### 체크리스트 - Task 2

- [ ] `Portfolio.tsx` 파일 수정 완료
- [ ] `usePortfolio` import 추가 확인
- [ ] `npx tsc --noEmit` 에러 0개
- [ ] 브라우저에서 `/portfolio` 접속
- [ ] 로딩 상태 Skeleton 표시 확인
- [ ] 데이터 로드 후 통계 카드 표시 확인
- [ ] 투자 목록 테이블 표시 확인 (또는 "투자한 전략이 없습니다" 메시지)

---

## 📌 Task 3: Profile 페이지 사용자 정보 동기화

### 작업 위치
```
파일: yoloseum-phase3-ui/src/components/pages/Profile.tsx
상태: UPDATE (기존 파일 수정)
```

### 현재 Profile.tsx 상태

**이미 494줄로 충분히 구현되어 있습니다.**
Profile.tsx는 이미:
- ✅ useUserProfile 훅 사용 중
- ✅ 사용자 정보 표시 중
- ✅ 프로필 이미지 표시 중
- ✅ 팔로우 트레이더 목록 표시 중

### 3-1. 최소 필요 수정

Profile.tsx에서 필요한 것은 **추가 개선** 정도입니다.

```typescript
// yoloseum-phase3-ui/src/components/pages/Profile.tsx

// 기존 코드 유지, 다음 부분 추가:

// 프로필 로딩 상태 개선
if (loading) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

// 프로필 에러 처리
if (error) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-600" />
      <span className="text-red-600">{error.message}</span>
    </div>
  );
}

// 프로필 데이터 없음
if (!userProfile) {
  return (
    <div className="text-center py-8 text-gray-500">
      프로필을 불러올 수 없습니다. 나중에 다시 시도해주세요.
    </div>
  );
}
```

### 3-2. 기존 코드 유지

**중요:** Profile.tsx는 이미 잘 구현되어 있으므로:
- ✅ 기존 코드 유지
- ✅ 로딩/에러 상태만 추가 (위의 코드)
- ✅ 새로운 기능 불필요

### 체크리스트 - Task 3

- [ ] Profile.tsx 파일 확인 (기존 코드 유지)
- [ ] 로딩 상태 Skeleton 처리 추가 (선택 사항)
- [ ] 에러 상태 처리 추가 (선택 사항)
- [ ] 브라우저에서 `/profile` 접속
- [ ] 사용자 정보 표시 확인
- [ ] 팔로우 트레이더 목록 표시 확인

---

## 🧪 Day 1-2 최종 테스트

### 개발 서버 상태 확인

```bash
# 개발 서버 실행 확인
npm run dev

# 출력 예시:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### 각 페이지 테스트

**1. Dashboard 페이지**
```
URL: http://localhost:5173/dashboard
확인 사항:
[ ] 페이지 로드 됨
[ ] 통계 카드 표시됨
[ ] 콘솔 에러 없음
```

**2. Portfolio 페이지**
```
URL: http://localhost:5173/portfolio
확인 사항:
[ ] 로딩 상태 표시 (Skeleton)
[ ] 데이터 로드됨
[ ] 통계 카드 4개 표시
[ ] 투자 목록 테이블 또는 "투자한 전략이 없습니다" 메시지
[ ] 콘솔 에러 없음
```

**3. Profile 페이지**
```
URL: http://localhost:5173/profile
확인 사항:
[ ] 사용자 정보 표시됨
[ ] 프로필 이미지 표시됨
[ ] 팔로우 정보 표시됨
[ ] 콘솔 에러 없음
```

### TypeScript 컴파일 테스트

```bash
# 모든 TypeScript 파일 타입 체크
npx tsc --noEmit

# 결과:
# ✅ 성공: 아무 출력 없음
# ❌ 실패: 에러 메시지 출력

# 에러가 있으면:
# src/hooks/usePortfolio.ts(45): error TS2304: Cannot find name 'Investment'
# → 코드 검토 후 수정
```

### 빌드 테스트

```bash
# 프로덕션 빌드
npm run build

# 결과:
# ✅ 성공: dist/ 폴더 생성
# ❌ 실패: 에러 메시지 출력

# 빌드 크기 확인
# dist/assets/
# ├─ index-xxx.js
# ├─ index-xxx.css
# └─ ...
```

### 콘솔 에러 확인

```javascript
// 브라우저 개발자 도구 (F12)
// Console 탭에서 에러 확인

// 정상:
// ✅ 에러 메시지 없음
// ✅ 경고 정도는 괜찮음

// 문제:
// ❌ "Cannot find module"
// ❌ "usePortfolio is not defined"
// ❌ "Firestore error"
```

---

## 🎯 완료 체크리스트 - Day 1-2

### Task 1: usePortfolio 훅
- [ ] 파일 생성: `yoloseum-phase3-ui/src/hooks/usePortfolio.ts`
- [ ] 모든 코드 작성 완료
- [ ] `npx tsc --noEmit` 에러 0개
- [ ] 파일이 src/hooks/ 폴더에 있음
- [ ] 다른 훅들과 함께 나열됨

### Task 2: Portfolio 페이지
- [ ] 파일 수정: `yoloseum-phase3-ui/src/components/pages/Portfolio.tsx`
- [ ] usePortfolio 훅 import 추가
- [ ] 로딩 상태 UI 구현
- [ ] 에러 상태 UI 구현
- [ ] 통계 카드 4개 표시
- [ ] 투자 목록 테이블 표시
- [ ] 모바일 반응형 확인
- [ ] `npx tsc --noEmit` 에러 0개

### Task 3: Profile 페이지
- [ ] 파일 확인: `yoloseum-phase3-ui/src/components/pages/Profile.tsx`
- [ ] 로딩/에러 상태 처리 확인
- [ ] 사용자 정보 표시 확인
- [ ] 팔로우 정보 표시 확인

### 최종 확인
- [ ] 개발 서버 실행: `npm run dev` ✅
- [ ] Dashboard 페이지 동작 ✅
- [ ] Portfolio 페이지 동작 ✅
- [ ] Profile 페이지 동작 ✅
- [ ] TypeScript 컴파일 에러 0개: `npx tsc --noEmit` ✅
- [ ] 프로덕션 빌드 성공: `npm run build` ✅
- [ ] 콘솔 에러 없음 ✅

### Git 커밋 (완료 후)

```bash
cd d:\jjumV\yoloseum-phase3-ui

# 변경사항 확인
git status

# 변경사항 스테이징
git add .

# 커밋
git commit -m "feat: Implement usePortfolio hook and synchronize Portfolio/Profile pages with real-time data

- Add usePortfolio custom hook for investment tracking
- Implement real-time Firestore listener for supporters collection
- Calculate portfolio statistics (ROI, total value, active strategies)
- Update Portfolio page with data binding
- Enhance Profile page with loading and error states
- Implement Skeleton loading UI for Portfolio page
- Add proper error handling with user-friendly messages

Changes:
- New: src/hooks/usePortfolio.ts (140+ lines)
- Updated: src/components/pages/Portfolio.tsx
- Updated: src/components/pages/Profile.tsx

Test Results:
✅ TypeScript compilation: 0 errors
✅ Build successful: npm run build
✅ All pages load correctly
✅ Real-time data sync works
✅ Mobile responsive design verified"

# 푸시 (원격 저장소가 있는 경우)
git push origin main
```

---

## 💡 문제 해결

### 문제 1: "Cannot find module '@/lib/firebase'"
```
원인: import 경로 오류
해결:
- 경로가 @/lib/firebase인지 확인
- 또는 @/config/firebase인지 확인
- 프로젝트의 실제 경로 사용
```

### 문제 2: "useAuth is not defined"
```
원인: useAuth 훅을 import하지 않음
해결:
import { useAuth } from "@/hooks/useAuth";
```

### 문제 3: "onSnapshot is not a function"
```
원인: firebase/firestore에서 import하지 않음
해결:
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
```

### 문제 4: Portfolio 페이지에 데이터가 안 나타남
```
원인: Firestore에 supporters 컬렉션이 없음
해결:
1. Firebase Console → Firestore Database
2. 컬렉션 생성: supporters
3. 샘플 문서 추가:
   {
     "supporterId": "user123",
     "traderId": "trader456",
     "investedAmount": 1000,
     "currentValue": 1250,
     "investedDate": Timestamp,
     "traderName": "John Trader",
     "strategyName": "Growth Strategy"
   }
```

### 문제 5: "Property 'toDate' does not exist"
```
원인: Firestore Timestamp 처리 오류
해결:
const investedDate = data.investedDate?.toDate?.() || new Date();
// toDate() 메서드가 없으면 new Date() 사용
```

---

## 📚 참고 자료

### Firestore 컬렉션 구조
```
firestore/
├─ users/
│  └─ {uid}
│     ├─ displayName: string
│     ├─ email: string
│     └─ ...
│
└─ supporters/
   └─ {docId}
      ├─ supporterId: string  ← 투자자 ID
      ├─ traderId: string     ← 트레이더 ID
      ├─ strategyId: string
      ├─ investedAmount: number
      ├─ currentValue: number
      ├─ investedDate: Timestamp
      ├─ traderName: string
      └─ strategyName: string
```

### React Hooks 문서
- [React Hooks](https://react.dev/reference/react)
- [useEffect](https://react.dev/reference/react/useEffect)
- [useState](https://react.dev/reference/react/useState)

### Firebase Firestore 문서
- [Firestore Realtime Updates](https://firebase.google.com/docs/firestore/query-data/listen)
- [onSnapshot](https://firebase.google.com/docs/firestore/query-data/listen)
- [Query Constraints](https://firebase.google.com/docs/firestore/query-data/queries)

---

## ✅ Day 1-2 완료 후

**다음 단계:**
1. ✅ Day 1-2 모든 Task 완료
2. ➡️ Day 3로 진행: 사용자 피드백 시스템
3. 📌 커밋 메시지: "feat: Complete Day 1-2 real-time data sync"

---

**작성일**: 2025년 10월 30일
**예상 완료**: 2025년 11월 1일
**상태**: 📌 완전 독립 버전 - 다른 문서 참고 불필요

🚀 **이제 이 문서만으로 Day 1-2를 완전히 진행할 수 있습니다!**
