# 📋 Day 1-2: 실시간 데이터 동기화 완성 - 작업 지시서

**작업 기간**: 2025년 10월 31일 ~ 11월 1일
**상태**: 📌 준비 완료
**목표**: usePortfolio 훅 및 Portfolio, Profile 페이지 데이터 연동

---

## 🎯 Day 1-2 목표

```
✅ usePortfolio 훅 완성 및 테스트
✅ Portfolio 페이지 실시간 데이터 연동
✅ Profile 페이지 사용자 정보 동기화
✅ 로딩/에러 상태 처리
```

---

## 📌 Task 1: usePortfolio 훅 추가 구현

### 작업 위치
```
파일: src/hooks/usePortfolio.ts
상태: NEW (신규 생성)
```

### 작업 세부사항

#### 1-1. 파일 생성 및 Type 정의

```typescript
// src/hooks/usePortfolio.ts

import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

// ✅ Type 정의
interface Investment {
  id: string;
  traderId: string;
  strategyId: string;
  traderName: string;
  strategyName: string;
  investedAmount: number;
  currentValue: number;
  roi: number;
  investedDate: string;
  lastUpdated: string;
}

interface PortfolioStats {
  totalInvested: number;
  totalValue: number;
  totalROI: number;
  activeStrategies: number;
  unrealizedProfit: number;
}

interface UsePortfolioReturn {
  investments: Investment[];
  stats: PortfolioStats;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}
```

#### 1-2. 커스텀 훅 구현

```typescript
export const usePortfolio = (userId: string | undefined): UsePortfolioReturn => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalValue: 0,
    totalROI: 0,
    activeStrategies: 0,
    unrealizedProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // ✅ Task 1-2-A: Firestore supporters 컬렉션 구독
      const supportersQuery = query(
        collection(db, 'supporters'),
        where('supporterId', '==', userId),
        orderBy('investedDate', 'desc')
      );

      const unsubscribe = onSnapshot(
        supportersQuery,
        (snapshot) => {
          // ✅ Task 1-2-B: 투자 목록 매핑
          const investmentsList: Investment[] = snapshot.docs.map(doc => ({
            id: doc.id,
            traderId: doc.data().traderId,
            strategyId: doc.data().strategyId,
            traderName: doc.data().traderName,
            strategyName: doc.data().strategyName,
            investedAmount: doc.data().investedAmount,
            currentValue: doc.data().currentValue,
            roi: ((doc.data().currentValue - doc.data().investedAmount) / doc.data().investedAmount) * 100,
            investedDate: doc.data().investedDate,
            lastUpdated: doc.data().lastUpdated,
          }));

          // ✅ Task 1-2-C: 포트폴리오 통계 계산
          const calculatedStats: PortfolioStats = {
            totalInvested: investmentsList.reduce((sum, inv) => sum + inv.investedAmount, 0),
            totalValue: investmentsList.reduce((sum, inv) => sum + inv.currentValue, 0),
            totalROI: 0, // 계산할 예정
            activeStrategies: new Set(investmentsList.map(inv => inv.strategyId)).size,
            unrealizedProfit: 0, // 계산할 예정
          };

          // ✅ Task 1-2-D: ROI 및 이익 계산
          if (calculatedStats.totalInvested > 0) {
            calculatedStats.totalROI =
              ((calculatedStats.totalValue - calculatedStats.totalInvested) / calculatedStats.totalInvested) * 100;
            calculatedStats.unrealizedProfit = calculatedStats.totalValue - calculatedStats.totalInvested;
          }

          setInvestments(investmentsList);
          setStats(calculatedStats);
          setError(null);
          setLoading(false);
        },
        (err) => {
          // ✅ Task 1-2-E: 에러 처리
          console.error('Portfolio 데이터 로드 실패:', err);
          setError('포트폴리오 데이터를 불러올 수 없습니다');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError('데이터 동기화 중 오류가 발생했습니다');
      setLoading(false);
    }
  }, [userId]);

  const refreshData = () => {
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

### 체크리스트 - Task 1

- [ ] `usePortfolio.ts` 파일 생성
- [ ] Type 정의 완료 (Investment, PortfolioStats, UsePortfolioReturn)
- [ ] onSnapshot으로 supporters 컬렉션 구독 완료
- [ ] 투자액 합계 계산 로직 작성
- [ ] ROI 실시간 업데이트 로직 작성
- [ ] 거래 이력 정렬 완료 (investedDate DESC)
- [ ] 로딩/에러 상태 관리 구현
- [ ] TypeScript 컴파일 에러 없음
- [ ] 훅 export 완료

---

## 📌 Task 2: Portfolio 페이지 데이터 연동

### 작업 위치
```
파일: src/components/pages/Portfolio.tsx
상태: UPDATE (기존 페이지 수정)
```

### 작업 세부사항

#### 2-1. usePortfolio 훅 통합

```typescript
// src/components/pages/Portfolio.tsx

