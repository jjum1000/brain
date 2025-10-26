# Solana 자동화 트레이딩 플랫폼 - 피쳐 목록

## 프로젝트 개요
Solana 블록체인 기반의 비위탁(Non-Custodial) 자동화 거래 플랫폼. 사용자가 자신의 자산에 대한 완전한 통제권을 유지하면서 온체인 스마트 컨트랙트 기반의 자동화 거래 전략을 사용할 수 있습니다.

## 🎨 목업 사이트 (Mockup)
**📱 [solana-trading-mockup.html](./solana-trading-mockup.html)** (305KB, 완전 독립형)

React + Tailwind CSS + shadcn/ui로 제작된 **인터랙티브 목업 사이트**입니다.

### 🔄 업데이트됨 (v2.0)
- ✅ Strategy Ranking 페이지 (4개 샘플 전략)
- ✅ **🆕 전략 상세 페이지** (YouTube 영상, TradingView 차트, 거래 히스토리)
- ✅ Portfolio Monitoring 대시보드
- ✅ Wallet 연동 UI
- ✅ 완벽한 반응형 디자인
- ✅ 성과 통계 (Win Rate, MDD, Sharpe Ratio)

### 새로운 기능
- **YouTube 임베드:** 각 전략별 설명 영상 및 트레이더 정보
- **TradingView 차트:** SOL/USDC 가격 차트 (플레이스홀더)
- **거래 히스토리 테이블:** 최근 거래 5개 샘플 데이터
- **성과 지표:** 승률, 평균 수익, 최대낙폭(MDD), 샤프지수

**👉 [목업 가이드 읽기](./MOCKUP_GUIDE.md)**

---

## 전체 피쳐 맵

```
01_Strategy_Ranking         (전략 랭킹 시스템)
    ├── README.md
    ├── TECHNICAL_SPECS.md
    └── [구현 시 추가 파일]

02_Vault_System             (비위탁 Vault 시스템)
    ├── README.md
    ├── TECHNICAL_SPECS.md
    └── [구현 시 추가 파일]

03_Wallet_Integration       (지갑 연동)
    ├── README.md
    ├── TECHNICAL_SPECS.md
    └── [구현 시 추가 파일]

04_Deposit_Withdraw         (자금 입출금)
    ├── README.md
    └── [구현 시 추가 파일]

05_Portfolio_Monitoring     (포트폴리오 모니터링)
    ├── README.md
    └── [구현 시 추가 파일]

06_Automated_Trading        (자동화 거래 실행)
    ├── README.md
    ├── IMPLEMENTATION_PLAN.md
    └── [구현 시 추가 파일]

07_Performance_Fee          (성과 수수료 계산)
    ├── README.md
    └── [구현 시 추가 파일]

08_Backtesting              (백테스팅 시스템)
    ├── README.md
    └── [구현 시 추가 파일]

09_Jupiter_Integration      (DEX 통합)
    ├── README.md
    └── [구현 시 추가 파일]

10_Data_Dashboard           (데이터 대시보드)
    ├── README.md
    └── [구현 시 추가 파일]
```

---

## 피쳐별 상세 정보

### 1️⃣ 전략 랭킹 시스템 (Strategy Ranking)
**우선순위:** 높음 | **복잡도:** 중간 | **팀:** 프론트엔드/백엔드

사용자가 플랫폼의 모든 거래 전략을 수익률, TVL, 위험도 등 다양한 기준으로 탐색하고 비교할 수 있는 메인 페이지 시스템.

**핵심 기능:**
- 전략 정렬 및 필터링
- 전략 카드 UI
- 유명 트레이더 영상 연동
- QR 코드 기반 빠른 입금

**관련 문서:** [01_Strategy_Ranking/README.md](./01_Strategy_Ranking/README.md)

---

### 2️⃣ 비위탁 Vault 시스템 (Non-Custodial Vault)
**우선순위:** 매우 높음 | **복잡도:** 높음 | **팀:** 스마트 컨트랙트/보안

플랫폼의 핵심 인프라로, 각 거래 전략을 스마트 컨트랙트 기반의 Vault로 구현합니다. 사용자의 자산에 대한 완전한 통제권을 보장합니다.

**핵심 기능:**
- Vault 생성 및 초기화
- 자산 입출금
- 자동화 거래 실행
- 성과 수수료 징수
- 재진입 공격 방지 등 보안

**기술 스택:** Rust, Anchor Framework, Solana

**관련 문서:** [02_Vault_System/README.md](./02_Vault_System/README.md)

---

### 3️⃣ 지갑 연동 (Wallet Integration)
**우선순위:** 높음 | **복잡도:** 낮음 | **팀:** 프론트엔드

Phantom, Solflare 등 주요 Solana 지갑과 웹사이트를 연동하여 사용자가 편리하게 거래에 서명하고 자산을 관리할 수 있도록 합니다.

