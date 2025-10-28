/**
 * Verify Email Page
 *
 * Email verification page with token
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Geçersiz doğrulama bağlantısı');
      setIsVerifying(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Email doğrulama başarısız');
      }

      setIsSuccess(true);
      toast.success('Email adresiniz başarıyla doğrulandı!');
    } catch (error: any) {
      setError(error.message || 'Email doğrulama başarısız');
      toast.error(error.message || 'Email doğrulama başarısız');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Email Doğrulanıyor</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Spinner size="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-center">Email Doğrulandı!</CardTitle>
            <CardDescription className="text-center">
              Email adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/login" className="w-full">
              <Button className="w-full">Giriş Yap</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-center">Doğrulama Başarısız</CardTitle>
          <CardDescription className="text-center">{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Doğrulama bağlantısı geçersiz veya süresi dolmuş olabilir.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Giriş Sayfasına Dön
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button variant="ghost" className="w-full">
              Yeni Hesap Oluştur
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

