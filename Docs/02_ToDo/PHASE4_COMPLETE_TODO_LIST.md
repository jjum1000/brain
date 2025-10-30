# 🎯 YOLOSEUM Phase 4 - 완전 작업 목록

**작성일**: 2025-10-31
**상태**: 작업 준비 완료
**프로젝트**: yoloseum-phase3-ui
**목표**: Solana 블록체인 연동 + 테스트 + 배포

---

## 📋 전체 작업 요약

### 총 15개 작업 (우선순위 순)

| 순서 | 작업명 | 카테고리 | 우선순위 | 예상시간 | 상태 |
|------|--------|---------|--------|---------|------|
| 1 | Solana 지갑 연동 구현 | 블록체인 | 🔴 Critical | 2-3주 | ⏳ 준비 |
| 2 | Jupiter DEX API 통합 | 블록체인 | 🔴 Critical | 2-3주 | ⏳ 준비 |
| 3 | 스마트 컨트랙트 연동 (입출금) | 블록체인 | 🔴 Critical | 1-2주 | ⏳ 준비 |
| 4 | YouTube 영상 통합 | 기능 | 🟡 High | 3-5일 | ⏳ 준비 |
| 5 | QR 코드 생성 기능 | 기능 | 🟡 High | 1-2일 | ⏳ 준비 |
| 6 | 성과 수수료 계산 로직 | 기능 | 🟡 High | 3-5일 | ⏳ 준비 |
| 7 | 거래 페이지네이션 | 기능 | 🟡 High | 2-3일 | ⏳ 준비 |
| 8 | 전략 정렬 기능 (TVL, 수익률) | 기능 | 🟡 High | 2-3일 | ⏳ 준비 |
| 9 | Unit Test 작성 (vitest) | 테스트 | 🟡 High | 3-5일 | ⏳ 준비 |
| 10 | E2E Test 작성 (Playwright) | 테스트 | 🟡 High | 5-7일 | ⏳ 준비 |
| 11 | 다국어 지원 (i18n) | 기능 | 🟢 Medium | 3-5일 | ⏳ 준비 |
| 12 | API 에러 재시도 로직 | 기능 | 🟢 Medium | 2-3일 | ⏳ 준비 |
| 13 | Firestore 보안 규칙 검증 | 보안 | 🟢 Medium | 1-2일 | ⏳ 준비 |
| 14 | Sentry 에러 로깅 통합 | 기능 | 🟢 Medium | 2-3일 | ⏳ 준비 |
| 15 | README 및 문서 작성 | 문서 | 🟢 Medium | 2-3일 | ⏳ 준비 |

**총 예상 시간**: 10-15주

---

## 🔴 CRITICAL 작업 (즉시 필요)

### 1️⃣ Solana 지갑 연동 구현
- **파일**: `/src/components/WalletConnector.tsx` (신규)
- **의존성**: @solana/wallet-adapter-react, @solana/web3.js
- **기존 코드 활용**:
  - `src/lib/firebase.ts` (인증 패턴 참고)
  - `src/context/AuthContext.tsx` (Context 패턴 참고)
- **작업 내용**:
  - WalletProvider 설정
  - Phantom, Solflare 지갑 어댑터
  - 지갑 연결/해제 함수
  - PublicKey 상태 관리
- **문서**: `/Docs/03_Task/TASK_001_SOLANA_WALLET_SETUP.md`

### 2️⃣ Jupiter DEX API 통합
- **파일**: `/src/lib/jupiter.ts` (신규)
- **의존성**: @jupiter-aggregator/core-sdk
- **기존 코드 활용**:
  - `src/lib/firebase.ts` (API 호출 패턴)
  - `src/lib/errorHandler.ts` (에러 처리)
- **작업 내용**:
  - Jupiter API 초기화
  - 토큰 스왑 경로 조회
  - 슬리피지 계산
  - 거래 서명 및 실행
- **문서**: `/Docs/03_Task/TASK_002_JUPITER_DEX_INTEGRATION.md`

### 3️⃣ 스마트 컨트랙트 연동 (입출금)
- **파일**: `/src/lib/contracts/vaultContract.ts` (신규)
- **의존성**: @solana/web3.js, @project-serum/anchor
- **기존 코드 활용**:
  - `src/hooks/useAuth.ts` (사용자 확인)
  - `src/context/AuthContext.tsx` (사용자 상태)
- **작업 내용**:
  - Vault 컨트랙트 ABI/IDL 로드
  - 입금 (Deposit) 함수
  - 출금 (Withdraw) 함수
  - 거래 수수료 처리
- **문서**: `/Docs/03_Task/TASK_003_SMART_CONTRACT_INTEGRATION.md`

---

## 🟡 HIGH 우선순위 작업

