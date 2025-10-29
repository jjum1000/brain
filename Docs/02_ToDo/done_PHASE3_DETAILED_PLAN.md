# YOLOSEUM Phase 3 상세 계획
## UI/UX 개발 & Firebase 통합

**작성일**: 2025년 10월 28일
**예상 기간**: 4주 (Week 1-4)
**목표**: 완전히 작동하는 웹 애플리케이션 UI 구현

---

## 📋 Phase 3 개요

### 목표
- React 기반 완전한 사용자 인터페이스 개발
- Firebase 백엔드와 완전한 통합
- 실시간 데이터 표시
- 모든 주요 사용자 플로우 구현

### 성과물
- 8개 이상의 주요 페이지
- 30+ UI 컴포넌트
- 완벽한 사용자 인증 플로우
- 실시간 대시보드

### 기술 스택
```
Frontend: React 19.x + TypeScript
State Management: Zustand / Context API
Styling: Tailwind CSS + Styled Components
UI Components: shadcn/ui, Ant Design
Charts: TradingView Lightweight Charts, Chart.js
Routing: React Router v6
Form: React Hook Form + Zod
Real-time: Firebase Realtime DB
```

---

## 🗓️ 주별 작업 계획

## 📍 Week 1: 프레임워크 & 기초 설정

### 1.1 프로젝트 구조 초기화
```
작업 내용:
□ React 프로젝트 초기화 (Vite / CRA)
□ TypeScript 설정
□ Tailwind CSS 설정
□ Zustand / Context API 설정
□ ESLint & Prettier 설정
□ Git hooks 설정 (Husky)

완료 조건:
✓ npm start로 로컬 서버 실행 가능
✓ 기본 레이아웃 렌더링 확인
✓ TypeScript 컴파일 에러 없음
```

### 1.2 글로벌 레이아웃 컴포넌트
```
구현할 컴포넌트:
□ Layout (메인 레이아웃)
  ├── Header (네비게이션 바)
  ├── Sidebar (좌측 메뉴)
  └── Footer
□ Navigation Bar
  ├── 로고
  ├── 메뉴 링크
  ├── 사용자 메뉴
  └── 지갑 연결 버튼
□ AuthProvider (인증 컨텍스트)
□ ThemeProvider (다크/라이트 모드)
□ NotificationProvider (토스트 알림)

파일 구조:
src/components/
├── layout/
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── providers/
│   ├── AuthProvider.tsx
│   ├── ThemeProvider.tsx
│   └── NotificationProvider.tsx
└── ...
```

### 1.3 라우팅 설정
```
구현할 경로:
/                    - 메인 랜딩 페이지 (또는 대시보드로 리다이렉트)
/auth/login          - 로그인
/auth/signup         - 회원가입
/auth/verify-email   - 이메일 검증
/dashboard           - 메인 대시보드
/leaderboard         - 랭킹
/traders             - 트레이더 목록
/trader/:id          - 트레이더 상세
/strategies          - 전략 목록
/strategy/:id        - 전략 상세
/profile             - 사용자 프로필
/settings            - 설정

라우팅 파일:
src/App.tsx
src/routes/
├── index.ts (경로 정의)
├── ProtectedRoute.tsx (보호된 경로)
└── RouteConfig.tsx (라우트 구성)
```

---

## 📍 Week 2: 인증 UI 및 기초 페이지

### 2.1 인증 페이지 구현
```
구현할 페이지:
□ Login Page (/auth/login)
  ├── Email/Password 입력
  ├── OAuth 버튼 (Google, Discord)
  ├── "회원가입" 링크
  └── "비밀번호 찾기" 링크

□ Signup Page (/auth/signup)
  ├── 이메일 입력
  ├── 비밀번호 입력 (검증 포함)
  ├── 표시 이름 입력
  ├── 약관 동의
  └── "로그인하기" 링크

□ Verify Email Page (/auth/verify-email)
  ├── 인증 코드 입력
  ├── 코드 재전송 버튼
  └── 완료 후 대시보드로 이동

파일 구조:
src/pages/auth/
├── LoginPage.tsx
├── SignupPage.tsx
├── VerifyEmailPage.tsx
└── components/
    ├── LoginForm.tsx
    ├── SignupForm.tsx
    └── OAuthButtons.tsx
```