**핵심 기능:**
- 다중 지갑 지원
- 트랜잭션 서명
- 세션 관리
- 에러 처리

**기술 스택:** React, @solana/wallet-adapter

**관련 문서:** [03_Wallet_Integration/README.md](./03_Wallet_Integration/README.md)

---

### 4️⃣ 자금 입출금 (Deposit/Withdraw)
**우선순위:** 매우 높음 | **복잡도:** 중간 | **팀:** 스마트 컨트랙트/프론트엔드

사용자가 선택한 Vault에 자산을 입금하거나 출금할 수 있는 핵심 거래 기능입니다.

**핵심 기능:**
- SOL/SPL 토큰 입금
- 지분 기반 출금
- 거래 상태 추적
- 확인 및 검증

**관련 문서:** [04_Deposit_Withdraw/README.md](./04_Deposit_Withdraw/README.md)

---

### 5️⃣ 포트폴리오 모니터링 (Portfolio Monitoring)
**우선순위:** 높음 | **복잡도:** 중간 | **팀:** 프론트엔드/백엔드

사용자가 자신의 투자 현황을 실시간으로 모니터링할 수 있는 개인 대시보드.

**핵심 기능:**
- 총자산 조회
- Vault별 성과 추적
- 거래 내역 상세 조회
- 수익률 차트 및 시각화
- 실시간 업데이트

**기술 스택:** React, Chart.js, PostgreSQL

**관련 문서:** [05_Portfolio_Monitoring/README.md](./05_Portfolio_Monitoring/README.md)

---

### 6️⃣ 자동화 거래 실행 (Automated Trading)
**우선순위:** 매우 높음 | **복잡도:** 높음 | **팀:** 백엔드/스마트 컨트랙트

Crank 메커니즘을 통해 사전 정의된 조건에 따라 자동으로 거래를 실행합니다.

**핵심 기능:**
- Crank 스케줄러
- 거래 조건 평가
- Jupiter 통합 거래
- 슬리피지 관리
- 거래 기록 저장

**기술 스택:** Node.js/Python, Jupiter API, Bull Queue

**관련 문서:** [06_Automated_Trading/README.md](./06_Automated_Trading/README.md)

---

### 7️⃣ 성과 수수료 계산 (Performance Fee)
**우선순위:** 높음 | **복잡도:** 중간 | **팀:** 스마트 컨트랙트/백엔드

수익이 발생했을 경우에만 자동으로 성과 수수료를 징수하는 투명한 수수료 모델입니다.

**핵심 기능:**
- 고워터마크 방식 수수료 계산
- 자동 징수
- 거래 기록
- 통계 분석

**관련 문서:** [07_Performance_Fee/README.md](./07_Performance_Fee/README.md)

---

### 8️⃣ 백테스팅 시스템 (Backtesting)
**우선순위:** 높음 | **복잡도:** 높음 | **팀:** 백엔드/데이터 과학

거래 전략을 실제 배포 전 과거 데이터로 검증하여 유효성을 확인합니다.

**핵심 기능:**
- 과거 데이터 분석
- 시뮬레이션
- 성과 평가
- 파라미터 최적화
- 리스크 분석

**기술 스택:** Python, pandas, numpy, Matplotlib

**관련 문서:** [08_Backtesting/README.md](./08_Backtesting/README.md)

---

### 9️⃣ DEX 통합 - Jupiter (Jupiter Integration)
**우선순위:** 높음 | **복잡도:** 중간 | **팀:** 백엔드

Jupiter 애그리게이터를 통해 Solana의 여러 DEX에서 최적의 거래 가격을 제공합니다.

**핵심 기능:**
- 최적 경로 조회
- 슬리피지 최소화
- 다양한 토큰 지원
- 에러 처리 및 폴백

**기술 스택:** TypeScript, Jupiter SDK

**관련 문서:** [09_Jupiter_Integration/README.md](./09_Jupiter_Integration/README.md)

---

### 🔟 데이터 대시보드 (Data Dashboard)
**우선순위:** 중간-높음 | **복잡도:** 중간 | **팀:** 프론트엔드/백엔드

플랫폼의 모든 주요 지표를 시각화한 분석 대시보드.

**핵심 기능:**
- 플랫폼 개요 (TVL, 사용자, 거래)
- Vault 분석
- 거래 통계
- 사용자 지표
- 수익 분석

**기술 스택:** React, Recharts, PostgreSQL, Redis

**관련 문서:** [10_Data_Dashboard/README.md](./10_Data_Dashboard/README.md)

---

### 🔟➕ 전략 상세 페이지 (Strategy Details)
**우선순위:** 높음 | **복잡도:** 높음 | **팀:** 프론트엔드/백엔드

