import { FirebaseError } from 'firebase/app';
import { toast } from '@/hooks/use-toast';

/**
 * Solana Vault 스마트 컨트랙트 에러 메시지 매핑
 */
export const vaultErrorMessages: Record<string, string> = {
  // Vault account errors
  'Vault account not found': 'Vault 계정을 찾을 수 없습니다. 잠시 후 다시 시도해주세요',
  'Invalid vault address': '잘못된 Vault 주소입니다',
  'Vault is paused': 'Vault가 일시 중단되었습니다. 나중에 다시 시도해주세요',
  'Vault authority mismatch': 'Vault 권한이 일치하지 않습니다',

  // User account errors
  'User token account not found': '토큰 계정이 없습니다. 토큰 계정을 생성해주세요',
  'Insufficient user balance': '토큰 잔액이 부족합니다',
  'User shares not found': '해당 Vault에서 보유한 shares가 없습니다',

  // Deposit errors
  'Deposit amount too small': '최소 입금액보다 적습니다',
  'Deposit amount too large': '최대 입금액을 초과했습니다',
  'Deposit failed': '입금 작업에 실패했습니다. 다시 시도해주세요',
  'Invalid deposit parameters': '잘못된 입금 파라미터입니다',

  // Withdrawal errors
  'Insufficient shares': '보유한 shares가 부족합니다',
  'Withdrawal amount too small': '출금 금액이 너무 적습니다',
  'Withdrawal failed': '출금 작업에 실패했습니다. 다시 시도해주세요',
  'Withdrawal not allowed': '현재 출금이 불가능합니다',

  // Transaction errors
  'Custom program error': 'Vault 프로그램 오류가 발생했습니다',
  'Account already exists': '계정이 이미 존재합니다',
  'Account does not exist': '계정이 존재하지 않습니다',
  'Insufficient lamports': 'SOL 잔액이 부족합니다',
  'Invalid instruction data': '잘못된 명령어입니다',
  'Invalid account data': '잘못된 계정 데이터입니다',
  'Account is not writable': '계정에 쓸 수 있는 권한이 없습니다',
  'Account is not executable': '계정은 실행 가능하지 않습니다',
  'Program failed to complete': 'Vault 프로그램 실행에 실패했습니다',

  // RPC errors
  'BlockhashNotFound': 'Blockhash를 찾을 수 없습니다. 다시 시도해주세요',
  'Transaction too large': '트랜잭션이 너무 큽니다',
  'Invalid transaction': '잘못된 트랜잭션입니다',

  // Network/timeout errors
  'Timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요',
  'Connection error': 'Solana 네트워크에 연결할 수 없습니다. 네트워크 상태를 확인해주세요',
  'Failed to get account': '계정 정보를 가져올 수 없습니다',
};

/**
 * Vault 에러인지 확인
 */
export function isVaultError(error: any): boolean {
  if (!error) return false;
  const message = error.message || error.toString();
  return Object.keys(vaultErrorMessages).some(key =>
    message.toLowerCase().includes(key.toLowerCase())
  );
}

/**
 * Vault 에러 메시지 가져오기
 */
export function getVaultErrorMessage(error: any): string {
  if (!error) return '알 수 없는 오류가 발생했습니다';

  const message = error.message || error.toString();

  // 정확한 매칭
  for (const [code, msg] of Object.entries(vaultErrorMessages)) {
    if (message.includes(code)) {
      return msg;
    }
  }

  // 부분 매칭
  for (const [code, msg] of Object.entries(vaultErrorMessages)) {
    if (message.toLowerCase().includes(code.toLowerCase())) {
      return msg;
    }
  }

  return message || 'Vault 작업 중 오류가 발생했습니다';
}

/**
 * Jupiter DEX 에러 메시지 매핑
 */
