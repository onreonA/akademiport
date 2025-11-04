/**
 * Login Page
 * Akademiport.com design standards
 */

'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Lock, Globe, Building2, Shield, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Card } from '@/presentation/components/ui/atoms/card';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const features = [
    {
      title: 'Firma Paneli',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Admin Paneli',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'Güvenli Erişim',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      title: 'Otomatik Yönlendirme',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <Globe className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">AKADEMİ PORT</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              'Anasayfa',
              'Program Hakkında',
              'Destekler',
              'Platform Özellikleri',
              'Başarı Hikayeleri',
              'SSS',
            ].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Giriş Button */}
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            onClick={() => router.push('/login')}
          >
            <ArrowRight className="h-4 w-4" />
            Giriş
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700 p-8">
            {/* Logo Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Giriş Yap
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
              E-posta adresiniz ve şifrenizle sisteme giriş yapın
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@mundo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md"
                disabled={loading}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Şifremi Unuttum
                </Link>
              </div>
            </form>

            {/* Features Section */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Sisteme Giriş Yaptıktan Sonra
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className={`flex items-center gap-2 p-3 rounded-lg ${feature.bgColor} transition-all duration-200 hover:scale-105`}
                    >
                      <Icon className={`h-5 w-5 ${feature.color}`} />
                      <span className={`text-sm font-medium ${feature.color}`}>
                        {feature.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Henüz kaydınız yok mu?{' '}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
