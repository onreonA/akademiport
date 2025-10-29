/**
 * Consultant Company Detail Page
 * Sprint 7: Consultant Management
 *
 * Firma detay sayfası - Consultant için
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Users, Mail, Phone, Globe, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import type { Company } from '@/domain/entities/Company';
import type { User } from '@/domain/entities/User';

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    params.then((p) => {
      setCompanyId(p.id);
      fetchCompanyData(p.id);
    });
  }, [params]);

  const fetchCompanyData = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch company
      const companyResponse = await fetch(`/api/companies/${id}`);
      const companyData = await companyResponse.json();

      if (!companyData.success) {
        setError(companyData.error || 'Firma bulunamadı');
        return;
      }

      setCompany(companyData.data);

      // Fetch users
      const usersResponse = await fetch(`/api/companies/${id}/users`);
      const usersData = await usersResponse.json();

      if (usersData.success) {
        setUsers(usersData.data);
      }
    } catch (err) {
      setError('Firma bilgileri yüklenirken bir hata oluştu');
      console.error('Failed to fetch company:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error || 'Firma bulunamadı'}</p>
            <Button onClick={() => router.back()}>Geri Dön</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </div>

      {/* Company Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{company.name}</CardTitle>
                <CardDescription>{company.legalName || company.name}</CardDescription>
              </div>
            </div>
            <Badge variant={company.isActive ? 'default' : 'outline'}>
              {company.isActive ? 'Aktif' : 'Pasif'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.city && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{company.city}</span>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{company.phone}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {company.website}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar ({users.length})</TabsTrigger>
          <TabsTrigger value="projects">Projeler (Sprint 8)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Firma Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.sector && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sektör</p>
                  <p className="text-sm">{company.sector}</p>
                </div>
              )}
              {company.address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adres</p>
                  <p className="text-sm">{company.address}</p>
                </div>
              )}
              {company.employeeCount && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Çalışan Sayısı</p>
                  <p className="text-sm">{company.employeeCount}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcılar</CardTitle>
              <CardDescription>{users.length} / {company.maxUsers} kullanıcı</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>Henüz kullanıcı eklenmemiş</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant={user.isActive ? 'default' : 'outline'}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projeler</CardTitle>
              <CardDescription>Sprint 8'de eklenecek</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Proje yönetimi Sprint 8'de gelecek</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