각 거래 전략의 상세 정보를 제공하는 페이지. 유튜브 설명 영상, 트레이딩뷰 차트, 거래 히스토리를 통해 투명성과 신뢰도를 확보합니다.

**핵심 기능:**
- 전략 헤더 (핵심 지표)
- YouTube 영상 및 트레이더 정보
- TradingView 차트 (가격, 거래 신호)
- 거래 히스토리 테이블 (필터/정렬)
- 성과 통계 (승률, MDD, Sharpe Ratio)

**기술 스택:** React, YouTube Embed, TradingView Charts, shadcn/ui Table

**관련 문서:**
- [11_Strategy_Details/README.md](./11_Strategy_Details/README.md)
- [11_Strategy_Details/TECHNICAL_SPECS.md](./11_Strategy_Details/TECHNICAL_SPECS.md)

---

## 개발 우선순위 및 추천 순서

### Phase 1: 핵심 인프라 (6-8주)
1. **02_Vault_System** - 스마트 컨트랙트 개발 (4주)
   - Rust/Anchor로 Vault 프로그램 구현
   - 단위/통합 테스트
   - Devnet/Testnet 배포

2. **03_Wallet_Integration** - 지갑 연동 (1주)
   - wallet-adapter 통합
   - 기본 UI 구현

3. **04_Deposit_Withdraw** - 입출금 기능 (2주)
   - 스마트 컨트랙트 Instruction 개발
   - 프론트엔드 UI 개발

### Phase 2: 거래 엔진 (4-6주)
4. **06_Automated_Trading** - 자동화 거래 (3주)
   - Crank 서비스 개발
   - Jupiter 통합

5. **09_Jupiter_Integration** - DEX 통합 (병렬 진행)
   - Jupiter SDK 통합
   - Quote/Swap API 구현

6. **07_Performance_Fee** - 수수료 계산 (1주)
   - 고워터마크 계산 로직
   - 자동 징수 메커니즘

### Phase 3: 사용자 인터페이스 (3-4주)
7. **01_Strategy_Ranking** - 전략 랭킹 (2주)
   - 백엔드 API 개발
   - 프론트엔드 UI 개발

8. **05_Portfolio_Monitoring** - 포트폴리오 (2주)
   - 대시보드 개발
   - 실시간 업데이트

### Phase 4: 분석 및 최적화 (2-3주)
9. **08_Backtesting** - 백테스팅 (2주)
   - 백테스팅 엔진 개발
   - 성과 평가 지표

10. **10_Data_Dashboard** - 데이터 대시보드 (1주)
    - 분석 API 개발
    - 차트 및 시각화

---

## 기술 스택 요약

### 블록체인 & 스마트 컨트랙트
- **Solana:** 메인넷
- **Rust:** 프로그램 개발
- **Anchor Framework:** 개발 프레임워크

### 프론트엔드
- **React 18.x** / **Next.js 13.x**
- **TypeScript**
- **Tailwind CSS** / **shadcn/ui**
- **@solana/web3.js** / **wallet-adapter**

### 백엔드
- **Node.js / Python**
- **Express.js / FastAPI**
- **PostgreSQL**
- **Redis**
- **RPC Node (Helius, QuickNode)**

### 외부 서비스
- **Jupiter API:** DEX 애그리게이터
- **CoinGecko / Messari:** 가격 데이터

---

## 체크리스트 및 진행 현황

- [ ] Phase 1: 핵심 인프라
  - [ ] 02_Vault_System 개발
  - [ ] 03_Wallet_Integration 개발
  - [ ] 04_Deposit_Withdraw 개발

- [ ] Phase 2: 거래 엔진
  - [ ] 06_Automated_Trading 개발
  - [ ] 09_Jupiter_Integration 개발
  - [ ] 07_Performance_Fee 개발

- [ ] Phase 3: 사용자 인터페이스
  - [ ] 01_Strategy_Ranking 개발
  - [ ] 05_Portfolio_Monitoring 개발

- [ ] Phase 4: 분석 및 최적화
  - [ ] 08_Backtesting 개발
  - [ ] 10_Data_Dashboard 개발

- [ ] 보안 감사 및 최적화
  - [ ] 스마트 컨트랙트 외부 감사
  - [ ] 보안 취약점 수정
  - [ ] Testnet 장기 안정성 검증

- [ ] 메인넷 배포 및 운영
  - [ ] Mainnet 배포
  - [ ] 모니터링 시스템 구축
  - [ ] 초기 전략 배포

---

## 추가 리소스

- [기획서](../00_Architecture/솔라나(Solana)%20기반%20자동화%20트레이딩%20플랫폼%20기획서.md)
- 스마트 컨트랙트 저장소: (추가 예정)
- 프론트엔드 저장소: (추가 예정)
- 백엔드 저장소: (추가 예정)

---

**마지막 업데이트:** 2025-10-27