export const jupiterErrorMessages: Record<string, string> = {
  // Swap errors
  'Slippage tolerance exceeded': '슬리피지 허용치를 초과했습니다. 슬리피지를 높여주세요',
  'Insufficient SOL': 'SOL 잔액이 부족합니다',
  'Insufficient balance': '토큰 잔액이 부족합니다',
  'No routes found': '이 토큰 쌍에 대한 스왑 경로를 찾을 수 없습니다',
  'Route not found': '이 토큰 쌍에 대한 스왑 경로를 찾을 수 없습니다',
  'Invalid token pair': '지원하지 않는 토큰 조합입니다',
  'Token not supported': '지원하지 않는 토큰입니다',

  // Rate limiting
  'Rate limit exceeded': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
  '429': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',

  // API errors
  'API error': 'Jupiter API에 오류가 발생했습니다',
  'Service unavailable': 'Jupiter 서비스를 일시적으로 이용할 수 없습니다. 나중에 다시 시도해주세요',
  '503': 'Jupiter 서비스를 일시적으로 이용할 수 없습니다. 나중에 다시 시도해주세요',
  'Bad gateway': 'Jupiter에 연결할 수 없습니다. 나중에 다시 시도해주세요',
  '502': 'Jupiter에 연결할 수 없습니다. 나중에 다시 시도해주세요',
  'Internal server error': 'Jupiter 서버 오류가 발생했습니다. 나중에 다시 시도해주세요',
  '500': 'Jupiter 서버 오류가 발생했습니다. 나중에 다시 시도해주세요',

  // Network errors
  'Network error': '네트워크 연결을 확인해주세요',
  'Timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요',
  'Failed to fetch': '데이터를 가져올 수 없습니다. 네트워크 연결을 확인해주세요',

  // Transaction errors
  'Transaction failed': '트랜잭션이 실패했습니다. 다시 시도해주세요',
  'Transaction rejected': '트랜잭션이 거부되었습니다',
  'Wallet not connected': '지갑이 연결되어 있지 않습니다. 지갑을 연결해주세요',
  'Transaction signing failed': '트랜잭션 서명에 실패했습니다',
};

/**
 * Jupiter 에러인지 확인
 */
export function isJupiterError(error: any): boolean {
  if (!error) return false;
  const message = error.message || error.toString();
  return Object.keys(jupiterErrorMessages).some(key =>
    message.toLowerCase().includes(key.toLowerCase())
  );
}

/**
 * Jupiter 에러 메시지 가져오기
 */
export function getJupiterErrorMessage(error: any): string {
  if (!error) return '알 수 없는 오류가 발생했습니다';

  const message = error.message || error.toString();

  // 정확한 매칭
  for (const [code, msg] of Object.entries(jupiterErrorMessages)) {
    if (message.includes(code)) {
      return msg;
    }
  }

  // 부분 매칭
  for (const [code, msg] of Object.entries(jupiterErrorMessages)) {
    if (message.toLowerCase().includes(code.toLowerCase())) {
      return msg;
    }
  }

  return message || '스왑 작업 중 오류가 발생했습니다';
}

/**
 * Firebase/Firestore 에러 코드를 사용자 친화적 메시지로 매핑
 */
export const firebaseErrorMessages: Record<string, string> = {
  // Authentication errors
  'auth/user-not-found': '등록되지 않은 사용자입니다',
  'auth/wrong-password': '잘못된 비밀번호입니다',
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다',
  'auth/weak-password': '비밀번호가 너무 약합니다 (최소 6자)',
  'auth/invalid-email': '잘못된 이메일 형식입니다',
  'auth/user-disabled': '비활성화된 계정입니다',
  'auth/too-many-requests': '너무 많은 시도가 있었습니다. 나중에 다시 시도해주세요',
  'auth/operation-not-allowed': '이 로그인 방식은 사용할 수 없습니다',
  'auth/invalid-api-key': '설정 오류가 있습니다. 관리자에게 문의해주세요',

  // Firestore errors
  'permission-denied': '이 데이터에 접근할 권한이 없습니다',
  'not-found': '요청한 데이터를 찾을 수 없습니다',
  'already-exists': '이미 존재하는 데이터입니다',
  'failed-precondition': '작업을 수행하기 위한 조건이 충족되지 않았습니다',
  'aborted': '작업이 중단되었습니다. 다시 시도해주세요',
  'unavailable': '서비스를 일시적으로 이용할 수 없습니다. 나중에 다시 시도해주세요',
  'unauthenticated': '로그인이 필요합니다. 다시 로그인해주세요',
  'invalid-argument': '잘못된 요청입니다. 입력값을 확인해주세요',
  'out-of-range': '범위를 초과한 값입니다',
  'deadline-exceeded': '요청 시간이 초과되었습니다. 다시 시도해주세요',
  'resource-exhausted': '리소스가 부족합니다. 나중에 다시 시도해주세요',
  'internal': '서버 오류가 발생했습니다. 나중에 다시 시도해주세요',

  // Network errors
  'network-error': '네트워크 연결을 확인해주세요',
  'timeout': '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요',
  'connection-error': '서버에 연결할 수 없습니다',
};

