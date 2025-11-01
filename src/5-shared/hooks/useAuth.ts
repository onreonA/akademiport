/**
 * useAuth Hook
 *
 * Client-side authentication hook
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthUser } from '@/domain/entities/User';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check on login page to avoid 401 console errors
    if (pathname === '/login') {
      setLoading(false);
      return;
    }
    checkUser();
  }, [pathname]);

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // 401 is expected when not authenticated, don't log as error
        setUser(null);
      }
    } catch {
      // Silently fail
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, redirectTo?: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız');
      }

      setUser(data.data);
      const finalRedirect = redirectTo || '/dashboard';
      router.push(finalRedirect);
      router.refresh();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Giriş başarısız',
      };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch {
      // Silently fail
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
