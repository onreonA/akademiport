/**
 * Edit User Page
 *
 * Page for editing an existing user
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { UserForm, type UserFormData } from '@/presentation/components/features/users/UserForm';
import { User } from '@/domain/entities/User';
import { ArrowLeft, Loader2, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      const result = await response.json();

      if (result.success) {
        console.log('🔍 [EditUserPage] User data from API:', result.data);
        setUser(result.data);
      } else {
        console.error('🔴 [EditUserPage] Failed to fetch user:', result.error);
        toast.error(result.error || 'Kullanıcı bilgileri alınamadı');
      }
    } catch (error) {
      console.error('🔴 [EditUserPage] Exception:', error);
      toast.error('Kullanıcı bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id, fetchUser]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı güncellenirken bir hata oluştu.');
      }

      const result = await response.json();
      toast.success(result.message || 'Kullanıcı başarıyla güncellendi!');
      router.push(`/dashboard/users/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Kullanıcı güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Kullanıcı Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Kullanıcı bilgileri yüklenemedi</p>
            <Button onClick={() => router.push('/dashboard/users')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kullanıcılara Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              Kullanıcıyı Düzenle
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {user.fullName} - Kullanıcı bilgilerini güncelleyin
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Kullanıcı Bilgileri
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Kullanıcı bilgilerini güncelleyin ve değişiklikleri kaydedin
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <UserForm
              initialData={{
                email: user.email || '',
                firstName:
                  user.firstName ||
                  (user.fullName ? user.fullName.split(' ')[0]?.trim() || '' : ''),
                lastName:
                  user.lastName ||
                  (user.fullName ? user.fullName.split(' ').slice(1).join(' ')?.trim() || '' : ''),
                phone: user.phone || '',
                role: user.role,
                companyId: user.companyId || '',
                bio: user.bio || '',
              }}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              isEdit={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
