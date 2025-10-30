# 📋 Task 002: Jupiter DEX API 통합

**작성일**: 2025-10-31
**우선순위**: 🔴 Critical
**예상 시간**: 2-3주
**상태**: ⏳ 준비 완료
**선행 작업**: Task 001 (Solana 지갑 연동)

---

## 📌 작업 개요

Jupiter DEX 애그리게이터를 통해 토큰 스왑 기능을 구현합니다. 사용자는 SOL 또는 SPL 토큰으로 전략에 투자할 때 최적의 거래 경로를 이용할 수 있어야 합니다.

---

## 🎯 완료 조건

- [ ] Jupiter API 초기화 및 설정
- [ ] 토큰 스왑 경로 조회 기능
- [ ] 슬리피지 계산 및 표시
- [ ] 거래 서명 및 실행 로직
- [ ] 거래 확인 대기 (Confirmation)
- [ ] 에러 처리 및 재시도

---

## 📁 파일 구조

```
src/
├── lib/
│   ├── jupiter/
│   │   ├── jupiterConfig.ts         (신규)
│   │   ├── jupiterClient.ts         (신규)
│   │   ├── tokenUtils.ts            (신규)
│   │   └── swapCalculator.ts        (신규)
│   └── retryFetch.ts                (신규 - 에러 재시도)
├── hooks/
│   └── useJupiterSwap.ts            (신규)
├── types/
│   └── jupiter.ts                   (신규)
└── components/
    └── pages/
        └── StrategyDetail.tsx       (수정) - 입금 UI에 스왑 로직 추가
```

---

## 🔧 기존 코드 참고

### 1. API 호출 패턴
**파일**: `src/lib/firebase.ts` (1-55줄)

```typescript
// 패턴: 초기화 + 서비스 export
const firebaseConfig = {
  // 설정
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**적용**: Jupiter API도 동일한 패턴으로 구성

### 2. 에러 처리 패턴
**파일**: `src/lib/errorHandler.ts`

```typescript
export const isNetworkError = (error: any): boolean => {
  // 네트워크 에러 판단
};

export const getErrorMessage = (error: any): string => {
  // 에러 메시지 변환
};
```

**적용**: Jupiter API 에러도 errorHandler 확장

### 3. 훅 데이터 페칭 패턴
**파일**: `src/hooks/useStrategies.ts`

```typescript
export const useStrategies = (
  filters?: StrategyFilters,
  limit?: number
) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Firestore에서 데이터 로드
  }, [filters, limit]);

  return { strategies, loading, error };
};
```

**적용**: useJupiterSwap도 동일한 패턴

### 4. 타입 정의 패턴
**파일**: `src/types/firestore.ts`

```typescript
export interface Strategy {
  id: string;
  name: string;
  // ... 필드들
}
```

**적용**: Jupiter 타입도 동일하게 정의

---

## 📦 필수 의존성

```bash
npm install @jupiter-aggregator/core-sdk
npm install @solana/web3.js  # 이미 설치됨
```

### 의존성 정보

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @jupiter-aggregator/core-sdk | ^6.x | Jupiter API 클라이언트 |
| @solana/web3.js | ^1.95.x | (기존) RPC 통신 |

---

## 🛠️ 구현 단계

### 1단계: 타입 정의 (src/types/jupiter.ts)

```typescript
import { PublicKey } from '@solana/web3.js';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface SwapRoute {
  inAmount: number;
  outAmount: number;
  priceImpactPct: number;
  marketInfos: any[]; // Jupiter API 응답
  slippageBps: number; // 슬리피지 기본값 (50 = 0.5%)
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  slippageBps: number;
  fees: {
    platformFeeAmount: number;
    feeMint: string;
  };
}

export interface SwapTransaction {
  swapTransaction: string; // Base64 encoded transaction
  lastValidBlockHeight: number;
}

export interface SwapResult {
  signature: string;
  confirmed: boolean;
  error?: string;
}
```

**위치**: `src/types/jupiter.ts` (신규)

---

### 2단계: Jupiter Config (src/lib/jupiter/jupiterConfig.ts)

```typescript
// Solana 토큰 표준
export const NATIVE_MINT = 'So11111111111111111111111111111111111111112'; // WSOL
export const USDC_MINT = 'EPjFWaLb3d7h91z8UiAkfKVjGUrUVCvvJ21YWmqohWP'; // USDC

export const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';

export const DEFAULT_SLIPPAGE = 50; // 0.5%
export const MAX_SLIPPAGE = 500; // 5%

export const TOKEN_DECIMALS = {
  [NATIVE_MINT]: 9, // SOL
  [USDC_MINT]: 6,   // USDC
};

