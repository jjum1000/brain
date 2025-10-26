# 기술 사양서 - 전략 랭킹 시스템

## 시스템 아키텍처

### 프론트엔드
- **프레임워크:** React 18.x / Next.js 13.x
- **상태관리:** Redux Toolkit 또는 TanStack Query
- **UI 라이브러리:** Tailwind CSS, shadcn/ui
- **차트:** Recharts, Chart.js

### 백엔드 API
- **프레임워크:** Express.js / FastAPI
- **데이터베이스:** PostgreSQL 14+
- **캐싱:** Redis

## 주요 API 엔드포인트

```
GET /api/strategies                    # 전략 목록 조회
  - 쿼리: sortBy (returns, tvl, risk), page, limit, search
GET /api/strategies/:id                # 특정 전략 상세 조회
GET /api/strategies/:id/performance    # 전략 성과 데이터
GET /api/strategies/:id/chart          # 성과 차트 데이터
POST /api/strategies/:id/deposit       # 전략 입금 (Vault 주소 반환)
```

## 데이터 구조

### Strategy 테이블
```sql
CREATE TABLE strategies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  vault_address VARCHAR(255) UNIQUE NOT NULL,
  creator_address VARCHAR(255),
  strategy_type VARCHAR(100),
  risk_level INTEGER (1-5),
  tvl DECIMAL(20, 8),
  apy DECIMAL(10, 4),
  ytd_return DECIMAL(10, 4),
  video_url VARCHAR(512),
  inception_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vault_snapshots (
  id UUID PRIMARY KEY,
  vault_id UUID NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  tvl DECIMAL(20, 8),
  share_price DECIMAL(20, 8),
  total_users INTEGER,
  transaction_count INTEGER,
  FOREIGN KEY (vault_id) REFERENCES strategies(id)
);
```

## UI 구성요소

### Strategy Card
- Vault 이름 및 설명
- 수익률 (APY, YTD, 1Y 등)
- TVL 및 사용자 수
- 위험 등급 (색상 코드)
- 미니 차트 (수익 추이)
- 영상 썸네일 및 링크
- QR 코드 (Vault 입금 주소)
- "입금하기" 버튼

### 정렬 및 필터
- 정렬: 수익률, TVL, 위험도, 인기도
- 필터: 위험도 범위, TVL 범위, 전략 타입
- 검색: Vault 이름, 설명

## 성능 요구사항
- 페이지 로드 시간: < 2초
- API 응답 시간: < 500ms
- TTI (Time to Interactive): < 3초

## 보안 고려사항
- 입금 주소 XSS 방지
- 영상 URL 검증
- CORS 설정
- Rate limiting (API 요청 제한)

## 배포 및 운영
- CI/CD: GitHub Actions
- 호스팅: Vercel (프론트) / AWS/Digital Ocean (백엔드)
- 모니터링: Sentry, DataDog
