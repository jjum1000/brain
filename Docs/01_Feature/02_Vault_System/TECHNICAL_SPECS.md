# 기술 사양서 - 비위탁 Vault 시스템

## 스마트 컨트랙트 구조

### 주요 프로그램
```
solana_trading_vault/
├── programs/
│   └── vault/
│       ├── src/
│       │   ├── lib.rs
│       │   ├── instructions/
│       │   │   ├── initialize.rs
│       │   │   ├── deposit.rs
│       │   │   ├── withdraw.rs
│       │   │   ├── execute_trade.rs
│       │   │   └── claim_fees.rs
│       │   ├── state/
│       │   │   ├── vault.rs
│       │   │   └── user_position.rs
│       │   └── utils/
│       │       ├── math.rs
│       │       └── errors.rs
│       └── Cargo.toml
└── tests/
    └── integration.ts
```

## 핵심 PDA (Program Derived Account)
```rust
// Vault 계정
seeds = ["vault", strategy_id.as_ref()]

// 사용자 위치
seeds = ["position", vault_address.as_ref(), user_address.as_ref()]

// Vault Treasury (자산 보관)
seeds = ["treasury", vault_address.as_ref()]
```

## Instruction 명세

### 1. Initialize
- 새로운 Vault 생성
- 초기 파라미터 설정 (수익 수수료율, 최소 입금액 등)

### 2. Deposit
- 사용자가 자산을 Vault에 입금
- LP 토큰 발행
- 입금액 기록

### 3. Withdraw
- 사용자가 자신의 지분 출금
- LP 토큰 소각
- 자산 전송

### 4. Execute Trade
- 외부 실행자(Crank)가 호출
- Jupiter API를 통한 거래 실행
- 거래 기록 저장

### 5. Claim Fees
- 성과 수수료 징수
- 플랫폼 지갑으로 전송

## 수학 계산

### LP 토큰 계산
```
입금액 = depositAmount
현재 TVL = totalAssets
발행된 LP 토큰 = totalLpTokens
발행할 LP 토큰 = depositAmount * totalLpTokens / totalAssets
(또는 초기 입금 시: depositAmount)
```

### 출금액 계산
```
사용자 LP 토큰 = userLpTokens
현재 TVL = totalAssets
발행된 LP 토큰 = totalLpTokens
출금액 = userLpTokens * totalAssets / totalLpTokens
```

### 수수료 계산
```
이전 최고 자산가 = highWaterMark
현재 자산가 = currentNav
수익 = currentNav - highWaterMark (양수인 경우)
수수료 = 수익 * performanceFeeRate
```

## 보안 감사 항목

### Re-entrancy Protection
- 모든 외부 호출 전 상태 변경
- ReentrancyGuard 구현

### 수학 오버플로우/언더플로우
- Checked math 사용
- SafeMath 라이브러리 활용

### 권한 검증
- 서명자 검증
- 계정 소유권 확인
- 계정 초기화 상태 확인

### 가격 조작 방지
- DEX 애그리게이터 사용
- 슬리피지 제한
- 오라클 사용 (미래 단계)

## 테스트 전략

### 단위 테스트
- 각 instruction별 성공 케이스
- 에러 케이스 (권한 없음, 잘못된 계정 등)

### 통합 테스트
- 전체 사용자 플로우
- 다중 사용자 시나리오
- 동시성 테스트

### Fuzzing
- 랜덤 입력 생성
- 경계값 테스트

## 배포 체크리스트
- [ ] Devnet 배포 및 테스트
- [ ] Testnet 배포 및 심화 테스트
- [ ] 외부 보안 감사 완료
- [ ] 모든 감사 이슈 해결
- [ ] Mainnet Beta 배포
- [ ] 메인넷 배포

## 모니터링 및 운영
- 거래 실패 추적
- 수수료 징수 검증
- 보안 이벤트 로깅
