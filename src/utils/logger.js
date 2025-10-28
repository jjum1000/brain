/**
 * Logger Utility
 * 애플리케이션 로깅 관리
 */

/**
 * Log Levels
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Logger Class
 */
export class Logger {
  constructor(options = {}) {
    this.name = options.name || 'App';
    this.level = options.level || LOG_LEVELS.INFO;
    this.isDev = import.meta.env.MODE === 'development';
    this.enableConsole = options.enableConsole !== false;
    this.enableStorage = options.enableStorage || false;
    this.maxStorageLogs = options.maxStorageLogs || 100;
    this.storageKey = options.storageKey || 'app_logs';
  }

  /**
   * 현재 타임스탬프
   * @private
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * 레벨 문자열
   * @private
   */
  getLevelString(level) {
    const levels = {
      [LOG_LEVELS.DEBUG]: 'DEBUG',
      [LOG_LEVELS.INFO]: 'INFO',
      [LOG_LEVELS.WARN]: 'WARN',
      [LOG_LEVELS.ERROR]: 'ERROR',
      [LOG_LEVELS.FATAL]: 'FATAL'
    };
    return levels[level] || 'UNKNOWN';
  }

  /**
   * 로그 포맷팅
   * @private
   */
  formatLog(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const levelStr = this.getLevelString(level);

    return {
      timestamp,
      level: levelStr,
      logger: this.name,
      message,
      data,
      isDev: this.isDev,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };
  }

  /**
   * 로그 저장소에 저장
   * @private
   */
  saveToStorage(logEntry) {
    if (!this.enableStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      let logs = [];
      const stored = localStorage.getItem(this.storageKey);

      if (stored) {
        logs = JSON.parse(stored);
      }

      logs.push(logEntry);

      // 최대 로그 수 초과시 오래된 로그 제거
      if (logs.length > this.maxStorageLogs) {
        logs = logs.slice(-this.maxStorageLogs);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save log to storage:', error);
    }
  }

  /**
   * 콘솔에 출력
   * @private
   */
  printToConsole(logEntry) {
    if (!this.enableConsole) {
      return;
    }

    const { timestamp, level, message, data } = logEntry;
    const prefix = `[${timestamp}] ${level}`;

    const styles = {
      [LOG_LEVELS.DEBUG]: 'color: #888; font-weight: normal;',
      [LOG_LEVELS.INFO]: 'color: #2196F3; font-weight: bold;',
      [LOG_LEVELS.WARN]: 'color: #FF9800; font-weight: bold;',
      [LOG_LEVELS.ERROR]: 'color: #F44336; font-weight: bold;',
      [LOG_LEVELS.FATAL]: 'color: #8B0000; font-weight: bold;'
    };

    const style = styles[this.getLevelString(level)] || '';

    if (data) {
      console.log(`%c${prefix}`, style, message, data);
    } else {
      console.log(`%c${prefix}`, style, message);
    }
  }

  /**
   * 로그 레벨 확인
   * @private
   */
  shouldLog(level) {
    return level >= this.level;
  }

  /**
   * Debug 로그
   * @param {string} message
   * @param {*} data
   */
  debug(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;

    const logEntry = this.formatLog(LOG_LEVELS.DEBUG, message, data);
    this.printToConsole(logEntry);
    this.saveToStorage(logEntry);
  }

  /**
   * Info 로그
   * @param {string} message
   * @param {*} data
   */
  info(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;

    const logEntry = this.formatLog(LOG_LEVELS.INFO, message, data);
    this.printToConsole(logEntry);
    this.saveToStorage(logEntry);
  }

  /**
   * Warn 로그
   * @param {string} message
   * @param {*} data
   */
  warn(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;

    const logEntry = this.formatLog(LOG_LEVELS.WARN, message, data);
    this.printToConsole(logEntry);
    this.saveToStorage(logEntry);
  }

  /**
   * Error 로그
   * @param {string} message
   * @param {Error|*} error
   */
  error(message, error = null) {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;

    const data = error instanceof Error ? {
      errorMessage: error.message,
      errorStack: error.stack,
      errorCode: error.code
    } : error;

    const logEntry = this.formatLog(LOG_LEVELS.ERROR, message, data);
    this.printToConsole(logEntry);
    this.saveToStorage(logEntry);
  }

  /**
   * Fatal 로그
   * @param {string} message
   * @param {Error|*} error
   */
  fatal(message, error = null) {
    if (!this.shouldLog(LOG_LEVELS.FATAL)) return;

    const data = error instanceof Error ? {
      errorMessage: error.message,
      errorStack: error.stack,
      errorCode: error.code
    } : error;

    const logEntry = this.formatLog(LOG_LEVELS.FATAL, message, data);
    this.printToConsole(logEntry);
    this.saveToStorage(logEntry);
  }

  /**
   * 성능 측정 시작
   * @param {string} label
   */
  time(label) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  }

  /**
   * 성능 측정 종료
   * @param {string} label
   */
  timeEnd(label) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label)[0];
        this.debug(`⏱️ ${label}`, {
          duration: `${measure.duration.toFixed(2)}ms`
        });
      } catch (error) {
        console.error('Performance measurement error:', error);
      }
    }
  }

  /**
   * 그룹 시작
   * @param {string} label
   */
  group(label) {
    if (this.enableConsole) {
      console.group(`📦 ${label}`);
    }
  }

  /**
   * 그룹 종료
   */
  groupEnd() {
    if (this.enableConsole) {
      console.groupEnd();
    }
  }

  /**
   * 테이블 출력
   * @param {Array} data
   * @param {string} label
   */
  table(data, label = '') {
    if (this.enableConsole) {
      if (label) console.log(`📊 ${label}`);
      console.table(data);
    }
  }

  /**
   * 저장된 모든 로그 조회
   * @returns {Array}
   */
  getLogs() {
    if (!this.enableStorage || typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  /**
   * 저장된 로그 초기화
   */
  clearLogs() {
    if (this.enableStorage && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.storageKey);
        this.info('📋 Logs cleared');
      } catch (error) {
        console.error('Failed to clear logs:', error);
      }
    }
  }

  /**
   * 저장된 로그를 파일로 다운로드
   */
  downloadLogs() {
    const logs = this.getLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 로거 레벨 변경
   * @param {number} level
   */
  setLevel(level) {
    this.level = level;
    this.info(`📊 Logger level changed to ${this.getLevelString(level)}`);
  }
}

/**
 * 글로벌 Logger 인스턴스
 */
export const logger = new Logger({
  name: 'YOLOSEUM',
  level: import.meta.env.MODE === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO,
  enableConsole: true,
  enableStorage: import.meta.env.MODE === 'development'
});

/**
 * 컴포넌트별 Logger 생성
 * @param {string} componentName
 * @returns {Logger}
 */
export function createLogger(componentName) {
  return new Logger({
    name: componentName,
    level: import.meta.env.MODE === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO,
    enableConsole: true,
    enableStorage: import.meta.env.MODE === 'development'
  });
}

export default logger;
