/**
 * New User Page
 *
 * Page for creating a new user
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { UserForm, type UserFormData } from '@/presentation/components/features/users/UserForm';
import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function NewUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı oluşturulurken bir hata oluştu.');
      }

      const result = await response.json();
      toast.success(result.message || 'Kullanıcı başarıyla oluşturuldu!');
      router.push('/dashboard/users');
    } catch (error: any) {
      toast.error(error.message || 'Kullanıcı oluşturulurken bir hata oluştu.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Kullanıcı Oluştur
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Sisteme yeni kullanıcı ekleyin</p>
          </div>
        </div>

        {/* Form */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Kullanıcı Bilgileri
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Lütfen kullanıcı bilgilerini eksiksiz doldurun
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <UserForm onSubmit={handleSubmit} onCancel={() => router.back()} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