### 4️⃣ YouTube 영상 통합
- **파일**: `src/components/pages/StrategyDetail.tsx` (수정)
- **의존성**: react-youtube (선택), 또는 iframe
- **기존 코드 활용**:
  - 라인 19-25: VideoSection 레이아웃
  - 타입: `src/types/firestore.ts` - `Strategy` 타입에 `youtubeUrl` 추가
- **작업 내용**:
  - YouTube URL 저장
  - 영상 플레이어 임베드
  - 영상 메타데이터 표시
- **문서**: `/Docs/03_Task/TASK_004_YOUTUBE_VIDEO_INTEGRATION.md`

### 5️⃣ QR 코드 생성 기능
- **파일**: `src/components/common/QRCodeGenerator.tsx` (신규)
- **의존성**: qrcode.react
- **기존 코드 활용**:
  - `src/components/pages/StrategyDetail.tsx` - 입금 섹션
  - `src/components/ui/card.tsx` - UI 컴포넌트
- **작업 내용**:
  - QR 코드 생성
  - Vault 주소 표시
  - 다운로드 기능
- **문서**: `/Docs/03_Task/TASK_005_QR_CODE_GENERATION.md`

### 6️⃣ 성과 수수료 계산 로직
- **파일**: `/src/lib/feeCalculator.ts` (신규)
- **의존성**: 없음 (순수 계산)
- **기존 코드 활용**:
  - `src/components/pages/Portfolio.tsx` - 포트폴리오 계산 로직
  - `src/hooks/usePortfolio.ts` - 수익 데이터
- **작업 내용**:
  - 성과 수수료 계산 (10-20%)
  - 순수익 계산
  - 누적 수수료 추적
- **문서**: `/Docs/03_Task/TASK_006_PERFORMANCE_FEE_CALCULATION.md`

### 7️⃣ 거래 페이지네이션
- **파일**: `src/components/pages/Dashboard.tsx` (수정)
- **의존성**: react-paginate (선택)
- **기존 코드 활용**:
  - 라인 166-211: 거래 테이블
  - `src/hooks/useTransactions.ts` - 데이터 훅
- **작업 내용**:
  - 페이지네이션 UI 추가
  - 페이지당 항목 수 선택
  - 정렬 기능
- **문서**: `/Docs/03_Task/TASK_007_TRANSACTION_PAGINATION.md`

### 8️⃣ 전략 정렬 기능 (TVL, 수익률)
- **파일**: `src/components/pages/Strategies.tsx` (수정)
- **의존성**: 없음 (useMemo 활용)
- **기존 코드 활용**:
  - 라인 42-49: 검색 필터 로직
  - 라인 51-69: 컬러 코딩 시스템
  - `src/hooks/useStrategies.ts` - 데이터
- **작업 내용**:
  - TVL 기준 정렬
  - 수익률 기준 정렬
  - 위험도 기준 정렬
- **문서**: `/Docs/03_Task/TASK_008_STRATEGY_SORTING.md`

### 9️⃣ Unit Test 작성 (vitest)
- **파일**: `src/**/__tests__/*.test.ts` (신규)
- **의존성**: vitest, @testing-library/react, @testing-library/user-event
- **기존 코드 활용**:
  - `src/hooks/` - 모든 커스텀 훅
  - `src/lib/errorHandler.ts` - 에러 처리
  - `src/lib/firebase.ts` - Firebase 서비스
- **작업 내용**:
  - useAuth 훅 테스트
  - useStrategies 훅 테스트
  - usePortfolio 훅 테스트
  - errorHandler 유틸 테스트
- **문서**: `/Docs/03_Task/TASK_009_UNIT_TESTS.md`

### 🔟 E2E Test 작성 (Playwright)
- **파일**: `e2e/**/*.spec.ts` (신규)
- **의존성**: @playwright/test
- **기존 코드 활용**:
  - `src/App.tsx` - 전체 라우팅
  - `src/context/AuthContext.tsx` - 인증 플로우
- **작업 내용**:
  - 로그인 플로우 테스트
  - 전략 탐색 테스트
  - 포트폴리오 조회 테스트
- **문서**: `/Docs/03_Task/TASK_010_E2E_TESTS.md`

---

## 🟢 MEDIUM 우선순위 작업

### 1️⃣1️⃣ 다국어 지원 (i18n)
- **파일**: `/src/i18n/` (신규 디렉토리)
- **의존성**: i18next, react-i18next
- **기존 코드 활용**:
  - 모든 텍스트 문자열 (현재 영문 혼용)
  - `src/context/AuthContext.tsx` - 사용자 언어 설정 저장
- **작업 내용**:
  - 한국어/영문 번역 파일
  - 언어 선택 UI
  - 사용자 언어 선호도 저장
- **문서**: `/Docs/03_Task/TASK_011_INTERNATIONALIZATION.md`

