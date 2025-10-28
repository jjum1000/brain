export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
}
