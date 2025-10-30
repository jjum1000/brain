# Day 1-2: Task 1-3 상세 구현 지시서

**기간**: Day 1-2 (실시간 데이터 동기화 완성)
**포함 태스크**: Task 1, Task 2, Task 3
**예상 시간**: 8-10시간

---

## Task 1: usePortfolio 훅 구현

### 개요
`/supporters` 컬렉션을 실시간으로 구독하고 포트폴리오 통계를 계산하는 React 훅.

### 파일 생성
**경로**: `yoloseum-phase3-ui/src/hooks/usePortfolio.ts` (NEW)

### 전체 구현 코드

```typescript
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { Support } from "@/types/firestore";

interface PortfolioStatistics {
  totalInvested: number;           // 전체 투자액 (USD)
  activeInvestments: number;       // 활성 투자 개수
  totalROI: number;                // 총 ROI (%)
  totalEarned: number;             // 총 수익액 (USD)
  totalRealizedProfit: number;     // 현실화된 수익 (USD)
}

interface UsePortfolioReturn {
  investments: Support[];
  statistics: PortfolioStatistics;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and listen to user's investments (supporters) from Firestore
 * Calculates portfolio statistics in real-time
 *
 * @param {number} [limitCount=50] - Number of investments to fetch (default: 50)
 * @returns {UsePortfolioReturn} Array of investments, statistics, loading state, and error
 *
 * @example
 * const { investments, statistics, loading, error } = usePortfolio(100);
 *
 * if (loading) return <div>Loading portfolio...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     <p>Total Invested: ${statistics.totalInvested}</p>
 *     <p>Total ROI: {statistics.totalROI}%</p>
 *     {investments.map(inv => (
 *       <div key={inv.id}>{inv.strategyId}: ${inv.investmentAmount}</div>
 *     ))}
 *   </div>
 * );
 */
export const usePortfolio = (limitCount: number = 50): UsePortfolioReturn => {
  const { user: authUser } = useAuth();
  const [investments, setInvestments] = useState<Support[]>([]);
  const [statistics, setStatistics] = useState<PortfolioStatistics>({
    totalInvested: 0,
    activeInvestments: 0,
    totalROI: 0,
    totalEarned: 0,
    totalRealizedProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate statistics from investments
  const calculateStatistics = (invs: Support[]): PortfolioStatistics => {
    let totalInvested = 0;
    let activeCount = 0;
    let totalEarned = 0;
    let totalRealizedProfit = 0;

    invs.forEach((inv) => {
      totalInvested += inv.investmentAmount;

      if (inv.status === "active") {
        activeCount++;
      }

      totalEarned += inv.returns.earned;
      totalRealizedProfit += inv.returns.realized;
    });

    const totalROI = totalInvested > 0
      ? parseFloat(((totalEarned / totalInvested) * 100).toFixed(2))
      : 0;

    return {
      totalInvested,
      activeInvestments: activeCount,
      totalROI,
      totalEarned,
      totalRealizedProfit,
    };
  };

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!authUser) {
      setInvestments([]);
      setStatistics({
        totalInvested: 0,
        activeInvestments: 0,
        totalROI: 0,
        totalEarned: 0,
        totalRealizedProfit: 0,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query investments for the authenticated user
      // Ordered by investedAt descending (most recent first)
      const supportersRef = collection(db, "supporters");
      const q = query(
        supportersRef,
        where("userId", "==", authUser.id),
        orderBy("investedAt", "desc"),
        limit(limitCount)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          try {
            const invs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            } as Support));

            setInvestments(invs);
            const stats = calculateStatistics(invs);
            setStatistics(stats);
            setError(null);
            setLoading(false);
          } catch (err) {
            console.error("Error processing investments:", err);
            const errorMessage = err instanceof Error
              ? err
              : new Error("Failed to process investments");
            setError(errorMessage);
            setLoading(false);
          }
        },
        (err) => {
          // Error querying investments
          console.error("Error fetching investments:", err);
          setError(err instanceof Error
            ? err
            : new Error("Failed to fetch investments"));
          setLoading(false);
        }
      );

      // Cleanup: unsubscribe from real-time updates when component unmounts
      return unsubscribe;
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err
        : new Error("Unknown error occurred");
      setError(errorMessage);
      setLoading(false);
    }
  }, [authUser, limitCount]);

  return {
    investments,
    statistics,
    loading,
    error,
  };
};
```

