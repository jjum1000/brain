# 기술 사양서 - 지갑 연동

## 라이브러리 스택
- **@solana/web3.js:** 13.x
- **@solana/wallet-adapter-react:** Latest
- **Phantom SDK:** Latest
- **Solflare SDK:** Latest

## Wallet Adapter 설정

```typescript
// WalletProviderSetup
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new LedgerWalletAdapter(),
];

// Provider 감싸기
<ConnectionProvider endpoint={RPC_ENDPOINT}>
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      <App />
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>;
```

## 주요 Hook 및 함수

### useWallet Hook
```typescript
const { connected, publicKey, wallet, signTransaction } = useWallet();
```

### Transaction 서명 및 전송
```typescript
const transaction = new Transaction().add(
  // instructions...
);

const signedTransaction = await signTransaction(transaction);
const signature = await connection.sendRawTransaction(
  signedTransaction.serialize()
);
await connection.confirmTransaction(signature);
```

## 연결 상태 관리

### 지갑 연결 상태
```typescript
enum WalletConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTING = "disconnecting",
  ERROR = "error",
}
```

### 상태 저장 (LocalStorage)
```javascript
// 사용자 연결 기록 저장
localStorage.setItem("walletName", wallet.name);
```

## 지갑별 지원 기능

| 지갑 | 타입 | Ledger 연동 | 다중 서명 | 주석 |
|------|------|-----------|--------|------|
| Phantom | 모바일/확장 | 지원 | 지원 | 가장 인기 있음 |
| Solflare | 모바일/확장 | 지원 | 지원 | 신뢰할 수 있음 |
| Ledger | 하드웨어 | 해당없음 | 미지원 | 고보안 |
| Magic Eden | 확장 | 미지원 | 미지원 | NFT 관련 |

## 에러 처리

```typescript
try {
  const transaction = new Transaction().add(instruction);
  const signature = await signTransaction(transaction);
  await connection.sendRawTransaction(signature.serialize());
} catch (error) {
  if (error instanceof WalletSignTransactionError) {
    // 사용자가 거래 거부
    console.error("Transaction rejected by user");
  } else if (error instanceof WalletConnectionError) {
    // 지갑 연결 오류
    console.error("Wallet connection failed");
  } else {
    // 기타 오류
    console.error("Unknown error:", error);
  }
}
```

## 보안 모범 사례

### 1. 트랜잭션 검증
- 거래 전에 사용자에게 명확한 정보 표시
- 거래 비용(가스비) 사전 공지

### 2. 개인키 보호
- 로컬 스토리지에 민감한 정보 저장 금지
- HTTPS 필수

### 3. Phishing 방지
- Wallet 도메인 검증
- URL 확인 권유

### 4. 승인 관리
- 무제한 승인 피하기
- 각 거래마다 명시적 서명 요구

## 모바일 지갑 통합

### 모바일 Web3 브라우저
- Phantom Mobile App
- Solflare Mobile App

### Deep Link 처리
```javascript
if (isPhantomInstalled) {
  // Phantom이 설치된 경우
  window.location.href =
    "solana://action?data=" + encodedTransactionData;
}
```

## 테스트 환경

### 테스트넷 설정
```javascript
const connection = new Connection(
  "https://api.testnet.solana.com",
  "confirmed"
);
```

### 로컬 테스트
```bash
solana-test-validator
```

## 모니터링 및 로깅

```typescript
// 지갑 연결 이벤트 추적
console.log(`Connected to ${wallet.adapter.name}`);

// 거래 서명 추적
console.log(`Transaction signed: ${signature}`);

// 에러 추적
console.error(`Wallet error: ${error.message}`);
```
