/**
 * Company Users Management Page
 * Sprint 7.5: Company User Management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, UserPlus, Users, Mail, Phone, Edit, Trash2, Shield } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/atoms/card';
import { EmptyState } from '@/presentation/components/ui/atoms/empty-state';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import type { Company } from '@/domain/entities/Company';
import type { User } from '@/domain/entities/User';
import { toast } from 'sonner';

export default function CompanyUsersPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchCompany();
    fetchUsers();
  }, [id]);

  const fetchCompany = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success && data.data) {
        setCompany(data.data);
      } else {
        console.error('Failed to fetch company:', data.error || 'Unknown error');
        toast.error('Firma bilgileri alınamadı');
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
      toast.error('Firma bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/companies/${id}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
      } else {
        console.error('Failed to fetch users:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAddUser = () => {
    router.push(`/dashboard/companies/${id}/users/new`);
  };

  const handleEditUser = (userId: string) => {
    router.push(`/dashboard/companies/${id}/users/${userId}/edit`);
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName} kullanıcısını firmadan çıkarmak istediğinizden emin misiniz?`))
      return;

    try {
      const response = await fetch(`/api/companies/${id}/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Kullanıcı başarıyla çıkarıldı');
        fetchUsers();
        fetchCompany();
      } else {
        toast.error(data.error || 'Kullanıcı çıkarılamadı');
      }
    } catch (error) {
      console.error('Failed to remove user:', error);
      toast.error('Kullanıcı çıkarılamadı');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Geçersiz firma ID'si</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Firma bulunamadı</p>
      </div>
    );
  }

  const canAddMore = (company.currentUsers ?? 0) < (company.maxUsers ?? 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="space-y-2 flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Kullanıcı Yönetimi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
                {company.name}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={canAddMore ? 'default' : 'destructive'}
                  className="border font-medium"
                >
                  {company.currentUsers ?? 0} / {company.maxUsers ?? 0} Kullanıcı
                </Badge>
                {!canAddMore && (
                  <Badge
                    variant="outline"
                    className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                  >
                    Limit Doldu
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button onClick={handleAddUser} disabled={!canAddMore} className="shadow-sm shrink-0">
            <UserPlus className="mr-2 h-4 w-4" />
            Kullanıcı Ekle
          </Button>
        </div>

        {/* Users List */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
                  <Users className="w-5 h-5" />
                  Firma Kullanıcıları
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Firmaya kayıtlı kullanıcıları görüntüleyin ve yönetin
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {users.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Henüz kullanıcı eklenmemiş"
                description="Bu firmaya henüz kullanıcı eklenmemiş. Kullanıcı eklemek için yukarıdaki butonu kullanın."
                action={
                  canAddMore
                    ? {
                        label: 'İlk Kullanıcıyı Ekle',
                        onClick: handleAddUser,
                      }
                    : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <Card
                    key={user.id}
                    className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </div>
                          <div>
                            <CardTitle className="text-base text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </CardTitle>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge
                                variant={user.isActive ? 'default' : 'secondary'}
                                className="text-xs border font-medium"
                              >
                                {user.isActive ? 'Aktif' : 'Pasif'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Shield className="w-4 h-4" />
                          <span>Firma Kullanıcısı</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRemoveUser(user.id, `${user.firstName} ${user.lastName}`)
                          }
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        {!canAddMore && (
          <Card className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-600 dark:text-orange-400">
                ⚠️ Kullanıcı Limiti Doldu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bu firma maksimum kullanıcı sayısına ulaştı. Yeni kullanıcı eklemek için firma
                limitini artırmanız gerekiyor.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/companies/${id}/edit`)}
                className="mt-4 shadow-sm"
              >
                Firmayı Düzenle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
