# 11. 전략 상세 페이지 (Strategy Details)

## 개요
각 거래 전략의 상세 정보를 제공하는 페이지. 유명 유튜브 트레이더의 설명 영상, 실시간 트레이딩뷰 차트, 거래 히스토리를 통해 사용자가 전략을 깊이 있게 이해하고 신뢰할 수 있도록 지원합니다.

## 주요 기능

### 1. **전략 헤더 (Header Section)**
- 전략 이름 및 위험도 배지
- 핵심 지표 (APY, 24h Return, TVL, 사용자 수)
- 전략 설명 및 주요 특징
- 입금 버튼

### 2. **유튜브 영상 섹션 (YouTube Video Section)**
- **유튜브 임베드:** 전략 설명 영상 재생
- **썸네일:** 트레이더 프로필 이미지
- **메타데이터:**
  - 채널명 (유명 트레이더)
  - 조회수 및 업로드 날짜
  - 설명 텍스트

### 3. **트레이딩뷰 차트 (TradingView Chart)**
- **차트 유형:**
  - 양초 차트 (Candlestick)
  - 선 차트 (Line)
  - 거래량 (Volume)

- **표시 정보:**
  - SOL/USDC 가격 추이
  - 거래 신호 (매수/매도 포인트)
  - 이동평균선 (MA)
  - RSI, MACD 등 기술 지표

- **상호작용:**
  - 확대/축소 (Zoom)
  - 기간 선택 (1D, 1W, 1M)
  - 지표 추가/제거

### 4. **거래 히스토리 (Trade History)**
- **테이블 형식:**
  - 거래 날짜/시간
  - 유형 (Buy/Sell)
  - 가격
  - 수량
  - 수익/손실 (P&L)
  - 상태 (Completed/Pending)

- **필터링:**
  - 기간 필터 (최근 7일, 30일, 모두)
  - 유형 필터 (매수/매도)
  - 상태 필터

- **정렬:**
  - 날짜순
  - 수익순
  - 규모순

### 5. **성과 통계 (Performance Stats)**
- 총 거래수
- 승률 (Win Rate)
- 평균 수익 (Avg Profit)
- 최대 낙폭 (MDD)
- 샤프지수 (Sharpe Ratio)

## 기술 요구사항

### 프론트엔드
- **프레임워크:** React / Next.js
- **상태관리:** Redux 또는 TanStack Query
- **차트:** TradingView Lightweight Charts 또는 Chart.js
- **비디오:** HTML5 Video Player 또는 YouTube Embed API
- **테이블:** shadcn/ui Table

### 백엔드 API
- **전략 상세:** GET /api/strategies/:id
- **차트 데이터:** GET /api/strategies/:id/price-data
- **거래 히스토리:** GET /api/strategies/:id/trades
- **성과 통계:** GET /api/strategies/:id/stats
- **유튜브 정보:** GET /api/strategies/:id/video

### 데이터베이스
```sql
-- 거래 기록 테이블
CREATE TABLE strategy_trades (
  id UUID PRIMARY KEY,
  strategy_id UUID,
  timestamp TIMESTAMP,
  type VARCHAR(10), -- 'buy' or 'sell'
  price DECIMAL(20, 8),
  quantity DECIMAL(20, 8),
  pnl DECIMAL(20, 8),
  pnl_percent DECIMAL(10, 4),
  status VARCHAR(20), -- 'completed', 'pending'
  transaction_hash VARCHAR(255),
  FOREIGN KEY (strategy_id) REFERENCES strategies(id)
);

-- 가격 데이터
CREATE TABLE price_data (
  id UUID PRIMARY KEY,
  strategy_id UUID,
  timestamp TIMESTAMP,
  open DECIMAL(20, 8),
  high DECIMAL(20, 8),
  low DECIMAL(20, 8),
  close DECIMAL(20, 8),
  volume DECIMAL(20, 8),
  FOREIGN KEY (strategy_id) REFERENCES strategies(id),
  INDEX (strategy_id, timestamp)
);
```

## UI/UX 설계

