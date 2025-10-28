/**
 * Error Handler Utility
 * 애플리케이션 전체 에러 처리 및 로깅
 */

/**
 * Error Categories
 */
export const ERROR_CATEGORIES = {
  AUTH: 'AUTH',
  FIRESTORE: 'FIRESTORE',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  PERMISSION: 'PERMISSION',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN: 'UNKNOWN'
};

/**
 * ErrorHandler Class
 */
export class ErrorHandler {
  /**
   * 에러 분류
   * @param {Error} error - 에러 객체
   * @returns {string} 에러 카테고리
   */
  static categorizeError(error) {
    const code = error.code || '';
    const message = error.message || '';

    // Auth Errors
    if (code.startsWith('auth/')) {
      return ERROR_CATEGORIES.AUTH;
    }

    // Firestore Errors
    if (code === 'permission-denied') {
      return ERROR_CATEGORIES.PERMISSION;
    }

    if (code === 'not-found') {
      return ERROR_CATEGORIES.NOT_FOUND;
    }

    if (code.startsWith('firestore/') || message.includes('Firestore')) {
      return ERROR_CATEGORIES.FIRESTORE;
    }

    // Network Errors
    if (message.includes('Network') || message.includes('network') || code === 'ERR_NETWORK') {
      return ERROR_CATEGORIES.NETWORK;
    }

    // Validation Errors
    if (message.includes('validation') || code === 'VALIDATION_ERROR') {
      return ERROR_CATEGORIES.VALIDATION;
    }

    return ERROR_CATEGORIES.UNKNOWN;
  }

  /**
   * 사용자 친화적 에러 메시지 생성
   * @param {Error} error - 에러 객체
   * @returns {string} 사용자 메시지
   */
  static getUserFriendlyMessage(error) {
    const code = error.code || '';
    const category = this.categorizeError(error);

    const messages = {
      // Auth Errors
      'auth/email-already-in-use': '이미 가입된 이메일입니다',
      'auth/weak-password': '비밀번호는 6자 이상이어야 합니다',
      'auth/invalid-email': '유효하지 않은 이메일입니다',
      'auth/user-not-found': '가입되지 않은 사용자입니다',
      'auth/wrong-password': '잘못된 비밀번호입니다',
      'auth/operation-not-allowed': '이 작업은 허용되지 않습니다',
      'auth/too-many-requests': '너무 많은 시도를 했습니다. 잠시 후 다시 시도하세요',
      'auth/account-exists-with-different-credential': '이미 다른 방식으로 가입된 계정입니다',
      'auth/popup-closed-by-user': '사용자가 팝업을 닫았습니다',
      'auth/network-request-failed': '네트워크 오류가 발생했습니다',

      // Firestore Errors
      'permission-denied': '이 작업을 수행할 권한이 없습니다',
      'not-found': '요청한 데이터를 찾을 수 없습니다',

      // General Errors
      [ERROR_CATEGORIES.NETWORK]: '네트워크 연결을 확인해주세요',
      [ERROR_CATEGORIES.VALIDATION]: '입력 값을 확인해주세요',
      [ERROR_CATEGORIES.PERMISSION]: '이 작업을 수행할 권한이 없습니다'
    };

    return messages[code] || messages[category] || '알 수 없는 오류가 발생했습니다';
  }

  /**
   * 상세 에러 정보 생성
   * @param {Error} error - 에러 객체
   * @returns {Object} 상세 에러 정보
   */
  static createDetailedError(error) {
    const category = this.categorizeError(error);
    const userMessage = this.getUserFriendlyMessage(error);

    return {
      code: error.code || 'UNKNOWN',
      message: error.message || 'Unknown error',
      category,
      userMessage,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      originalError: error
    };
  }

  /**
   * 에러 로깅
   * @param {Error} error - 에러 객체
   * @param {Object} context - 컨텍스트 정보
   */
  static logError(error, context = {}) {
    const detailedError = this.createDetailedError(error);

    console.error('❌ Error Occurred', {
      ...detailedError,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString()
    });

    // Production에서는 에러 트래킹 서비스에 전송할 수 있음
    // Ex: Sentry, LogRocket 등
    if (import.meta.env.PROD) {
      // sendToErrorTrackingService(detailedError, context);
    }
  }

  /**
   * Validation Error 생성
   * @param {string} message - 에러 메시지
   * @returns {Error} 검증 에러
   */
  static createValidationError(message) {
    const error = new Error(message);
    error.code = 'VALIDATION_ERROR';
    error.category = ERROR_CATEGORIES.VALIDATION;
    return error;
  }