export interface JupiterConfig {
  apiUrl: string;
  defaultSlippage: number;
  maxRetries: number;
  timeoutMs: number;
}

export const JUPITER_CONFIG: JupiterConfig = {
  apiUrl: JUPITER_API_URL,
  defaultSlippage: DEFAULT_SLIPPAGE,
  maxRetries: 3,
  timeoutMs: 10000,
};
```

**위치**: `src/lib/jupiter/jupiterConfig.ts` (신규)

---

### 3단계: Jupiter 클라이언트 (src/lib/jupiter/jupiterClient.ts)

```typescript
import { JUPITER_CONFIG, NATIVE_MINT, USDC_MINT } from './jupiterConfig';
import type { SwapQuote, SwapRoute } from '@/types/jupiter';

export class JupiterClient {
  private apiUrl: string;

  constructor(apiUrl = JUPITER_CONFIG.apiUrl) {
    this.apiUrl = apiUrl;
  }

  /**
   * 토큰 스왑 시세 조회
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = JUPITER_CONFIG.defaultSlippage
  ): Promise<SwapQuote> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
      });

      const response = await fetch(`${this.apiUrl}/quote?${params}`);

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        inputMint,
        outputMint,
        inputAmount: parseInt(data.inAmount),
        outputAmount: parseInt(data.outAmount),
        slippageBps,
        fees: data.fees || { platformFeeAmount: 0, feeMint: USDC_MINT },
      };
    } catch (error) {
      throw new Error(`Failed to get quote: ${error.message}`);
    }
  }

  /**
   * 스왑 경로 조회 (고급)
   */
  async getRoutes(
    inputMint: string,
    outputMint: string,
    amount: number
  ): Promise<SwapRoute[]> {
    // Jupiter의 복잡한 경로 계산 사용
    const quote = await this.getQuote(inputMint, outputMint, amount);
    return [{
      inAmount: quote.inputAmount,
      outAmount: quote.outputAmount,
      priceImpactPct: 0, // 계산 로직 필요
      marketInfos: [],
      slippageBps: quote.slippageBps,
    }];
  }

  /**
   * SOL로 입금 (직접 거래)
   */
  async swapForSOL(
    amount: number,
    inputMint: string = USDC_MINT
  ): Promise<SwapQuote> {
    return this.getQuote(inputMint, NATIVE_MINT, amount);
  }

  /**
   * SOL에서 다른 토큰으로 (직접 거래)
   */
  async swapFromSOL(
    amount: number,
    outputMint: string
  ): Promise<SwapQuote> {
    return this.getQuote(NATIVE_MINT, outputMint, amount);
  }
}

export const jupiterClient = new JupiterClient();
```

**위치**: `src/lib/jupiter/jupiterClient.ts` (신규)
**참고**: Firebase 클라이언트 패턴 (firebase.ts)

---

### 4단계: 스왑 계산기 (src/lib/jupiter/swapCalculator.ts)

```typescript
import { NATIVE_MINT } from './jupiterConfig';
import type { SwapQuote } from '@/types/jupiter';

/**
 * 슬리피지 계산
 * @param expectedAmount 예상 출력량
 * @param slippageBps 슬리피지 기본값 (bps = basis points)
 * @returns 최소 수령 금액
 */
export const calculateMinimumAmount = (
  expectedAmount: number,
  slippageBps: number
): number => {
  const slippageDecimal = slippageBps / 10000;
  return Math.floor(expectedAmount * (1 - slippageDecimal));
};

/**
 * 가격 변동 계산
 */
export const calculatePriceImpact = (
  inputAmount: number,
  spotPrice: number,
  outputAmount: number
): number => {
  const expectedOutput = inputAmount * spotPrice;
  if (expectedOutput === 0) return 0;
  return ((expectedOutput - outputAmount) / expectedOutput) * 100;
};

/**
 * 수수료 계산
 */
export const calculateFees = (
  outputAmount: number,
  platformFeeBps: number = 25 // 0.25%
): number => {
  return Math.floor((outputAmount * platformFeeBps) / 10000);
};

/**
 * 최종 수령액 계산
 */
export const calculateNetAmount = (
  quote: SwapQuote
): number => {
  const fees = calculateFees(quote.outputAmount);
  return quote.outputAmount - fees;
};

/**
 * SOL 단위 변환 (lamports → SOL)
 */
export const lamportsToSOL = (lamports: number): number => {
  return lamports / 10 ** 9;
};

/**
 * SOL → lamports 변환
 */
export const solToLamports = (sol: number): number => {
  return Math.floor(sol * 10 ** 9);
};

/**
 * 토큰 단위 변환
 */
