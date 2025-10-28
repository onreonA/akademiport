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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Kullanıcı bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Kullanıcı bulunamadı</p>
          <Button onClick={() => router.push('/dashboard/users')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kullanıcılara Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Kullanıcıyı Düzenle</h1>
          <p className="text-muted-foreground">{user.fullName}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            initialData={{
              email: user.email,
              fullName: user.fullName,
              phone: user.phone,
              role: user.role,
              companyId: user.companyId,
              bio: user.bio,
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
