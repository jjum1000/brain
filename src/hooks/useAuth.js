/**
 * useAuth Hook
 * AuthContext의 useAuth hook을 래핑한 커스텀 훅
 * 인증 상태 및 메서드 제공
 */

import { useAuth as useAuthContext } from '../services/auth/authContext.jsx';
import { AuthService } from '../services/auth/authService.js';
import { UserService } from '../services/user/userService.js';
import { useState, useCallback } from 'react';

/**
 * useAuth Hook
 * 인증 관련 모든 기능 제공
 *
 * @returns {Object} 인증 상태 및 메서드
 * - user: 현재 로그인한 사용자
 * - userProfile: Firestore 사용자 프로필
 * - loading: 로딩 상태
 * - error: 에러 정보
 * - signUp: 회원가입
 * - signInWithEmail: 이메일 로그인
 * - signInWithGoogle: Google 로그인
 * - logout: 로그아웃
 * - updateProfile: 프로필 업데이트
 *
 * 사용 예시:
 * ```jsx
 * function LoginPage() {
 *   const { user, loading, signUp, signInWithEmail } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {user ? (
 *         <p>Welcome, {user.displayName}</p>
 *       ) : (
 *         <button onClick={() => signUp('email', 'password', 'name')}>Sign Up</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useAuthContext();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  /**
   * 프로필 업데이트
   * @param {Object} profileData - 업데이트할 프로필 정보
   */
  const updateProfile = useCallback(async (profileData) => {
    if (!context.user) {
      throw new Error('User not logged in');
    }

    setUpdateLoading(true);
    setUpdateError(null);

    try {
      await UserService.updateUserProfile(context.user.uid, profileData);
      console.log('✅ Profile updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(error);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  }, [context.user]);

  /**
   * 사용자 프로필 로드
   */
  const loadUserProfile = useCallback(async () => {
    if (!context.user) {
      return null;
    }

    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const profile = await UserService.getUserProfile(context.user.uid);
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUpdateError(error);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  }, [context.user]);

  /**
   * 회원가입 (에러 처리 개선)
   */
  const signUp = useCallback(async (email, password, displayName) => {
    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const result = await AuthService.signUp(email, password, displayName);
      console.log('✅ Sign up successful');
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      setUpdateError(error);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  }, []);

  /**
   * 이메일 로그인 (에러 처리 개선)
   */
  const signInWithEmail = useCallback(async (email, password) => {
    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const result = await AuthService.signInWithEmail(email, password);
      console.log('✅ Sign in successful');
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      setUpdateError(error);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  }, []);

  /**
   * Google 로그인 (에러 처리 개선)
   */
  const signInWithGoogle = useCallback(async () => {
    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const result = await AuthService.signInWithGoogle();
      console.log('✅ Google sign in successful');
      return result;
    } catch (error) {
      console.error('Error with Google sign in:', error);
      setUpdateError(error);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  }, []);

  /**
   * 로그아웃 (에러 처리 개선)
   */
  const logout = useCallback(async () => {
    setUpdateLoading(true);
    setUpdateError(null);

    try {
      await AuthService.logout();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Error logging out:', error);
      setUpdateError(error);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  }, []);

  return {
    // 상태
    user: context.user,
    userProfile: context.userProfile,
    loading: context.loading || updateLoading,
    error: updateError || context.error,

    // 메서드
    signUp,
    signInWithEmail,
    signInWithGoogle,
    logout,
    updateProfile,
    loadUserProfile,

    // 편의 메서드
    isAuthenticated: !!context.user,
    isLoading: context.loading || updateLoading
  };
}

export default useAuth;
