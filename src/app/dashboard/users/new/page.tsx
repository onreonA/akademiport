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
import { ArrowLeft } from 'lucide-react';
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
    <div className="container mx-auto py-8 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Yeni Kullanıcı Oluştur</h1>
          <p className="text-muted-foreground">Sisteme yeni kullanıcı ekleyin</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm onSubmit={handleSubmit} onCancel={() => router.back()} />
        </CardContent>
      </Card>
    </div>
  );
}