### 2.2 공통 UI 컴포넌트
```
구현할 컴포넌트:
□ 폼 컴포넌트
  ├── Input.tsx
  ├── Select.tsx
  ├── Checkbox.tsx
  ├── Radio.tsx
  └── FormField.tsx

□ 데이터 표시 컴포넌트
  ├── Card.tsx
  ├── Table.tsx
  ├── Badge.tsx
  ├── Tag.tsx
  └── Statistics.tsx

□ 모달 & 다이얼로그
  ├── Modal.tsx
  ├── Dialog.tsx
  ├── Drawer.tsx
  └── Popover.tsx

□ 버튼 & 상호작용
  ├── Button.tsx
  ├── IconButton.tsx
  ├── Tooltip.tsx
  └── Dropdown.tsx

파일 구조:
src/components/ui/
├── forms/
├── data-display/
├── feedback/
└── navigation/
```

### 2.3 프로필 초기 설정 플로우
```
구현할 페이지:
□ Profile Setup Page (/auth/profile-setup)
  ├── 프로필 사진 업로드
  ├── 자기소개 입력
  ├── 지갑 주소 입력 (선택)
  ├── 역할 선택 (Trader / Supporter)
  └── 저장 및 대시보드로 이동

역할별 추가 정보:
□ Trader라면:
  ├── 유튜브 채널 URL
  ├── 트위터 / 디스코드
  └── 검증 신청

□ Supporter라면:
  ├── 지갑 주소 (필수)
  └── 알림 설정
```

---

## 📍 Week 3: 대시보드 & 핵심 페이지

### 3.1 메인 대시보드
```
구현할 컴포넌트:
□ Dashboard Page (/dashboard)
  ├── 사용자 인사말 + 빠른 통계
  │   ├── 총 투자액
  │   ├── 총 수익
  │   ├── ROI %
  │   └── 팔로우 중인 트레이더 수
  │
  ├── 포트폴리오 요약
  │   ├── 투자 분배 차트 (원형 차트)
  │   ├── 수익 추이 (선 그래프)
  │   └── 성과 비교
  │
  ├── 실시간 알림
  │   ├── 새로운 전략 추천
  │   ├── 팔로우한 트레이더 활동
  │   └── 수익 배분 공지
  │
  └── 빠른 작업
      ├── "전략 찾기" 버튼
      ├── "트레이더 팔로우" 버튼
      └── "포트폴리오 관리" 버튼

파일 구조:
src/pages/dashboard/
├── DashboardPage.tsx
└── components/
    ├── StatisticsSummary.tsx
    ├── PortfolioChart.tsx
    ├── RecentNotifications.tsx
    └── QuickActions.tsx
```

### 3.2 리더보드 페이지
```
구현할 컴포넌트:
□ Leaderboard Page (/leaderboard)
  ├── 탭 선택 (주간 / 월간 / 시즌)
  ├── 필터 & 정렬
  │   ├── 카테고리 필터
  │   ├── 정렬 기준 (ROI, Win Rate, TVL 등)
  │   └── 검색
  │
  ├── 순위 테이블
  │   ├── 순위
  │   ├── 트레이더/전략 이름
  │   ├── ROI
  │   ├── Win Rate
  │   ├── TVL
  │   ├── 팔로워 수
  │   └── 작업 (팔로우, 상세보기)
  │
  └── 상세 정보 모달
      ├── 트레이더 정보
      ├── 성과 메트릭
      ├── 거래 이력
      └── 투자 버튼

파일 구조:
src/pages/leaderboard/
├── LeaderboardPage.tsx
├── components/
│   ├── LeaderboardTable.tsx
│   ├── LeaderboardFilters.tsx
│   ├── StrategyDetailModal.tsx
│   └── TraderCard.tsx
└── hooks/
    └── useLeaderboardData.ts
```

### 3.3 트레이더 & 전략 페이지
```
구현할 페이지:
□ Traders List Page (/traders)
  ├── 트레이더 카드 그리드
  │   ├── 프로필 사진
  │   ├── 이름 및 소개
  │   ├── 검증 상태 배지
  │   ├── 팔로워 수
  │   ├── 평점
  │   └── 팔로우 버튼
  │
  └── 필터 & 검색
      ├── 검증 상태 필터
      ├── 정렬 (팔로워 수, 평점)
      └── 검색

□ Trader Detail Page (/trader/:id)
  ├── 프로필 섹션
  │   ├── 큰 프로필 사진
  │   ├── 기본 정보
  │   ├── 소개
  │   ├── 소셜 링크
  │   └── 팔로우 버튼
  │
  ├── 성과 통계
  │   ├── 총 거래 수
  │   ├── 승률
  │   ├── 평균 ROI
  │   ├── Sharpe Ratio
  │   └── Max Drawdown
  │
  ├── 전략 목록
  │   └── 트레이더가 만든 전략들
  │
  └── 최근 거래
      └── 거래 이력 테이블

□ Strategy Detail Page (/strategy/:id)
  ├── 전략 정보
  │   ├── 이름
  │   ├── 설명
  │   ├── 트레이더 정보
  │   └── 상태
  │
  ├── 성과 차트
  │   ├── ROI 추이
  │   ├── 승패 비율
  │   └── Drawdown 차트
  │
  ├── 거래 이력
  │   └── 거래 테이블
  │
  └── 투자 섹션
      ├── 현재 TVL
      ├── 투자 버튼
      └── 투자 조건 설명

파일 구조:
src/pages/
├── traders/
│   ├── TradersListPage.tsx
│   ├── TraderDetailPage.tsx
│   └── components/
│       ├── TraderCard.tsx
│       ├── TraderStats.tsx
│       └── StrategyList.tsx
└── strategies/
    ├── StrategiesListPage.tsx
    ├── StrategyDetailPage.tsx
    └── components/
        ├── StrategyCard.tsx
        ├── PerformanceChart.tsx
        └── TradeHistoryTable.tsx
```

