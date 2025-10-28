/**
 * Dashboard Page
 */

'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { UserRoleLabels } from '@/domain/enums/UserRole';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Kullanıcı bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Hoş geldiniz, {user.fullName}</p>
          </div>
          <Button onClick={signOut} variant="outline">
            Çıkış Yap
          </Button>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
            <CardDescription>Hesap detaylarınız</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ad Soyad</p>
                <p className="text-lg font-medium">{user.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <Badge variant="default" className="mt-1">
                  {UserRoleLabels[user.role]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-sm font-mono">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Projeler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-2">Aktif proje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-secondary">Görevler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-2">Bekleyen görev</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-accent">Eğitimler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">0</p>
              <p className="text-sm text-muted-foreground mt-2">Tamamlanan eğitim</p>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        <Card className="bg-success/10 border-success">
          <CardContent className="pt-6">
            <p className="text-center text-success font-medium">
              🎉 Authentication sistemi başarıyla çalışıyor!
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Sprint 2 - Gün 4 tamamlandı
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
