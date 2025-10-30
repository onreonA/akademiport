/**
 * User Detail Page
 *
 * Displays detailed information about a user
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { UserProfileCard, UserProgramList } from '@/presentation/components/features/users';
import { User } from '@/domain/entities/User';
import { Program } from '@/domain/entities/Program';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchUser();
      fetchPrograms();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`/api/users/${id}/program`);
      const result = await response.json();

      if (result.success) {
        setPrograms(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
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
    <div className="container mx-auto py-4 md:py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          size="sm"
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <Button
          onClick={() => router.push(`/dashboard/users/${id}/edit`)}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Edit className="h-4 w-4 mr-2" />
          Düzenle
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <UserProfileCard
            user={user}
            onEdit={() => router.push(`/dashboard/users/${id}/edit`)}
            canEdit={true}
          />
        </div>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="programs">
            <TabsList>
              <TabsTrigger value="programs">Programlar</TabsTrigger>
              <TabsTrigger value="activity">Aktivite</TabsTrigger>
            </TabsList>

            <TabsContent value="programs" className="mt-6">
              <UserProgramList programs={programs} canManage={true} />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <div className="text-center py-12 border rounded-lg bg-card">
                <p className="text-muted-foreground">Aktivite geçmişi yakında eklenecek</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
