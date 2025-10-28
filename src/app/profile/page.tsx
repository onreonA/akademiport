/**
 * User Profile Page
 *
 * Page for viewing and editing own profile
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  UserProfileCard,
  UserProgramList,
  ChangePasswordForm,
} from '@/presentation/components/features/users';
import { User } from '@/domain/entities/User';
import { Program } from '@/domain/entities/Program';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchPrograms();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Profil bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      // TODO: Get current user ID from auth
      const userId = 'mock-user-id';
      const response = await fetch(`/api/users/${userId}/program`);
      const result = await response.json();

      if (result.success) {
        setPrograms(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const handlePasswordChange = async (data: any) => {
    try {
      // TODO: Get current user ID from auth
      const userId = 'mock-user-id';
      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Şifre değiştirilemedi');
      }

      toast.success('Şifreniz başarıyla değiştirildi!');
    } catch (error: any) {
      toast.error(error.message || 'Şifre değiştirilemedi');
      throw error;
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
          <p className="text-muted-foreground mb-4">Profil bilgileri yüklenemedi</p>
          <Button onClick={fetchProfile} variant="outline">
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profilim</h1>
        <p className="text-muted-foreground">Profil bilgilerinizi görüntüleyin ve düzenleyin</p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <UserProfileCard user={user} canEdit={false} />
        </div>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="programs">
            <TabsList>
              <TabsTrigger value="programs">Programlarım</TabsTrigger>
              <TabsTrigger value="password">Şifre Değiştir</TabsTrigger>
              <TabsTrigger value="settings">Ayarlar</TabsTrigger>
            </TabsList>

            <TabsContent value="programs" className="mt-6">
              <UserProgramList programs={programs} canManage={false} />
            </TabsContent>

            <TabsContent value="password" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Şifre Değiştir</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChangePasswordForm onSubmit={handlePasswordChange} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ayarlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Kullanıcı ayarları yakında eklenecek</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
