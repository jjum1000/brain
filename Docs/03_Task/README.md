# 📋 Phase 4 작업 지시서 (Task Documents)

**작성일**: 2025-10-31
**프로젝트**: yoloseum-phase3-ui
**총 작업**: 15개 (우선순위별 정렬)

---

## 📁 파일 목록

### Critical 작업 (블록체인 연동)

| Task | 파일명 | 우선순위 | 예상시간 | 상태 |
|------|--------|---------|---------|------|
| **001** | [TASK_001_SOLANA_WALLET_SETUP.md](TASK_001_SOLANA_WALLET_SETUP.md) | 🔴 Critical | 2-3주 | ✅ **완료** (3시간) |
| **002** | [TASK_002_JUPITER_DEX_INTEGRATION.md](TASK_002_JUPITER_DEX_INTEGRATION.md) | 🔴 Critical | 2-3주 | ✅ **완료** |
| **003** | [TASK_003_SMART_CONTRACT_INTEGRATION.md](TASK_003_SMART_CONTRACT_INTEGRATION.md) | 🔴 Critical | 1-2주 | ✅ **완료** (2시간) |

### High 우선순위 작업 (기능 개선)

| Task | 파일명 | 예상시간 |
|------|--------|---------|
| **004** | [TASK_004_YOUTUBE_VIDEO_INTEGRATION.md](TASK_004_YOUTUBE_VIDEO_INTEGRATION.md) | 3-5일 |
| **005-008** | [TASK_005_006_007_008.md](TASK_005_006_007_008.md) | 8-15일 |

### High 우선순위 작업 (테스트)

