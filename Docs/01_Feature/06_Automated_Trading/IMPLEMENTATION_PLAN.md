# 구현 계획 - 자동화 거래 실행

## 개발 단계

### Phase 1: 기본 Crank 서비스 (1-2주)
- [ ] Crank 스케줄러 구현
- [ ] Jupiter API 통합
- [ ] 거래 기록 저장
- [ ] 에러 처리 및 로깅

### Phase 2: 거래 조건 엔진 (2-3주)
- [ ] 조건 정의 언어 (CDL) 설계
- [ ] 조건 파서 구현
- [ ] 온체인 데이터 분석
- [ ] 조건 평가 로직

### Phase 3: 거래 최적화 (1-2주)
- [ ] 슬리피지 계산
- [ ] 가스비 최적화
- [ ] 거래 경로 최적화
- [ ] 실패 처리 및 재시도

### Phase 4: 모니터링 및 대시보드 (1주)
- [ ] 거래 상태 모니터링
- [ ] 실시간 알림
- [ ] 거래 이력 조회
- [ ] 성과 대시보드

## 기술 구조

### Crank 서비스 아키텍처
```
┌─────────────────────────────────┐
│   Crank Scheduler               │
│   (Node.js + Bull Queue)        │
└────────────┬────────────────────┘
             │
     ┌───────┴─────────┐
     ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Condition    │  │ Jupiter API  │
│ Evaluator    │  │ Client       │
└──────────────┘  └──────────────┘
     │                 │
     └─────────┬───────┘
               ▼
        ┌─────────────────┐
        │ Transaction     │
        │ Executor        │
        └────────┬────────┘
                 ▼
        ┌─────────────────┐
        │ Solana Network  │
        │ (RPC Node)      │
        └─────────────────┘
```

### 메인 Crank 루프
```javascript
async function cranker() {
  while (true) {
    try {
      // 1. Vault 목록 조회
      const vaults = await getActiveVaults();

      for (const vault of vaults) {
        // 2. 거래 조건 평가
        const shouldTrade = await evaluateCondition(vault);

        if (shouldTrade) {
          // 3. 거래 실행
          const txSignature = await executeTrade(vault);

          // 4. 결과 저장
          await saveTradeLog(vault.id, txSignature);
        }
      }

      // 5. 대기 (예: 1분)
      await sleep(60000);
    } catch (error) {
      console.error("Cranker error:", error);
      // 에러 추적 및 알림
      await notifyError(error);
    }
  }
}
```

## 데이터베이스 스키마

### trade_logs 테이블
```sql
CREATE TABLE trade_logs (
  id UUID PRIMARY KEY,
  vault_id UUID NOT NULL,
  timestamp TIMESTAMP,
  instruction_type VARCHAR(50), -- 'swap', 'lp', 'arbitrage'
  input_token VARCHAR(100),
  output_token VARCHAR(100),
  input_amount DECIMAL(20, 8),
  output_amount DECIMAL(20, 8),
  slippage DECIMAL(10, 4),
  gas_fee DECIMAL(20, 8),
  transaction_signature VARCHAR(255) UNIQUE,
  status VARCHAR(50), -- 'pending', 'confirmed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (vault_id) REFERENCES strategies(id)
);

CREATE TABLE trade_conditions (
  id UUID PRIMARY KEY,
  vault_id UUID NOT NULL,
  condition_type VARCHAR(50), -- 'price', 'time', 'tvl'
  condition_rule TEXT, -- JSON
  enabled BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (vault_id) REFERENCES strategies(id)
);
```

## 거래 조건 평가 예시

```javascript
// 가격 기반 조건
const priceCondition = {
  type: "price",
  token: "SOL/USDC",
  operator: "below",
  value: 150,
};

// 시간 기반 조건
const timeCondition = {
  type: "time",
  cron: "0 9,14 * * MON-FRI", // 평일 9시, 14시
};

// TVL 기반 조건
const tvlCondition = {
  type: "tvl",
  operator: "above",
  value: 100000, // $100k
};
```

## Jupiter API 호출 예시

```javascript
// Quote 조회
const quote = await fetch(
  "https://quote-api.jup.ag/v6/quote?inputMint=...&outputMint=...&amount=..."
);

// Swap 실행
const swapIx = await (
  await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: userAddress,
      wrapAndUnwrapSol: true,
    }),
  })
).json();

// Transaction 생성 및 실행
const transaction = new Transaction().add(swapIx);
const signature = await sendTransaction(transaction);
```

## 테스트 계획

### 단위 테스트
```typescript
describe("Condition Evaluator", () => {
  it("should return true for met condition", () => {
    // ...
  });

  it("should return false for unmet condition", () => {
    // ...
  });
});
```

### 통합 테스트
- Testnet에서 실제 거래 실행
- 다양한 토큰 쌍 테스트
- 극한 시장 조건 시뮬레이션

### 로드 테스트
- 동시에 여러 Vault 처리
- 대규모 Crank 시뮬레이션

## 배포 전 체크리스트
- [ ] 모든 테스트 통과
- [ ] 보안 감사 완료
- [ ] Testnet에서 1주일 이상 안정성 검증
- [ ] 모니터링 및 알림 시스템 구축
- [ ] 운영 매뉴얼 작성
- [ ] 장애 복구 계획 수립
