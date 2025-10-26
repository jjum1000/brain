# SolanaVault 목업 사이트 가이드

## 📱 개요

**파일:** `solana-trading-mockup.html` (305KB)
**버전:** v2.0 (전략 상세 페이지 추가)

이 목업 사이트는 Solana 자동화 트레이딩 플랫폼의 프론트엔드를 시각적으로 표현합니다.
React + Tailwind CSS + shadcn/ui로 개발된 단일 HTML 파일입니다.

---

## 🎯 포함된 기능

### 1. **전략 랭킹 시스템 (Strategy Ranking Tab)**
- 4개의 샘플 거래 전략 카드
- 각 전략별 주요 지표 표시:
  - **APY (Annual Percentage Yield):** 연 수익률
  - **24h Return:** 24시간 수익률
  - **Users:** 현재 사용자 수
  - **TVL (Total Value Locked):** 예치 자산
  - **Risk Level:** 위험 등급 (Low/Medium/High)
- 컬러 코드된 위험도 배지
- "Learn More", "Deposit" 액션 버튼

### 2. **포트폴리오 모니터링 (Your Portfolio Tab)**
- **지갑 연동 상태 표시**
  - "Connect Wallet" 버튼으로 Phantom/Solflare 지갑 연동 시뮬레이션

- **지갑 연동 후 표시되는 정보:**
  - **포트폴리오 요약 카드:**
    - 총 자산 가치: $45,230.50
    - 총 수익: $3,245.75 (+7.7%)

  - **활성 전략 수:** 3개

  - **통제 방식:** Non-Custodial (비위탁)

  - **투자 상세:**
    - 각 Vault별 자산값, 수익, 수익률 표시
    - 실시간 수익 업데이트 시뮬레이션

### 3. **헤더 (Header Section)**
- SolanaVault 로고 및 브랜딩
- "Non-Custodial Trading Platform" 부제
- 동적 지갑 연결 버튼
  - 연결 전: "Connect Wallet" (파란색)
  - 연결 후: "Connected" (초록색)

### 4. **히어로 섹션 (Hero Section)**
- 플랫폼의 핵심 가치 제안
- "Automated Trading on Solana" 메시지
- 비위탁, 투명성, 수익성에 대한 설명

### 5. **핵심 기능 하이라이트 (Features Section)**
3개의 핵심 가치 제안 카드:

1. **🛡️ Non-Custodial**
   - "Your private key, your assets."
   - "Complete control, zero trust needed."

2. **📈 Automated Trading**
   - "Smart contracts execute trades automatically based on defined strategies."

3. **⚡ Solana Speed**
   - "Fast transactions, low fees."
   - "Trade at scale with minimal costs."

### 6. **전략 상세 페이지 (Strategy Details)** 🆕
"Learn More" 버튼 클릭 시 표시되는 상세 페이지:
- **전략 헤더:** 이름, 설명, 위험도, APY, 24h Return, TVL, 사용자 수
- **YouTube 임베드:** 전략 설명 영상 (실제 YouTube 링크 사용 가능)
- **트레이더 정보:**
  - 트레이더 프로필 이미지
  - 구독자 수 (예: 500K)
  - 조회수 (예: 1.2M)
  - 업로드 날짜
- **가격 차트:** TradingView 차트 플레이스홀더 (실제 통합 시 Lightweight Charts 사용)
- **성과 통계:**
  - Win Rate (승률): 예) 65.5%
  - Total Trades: 342
  - Avg Profit: $150.25
  - Max Drawdown (MDD): 12.5%
  - Sharpe Ratio: 1.8
- **거래 히스토리:** 샘플 거래 5개 표시
  - 날짜/시간, 유형(BUY/SELL), 가격, 수량, P&L, 상태

### 7. **디자인 특징**
- **배경:** 다크 그래디언트 (Slate 900 → 800 → 900)
- **색상 팔레트:** 블루/퍼플 그래디언트 테마
- **폰트:** 시스템 폰트 스택 (빠른 로딩)
- **반응성:** 모바일 완벽 지원
- **상호작용성:** 호버 효과, 부드러운 전환
- **네비게이션:** 헤더에 뒤로가기 버튼 (전략 상세 페이지 → 메인)

---

## 🎮 상호작용 가능한 요소

### 탭 네비게이션
- **Strategy Ranking:** 거래 전략 탐색
- **Your Portfolio:** 개인 투자 포트폴리오 (지갑 연동 후 활성화)

### 버튼 상호작용
- **Connect Wallet:** 지갑 연동 토글 ✅
- **Learn More:** 전략 상세 페이지로 이동 ✅
- **Deposit:** 입금 모달 열기 (추후 구현)
- **뒤로가기 (←):** 메인 페이지로 돌아가기 ✅

### 상태 관리
- 지갑 연결/해제 상태 동적 변경 ✅
- 포트폴리오 탭은 지갑 연결 후에만 데이터 표시 ✅
- 전략 상세 페이지 상태 관리 ✅

---

## 📊 샘플 데이터