import { useAuth } from '../../hooks/useAuth';
import { usePortfolio } from '../../hooks/usePortfolio';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle } from 'lucide-react';

export const Portfolio: React.FC = () => {
  const { user } = useAuth();
  const { investments, stats, loading, error } = usePortfolio(user?.uid);

  // ✅ Task 2-1-A: 로딩 상태 처리
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ✅ Task 2-1-B: 에러 상태 처리
  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-red-600">{error}</span>
      </div>
    );
  }

  // ✅ Task 2-1-C: 통계 카드 렌더링
  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="총 투자액"
          value={`$${stats.totalInvested.toLocaleString()}`}
          change={stats.totalInvested > 0 ? '+' : ''}
          className="text-blue-600"
        />
        <StatCard
          label="현재 평가액"
          value={`$${stats.totalValue.toLocaleString()}`}
          change={`${stats.totalROI >= 0 ? '+' : ''}${stats.totalROI.toFixed(2)}%`}
          className={stats.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard
          label="실현 수익"
          value={`$${stats.unrealizedProfit.toLocaleString()}`}
          change={stats.unrealizedProfit >= 0 ? '수익' : '손실'}
          className={stats.unrealizedProfit >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard
          label="활성 전략"
          value={stats.activeStrategies.toString()}
          change="개"
          className="text-purple-600"
        />
      </div>

      {/* ✅ Task 2-1-D: 투자 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>투자 현황</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              투자한 전략이 없습니다
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">전략명</th>
                    <th className="text-left py-3 px-4">트레이더</th>
                    <th className="text-right py-3 px-4">투자액</th>
                    <th className="text-right py-3 px-4">현재 평가</th>
                    <th className="text-right py-3 px-4">ROI</th>
                    <th className="text-left py-3 px-4">투자일</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{inv.strategyName}</td>
                      <td className="py-3 px-4">{inv.traderName}</td>
                      <td className="py-3 px-4 text-right">${inv.investedAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">${inv.currentValue.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${inv.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {inv.roi >= 0 ? '+' : ''}{inv.roi.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4">{new Date(inv.investedDate).toLocaleDateString('ko-KR')}</td>
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

### 체크리스트 - Task 2

- [ ] usePortfolio 훅 import 추가
- [ ] Loading 상태 UI (Skeleton) 구현
- [ ] Error 상태 UI 구현
- [ ] 통계 카드 실시간 업데이트 확인
- [ ] 투자 목록 테이블 레이아웃 완성
- [ ] ROI 색상 구분 (녹색/빨강) 적용
- [ ] 투자 목록 정렬 확인 (최신순)
- [ ] 빈 상태 메시지 추가
- [ ] 모바일 반응형 확인
- [ ] TypeScript 컴파일 에러 없음

---

## 📌 Task 3: Profile 페이지 사용자 정보 동기화

### 작업 위치
```
파일: src/components/pages/Profile.tsx
상태: UPDATE (기존 페이지 수정)
```

### 작업 세부사항

#### 3-1. useUserProfile 훅 활용

```typescript
// src/components/pages/Profile.tsx

import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, error } = useUserProfile(user?.uid);

  // ✅ Task 3-1-A: 로딩 상태
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // ✅ Task 3-1-B: 에러 상태
  if (error || !profile) {
    return (
      <div className="text-center py-8 text-red-600">
        프로필을 불러올 수 없습니다
      </div>
    );
  }

  // ✅ Task 3-1-C: 프로필 기본 정보
  return (
    <div className="space-y-6">
      {/* 프로필 헤더 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.profileImage} />
              <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-gray-600 mt-1">{profile.email}</p>
              <div className="flex gap-4 mt-4">
                <div>
                  <p className="text-gray-600 text-sm">가입일</p>
                  <p className="font-semibold">{new Date(profile.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">지갑 주소</p>
                  <p className="font-mono text-sm truncate w-64">{profile.walletAddress || '연결되지 않음'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Task 3-1-D: 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="팔로우 트레이더"
          value={profile.followingCount?.toString() || '0'}
          subtext="명"
        />
        <StatCard
          label="총 투자액"
          value={`$${(profile.totalInvested || 0).toLocaleString()}`}
          subtext="투자"
        />
        <StatCard
          label="총 수익"
          value={`$${(profile.totalProfit || 0).toLocaleString()}`}
          subtext={profile.totalProfit && profile.totalProfit > 0 ? '수익' : '손실'}
          className={profile.totalProfit && profile.totalProfit > 0 ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* ✅ Task 3-1-E: 관심 트레이더 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>팔로우 중인 트레이더</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.followingTraders && profile.followingTraders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.followingTraders.map(trader => (
                <div key={trader.id} className="p-3 border rounded-lg">
                  <h3 className="font-semibold">{trader.name}</h3>
                  <p className="text-sm text-gray-600">{trader.strategies} 전략</p>
                  <p className="text-sm text-green-600">ROI: {trader.roi}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">팔로우 중인 트레이더가 없습니다</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

### 체크리스트 - Task 3

- [ ] useUserProfile 훅 import 확인
- [ ] Loading 상태 Skeleton UI 구현
- [ ] Error 상태 처리 추가
- [ ] 사용자 기본 정보 표시 (이름, 이메일)
- [ ] 지갑 주소 표시 (연결 상태 확인)
- [ ] 통계 정보 카드 추가
- [ ] 관심 트레이더 목록 표시
- [ ] Avatar 컴포넌트 적용
- [ ] 모바일 반응형 확인
- [ ] TypeScript 컴파일 에러 없음

---

## 🧪 테스트 체크리스트 - Day 1-2

### 기능 테스트
- [ ] `npm run dev` 실행 후 에러 없음
- [ ] Portfolio 페이지 로드 확인
- [ ] 실시간 데이터 업데이트 확인 (Firestore 데이터 변경 시)
- [ ] Profile 페이지 사용자 정보 표시 확인
- [ ] 로딩 상태 UI 표시 확인
- [ ] 에러 발생 시 에러 메시지 표시 확인

### 성능 테스트
- [ ] 번들 크기 확인 (`npm run build`)
- [ ] 로딩 속도 확인 (Chrome DevTools)
- [ ] 메모리 누수 확인 (구독 해제 정상 작동)

### 반응형 테스트
- [ ] 모바일 (390px) 화면 확인
- [ ] 태블릿 (768px) 화면 확인
- [ ] 데스크톱 (1920px) 화면 확인

---

## 🔧 환경 설정 확인

### Firestore Collections 확인
```
✅ users 컬렉션 존재
✅ traders 컬렉션 존재
✅ strategies 컬렉션 존재
✅ supporters 컬렉션 존재 (투자 기록)
```

### 필수 패키지 확인
```bash
npm list firebase
npm list react
npm list react-router-dom
npm list @mui/material  # 또는 사용하는 UI 라이브러리
```

---

## 📝 완료 체크리스트

### Task 1 완료 시
- [ ] `usePortfolio.ts` 파일 생성 및 export
- [ ] 모든 타입 정의 완료
- [ ] onSnapshot 구독 정상 작동
- [ ] 테스트 완료

### Task 2 완료 시
- [ ] Portfolio 페이지 데이터 연동 확인
- [ ] 통계 카드 실시간 업데이트 확인
- [ ] 투자 목록 테이블 표시 확인
- [ ] 모바일 반응형 확인

### Task 3 완료 시
- [ ] Profile 페이지 사용자 정보 표시 확인
- [ ] 통계 정보 표시 확인
- [ ] 팔로우 트레이더 목록 표시 확인
- [ ] 모바일 반응형 확인

### Day 1-2 최종 완료
- [ ] TypeScript 컴파일 에러 0개
- [ ] 모든 페이지 정상 작동
- [ ] 실시간 데이터 동기화 완벽 작동
- [ ] Git 커밋 완료

---

## 💡 개발 팁

### 빠른 테스트 방법
```bash
# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build

# TypeScript 체크
npx tsc --noEmit
```

### 디버깅 팁
```typescript
// 상태 변화 확인
useEffect(() => {
  console.log('Portfolio Stats:', stats);
}, [stats]);

// 훅 렌더링 확인
console.log('usePortfolio called with userId:', userId);
```

### Firestore 데이터 구조 예시
```json
{
  "supporters": {
    "doc_id": {
      "supporterId": "user_id",
      "traderId": "trader_id",
      "strategyId": "strategy_id",
      "traderName": "Trader Name",
      "strategyName": "Strategy Name",
      "investedAmount": 1000,
      "currentValue": 1250,
      "investedDate": "2025-10-30T00:00:00Z",
      "lastUpdated": "2025-10-30T12:00:00Z"
    }
  }
}
```

---

## 🎯 다음 단계

Day 1-2 완료 후:
1. ✅ Task 1-3 모두 완료 및 테스트
2. ➡️ Day 3으로 진행: 사용자 피드백 시스템 (Task 4-6)
3. 📌 커밋 메시지: `feat: Complete Day 1-2 real-time data sync (usePortfolio, Portfolio, Profile)`

---

**작성일**: 2025년 10월 30일
**예상 완료**: 2025년 11월 1일
**담당자**: 개발팀

🚀 **Day 1-2을 성공적으로 완료하자!**