  /**
   * Firebase Firestore 에러 처리
   * @param {Error} error - Firebase 에러
   * @returns {Object} 처리된 에러 정보
   */
  static handleFirestoreError(error) {
    const detailedError = this.createDetailedError(error);

    if (error.code === 'permission-denied') {
      detailedError.userMessage = '이 작업을 수행할 권한이 없습니다. 관리자에게 문의하세요.';
    }

    if (error.code === 'not-found') {
      detailedError.userMessage = '요청한 데이터를 찾을 수 없습니다.';
    }

    if (error.code === 'unavailable') {
      detailedError.userMessage = '서버가 일시적으로 사용 불가능합니다. 잠시 후 다시 시도해주세요.';
    }

    return detailedError;
  }

  /**
   * Firebase Auth 에러 처리
   * @param {Error} error - Firebase Auth 에러
   * @returns {Object} 처리된 에러 정보
   */
  static handleAuthError(error) {
    const detailedError = this.createDetailedError(error);
    return detailedError;
  }

  /**
   * API 에러 처리
   * @param {Object} response - 에러 응답
   * @returns {Object} 처리된 에러 정보
   */
  static handleApiError(response) {
    const error = new Error(response.message || 'API Error');
    error.code = `HTTP_${response.status}`;
    error.status = response.status;

    const detailedError = this.createDetailedError(error);
    detailedError.statusCode = response.status;

    return detailedError;
  }

  /**
   * 에러에서 주요 정보 추출
   * @param {Error} error - 에러 객체
   * @returns {Object} 정보
   */
  static extractErrorInfo(error) {
    return {
      code: error.code,
      message: error.message,
      category: this.categorizeError(error),
      userMessage: this.getUserFriendlyMessage(error),
      hasStack: !!error.stack
    };
  }

  /**
   * 에러 비교 (같은 종류의 에러인지 확인)
   * @param {Error} error1
   * @param {Error} error2
   * @returns {boolean}
   */
  static isSameError(error1, error2) {
    return error1?.code === error2?.code &&
           error1?.message === error2?.message;
  }

  /**
   * 재시도 가능한 에러인지 확인
   * @param {Error} error
   * @returns {boolean}
   */
  static isRetryable(error) {
    const code = error.code || '';
    const retryableCodes = [
      'network-request-failed',
      'too-many-requests',
      'unavailable',
      'ETIMEDOUT',
      'ECONNRESET',
      'ERR_NETWORK'
    ];

    return retryableCodes.some(retryCode => code.includes(retryCode));
  }

  /**
   * 재시도 지연 시간 계산 (Exponential Backoff)
   * @param {number} attemptNumber - 시도 번호
   * @returns {number} 지연 시간 (ms)
   */
  static getRetryDelay(attemptNumber) {
    const baseDelay = 1000; // 1초
    const maxDelay = 32000; // 32초
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
    const jitter = Math.random() * 1000; // 무작위 지터 추가
    return delay + jitter;
  }
}

/**
 * 안전한 함수 실행 (에러 처리 포함)
 * @param {Function} fn - 실행할 함수
 * @param {Object} options - 옵션
 * @returns {Promise}
 *
 * 사용 예시:
 * ```javascript
 * const result = await safeExecute(
 *   () => userService.getUserProfile(uid),
 *   {
 *     retry: 3,
 *     context: { userId: uid }
 *   }
 * );
 * ```
 */
export async function safeExecute(fn, options = {}) {
  const {
    retry = 1,
    context = {},
    onError = null,
    throwError = true
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= retry; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 에러 로깅
      ErrorHandler.logError(error, {
        attempt,
        maxRetries: retry,
        ...context
      });

      // 마지막 시도이거나 재시도 불가능한 에러인 경우
      if (attempt === retry || !ErrorHandler.isRetryable(error)) {
        if (onError) {
          onError(error);
        }

        if (throwError) {
          throw error;
        }

        return null;
      }

      // 다음 시도 전에 대기
      const delay = ErrorHandler.getRetryDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 에러 경계 (React Error Boundary용)
 */
export class ErrorBoundary extends Error {
  constructor(message, category = ERROR_CATEGORIES.UNKNOWN) {
    super(message);
    this.name = 'ErrorBoundary';
    this.category = category;
  }
}

export default ErrorHandler;