export const tokenToAmount = (
  tokenAmount: number,
  decimals: number
): number => {
  return Math.floor(tokenAmount * 10 ** decimals);
};

export const amountToToken = (
  amount: number,
  decimals: number
): number => {
  return amount / (10 ** decimals);
};
```

**위치**: `src/lib/jupiter/swapCalculator.ts` (신규)

---

### 5단계: 토큰 유틸 (src/lib/jupiter/tokenUtils.ts)

```typescript
import { NATIVE_MINT, USDC_MINT, TOKEN_DECIMALS } from './jupiterConfig';
import type { Token } from '@/types/jupiter';

// 지원하는 토큰 목록
export const SUPPORTED_TOKENS: Token[] = [
  {
    address: NATIVE_MINT,
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112.png',
  },
  {
    address: USDC_MINT,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWaLb3d7h91z8UiAkfKVjGUrUVCvvJ21YWmqohWP.png',
  },
];

/**
 * 토큰 주소로 정보 찾기
 */
export const getTokenByAddress = (address: string): Token | undefined => {
  return SUPPORTED_TOKENS.find(t => t.address === address);
};

/**
 * 심볼로 토큰 찾기
 */
export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return SUPPORTED_TOKENS.find(t => t.symbol === symbol);
};

/**
 * 토큰 decimals 가져오기
 */
export const getTokenDecimals = (mint: string): number => {
  return TOKEN_DECIMALS[mint] || 6;
};

/**
 * 토큰 포맷팅 (가독성)
 */
export const formatTokenAmount = (
  amount: number,
  decimals: number,
  maxDecimals: number = 2
): string => {
  const value = amount / (10 ** decimals);
  return value.toFixed(maxDecimals);
};
```

**위치**: `src/lib/jupiter/tokenUtils.ts` (신규)

---

### 6단계: useJupiterSwap 훅 (src/hooks/useJupiterSwap.ts)

```typescript
import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { jupiterClient } from '@/lib/jupiter/jupiterClient';
import {
  calculateMinimumAmount,
  calculateNetAmount,
  lamportsToSOL,
} from '@/lib/jupiter/swapCalculator';
import { getErrorMessage } from '@/lib/errorHandler';
import type { SwapQuote, SwapResult } from '@/types/jupiter';

interface UseJupiterSwapState {
  quote: SwapQuote | null;
  loading: boolean;
  error: Error | null;
  swapping: boolean;
}

