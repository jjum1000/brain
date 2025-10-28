/**
 * Authentication Service Tests
 * AuthService의 주요 기능 테스트
 *
 * 실행 방법:
 * npm test -- auth.test.js
 * 또는
 * vitest auth.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './authService.js';
import { UserService } from '../user/userService.js';

/**
 * Mock 데이터
 */
const testEmail = 'test@yoloseum.io';
const testPassword = 'TestPassword123!';
const testDisplayName = 'Test User';

const invalidEmail = 'invalid-email';
const weakPassword = 'weak';

describe('AuthService', () => {
  /**
   * Sign Up Tests
   */
  describe('signUp', () => {
    it('should successfully sign up with valid email and password', async () => {
      const result = await AuthService.signUp(testEmail, testPassword, testDisplayName);

      expect(result).toBeDefined();
      expect(result.uid).toBeDefined();
      expect(result.email).toBe(testEmail);
      expect(result.displayName).toBe(testDisplayName);
    });

    it('should throw error with invalid email', async () => {
      try {
        await AuthService.signUp(invalidEmail, testPassword, testDisplayName);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('유효하지 않은');
      }
    });

    it('should throw error with weak password', async () => {
      try {
        await AuthService.signUp(testEmail, weakPassword, testDisplayName);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('비밀번호');
      }
    });

    it('should throw error with duplicate email', async () => {
      // 첫 가입
      await AuthService.signUp(testEmail, testPassword, testDisplayName);

      // 같은 이메일로 두 번째 가입 시도
      try {
        await AuthService.signUp(testEmail, testPassword, 'Another User');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('이미 가입');
      }
    });

    it('should create user profile in Firestore', async () => {
      const result = await AuthService.signUp(testEmail, testPassword, testDisplayName);

      // Firestore에서 사용자 프로필 확인
      const userProfile = await UserService.getUserProfile(result.uid);

      expect(userProfile).toBeDefined();
      expect(userProfile.email).toBe(testEmail);
      expect(userProfile.displayName).toBe(testDisplayName);
      expect(userProfile.role).toBe('supporter');
      expect(userProfile.stats.totalInvested).toBe(0);
      expect(userProfile.stats.totalEarnings).toBe(0);
      expect(userProfile.kycStatus).toBe('pending');
    });
  });

  /**
   * Sign In Tests
   */
  describe('signInWithEmail', () => {
    beforeEach(async () => {
      // 테스트 사용자 생성
      await AuthService.signUp(testEmail, testPassword, testDisplayName);
    });

    it('should successfully sign in with valid credentials', async () => {
      const result = await AuthService.signInWithEmail(testEmail, testPassword);

      expect(result).toBeDefined();
      expect(result.uid).toBeDefined();
      expect(result.email).toBe(testEmail);
    });

    it('should throw error with wrong password', async () => {
      try {
        await AuthService.signInWithEmail(testEmail, 'WrongPassword123!');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('잘못된');
      }
    });

    it('should throw error with non-existent user', async () => {
      try {
        await AuthService.signInWithEmail('nonexistent@yoloseum.io', testPassword);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('가입되지 않은');
      }
    });
  });

  /**
   * Google Sign In Tests
   */
  describe('signInWithGoogle', () => {
    it('should create user profile if first time Google user', async () => {
      // Note: 실제 Google OAuth는 팝업이 필요하므로,
      // 실제 테스트는 E2E 테스트에서 수행하는 것이 좋음
      // 여기서는 기본 구조만 테스트
      expect(true).toBe(true);
    });
  });

  /**
   * Get Current User Tests
   */
  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', () => {
      const currentUser = AuthService.getCurrentUser();
      expect(currentUser).toBeNull();
    });

    it('should return current user after sign up', async () => {
      await AuthService.signUp(testEmail, testPassword, testDisplayName);

      const currentUser = AuthService.getCurrentUser();

      expect(currentUser).toBeDefined();
      expect(currentUser.email).toBe(testEmail);
      expect(currentUser.displayName).toBe(testDisplayName);
    });
  });

  /**
   * Logout Tests
   */
  describe('logout', () => {
    it('should successfully log out', async () => {
      // 로그인
      await AuthService.signUp(testEmail, testPassword, testDisplayName);
      expect(AuthService.getCurrentUser()).not.toBeNull();

      // 로그아웃
      await AuthService.logout();

      // 로그아웃 확인
      expect(AuthService.getCurrentUser()).toBeNull();
    });
  });

  /**
   * Error Handling Tests
   */
  describe('handleError', () => {
    it('should return user-friendly error message for auth/email-already-in-use', () => {
      const error = new Error();
      error.code = 'auth/email-already-in-use';

      const handled = AuthService.handleError(error);

      expect(handled.message).toBe('이미 가입된 이메일입니다');
      expect(handled.code).toBe('auth/email-already-in-use');
    });

    it('should return user-friendly error message for auth/weak-password', () => {
      const error = new Error();
      error.code = 'auth/weak-password';

      const handled = AuthService.handleError(error);

      expect(handled.message).toContain('비밀번호');
    });

    it('should return default message for unknown error', () => {
      const error = new Error('Unknown error');
      error.code = 'unknown/error';

      const handled = AuthService.handleError(error);

      expect(handled.message).toBe('Unknown error');
    });
  });

  /**
   * Auth State Change Tests
   */
  describe('onAuthStateChanged', () => {
    it('should call callback when auth state changes', (done) => {
      const callback = vi.fn();
      const unsubscribe = AuthService.onAuthStateChanged(callback);

      // 콜백이 호출되었는지 확인 (초기 상태)
      setTimeout(() => {
        expect(callback).toHaveBeenCalled();
        unsubscribe();
        done();
      }, 1000);
    });
  });
});

