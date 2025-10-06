// =====================================================
// AUTH STORE - ZUSTAND (OPTIMIZED)
// =====================================================
// Optimized authentication state management with Zustand
'use client';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
  expires_at: string;
}
interface AuthState {
  // State
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  // Actions
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Auth Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshSession: () => Promise<void>;
  // Computed
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isFirma: () => boolean;
  isCompanyUser: () => boolean;
  // Reset
  reset: () => void;
}
export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial State
        user: null,
        session: null,
        loading: false,
        error: null,
        // Actions
        setUser: user =>
          set(state => {
            state.user = user;
          }),
        setSession: session =>
          set(state => {
            state.session = session;
          }),
        setLoading: loading =>
          set(state => {
            state.loading = loading;
          }),
        setError: error =>
          set(state => {
            state.error = error;
          }),
        // Auth Actions
        signIn: async (email: string, password: string) => {
          set(state => {
            state.loading = true;
            state.error = null;
          });
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (!response.ok) {
              throw new Error(result.error || 'Giriş başarısız');
            }
            if (result.user && result.session) {
              const expiresAt = new Date(
                Date.now() + result.session.expires_in * 1000
              );
              const sessionWithExpiry = {
                ...result.session,
                expires_at: expiresAt.toISOString(),
              };
              set(state => {
                state.user = result.user;
                state.session = sessionWithExpiry;
                state.loading = false;
                state.error = null;
              });
              // Set auth cookies for middleware access
              if (typeof window !== 'undefined') {
                // Set cookies for middleware access
                document.cookie = `auth-user-email=${result.user.email}; path=/; max-age=86400; SameSite=Lax`;
                document.cookie = `auth-user-role=${result.user.role}; path=/; max-age=86400; SameSite=Lax`;
              }
            } else {
              throw new Error('Invalid response format');
            }
          } catch (error: any) {
            set(state => {
              state.loading = false;
              state.error = error.message || 'Giriş başarısız';
            });
            throw error;
          }
        },
        signOut: () => {
          set(state => {
            state.user = null;
            state.session = null;
            state.loading = false;
            state.error = null;
          });
          // Clear auth cookies
          if (typeof window !== 'undefined') {
            document.cookie =
              'auth-user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie =
              'auth-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        },
        refreshSession: async () => {
          const { session } = get();
          if (!session?.refresh_token) {
            return;
          }
          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh_token: session.refresh_token }),
            });
            const result = await response.json();
            if (response.ok && result.user && result.session) {
              const expiresAt = new Date(
                Date.now() + result.session.expires_in * 1000
              );
              const sessionWithExpiry = {
                ...result.session,
                expires_at: expiresAt.toISOString(),
              };
              set(state => {
                state.user = result.user;
                state.session = sessionWithExpiry;
              });
            } else {
              get().signOut();
            }
          } catch (error) {
            get().signOut();
          }
        },
        // Computed
        isAuthenticated: () => {
          const { user, session } = get();
          return user !== null && session !== null;
        },
        isAdmin: () => {
          const { user } = get();
          return user?.role === 'admin' || user?.role === 'master_admin';
        },
        isFirma: () => {
          const { user } = get();
          return (
            user?.role === 'operator' ||
            user?.role === 'manager' ||
            user?.role === 'admin'
          );
        },
        isCompanyUser: () => {
          const { user } = get();
          return user?.role === 'operator' || user?.role === 'manager';
        },
        // Reset
        reset: () =>
          set(state => {
            state.user = null;
            state.session = null;
            state.loading = false;
            state.error = null;
          }),
      })),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({
          user: state.user,
          session: state.session,
        }),
      }
    )
  )
);
// Optimized selectors for better performance
export const useAuthUser = () => useAuthStore(state => state.user);
export const useAuthSession = () => useAuthStore(state => state.session);
export const useAuthLoading = () => useAuthStore(state => state.loading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useAuthActions = () =>
  useAuthStore(state => ({
    signIn: state.signIn,
    signOut: state.signOut,
    refreshSession: state.refreshSession,
    setUser: state.setUser,
    setSession: state.setSession,
    setLoading: state.setLoading,
    setError: state.setError,
    reset: state.reset,
  }));
export const useAuthComputed = () =>
  useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin,
    isFirma: state.isFirma,
    isCompanyUser: state.isCompanyUser,
  }));
