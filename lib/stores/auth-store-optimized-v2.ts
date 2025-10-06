// =====================================================
// OPTIMIZED AUTH STORE - ZUSTAND
// =====================================================
// High-performance authentication state management
'use client';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware';
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
  initialized: boolean;
  // Actions
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  // Auth Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshSession: () => Promise<void>;
  // Computed
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isFirma: () => boolean;
  isTokenValid: () => boolean;
}
// Optimized selectors
export const useAuthUser = () => useAuthStore(state => state.user);
export const useAuthLoading = () => useAuthStore(state => state.loading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated());
export const useIsAdmin = () => useAuthStore(state => state.isAdmin());
export const useIsFirma = () => useAuthStore(state => state.isFirma());
export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        session: null,
        loading: false,
        error: null,
        initialized: false,
        // Actions
        setUser: user => set({ user }),
        setSession: session => set({ session }),
        setLoading: loading => set({ loading }),
        setError: error => set({ error }),
        setInitialized: initialized => set({ initialized }),
        // Auth Actions
        signIn: async (email: string, password: string) => {
          try {
            set({ loading: true, error: null });
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Giriş başarısız');
            }
            const data = await response.json();
            if (data.success && data.session) {
              const session = data.session;
              // Set cookies for middleware
              document.cookie = `auth-user-email=${session.user.email}; path=/; max-age=${session.expires_in}`;
              document.cookie = `auth-user-role=${session.user.role}; path=/; max-age=${session.expires_in}`;
              set({
                user: session.user,
                session: session,
                loading: false,
                error: null,
                initialized: true,
              });
            } else {
              throw new Error(data.error || 'Giriş başarısız');
            }
          } catch (error: any) {
            set({
              error: error.message || 'Giriş sırasında hata oluştu',
              loading: false,
            });
            throw error;
          }
        },
        signOut: () => {
          // Clear cookies
          document.cookie =
            'auth-user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie =
            'auth-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          set({
            user: null,
            session: null,
            loading: false,
            error: null,
            initialized: true,
          });
        },
        refreshSession: async () => {
          const { session } = get();
          if (!session) return;
          try {
            set({ loading: true });
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh_token: session.refresh_token }),
            });
            if (!response.ok) {
              throw new Error('Session refresh failed');
            }
            const data = await response.json();
            if (data.success && data.session) {
              const newSession = data.session;
              // Update cookies
              document.cookie = `auth-user-email=${newSession.user.email}; path=/; max-age=${newSession.expires_in}`;
              document.cookie = `auth-user-role=${newSession.user.role}; path=/; max-age=${newSession.expires_in}`;
              set({
                session: newSession,
                user: newSession.user,
                loading: false,
              });
            } else {
              throw new Error('Session refresh failed');
            }
          } catch (error) {
            get().signOut();
          }
        },
        // Computed
        isAuthenticated: () => {
          const { user, session } = get();
          return !!(user && session && get().isTokenValid());
        },
        isAdmin: () => {
          const { user } = get();
          return user?.role === 'admin' || user?.role === 'master_admin';
        },
        isFirma: () => {
          const { user } = get();
          return ['user', 'operator', 'manager'].includes(user?.role || '');
        },
        isTokenValid: () => {
          const { session } = get();
          if (!session) return false;
          const expiry = new Date(session.expires_at);
          return expiry > new Date();
        },
      }),
      {
        name: 'auth-store-optimized',
        storage: createJSONStorage(() => localStorage),
        // Only persist essential data
        partialize: state => ({
          user: state.user,
          session: state.session,
          initialized: state.initialized,
        }),
        // Optimize storage updates
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            // Migration logic if needed
            return persistedState;
          }
          return persistedState;
        },
      }
    )
  )
);
// Initialize store on client side
if (typeof window !== 'undefined') {
  useAuthStore.getState().setInitialized(true);
}
