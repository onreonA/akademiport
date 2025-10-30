/**
 * Login Page
 */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { GradientHeader } from '@/presentation/components/ui/molecules/gradient-header';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password, redirect || undefined);

    if (!result.success) {
      setError(result.error || 'Giriş başarısız');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-background to-secondary/10">
      {/* Modern Gradient Header */}
      <div className="p-4 md:p-6 lg:p-8">
        <GradientHeader
          title="Akademi Port"
          subtitle="E-İhracat Dönüşüm Platformu"
          icon={undefined}
          progress={undefined}
          actions={undefined}
          className="mb-4 md:mb-6 lg:mb-8"
        />
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 pb-8">
        <EnhancedCard variant="glass" className="w-full max-w-md p-6 md:p-8">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Şifre
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium py-2.5 transition-all duration-200 hover:scale-[1.02] shadow-lg"
                disabled={loading}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p className="font-medium">Demo Hesap:</p>
              <p>admin@akademiport.com / demo123</p>
            </div>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