### 거래 전략
```
1. Luna Trend Following
   - APY: 28.5% | 24h: +2.3% | Users: 342 | TVL: $1.23M | Risk: Medium

2. Arbitrage Bot Pro
   - APY: 45.2% | 24h: +3.8% | Users: 567 | TVL: $2.57M | Risk: Low

3. High Volatility Play
   - APY: 62.1% | 24h: +5.2% | Users: 193 | TVL: $856K | Risk: High

4. Market Maker Strategy
   - APY: 34.8% | 24h: +1.9% | Users: 421 | TVL: $1.88M | Risk: Low
```

### 포트폴리오 (연결 후)
```
총 자산: $45,230.50
총 수익: $3,245.75 (+7.7%)

투자 중인 Vault:
- Luna Trend Following: $15,000 → $16,155 (+7.7%)
- Arbitrage Bot Pro: $20,000 → $21,890 (+9.5%)
- Market Maker Strategy: $10,230.50 → $10,436.25 (+2.0%)
```

---

## 🚀 사용 방법

### 1. 파일 열기
- 브라우저에서 `solana-trading-mockup.html` 파일 직접 열기
- 또는 Claude.ai 에서 아티팩트로 표시

### 2. 화면 탐색
1. **Strategy Ranking 탭** 확인
   - 다양한 거래 전략 카드 스크롤
   - 각 전략의 성과 지표 비교
   - 위험도별 색상 코딩 확인

2. **Connect Wallet 버튼** 클릭
   - 지갑 연동 상태 변경 시뮬레이션
   - 버튼 색상 및 텍스트 변경 확인

3. **Your Portfolio 탭** 이동
   - 지갑 미연동 상태에서 연동 유도 화면 확인
   - 지갑 연동 후 포트폴리오 데이터 표시 확인

### 3. 반응성 테스트
- 브라우저 리사이즈로 모바일/태블릿/데스크톱 반응성 확인
- 각 기기 크기별 레이아웃 변화 확인

---

## 🛠️ 기술 스택

| 분야 | 기술 |
|------|------|
| **UI Framework** | React 19.2 |
| **스타일링** | Tailwind CSS 3.4 |
| **컴포넌트** | shadcn/ui (40+ 컴포넌트) |
| **빌드도구** | Vite 7.1 + Parcel 2.16 |
| **아이콘** | Lucide React |
| **번들 크기** | 294KB (완전 포함) |

---

## 📋 구현된 피쳐와의 매핑

### 01_Strategy_Ranking (전략 랭킹 시스템)
✅ **메인 페이지 구현**
- 전략 카드 UI
- 정렬 및 필터링 준비
- TVL, APY, 사용자 수 표시

### 03_Wallet_Integration (지갑 연동)
✅ **지갑 연결 UI 구현**
- 연결/해제 버튼
- 상태 표시
- 실제 구현 준비됨

### 05_Portfolio_Monitoring (포트폴리오 모니터링)
✅ **대시보드 UI 구현**
- 포트폴리오 요약
- Vault별 성과 추적
- 수익률 표시

### 06_Automated_Trading (자동화 거래)
⏳ **Crank 상태 표시 (향후)**
- 거래 실행 상태
- 실시간 거래 로그

---

## 🔄 다음 단계

### 프론트엔드 개선
- [ ] 실제 지갑 연동 (wallet-adapter 통합)
- [ ] 거래 모달 구현 (Deposit/Withdraw)
- [ ] 차트 추가 (수익 추이)
- [ ] 실시간 데이터 연동 (WebSocket)

### 백엔드 연동
- [ ] API 엔드포인트 구현
- [ ] 실제 데이터 연동
- [ ] 거래 기록 저장
- [ ] 사용자 인증

### 스마트 컨트랙트 연동
- [ ] Jupiter API 통합
- [ ] 자산 입출금 함수 호출
- [ ] 거래 자동 실행
- [ ] 성과 수수료 계산

---

## 🎨 디자인 원칙

### 1. 최소한의 UI Slop 회피
- ✅ 과도한 중앙 정렬 제거
- ✅ 보라색 그래디언트 대신 블루/퍼플 조화
- ✅ 고르지 않은 코너 반지름 사용
- ✅ 시스템 폰트 활용 (전문성)

### 2. 접근성
- 충분한 색상 대비 (WCAG AA 준수)
- 키보드 네비게이션 가능
- 스크린 리더 지원

### 3. 성능
- 294KB 단일 파일 (번들)
- 빠른 로딩
- 부드러운 애니메이션 (60fps)

---

## 📝 참고사항

### 실제 구현 시 고려사항
1. **보안**
   - 개인키는 절대 서버에 저장하지 말 것
   - HTTPS 필수
   - CSP (Content Security Policy) 설정

2. **성능**
   - 대규모 데이터는 페이지네이션
   - 가상 스크롤 사용
   - 이미지 최적화

3. **규제**
   - 지역별 규제 준수
   - 면책 조항 명확히
   - KYC/AML 준비

4. **모니터링**
   - 에러 추적 (Sentry)
   - 사용자 분석 (Mixpanel)
   - 성능 모니터링 (Datadog)

---

**마지막 업데이트:** 2025-10-27
**개발자:** Claude Code (artifacts-builder 스킬)
