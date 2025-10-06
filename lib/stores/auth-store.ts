// =====================================================
// AUTH STORE - ZUSTAND
// =====================================================
// Authentication state management with Zustand
'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role:
    | 'master_admin'
    | 'danışman'
    | 'firma_admin'
    | 'firma_kullanıcı'
    | 'gözlemci';
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
  _hasHydrated: boolean;
  // Actions
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  // Auth Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshSession: () => Promise<void>;
  // Computed
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isFirma: () => boolean;
  isMasterAdmin: () => boolean;
  isConsultant: () => boolean;
  isObserver: () => boolean;
  isCompanyUser: () => boolean;
  // Reset
  reset: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // Initial State
      user: null,
      session: null,
      loading: false,
      error: null,
      _hasHydrated: false,
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
      setHasHydrated: hasHydrated =>
        set(state => {
          state._hasHydrated = hasHydrated;
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
              document.cookie = `auth-user-email=${result.user.email}; path=/; max-age=86400; SameSite=Lax`;
              document.cookie = `auth-user-role=${result.user.role}; path=/; max-age=86400; SameSite=Lax`;
              if (result.user.company_id) {
                document.cookie = `auth-user-company-id=${result.user.company_id}; path=/; max-age=86400; SameSite=Lax`;
              }
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
          document.cookie =
            'auth-user-company-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          // Redirect to login page
          window.location.href = '/giris';
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
        return user?.role === 'master_admin' || user?.role === 'danışman';
      },
      isMasterAdmin: () => {
        const { user } = get();
        return user?.role === 'master_admin';
      },
      isConsultant: () => {
        const { user } = get();
        return user?.role === 'danışman';
      },
      isObserver: () => {
        const { user } = get();
        return user?.role === 'gözlemci';
      },
      isFirma: () => {
        const { user } = get();
        return user?.role === 'firma_admin' || user?.role === 'firma_kullanıcı';
      },
      isCompanyUser: () => {
        const { user } = get();
        return user?.role === 'firma_admin' || user?.role === 'firma_kullanıcı';
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
      onRehydrateStorage: () => state => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
