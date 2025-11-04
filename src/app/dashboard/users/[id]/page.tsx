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
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import { UserProfileCard, UserProgramList } from '@/presentation/components/features/users';
import { User } from '@/domain/entities/User';
import { Program } from '@/domain/entities/Program';
import { UserRoleLabels } from '@/domain/enums/UserRole';
import {
  ArrowLeft,
  Edit,
  AlertCircle,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  UserCheck,
} from 'lucide-react';

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

  const roleColors = {
    master_admin:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    program_manager:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    consultant:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    company_admin:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    company_user:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    observer:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user.fullName}
                </h1>
                <Badge
                  className={`${roleColors[user.role as keyof typeof roleColors] || roleColors.company_user} border font-medium px-2.5 py-1`}
                >
                  {UserRoleLabels[user.role as keyof typeof UserRoleLabels] || user.role}
                </Badge>
                {user.isActive !== undefined && (
                  <Badge
                    className={`${
                      user.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    } border font-medium px-2.5 py-1`}
                  >
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base">Kullanıcı Detayları</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/users/${id}/edit`)}
              className="shadow-sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* E-posta */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    E-posta
                  </p>
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-white truncate"
                    title={user.email || 'Belirtilmemiş'}
                  >
                    {user.email || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rol */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rol</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {UserRoleLabels[user.role as keyof typeof UserRoleLabels] || user.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Firma */}
          {user.companyId && (
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <Building2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Firma
                    </p>
                    <p
                      className="text-sm font-medium text-gray-900 dark:text-white truncate"
                      title={user.companyName || 'Belirtilmemiş'}
                    >
                      {user.companyName || 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Programlar */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Programlar
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {programs.length} Program
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <Tabs defaultValue="programs" className="space-y-6">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <TabsTrigger value="programs" className="data-[state=active]:bg-primary/10">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Programlar ({programs.length})
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-primary/10">
                  <Calendar className="w-4 h-4 mr-2" />
                  Aktivite
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="programs" className="space-y-4 mt-0">
                <UserProgramList programs={programs} canManage={true} />
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-0">
                <div className="text-center py-12 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
                  <p className="text-gray-600 dark:text-gray-400">
                    Aktivite geçmişi yakında eklenecek
                  </p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