### 레이아웃
```
┌─────────────────────────────────────┐
│          Strategy Header             │
│  (Name, Risk, APY, TVL, Users)      │
├─────────────────────────────────────┤
│  YouTube Video | 트레이더 정보       │
├─────────────────────────────────────┤
│        TradingView Chart            │
│  (SOL/USDC 가격 추이)               │
├─────────────────────────────────────┤
│        Trade History Table          │
│  (최근 거래 100개)                   │
├─────────────────────────────────────┤
│     Performance Statistics          │
│  (총거래, 승률, MDD 등)              │
└─────────────────────────────────────┘
```

### 반응형 디자인
- **모바일:** 세로 스택 레이아웃
- **태블릿:** 2열 레이아웃 (영상 + 차트)
- **데스크톱:** 풀 너비 레이아웃

## 데이터 예시

### 전략 정보
```json
{
  "id": "strategy_001",
  "name": "Luna Trend Following",
  "creator": "Crypto King",
  "description": "TradingView에서 검증된 추세 추종 전략입니다.",
  "risk": "medium",
  "apy": 28.5,
  "tvl": 1234567,
  "users": 342,
  "returns_24h": 2.3,
  "video_url": "https://youtube.com/embed/...",
  "youtuber": {
    "name": "Crypto King",
    "views": "1.2M",
    "subscribers": "500K",
    "uploaded": "2025-10-20"
  }
}
```

### 거래 히스토리 데이터
```json
[
  {
    "date": "2025-10-27 14:32",
    "type": "BUY",
    "price": 155.23,
    "quantity": 100,
    "pnl": 320.50,
    "pnl_percent": 2.1,
    "status": "completed"
  },
  {
    "date": "2025-10-27 12:15",
    "type": "SELL",
    "price": 158.45,
    "quantity": 100,
    "pnl": 320.50,
    "pnl_percent": 2.1,
    "status": "completed"
  }
]
```

## 기술 스택

| 분야 | 기술 | 역할 |
|------|------|------|
| **차트** | TradingView Lightweight Charts | 실시간 가격 차트 |
| 또는 | Chart.js | 대체 차트 라이브러리 |
| **비디오** | YouTube Embed API | 유튜브 영상 임베드 |
| **테이블** | shadcn/ui Table | 거래 히스토리 표시 |
| **상태관리** | TanStack Query | 실시간 데이터 동기화 |
| **백엔드** | Node.js / Python | API 서버 |

## 구현 단계

### Phase 1: 기본 UI (1주)
- [ ] 페이지 레이아웃 구성
- [ ] 전략 헤더 구현
- [ ] 유튜브 임베드 통합
- [ ] 기본 응답형 디자인

### Phase 2: 차트 통합 (1주)
- [ ] TradingView Lightweight Charts 통합
- [ ] 가격 데이터 API 연동
- [ ] 기술 지표 추가
- [ ] 상호작용 기능

### Phase 3: 거래 히스토리 (1주)
- [ ] 테이블 구현
- [ ] 필터링/정렬 기능
- [ ] 페이지네이션
- [ ] 실시간 업데이트

### Phase 4: 성과 통계 (3-5일)
- [ ] 통계 계산
- [ ] 차트 시각화
- [ ] 성과 카드

### Phase 5: 최적화 및 테스트 (1주)
- [ ] 성능 최적화
- [ ] 크로스 브라우저 테스트
- [ ] 보안 감시

## 성능 요구사항
- 페이지 로드: < 2초
- 차트 렌더링: < 1초
- API 응답: < 500ms
- 60fps 부드러운 스크롤

## 보안 고려사항
- YouTube API 키 서버에서만 관리
- 가격 데이터 인증 필수
- XSS 방지 (영상 URL 검증)
- CORS 설정

## 향후 확장 기능
- [ ] 실시간 알림 (WebSocket)
- [ ] 거래 제안 (Trade Signals)
- [ ] 포트폴리오 비교
- [ ] 커뮤니티 댓글
- [ ] 전략 복제 (Copy Trading)

## 연관 피쳐
- 01_Strategy_Ranking
- 09_Jupiter_Integration (거래 데이터)
- 10_Data_Dashboard (성과 시각화)

## 개발 우선순위
**높음** - Strategy Ranking과 함께 사용자 신뢰도 확보의 핵심 기능