/**
 * Firebase 에러를 사용자 친화적 메시지로 변환
 *
 * @param error - Firebase 에러 또는 일반 Error
 * @param defaultMessage - 매칭되지 않을 때 기본 메시지
 * @returns 사용자 친화적 에러 메시지
 *
 * @example
 * try {
 *   // Firebase 작업
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   toast({
 *     title: 'Error',
 *     description: message,
 *     variant: 'destructive'
 *   });
 * }
 */
export function getErrorMessage(
  error: any,
  defaultMessage: string = '예기치 않은 오류가 발생했습니다'
): string {
  // Firebase 에러
  if (error instanceof FirebaseError) {
    // 정확한 코드 매칭
    if (firebaseErrorMessages[error.code]) {
      return firebaseErrorMessages[error.code];
    }

    // 부분 매칭 (예: 'auth/user-not-found'에서 'user-not-found' 찾기)
    for (const [code, message] of Object.entries(firebaseErrorMessages)) {
      if (error.code.includes(code)) {
        return message;
      }
    }

    // Firebase 에러 메시지 직접 사용
    return error.message || defaultMessage;
  }

  // 일반 Error
  if (error instanceof Error) {
    const errorMsg = error.message;

    // 에러 메시지에서 키워드 찾기
    for (const [code, message] of Object.entries(firebaseErrorMessages)) {
      if (errorMsg.toLowerCase().includes(code.toLowerCase())) {
        return message;
      }
    }

    return errorMsg || defaultMessage;
  }

  // 문자열 에러
  if (typeof error === 'string') {
    for (const [code, message] of Object.entries(firebaseErrorMessages)) {
      if (error.toLowerCase().includes(code.toLowerCase())) {
        return message;
      }
    }
    return error;
  }

  return defaultMessage;
}

/**
 * 에러 로깅 (개발/프로덕션 모드)
 */
export function logError(error: any, context: string = 'Unknown'): void {
  console.error(`[${context}]`, error);

  // 프로덕션 환경에서는 외부 서비스로 전송 가능
  // Sentry, LogRocket, etc.
  if (typeof window !== 'undefined' && import.meta.env.MODE === 'production') {
    // 예: Sentry.captureException(error);
  }
}

/**
 * 에러 처리 및 토스트 알림 통합
 *
 * @param error - 에러 객체
 * @param options - 옵션 (context, showToast 등)
 */
export function handleError(
  error: any,
  options: {
    context?: string;
    showToast?: boolean;
    defaultMessage?: string;
  } = {}
): string {
  const { context = 'Unknown', showToast = true, defaultMessage } = options;

  // 에러 메시지 변환
  const message = getErrorMessage(error, defaultMessage);

  // 로깅
  logError(error, context);

  // 토스트 표시
  if (showToast) {
    toast({
      title: '오류 발생',
      description: message,
      variant: 'destructive',
    });
  }

  return message;
}

/**
 * 특정 에러 타입 확인
 */
export const errorChecks = {
  isNetworkError: (error: any): boolean => {
    if (error instanceof FirebaseError) {
      return error.code === 'unavailable' || error.code === 'connection-error';
    }
    return error?.message?.toLowerCase().includes('network');
  },

  isAuthError: (error: any): boolean => {
    if (error instanceof FirebaseError) {
      return error.code.startsWith('auth/');
    }
    return false;
  },

  isPermissionError: (error: any): boolean => {
    if (error instanceof FirebaseError) {
      return error.code === 'permission-denied';
    }
    return false;
  },

  isNotFoundError: (error: any): boolean => {
    if (error instanceof FirebaseError) {
      return error.code === 'not-found';
    }
    return false;
  },
};
