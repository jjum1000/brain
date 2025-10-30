import { FirebaseError } from 'firebase/app';
import { toast } from '@/hooks/use-toast';

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