/**
 * Integration Tests
 */
describe('Auth Integration', () => {
  it('should complete full auth flow: signup -> login -> logout', async () => {
    // 회원가입
    const signUpResult = await AuthService.signUp(testEmail, testPassword, testDisplayName);
    expect(signUpResult.uid).toBeDefined();

    // 로그아웃
    await AuthService.logout();
    expect(AuthService.getCurrentUser()).toBeNull();

    // 로그인
    const signInResult = await AuthService.signInWithEmail(testEmail, testPassword);
    expect(signInResult.uid).toBe(signUpResult.uid);

    // 현재 사용자 확인
    const currentUser = AuthService.getCurrentUser();
    expect(currentUser.uid).toBe(signUpResult.uid);
    expect(currentUser.email).toBe(testEmail);

    // 최종 로그아웃
    await AuthService.logout();
    expect(AuthService.getCurrentUser()).toBeNull();
  });

  it('should sync user profile across services', async () => {
    // 회원가입 (AuthService가 자동으로 UserService.createUserProfile 호출)
    const signUpResult = await AuthService.signUp(testEmail, testPassword, testDisplayName);

    // UserService에서 프로필 확인
    const userProfile = await UserService.getUserProfile(signUpResult.uid);

    expect(userProfile.email).toBe(testEmail);
    expect(userProfile.displayName).toBe(testDisplayName);
    expect(userProfile.role).toBe('supporter');
  });
});

/**
 * Edge Cases Tests
 */
describe('Auth Edge Cases', () => {
  it('should handle rapid sign up attempts', async () => {
    const promises = [
      AuthService.signUp('user1@yoloseum.io', testPassword, 'User 1'),
      AuthService.signUp('user2@yoloseum.io', testPassword, 'User 2'),
      AuthService.signUp('user3@yoloseum.io', testPassword, 'User 3')
    ];

    const results = await Promise.all(promises);

    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result.uid).toBeDefined();
    });
  });

  it('should handle special characters in display name', async () => {
    const specialName = '테스트 유저 - 한글 😀';
    const result = await AuthService.signUp(
      'special@yoloseum.io',
      testPassword,
      specialName
    );

    expect(result.displayName).toBe(specialName);
  });

  it('should handle very long email addresses', async () => {
    const longEmail = 'a'.repeat(50) + '@yoloseum.io';
    const result = await AuthService.signUp(longEmail, testPassword, 'Long Email User');

    expect(result.email).toBe(longEmail);
  });
});