---

## 📍 Week 4: 사용자 기능 & 통합 완성

### 4.1 사용자 프로필 & 설정
```
구현할 페이지:
□ Profile Page (/profile)
  ├── 기본 정보 섹션
  │   ├── 프로필 사진 변경
  │   ├── 이름 & 소개 편집
  │   ├── 이메일 확인
  │   └── 저장 버튼
  │
  ├── 지갑 관리
  │   ├── 연결된 지갑 표시
  │   ├── 지갑 연결 / 분리
  │   └── 지갑 주소 확인
  │
  └── 계정 설정
      ├── 비밀번호 변경
      ├── 2단계 인증
      └── 계정 삭제 옵션

□ Settings Page (/settings)
  ├── 알림 설정
  │   ├── 이메일 알림
  │   ├── 푸시 알림
  │   └── 알림 유형별 설정
  │
  ├── 디스플레이 설정
  │   ├── 테마 (라이트/다크)
  │   ├── 언어
  │   └── 통화 선택
  │
  └── 개인정보 설정
      ├── 데이터 공개 범위
      └── 프라이버시 설정

파일 구조:
src/pages/
├── profile/
│   ├── ProfilePage.tsx
│   └── components/
│       ├── BasicInfoSection.tsx
│       ├── WalletSection.tsx
│       └── AccountSection.tsx
└── settings/
    ├── SettingsPage.tsx
    └── components/
        ├── NotificationSettings.tsx
        ├── DisplaySettings.tsx
        └── PrivacySettings.tsx
```

### 4.2 포트폴리오 관리
```
구현할 기능:
□ Portfolio Page (/portfolio)
  ├── 포트폴리오 개요
  │   ├── 총 자산
  │   ├── 총 수익
  │   ├── ROI %
  │   └── 평가액 추이 차트
  │
  ├── 투자 목록
  │   ├── 활성 투자
  │   ├── 종료된 투자
  │   ├── 목록 또는 카드 뷰
  │   └── 필터 & 정렬
  │
  └── 거래 이력
      ├── 입금 이력
      ├── 출금 이력
      ├── 수익 배분 이력
      └── 거래 상세보기

파일 구조:
src/pages/portfolio/
├── PortfolioPage.tsx
└── components/
    ├── PortfolioOverview.tsx
    ├── InvestmentList.tsx
    └── TransactionHistory.tsx
```

### 4.3 통합 테스트 & 최적화
```
작업 내용:
□ 모든 페이지 Firebase 데이터 연동
□ 실시간 데이터 업데이트 테스트
□ 성능 최적화
  ├── 이미지 최적화
  ├── 코드 스플리팅
  └── 번들 크기 최적화
□ 크로스 브라우저 테스트
□ 모바일 반응형 테스트
□ 에러 처리 & 로딩 상태

완료 조건:
✓ 모든 페이지에서 데이터 정상 로딩
✓ 실시간 업데이트 동작 확인
✓ 번들 크기 < 500KB
✓ 모바일에서 완벽하게 동작
✓ 에러 발생 시 친절한 메시지 표시
```

---

## 🎯 주요 UI 컴포넌트 목록

### 필수 컴포넌트 (30+)

#### 폼 컴포넌트
```
□ Input (텍스트 입력)
□ Textarea (여러 줄 입력)
□ Select (드롭다운)
□ MultiSelect (다중 선택)
□ Checkbox (체크박스)
□ Radio (라디오 버튼)
□ Toggle (토글)
□ DatePicker (날짜 선택)
□ FileUpload (파일 업로드)
□ FormField (폼 필드 래퍼)
□ FormError (에러 메시지)
```