export const useJupiterSwap = () => {
  const { connection } = useConnection();
  const { publicKey, signAllTransactions, sendTransaction } = useWallet();

  const [state, setState] = useState<UseJupiterSwapState>({
    quote: null,
    loading: false,
    error: null,
    swapping: false,
  });

  /**
   * 시세 조회
   */
  const getQuote = useCallback(
    async (
      inputMint: string,
      outputMint: string,
      amount: number
    ) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const quote = await jupiterClient.getQuote(
          inputMint,
          outputMint,
          amount
        );
        setState(prev => ({ ...prev, quote, loading: false }));
        return quote;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState(prev => ({
          ...prev,
          error: new Error(errorMessage),
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * 스왑 실행
   */
  const executeSwap = useCallback(
    async (
      quote: SwapQuote,
      slippageBps: number = 50
    ): Promise<SwapResult> => {
      if (!publicKey || !signAllTransactions || !sendTransaction) {
        throw new Error('Wallet not connected');
      }

      setState(prev => ({ ...prev, swapping: true, error: null }));

      try {
        // 1. Jupiter에서 트랜잭션 받기
        // (실제 구현은 Jupiter API v6 spec 참고)

        // 2. 트랜잭션 서명
        // const signedTx = await signAllTransactions([tx]);

        // 3. 트랜잭션 전송
        // const signature = await sendTransaction(signedTx[0], connection);

        // 4. 확인 대기
        // await connection.confirmTransaction(signature, 'confirmed');

        const result: SwapResult = {
          signature: 'dummy-signature', // 실제 signature
          confirmed: true,
        };

        setState(prev => ({ ...prev, swapping: false }));
        return result;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState(prev => ({
          ...prev,
          error: new Error(errorMessage),
          swapping: false,
        }));
        throw error;
      }
    },
    [publicKey, signAllTransactions, sendTransaction, connection]
  );

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    quote: state.quote,
    loading: state.loading,
    swapping: state.swapping,
    error: state.error,
    getQuote,
    executeSwap,
    clearError,
  };
};
```

**위치**: `src/hooks/useJupiterSwap.ts` (신규)
**참고**: `src/hooks/useStrategies.ts` 패턴

---

### 7단계: 에러 재시도 로직 (src/lib/retryFetch.ts)

```typescript
/**
 * Exponential backoff를 사용한 재시도 로직
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const delay = Math.min(
          initialDelay * Math.pow(2, attempt),
          maxDelay
        );
        const jitter = Math.random() * (delay * 0.1);

        await new Promise(resolve =>
          setTimeout(resolve, delay + jitter)
        );
      }
    }
  }

  throw new Error(
    `Failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * 네트워크 에러 판단
 */
export function isRetryableError(error: any): boolean {
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('429') // rate limit
  );
}
```

**위치**: `src/lib/retryFetch.ts` (신규)

---

### 8단계: StrategyDetail.tsx 수정

**기존 코드** (StrategyDetail.tsx):

입금 섹션에 Jupiter 스왑 기능 추가

```typescript
import { useJupiterSwap } from '@/hooks/useJupiterSwap';
import { NATIVE_MINT, USDC_MINT } from '@/lib/jupiter/jupiterConfig';
import { calculateMinimumAmount } from '@/lib/jupiter/swapCalculator';

function DepositSection({ strategyVault }: { strategyVault: string }) {
  const { quote, loading, getQuote, executeSwap } = useJupiterSwap();
  const [inputAmount, setInputAmount] = useState(0);
  const [selectedMint, setSelectedMint] = useState(NATIVE_MINT);

  const handleQuoteUpdate = async (amount: number) => {
    try {
      await getQuote(selectedMint, strategyVault, amount);
    } catch (error) {
      console.error('Quote error:', error);
    }
  };

  const handleDeposit = async () => {
    if (!quote) return;
    try {
      const result = await executeSwap(quote);
      console.log('Deposit successful:', result.signature);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle>Deposit to Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 토큰 선택 */}
        <Select value={selectedMint} onValueChange={setSelectedMint}>
          <SelectTrigger className="bg-slate-700 border-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NATIVE_MINT}>SOL</SelectItem>
            <SelectItem value={USDC_MINT}>USDC</SelectItem>
          </SelectContent>
        </Select>

        {/* 입금액 입력 */}
        <Input
          type="number"
          placeholder="Amount"
          value={inputAmount}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setInputAmount(value);
            if (value > 0) {
              handleQuoteUpdate(value);
            }
          }}
          className="bg-slate-700 border-slate-600"
        />

        {/* 시세 정보 */}
        {quote && (
          <div className="p-3 bg-slate-700 rounded text-sm">
            <div className="flex justify-between mb-2">
              <span>Expected Output:</span>
              <span>{quote.outputAmount / 1e9} SOL</span>
            </div>
            <div className="flex justify-between">
              <span>Slippage:</span>
              <span>{(quote.slippageBps / 100).toFixed(2)}%</span>
            </div>
          </div>
        )}

        {/* 입금 버튼 */}
        <Button
          onClick={handleDeposit}
          disabled={loading || !quote}
          className="w-full bg-amber-600"
        >
          {loading ? 'Loading...' : 'Deposit'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## ⚠️ 주의사항

### 1. Jupiter API Rate Limiting
```typescript
// 너무 자주 호출하지 않기
const minRequestInterval = 1000; // 1초
```

### 2. 거래 서명 전 확인
```typescript
// 사용자에게 충분한 정보 제공
// 최소 수령액 명시
// 가격 영향 표시
```

### 3. Mainnet vs Devnet
```env
# .env.local
VITE_SOLANA_NETWORK=mainnet-beta  # 또는 devnet
```

### 4. 토큰 Decimals
```typescript
// 항상 decimals 고려
const amount = tokenAmount * (10 ** decimals);
```

---

## 🧪 검증 체크리스트

- [ ] Jupiter API 호출 성공
- [ ] 시세 조회 정상 작동
- [ ] 슬리피지 계산 정확
- [ ] 스왑 거래 서명 성공
- [ ] 거래 확인 대기 작동
- [ ] 에러 처리 정상 작동
- [ ] 재시도 로직 작동
- [ ] 환경 변수 설정 완료
- [ ] TypeScript 타입 에러 없음

---

## 📚 참고 링크

- [Jupiter API Documentation](https://docs.jup.ag)
- [Jupiter v6 API Spec](https://docs.jup.ag/api/rest-api.html)
- [Solana Swap Guide](https://solana.com/developers/guides/token-swaps)

---

## 📞 완료 후 다음 단계

1. ✅ Solana 지갑 연동 완료 (Task 001)
2. ✅ Jupiter DEX API 통합 완료 (Task 002)
3. → 스마트 컨트랙트 연동 (Task 003)

---

**작성**: Claude AI
**최종 검토**: 2025-10-31
**상태**: 실행 준비 완료 ✅
