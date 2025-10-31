import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isVaultError,
  getVaultErrorMessage,
  isJupiterError,
  getJupiterErrorMessage,
  getErrorMessage,
  logError,
  handleError,
} from '@/lib/errorHandler';

describe('errorHandler', () => {
  describe('isVaultError', () => {
    it('should return false for null/undefined', () => {
      expect(isVaultError(null)).toBe(false);
      expect(isVaultError(undefined)).toBe(false);
    });

    it('should detect vault not found error', () => {
      const error = new Error('Vault account not found');
      expect(isVaultError(error)).toBe(true);
    });

    it('should detect insufficient balance error', () => {
      const error = new Error('Insufficient user balance');
      expect(isVaultError(error)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const error = new Error('vault account NOT FOUND');
      expect(isVaultError(error)).toBe(true);
    });

    it('should return false for non-vault errors', () => {
      const error = new Error('Some random error');
      expect(isVaultError(error)).toBe(false);
    });

    it('should handle error objects without message property', () => {
      const error = { toString: () => 'Vault is paused' };
      expect(isVaultError(error)).toBe(true);
    });
  });

  describe('getVaultErrorMessage', () => {
    it('should return default message for null/undefined', () => {
      expect(getVaultErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다');
      expect(getVaultErrorMessage(undefined)).toBe('알 수 없는 오류가 발생했습니다');
    });

    it('should return mapped error message', () => {
      const error = new Error('Vault account not found');
      const message = getVaultErrorMessage(error);
      expect(message).toBe('Vault 계정을 찾을 수 없습니다. 잠시 후 다시 시도해주세요');
    });

    it('should handle insufficient balance error', () => {
      const error = new Error('Insufficient user balance');
      const message = getVaultErrorMessage(error);
      expect(message).toBe('토큰 잔액이 부족합니다');
    });

    it('should be case-insensitive', () => {
      const error = new Error('insufficient user BALANCE');
      const message = getVaultErrorMessage(error);
      expect(message).toBe('토큰 잔액이 부족합니다');
    });

    it('should return original message for unmapped errors', () => {
      const errorMsg = 'Some unknown vault error';
      const error = new Error(errorMsg);
      const message = getVaultErrorMessage(error);
      expect(message).toContain(errorMsg);
    });

    it('should handle deposit errors', () => {
      const error = new Error('Deposit amount too small');
      const message = getVaultErrorMessage(error);
      expect(message).toBe('최소 입금액보다 적습니다');
    });

    it('should handle withdrawal errors', () => {
      const error = new Error('Insufficient shares');
      const message = getVaultErrorMessage(error);
      expect(message).toBe('보유한 shares가 부족합니다');
    });
  });

  describe('isJupiterError', () => {
    it('should return false for null/undefined', () => {
      expect(isJupiterError(null)).toBe(false);
      expect(isJupiterError(undefined)).toBe(false);
    });

    it('should detect swap errors', () => {
      const error = new Error('No routes found');
      expect(isJupiterError(error)).toBe(true);
    });

    it('should detect insufficient balance errors', () => {
      const error = new Error('Insufficient balance');
      expect(isJupiterError(error)).toBe(true);
    });

    it('should return false for non-jupiter errors', () => {
      const error = new Error('Some other error');
      expect(isJupiterError(error)).toBe(false);
    });
  });

  describe('getJupiterErrorMessage', () => {
    it('should return default message for null/undefined', () => {
      expect(getJupiterErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다');
      expect(getJupiterErrorMessage(undefined)).toBe('알 수 없는 오류가 발생했습니다');
    });

    it('should return mapped error message for slippage exceeded', () => {
      const error = new Error('Slippage tolerance exceeded');
      const message = getJupiterErrorMessage(error);
      expect(message).toBe('슬리피지 허용치를 초과했습니다. 슬리피지를 높여주세요');
    });

    it('should return mapped error message for no routes', () => {
      const error = new Error('No routes found');
      const message = getJupiterErrorMessage(error);
      expect(message).toBe('이 토큰 쌍에 대한 스왑 경로를 찾을 수 없습니다');
    });
  });

  describe('getErrorMessage', () => {
    it('should handle general error messages', () => {
      const error = new Error('Test error message');
      const message = getErrorMessage(error);
      expect(message).toBe('Test error message');
    });

    it('should return custom default message', () => {
      const customMsg = 'Custom error';
      const message = getErrorMessage({}, customMsg);
      expect(message).toBe(customMsg);
    });

    it('should handle string errors', () => {
      const message = getErrorMessage('String error');
      expect(message).toBe('String error');
    });

    it('should use default message for unknown object', () => {
      const defaultMsg = 'Default error message';
      const message = getErrorMessage({}, defaultMsg);
      expect(message).toBe(defaultMsg);
    });
  });

  describe('logError', () => {
    it('should log error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      logError(error, 'TestContext');
      expect(consoleSpy).toHaveBeenCalledWith('[TestContext]', error);
      consoleSpy.mockRestore();
    });

    it('should use default context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      logError(error);
      expect(consoleSpy).toHaveBeenCalledWith('[Unknown]', error);
      consoleSpy.mockRestore();
    });
  });

  describe('handleError', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should log error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      handleError(error, { context: 'Test' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return error message', () => {
      const error = new Error('Test error message');
      const message = handleError(error, { showToast: false });
      expect(message).toBe('Test error message');
    });

    it('should use default context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      handleError(error, { showToast: false });
      expect(consoleSpy).toHaveBeenCalledWith('[Unknown]', error);
      consoleSpy.mockRestore();
    });
  });
});
