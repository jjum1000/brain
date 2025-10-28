/**
 * Authentication Context
 * 전역 인증 상태 관리 (React Context)
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from './authService.js';

/**
 * AuthContext 생성
 * Provider로 감싼 컴포넌트에서 useAuth() hook으로 접근 가능
 */
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 앱의 최상위에 이 Provider를 감싸서 인증 상태를 전역으로 관리
 *
 * 사용 예시:
 * ```jsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // 현재 로그인한 사용자 (Firebase Auth)
  const [userProfile, setUserProfile] = useState(null); // Firestore 사용자 프로필
  const [loading, setLoading] = useState(true);    // 초기화 로딩 상태
  const [error, setError] = useState(null);        // 에러 정보

  /**
   * 초기화: 사용자 인증 상태 모니터링
   */
  useEffect(() => {
    console.log('🔐 Setting up Auth state listener');

    // Firebase Auth 상태 변화 리스너
    const unsubscribe = AuthService.onAuthStateChanged(async (authUser) => {
      try {
        if (authUser) {
          console.log(`✅ User authenticated: ${authUser.uid}`);
          setUser(authUser);

          // TODO: Firestore에서 사용자 프로필 로드
          // const profile = await getUserProfile(authUser.uid);
          // setUserProfile(profile);
        } else {
          console.log('❌ User logged out');
          setUser(null);
          setUserProfile(null);
        }
        setError(null);
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log('🔐 Cleaning up Auth state listener');
      unsubscribe();
    };
  }, []);

  /**
   * Context 값
   */
  const value = {
    user,
    userProfile,
    loading,
    error,

    // Auth 메서드들
    signUp: AuthService.signUp,
    signInWithEmail: AuthService.signInWithEmail,
    signInWithGoogle: AuthService.signInWithGoogle,
    logout: AuthService.logout,
    getCurrentUser: AuthService.getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * AuthProvider로 감싼 컴포넌트에서 사용
 *
 * 사용 예시:
 * ```jsx
 * function MyComponent() {
 *   const { user, loading, signUp, logout } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {user ? (
 *         <>
 *           <p>Welcome, {user.displayName}</p>
 *           <button onClick={logout}>Logout</button>
 *         </>
 *       ) : (
 *         <button onClick={() => signUp('email', 'password', 'name')}>Sign Up</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * withAuth HOC (Higher Order Component)
 * Class Component에서 Auth를 사용하기 위한 HOC
 *
 * 사용 예시:
 * ```jsx
 * class MyComponent extends React.Component {
 *   render() {
 *     const { user, loading } = this.props.auth;
 *     return <div>{user?.displayName}</div>;
 *   }
 * }
 * export default withAuth(MyComponent);
 * ```
 */
export function withAuth(Component) {
  return function AuthedComponent(props) {
    const auth = useAuth();
    return <Component {...props} auth={auth} />;
  };
}

export default AuthContext;
