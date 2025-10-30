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
import { ArrowLeft, Loader2, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Kullanıcıyı Düzenle
            </h1>
            <p className="text-muted-foreground text-lg">
              {user.fullName} - Kullanıcı bilgilerini güncelleyin
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Kullanıcı Bilgileri
            </CardTitle>
            <p className="text-muted-foreground">
              Kullanıcı bilgilerini güncelleyin ve değişiklikleri kaydedin
            </p>
          </CardHeader>
          <CardContent className="p-8">
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
    </div>
  );
}
