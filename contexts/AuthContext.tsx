'use client';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
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
}
interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: AuthUser; session: AuthSession }>;
  signOut: () => void;
  refreshSession: () => Promise<void>;
  isAdmin: () => boolean;
  isFirma: () => boolean;
  isAuthenticated: () => boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  // Cookie'leri okuma fonksiyonu
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    // Önce cookie'leri kontrol et
    const email = getCookie('auth-user-email');
    const role = getCookie('auth-user-role');
    const companyId = getCookie('auth-user-company-id');
    if (email && role) {
      // Cookie'den kullanıcı bilgilerini oluştur
      const userFromCookie: AuthUser = {
        id: 'temp-id', // Cookie'de ID yok, geçici ID
        email: email,
        full_name: 'User',
        role: role,
        company_id: companyId || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(userFromCookie);
      setLoading(false);
      return;
    }
    // Cookie yoksa localStorage'dan yükle
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        // Check if token is still valid
        const tokenExpiry = new Date(parsedSession.expires_at);
        if (tokenExpiry > new Date()) {
          setSession(parsedSession);
          setUser(parsedSession.user);
        } else {
          localStorage.removeItem('auth_session');
        }
      } catch (error) {
        localStorage.removeItem('auth_session');
      }
    }
    setLoading(false);
  }, []);
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
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
      if (
        result.user &&
        Object.keys(result.user).length > 0 &&
        result.session
      ) {
        // Calculate expiry time
        const expiresAt = new Date(
          Date.now() + result.session.expires_in * 1000
        );
        const sessionWithExpiry = {
          ...result.session,
          expires_at: expiresAt.toISOString(),
        };
        setUser(result.user);
        setSession(sessionWithExpiry);
        // Check if we're in browser environment before using localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'auth_session',
            JSON.stringify(sessionWithExpiry)
          );
        }
        // Return success result
        return { user: result.user, session: sessionWithExpiry };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const signOut = () => {
    setUser(null);
    setSession(null);
    // Check if we're in browser environment before using localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_session');
    }
  };
  const refreshSession = async () => {
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
        setUser(result.user);
        setSession(sessionWithExpiry);
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'auth_session',
            JSON.stringify(sessionWithExpiry)
          );
        }
      } else {
        signOut();
      }
    } catch (error) {
      signOut();
    }
  };
  const isAdmin = () => {
    return user?.role === 'admin';
  };
  const isFirma = () => {
    // Middleware'deki COMPANY_ROLES ile uyumlu
    const COMPANY_ROLES = [
      'user',
      'operator',
      'manager',
      'firma_admin',
      'firma_kullanıcı',
    ];
    return user?.role ? COMPANY_ROLES.includes(user.role) : false;
  };
  const isAuthenticated = () => {
    return user !== null && session !== null;
  };
  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    refreshSession,
    isAdmin,
    isFirma,
    isAuthenticated,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