### 1️⃣2️⃣ API 에러 재시도 로직
- **파일**: `/src/lib/retryFetch.ts` (신규)
- **의존성**: 없음
- **기존 코드 활용**:
  - `src/lib/errorHandler.ts` - 에러 분류
  - 모든 hooks의 데이터 페칭
- **작업 내용**:
  - Exponential backoff 구현
  - 네트워크 에러 재시도
  - 타임아웃 처리
- **문서**: `/Docs/03_Task/TASK_012_ERROR_RETRY_LOGIC.md`

### 1️⃣3️⃣ Firestore 보안 규칙 검증
- **파일**: `firestore.rules` (기존 파일 검증)
- **의존성**: Firebase CLI
- **기존 코드 활용**:
  - `/src/types/firestore.ts` - 컬렉션 구조
  - `src/lib/firebase.ts` - Firestore 접근
- **작업 내용**:
  - 사용자 데이터 접근 규칙
  - 거래 기록 보호
  - 쓰기 권한 제한
- **문서**: `/Docs/03_Task/TASK_013_FIRESTORE_SECURITY.md`

### 1️⃣4️⃣ Sentry 에러 로깅 통합
- **파일**: `/src/lib/sentryConfig.ts` (신규)
- **의존성**: @sentry/react
- **기존 코드 활용**:
  - `src/lib/errorHandler.ts` - 에러 처리
  - `src/App.tsx` - 에러 바운더리
- **작업 내용**:
  - Sentry 초기화
  - 에러 캡처
  - 성능 모니터링
- **문서**: `/Docs/03_Task/TASK_014_SENTRY_INTEGRATION.md`

### 1️⃣5️⃣ README 및 문서 작성
- **파일**: `/README.md`, `/CONTRIBUTING.md` (신규)
- **의존성**: 없음
- **기존 코드 활용**:
  - 모든 소스 코드와 설정 파일
- **작업 내용**:
  - 설치 및 실행 가이드
  - 프로젝트 구조 설명
  - 기여 가이드
  - API 문서
- **문서**: `/Docs/03_Task/TASK_015_DOCUMENTATION.md`

---

## 📊 작업 흐름도

```
START
│
├─ Phase 4A: 블록체인 (1-2개월)
│  ├─ Task 1: Solana 지갑 연동 ✓
│  ├─ Task 2: Jupiter DEX 통합 ✓
│  └─ Task 3: 스마트 컨트랙트 연동 ✓
│
├─ Phase 4B: 기능 추가 (1개월)
│  ├─ Task 4: YouTube 영상 ✓
│  ├─ Task 5: QR 코드 ✓
│  ├─ Task 6: 수수료 계산 ✓
│  ├─ Task 7: 페이지네이션 ✓
│  └─ Task 8: 정렬 기능 ✓
│
├─ Phase 4C: 테스트 (1-2개월)
│  ├─ Task 9: Unit Test ✓
│  └─ Task 10: E2E Test ✓
│
├─ Phase 4D: 최적화 (2주)
│  ├─ Task 11: 다국어 ✓
│  ├─ Task 12: 에러 재시도 ✓
│  ├─ Task 13: 보안 규칙 ✓
│  └─ Task 14: Sentry ✓
│
└─ Phase 4E: 배포 준비 (1주)
   └─ Task 15: 문서 ✓

END
```

---

## 🔧 작업 시작 전 필수 확인

### 필수 의존성 설치
```bash
cd d:\jjumV\yoloseum-phase3-ui

# Phase 4 필수 라이브러리
npm install @solana/wallet-adapter-react @solana/web3.js @project-serum/anchor
npm install @jupiter-aggregator/core-sdk
npm install qrcode.react
npm install i18next react-i18next

# 테스트 도구
npm install -D vitest @testing-library/react @testing-library/user-event @playwright/test

# 모니터링
npm install @sentry/react

# 선택 사항
npm install react-paginate react-youtube
```

### 환경 변수 설정
```env
# .env.local에 추가
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_SOLANA_NETWORK=mainnet-beta
VITE_JUPITER_API_KEY=your_api_key
VITE_SENTRY_DSN=your_sentry_dsn
```

---

## 📈 진행률 추적

```
Phase 4 Progress:
┌──────────────────────────────────┐
│ 블록체인 연동    [--------] 0%   │
│ 기능 추가        [--------] 0%   │
│ 테스트          [--------] 0%   │
│ 최적화          [--------] 0%   │
│ 문서화          [--------] 0%   │
│                                  │
│ 전체: [--------] 0%              │
└──────────────────────────────────┘
```

---

## 📞 질문 및 지원

각 작업별 상세한 지시서는 `/Docs/03_Task/` 폴더의 개별 파일 참고.

**작성자**: Claude AI
**최종 업데이트**: 2025-10-31
**상태**: 실행 준비 완료 ✅
