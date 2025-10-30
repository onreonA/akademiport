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
              Yeni Kullanıcı Oluştur
            </h1>
            <p className="text-muted-foreground text-lg">Sisteme yeni kullanıcı ekleyin</p>
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
            <p className="text-muted-foreground">Lütfen kullanıcı bilgilerini eksiksiz doldurun</p>
          </CardHeader>
          <CardContent className="p-8">
            <UserForm onSubmit={handleSubmit} onCancel={() => router.back()} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