### 주요 구현 포인트

#### 1. 타입 정의
```typescript
interface PortfolioStatistics {
  totalInvested: number;        // 전체 투자액 합계
  activeInvestments: number;    // status == "active" 개수
  totalROI: number;             // (totalEarned / totalInvested) * 100
  totalEarned: number;          // 모든 returns.earned 합계
  totalRealizedProfit: number;  // 모든 returns.realized 합계
}
```

#### 2. Firestore 쿼리
- **Collection**: `supporters`
- **Filter**: `userId == authUser.id`
- **Sort**: `investedAt` DESC (최신순)
- **Limit**: limitCount (기본 50)

#### 3. 통계 계산 함수
```typescript
const calculateStatistics = (invs: Support[]) => {
  // 1. 투자액 합계 계산
  // 2. 활성 투자 개수 계산
  // 3. 총 수익액 합계
  // 4. ROI 계산: (totalEarned / totalInvested) * 100
}
```

#### 4. 실시간 구독
- `onSnapshot` 사용하여 실시간 업데이트
- 에러 콜백 분리
- Cleanup 함수에서 unsubscribe 반환

#### 5. 에러 처리
- Firestore 에러: 캡처 및 상태 저장
- 처리 에러: try-catch로 캡처
- 인증 안 된 사용자: 빈 배열 반환

### 테스트 체크리스트
- [ ] 로그인한 사용자가 자신의 투자만 조회 가능
- [ ] 투자 추가 시 실시간 업데이트
- [ ] 투자 삭제 시 통계 자동 갱신
- [ ] 로그아웃 시 빈 상태
- [ ] 네트워크 에러 시 에러 메시지
- [ ] 로딩 상태 정상 작동

---

## Task 2: Portfolio 페이지 데이터 연동

### 개요
`usePortfolio` 훅을 Portfolio 페이지에 통합하여 실시간 투자 정보 표시.

### 파일 수정
**경로**: `yoloseum-phase3-ui/src/components/pages/Portfolio.tsx` (UPDATE)

### 현재 상태 분석
**현재 코드** (Portfolio.tsx):
- `useTransactions` 훅 사용 (거래 이력만)
- 투자 목록 없음
- usePortfolio 미구현

### 수정 사항

#### 1. Import 추가
```typescript
// 맨 위에 추가
import { usePortfolio } from '@/hooks/usePortfolio';
```

#### 2. Hook 통합
```typescript
export function Portfolio() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { transactions, loading: txLoading, error: txError } = useTransactions(100);
  const { investments, statistics, loading: portfolioLoading, error: portfolioError } = usePortfolio(100);  // 추가
  const [filterType, setFilterType] = useState<string>('');

  // ... 기존 코드
}
```

#### 3. 통합 로딩/에러 상태
```typescript
// 기존 로딩 로직 수정
const loading = portfolioLoading || txLoading;  // 둘 다 체크
const error = portfolioError || txError;        // 둘 다 체크

if (loading) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-slate-300">Loading portfolio...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Alert className="bg-red-600/20 border-red-600">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200 ml-2">
            {error.message}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
```