| Task | 파일명 | 예상시간 |
|------|--------|---------|
| **009-010** | [TASK_009_010_011_012_013_014_015.md](TASK_009_010_011_012_013_014_015.md#task-009-unit-test-작성-vitest) | 8-12일 |

### Medium 우선순위 작업 (최적화 & 배포)

| Task | 파일명 | 예상시간 |
|------|--------|---------|
| **011-015** | [TASK_009_010_011_012_013_014_015.md](TASK_009_010_011_012_013_014_015.md#task-011-다국어-지원-i18n) | 10-14일 |

---

## 🎯 각 작업 요약

### Task 001: Solana 지갑 연동 구현 ✅ **완료**
**목표**: 사용자가 Phantom, Solflare 등의 지갑을 연결할 수 있도록 구현

**구현된 컴포넌트**:
- `src/context/WalletContext.tsx` - 지갑 프로바이더 ✅
- `src/hooks/useWallet.ts` - 지갑 상태 관리 훅 ✅
- `src/components/wallet/WalletButton.tsx` - 연결 버튼 ✅
- `src/lib/solana.ts` - 유틸 및 RPC 설정 ✅

**적용된 기술**:
- @solana/wallet-adapter-react
- Context API
- Solana Web3.js

**구현된 기능**:
- ✅ 사용자 지갑 연결/해제
- ✅ PublicKey 관리
- ✅ Solana RPC 통신 준비
- ✅ 에러 처리
- ✅ 응답형 UI (모바일/데스크톱)

---

### Task 002: Jupiter DEX API 통합
**목표**: 토큰 스왑 기능을 통해 사용자가 다양한 토큰으로 전략에 투자

**주요 파일**:
- `src/lib/jupiter/jupiterClient.ts` - API 클라이언트
- `src/hooks/useJupiterSwap.ts` - 스왑 상태 관리
- `src/lib/jupiter/swapCalculator.ts` - 계산 로직

**핵심 기술**:
- Jupiter Aggregator API
- Exponential backoff 재시도
- 슬리피지 계산

**완료 시 가능한 일**:
- SOL/USDC 시세 조회
- 토큰 스왑 경로 계산
- 거래 실행

---

### Task 003: 스마트 컨트랙트 연동
**목표**: Solana Vault 컨트랙트와 상호작용하여 입출금 가능하게 함

**주요 파일**:
- `src/lib/contracts/vaultContract.ts` - 컨트랙트 클래스
- `src/hooks/useVaultContract.ts` - 입출금 상태 관리
- `src/types/vault.ts` - Vault 타입 정의

**핵심 기술**:
- Anchor Framework
- IDL 파싱
- 거래 서명 및 확인

**완료 시 가능한 일**:
- Vault에 자금 입금
- 자금 출금
- 거래 기록 저장

---

### Task 004: YouTube 영상 통합
**목표**: 각 전략에 교육 영상을 링크하여 사용자 이해도 증진

**주요 파일**:
- `src/components/common/YouTubePlayer.tsx` - 플레이어 컴포넌트
- `src/types/firestore.ts` (수정) - Strategy 타입 확장

**완료 시 가능한 일**:
- 전략 상세 페이지에 영상 표시
- 영상 메타데이터 저장

---

### Task 005-008: 기능 개선 (4가지)

**Task 005: QR 코드 생성**
- Vault 주소의 QR 코드 생성 및 다운로드
- `qrcode.react` 라이브러리

**Task 006: 성과 수수료 계산**
- 20% 성과 수수료 자동 계산
- 사용자 순수익 표시
- `src/lib/feeCalculator.ts`

**Task 007: 거래 페이지네이션**
- 대시보드의 거래 테이블에 페이지네이션
- 페이지당 항목 수 설정 가능

**Task 008: 전략 정렬 기능**
- TVL, ROI, 위험도 기준 정렬
- 인기도 기준 정렬

---

### Task 009-010: 테스트 (2가지)

**Task 009: Unit Test (vitest)**
- 핵심 훅 테스트
- 유틸 함수 테스트
- 목표: 80% 이상 커버리지

**Task 010: E2E Test (Playwright)**
- 로그인 플로우
- 전략 탐색
- 포트폴리오 관리

---

### Task 011-015: 최적화 & 배포 (5가지)

**Task 011: 다국어 지원 (i18n)**
- 영문/한글 번역
- `react-i18next` 사용

**Task 012: API 에러 재시도 로직**
- Exponential backoff
- 네트워크 에러 처리

**Task 013: Firestore 보안 규칙**
- 사용자 데이터 보호
- 접근 제한 설정

**Task 014: Sentry 에러 로깅**
- 프로덕션 에러 모니터링
- 성능 추적

**Task 015: 문서 작성**
- README.md
- 아키텍처 문서
- API 문서

---

## 🔧 필수 명령어

### 의존성 설치 (한 번에)
```bash
cd d:\jjumV\yoloseum-phase3-ui

# Solana/Jupiter (Task 001-002)
npm install @solana/wallet-adapter-react @solana/web3.js @jupiter-aggregator/core-sdk

# 기능 개선 (Task 004-008)
npm install qrcode.react i18next react-i18next

# 테스트 (Task 009-010)
npm install -D vitest @testing-library/react @playwright/test

# 모니터링 (Task 014)
npm install @sentry/react
```

### 환경 변수 설정 (.env.local)
```env
# Solana
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_SOLANA_NETWORK=mainnet-beta

# 스마트 컨트랙트
VITE_VAULT_PROGRAM_ID=YourVaultProgramAddress
VITE_MOMENTUM_VAULT=YourMomentumVaultAddress
VITE_CONTRARIAN_VAULT=YourContrarianVaultAddress

# Sentry
VITE_SENTRY_DSN=your_sentry_dsn
```

---

## 📊 진행 상황 추적

### Phase 4 진행도
```
┌────────────────────────────────────────┐
│ Solana 블록체인 연동    [██████---] 100% │ ✅ Task 001-003 완료
│ 기능 개선              [--------] 0%   │
│ 테스트                [--------] 0%   │
│ 최적화 & 배포          [--------] 0%   │
├────────────────────────────────────────┤
│ 전체 진행도            [██------] 20%  │
└────────────────────────────────────────┘
```

### 완료된 작업
- ✅ **Task 001**: Solana 지갑 연동 (3시간 소요, 2025-10-31)
  - Phantom & Solflare 지갑 지원
  - 완전한 TypeScript 타입 안정성
  - 에러 처리 및 UI 구현

- ✅ **Task 002**: Jupiter DEX 통합 (완료)
  - Jupiter API 클라이언트
  - SOL/USDC 시세 조회 및 스왑
  - 슬리피지 설정 및 가격 영향도 표시

- ✅ **Task 003**: 스마트 컨트랙트 연동 (2시간 소요, 2025-10-31)
  - Vault 입출금 트랜잭션 빌더
  - useVaultContract 훅 구현
  - 에러 처리 및 Firestore 연동
  - 수동 Instruction 생성 (IDL 마이그레이션 준비)

---

## 🚀 작업 순서 권장사항

### 1단계: 블록체인 기초 (4-6주)
1. Task 001: Solana 지갑 연동
2. Task 002: Jupiter DEX API
3. Task 003: 스마트 컨트랙트

### 2단계: 기능 개선 (2-3주)
4. Task 004: YouTube 영상
5. Task 005-008: 기타 기능들

### 3단계: 테스트 (2-3주)
6. Task 009: Unit Test
7. Task 010: E2E Test

### 4단계: 최적화 & 배포 (2-3주)
8. Task 011-015: 다국어, 보안, 모니터링, 문서

**총 예상 시간: 10-15주**

---

## ✅ 작업 완료 체크리스트

### Pre-Launch
- [x] Task 001: Solana 지갑 연동 완료 ✅ (2025-10-31 완료)
- [x] Task 002: Jupiter DEX 통합 완료 ✅
- [x] Task 003: 스마트 컨트랙트 연동 완료 ✅ (2025-10-31 완료)

### Feature Complete
- [ ] Task 004: YouTube 영상 통합
- [ ] Task 005: QR 코드 생성
- [ ] Task 006: 수수료 계산
- [ ] Task 007: 거래 페이지네이션
- [ ] Task 008: 전략 정렬

### Quality Assurance
- [ ] Task 009: Unit Test (80% 커버리지)
- [ ] Task 010: E2E Test (모든 플로우)

### Production Ready
- [ ] Task 011: 다국어 지원
- [ ] Task 012: 에러 재시도 로직
- [ ] Task 013: Firestore 보안 규칙
- [ ] Task 014: Sentry 모니터링
- [ ] Task 015: 문서 완성

---

## 📞 도움말

### 각 작업별 상세 정보
- 각 Task 파일을 열어 상세 지시사항 확인
- "기존 코드 참고" 섹션에서 패턴 학습
- "주의사항" 섹션에서 일반적인 함정 확인

### 문제 해결
1. 타입 에러: `src/types/` 확인
2. 의존성 에러: `npm install` 재실행
3. 런타임 에러: `src/lib/errorHandler.ts` 활용

### 참고 자료
- Solana 문서: https://docs.solana.com
- Jupiter 문서: https://docs.jup.ag
- Anchor 프레임워크: https://www.anchor-lang.com

---

## 💾 저장소 구조

```
yoloseum-phase3-ui/
├── src/
│   ├── components/
│   │   ├── common/          (공통 컴포넌트)
│   │   ├── pages/           (페이지 컴포넌트)
│   │   ├── auth/            (인증 다이얼로그)
│   │   └── ui/              (shadcn/ui)
│   ├── hooks/               (커스텀 훅 - 8개)
│   ├── lib/                 (유틸 및 서비스)
│   ├── types/               (TypeScript 타입)
│   ├── context/             (Context API)
│   ├── i18n/                (다국어 - Task 011)
│   ├── App.tsx              (메인 컴포넌트)
│   └── main.tsx             (진입점)
├── e2e/                     (E2E 테스트 - Task 010)
├── docs/                    (문서)
├── .env.local               (환경 변수)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

**작성**: Claude AI
**최종 검토**: 2025-10-31
**상태**: 🟢 Task 001-003 완료 (5시간) | Task 004-015 준비 중

**진행 상황**:
- Task 001: ✅ 완료 (Solana 지갑 연동, 3시간)
- Task 002: ✅ 완료 (Jupiter DEX 통합)
- Task 003: ✅ 완료 (스마트 컨트랙트 연동, 2시간)
- Task 004-008: ⏳ 준비 (기능 개선)
- Task 009-015: ⏳ 준비 (테스트, 최적화)

👉 **다음 단계**: [TASK_004_YOUTUBE_VIDEO_INTEGRATION.md](TASK_004_YOUTUBE_VIDEO_INTEGRATION.md) 또는 Task 005-008 (기능 개선)