#### 데이터 표시
```
□ Card (카드)
□ Table (테이블)
□ Badge (배지)
□ Tag (태그)
□ Stat (통계 카드)
□ ProgressBar (프로그레스 바)
□ Avatar (사용자 아바타)
□ List (리스트)
```

#### 모달 & 피드백
```
□ Modal (모달)
□ Dialog (대화)
□ Drawer (드로어)
□ Toast (토스트 알림)
□ Alert (경고)
□ Skeleton (로딩 스켈레톤)
□ Spinner (로딩 스피너)
□ Empty State (빈 상태)
```

#### 네비게이션
```
□ Button (버튼)
□ Link (링크)
□ Breadcrumb (경로 표시)
□ Pagination (페이지네이션)
□ Tabs (탭)
□ Dropdown (드롭다운)
□ Menu (메뉴)
□ Sidebar (사이드바)
□ Header (헤더)
□ Footer (푸터)
```

#### 차트
```
□ LineChart (선 차트)
□ BarChart (막대 차트)
□ PieChart (원형 차트)
□ AreaChart (영역 차트)
□ CandlestickChart (캔들스틱 차트)
```

---

## 🔧 상태 관리 전략

### Zustand를 이용한 전역 상태

```typescript
// src/store/authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// src/store/portfolioStore.ts
interface PortfolioState {
  investments: Investment[];
  totalValue: number;
  fetchInvestments: () => Promise<void>;
  updateInvestment: (id: string, data: Partial<Investment>) => Promise<void>;
}

// src/store/leaderboardStore.ts
interface LeaderboardState {
  strategies: Strategy[];
  period: 'weekly' | 'monthly';
  setPeriod: (period: 'weekly' | 'monthly') => void;
  fetchLeaderboard: () => Promise<void>;
}
```

### Context API를 이용한 부분 상태

```typescript
// src/context/ThemeContext.tsx
// 테마 (라이트/다크 모드)

// src/context/NotificationContext.tsx
// 토스트 알림

// src/context/FilterContext.tsx
// 페이지 필터 및 검색
```

---

## 📊 성과 기준

### Week 1 목표
- ✓ 프로젝트 기초 설정 완료
- ✓ 글로벌 레이아웃 컴포넌트 5개 구현
- ✓ 라우팅 시스템 완료
- ✓ TypeScript 설정 완료

### Week 2 목표
- ✓ 인증 페이지 3개 완성
- ✓ 공통 UI 컴포넌트 15개 구현
- ✓ 프로필 설정 플로우 완성
- ✓ 모든 폼 검증 완료

### Week 3 목표
- ✓ 대시보드 페이지 완성
- ✓ 리더보드 페이지 완성
- ✓ 트레이더/전략 페이지 4개 완성
- ✓ Firebase 데이터 연동 완료

### Week 4 목표
- ✓ 프로필 & 설정 페이지 완성
- ✓ 포트폴리오 관리 페이지 완성
- ✓ 모든 실시간 업데이트 테스트
- ✓ 성능 최적화 완료
- ✓ 배포 준비 완료

---

## 📝 개발 가이드라인

### 코딩 컨벤션
```
□ TypeScript 엄격 모드 사용
□ 컴포넌트는 함수형 + Hooks
□ 파일명: PascalCase (컴포넌트), camelCase (유틸리티)
□ 불필요한 console.log 제거
□ 모든 API 호출에 에러 처리
```

### 컴포넌트 구조
```
src/components/
├── common/        # 재사용 가능한 컴포넌트
├── features/      # 기능별 컴포넌트
├── layouts/       # 레이아웃 컴포넌트
├── modals/        # 모달 컴포넌트
└── ui/            # shadcn/ui 래퍼
```

### 페이지 구조
```
src/pages/
├── [feature]/
│   ├── index.tsx            # 페이지 컴포넌트
│   ├── hooks/
│   │   └── use[Feature].ts
│   └── components/
│       └── [Feature].tsx
```

---

## 🚀 배포 준비

### Phase 3 완료 후 확인사항
```
□ 모든 페이지 테스트 완료
□ Firebase 연동 정상 동작
□ 성능 최적화 완료
□ 모바일 반응형 확인
□ 에러 처리 모두 구현
□ 문서화 완료
□ 배포 체크리스트 작성
```

### 다음 단계 (Phase 4)
1. WebSocket 통합 (실시간 데이터)
2. 푸시 알림 구현
3. 라이브 차트 통합
4. 고급 필터링 기능

---

**작성**: Claude AI
**예상 착수**: 2025년 10월 29일
**예상 완료**: 2025년 11월 25일