#### 4. 통계 카드 업데이트
```typescript
// 기존 Portfolio Overview Cards 위에 추가
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Active Investments */}
  <Card className="bg-slate-800/50 border-slate-700">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Active Investments
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold text-blue-400">
        {statistics.activeInvestments}
      </p>
    </CardContent>
  </Card>

  {/* Total ROI */}
  <Card className="bg-slate-800/50 border-slate-700">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Portfolio ROI
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className={`text-3xl font-bold ${statistics.totalROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {statistics.totalROI.toFixed(2)}%
      </p>
    </CardContent>
  </Card>

  {/* Total Earned */}
  <Card className="bg-slate-800/50 border-slate-700">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Total Earned
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold text-green-400">
        ${statistics.totalEarned.toLocaleString('en-US', { maximumFractionDigits: 2 })}
      </p>
    </CardContent>
  </Card>

  {/* Total Invested (기존과 유사) */}
  <Card className="bg-slate-800/50 border-slate-700">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Total Invested
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold text-amber-400">
        ${statistics.totalInvested.toLocaleString('en-US', { maximumFractionDigits: 2 })}
      </p>
    </CardContent>
  </Card>
</div>
```

#### 5. 투자 목록 테이블 추가
```typescript
// Transaction History 카드 위에 추가
<Card className="bg-slate-800/50 border-slate-700 mb-8">
  <CardHeader>
    <div>
      <CardTitle className="text-white">Investment List</CardTitle>
      <CardDescription className="text-slate-400">
        Your active and closed investments
      </CardDescription>
    </div>
  </CardHeader>

  <CardContent className="p-0">
    {investments.length === 0 ? (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4 opacity-50" />
        <p className="text-slate-400">No investments found</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Strategy</TableHead>
              <TableHead className="text-slate-300">Investment Amount</TableHead>
              <TableHead className="text-slate-300">Current Profit</TableHead>
              <TableHead className="text-slate-300">ROI</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Invested Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((inv) => (
              <TableRow key={inv.id} className="border-slate-700 hover:bg-slate-800/30">
                <TableCell className="text-white font-semibold">
                  {inv.strategyId}
                </TableCell>
                <TableCell className="text-white font-semibold">
                  ${inv.investmentAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className={inv.returns.earned >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${inv.returns.earned.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className={inv.returns.roi >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {inv.returns.roi.toFixed(2)}%
                </TableCell>
                <TableCell>
                  <Badge className={inv.status === 'active' ? 'bg-green-600' : 'bg-slate-700'}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400">
                  {FirebaseTimestamp.toLocaleDateString(inv.investedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </CardContent>
</Card>
```

#### 6. Import 추가 (맨 위)
```typescript
import { Activity, DollarSign } from 'lucide-react';  // 아이콘 추가
```

### 테스트 체크리스트
- [ ] usePortfolio 훅 데이터 정상 로드
- [ ] 통계 카드 정확한 값 표시
- [ ] 투자 목록 테이블 렌더링
- [ ] 실시간 업데이트 작동
- [ ] 로딩 상태 UI 표시
- [ ] 에러 상황 처리

---

## Task 3: Profile 페이지 사용자 정보 동기화

### 개요
`useUserProfile` 훅으로 실시간 사용자 정보를 표시하고 업데이트.

### 파일 수정
**경로**: `yoloseum-phase3-ui/src/components/pages/Profile.tsx` (UPDATE)

### 현재 상태 분석
**현재 코드**:
- useUserProfile 훅 사용 (일부 작동)
- 기본 정보만 표시 (displayName, email, bio)
- 실시간 동기화 불완전

### 수정 사항

#### 1. 사용자 정보 섹션 확장 (Header 다음)
```typescript
// Header 아래에 추가
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
  {/* User Info Card */}
  <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
    <CardHeader>
      <CardTitle className="text-white">Profile Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Avatar & Name */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={userProfile?.photoURL || undefined}
            alt={userProfile?.displayName}
          />
          <AvatarFallback className="bg-amber-600 text-white">
            {userProfile?.displayName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xl font-bold text-white">
            {userProfile?.displayName || 'No name'}
          </p>
          <p className="text-sm text-slate-400">
            {userProfile?.email}
          </p>
          {userProfile?.verified && (
            <Badge className="bg-green-600 mt-2">Verified</Badge>
          )}
        </div>
      </div>

      {/* Bio */}
      <div>
        <p className="text-sm text-slate-400 mb-2">Bio</p>
        <p className="text-slate-300">
          {userProfile?.bio || 'No bio added'}
        </p>
      </div>

      {/* Wallet Address */}
      <div>
        <p className="text-sm text-slate-400 mb-2">Wallet Address</p>
        <div className="flex items-center gap-2">
          <code className="bg-slate-700 px-3 py-2 rounded text-amber-400 text-sm flex-1 overflow-auto">
            {userProfile?.walletAddress
              ? `${userProfile.walletAddress.slice(0, 6)}...${userProfile.walletAddress.slice(-4)}`
              : 'Not connected'}
          </code>
          {userProfile?.walletAddress && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(userProfile.walletAddress || '');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-slate-400 hover:text-amber-400"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Stats Card */}
  <Card className="bg-slate-800/50 border-slate-700">
    <CardHeader>
      <CardTitle className="text-white">Account Stats</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <p className="text-sm text-slate-400">Joined</p>
        <p className="text-white font-semibold">
          {userProfile?.createdAt
            ? FirebaseTimestamp.toLocaleDateString(userProfile.createdAt)
            : 'Unknown'}
        </p>
      </div>
      <div>
        <p className="text-sm text-slate-400">Role</p>
        <Badge className="bg-blue-600 capitalize">
          {userProfile?.role || 'spectator'}
        </Badge>
      </div>
      <div>
        <p className="text-sm text-slate-400">Following Count</p>
        <p className="text-white font-semibold">
          {userProfile?.stats?.followingCount || 0}
        </p>
      </div>
      <div>
        <p className="text-sm text-slate-400">Total Invested</p>
        <p className="text-white font-semibold">
          ${userProfile?.stats?.totalInvested?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '0'}
        </p>
      </div>
      <div>
        <p className="text-sm text-slate-400">Total Earnings</p>
        <p className="text-green-400 font-semibold">
          ${userProfile?.stats?.totalEarnings?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '0'}
        </p>
      </div>
    </CardContent>
  </Card>
</div>
```

#### 2. 관심 트레이더 목록 추가 (아래)
```typescript
{/* Favorite Traders */}
{userProfile?.stats?.favoriteTraders && userProfile.stats.favoriteTraders.length > 0 && (
  <Card className="bg-slate-800/50 border-slate-700 mb-8">
    <CardHeader>
      <CardTitle className="text-white">Favorite Traders</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {userProfile.stats.favoriteTraders.map((traderId) => (
          <Button
            key={traderId}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 justify-start"
            onClick={() => navigate(`/trader/${traderId}`)}
          >
            {traderId}
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
)}
```

#### 3. Form 기본값 업데이트
```typescript
// useEffect 추가 (기존 form 근처)
useEffect(() => {
  if (userProfile) {
    form.reset({
      displayName: userProfile.displayName || '',
      email: userProfile.email || '',
      bio: userProfile.bio || '',
      walletAddress: userProfile.walletAddress || '',
      youtubeUrl: '', // 향후 User 타입 확장 필요
      twitterUrl: '',
      discordUsername: '',
    });
  }
}, [userProfile, form]);
```

#### 4. 로딩 및 에러 상태 UI
```typescript
if (loading) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-slate-300">Loading profile...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Alert className="bg-red-600/20 border-red-600">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200 ml-2">
            {error.message}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
```

#### 5. Import 추가
```typescript
// 맨 위에 추가
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { useEffect } from 'react';  // 추가
```

### 테스트 체크리스트
- [ ] 사용자 정보 정상 표시
- [ ] 지갑 주소 복사 기능 작동
- [ ] 통계 정상 계산
- [ ] 관심 트레이더 목록 표시
- [ ] 실시간 업데이트 (정보 변경 시)
- [ ] 로딩/에러 상태 처리

---

## 📝 작업 완료 체크리스트

### Task 1 완료 시
- [ ] usePortfolio.ts 파일 생성
- [ ] 모든 타입 정의 완료
- [ ] calculateStatistics 함수 정상 작동
- [ ] onSnapshot 구독 정상 작동
- [ ] 에러 처리 완료
- [ ] Cleanup 함수 반환

### Task 2 완료 시
- [ ] usePortfolio import 추가
- [ ] Hook 통합
- [ ] 통계 카드 4개 추가
- [ ] 투자 목록 테이블 추가
- [ ] 로딩/에러 상태 처리
- [ ] 실시간 업데이트 확인

### Task 3 완료 시
- [ ] 사용자 정보 섹션 확장
- [ ] 지갑 주소 복사 기능
- [ ] 통계 카드 추가
- [ ] 관심 트레이더 목록
- [ ] Form 기본값 동기화
- [ ] 로딩/에러 UI

---

## 🚀 다음 단계

모든 Task 1-3 완료 후:
1. `npm run build` - 타입 체크
2. `npm run dev` - 개발 서버 실행
3. 페이지 접근 및 기능 테스트
4. 실시간 업데이트 확인
5. Git 커밋

