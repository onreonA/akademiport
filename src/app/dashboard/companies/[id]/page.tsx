'use client';

/**
 * Company Detail Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, Edit, Trash2, Briefcase, Users, Building2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  CompanyProfileCard,
  CompanyStatsCard,
  CompanyUsersList,
  CompanyProgramsList,
} from '@/presentation/components/features/companies';
import type { Company } from '@/domain/entities/Company';
import type { User } from '@/domain/entities/User';
import type { Program } from '@/domain/entities/Program';

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgram = useCallback(async (programId: string) => {
    try {
      const response = await fetch(`/api/programs/${programId}`);
      const data = await response.json();

      if (data.success) {
        setProgram(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch program:', error);
    }
  }, []);

  const fetchCompany = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${id}`);
      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
        // Fetch program if programId exists
        if (data.data.programId) {
          fetchProgram(data.data.programId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setLoading(false);
    }
  }, [id, fetchProgram]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${id}/users`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]); // Set empty array on error to prevent undefined
    }
  }, [id]);

  useEffect(() => {
    fetchCompany();
    fetchUsers();
  }, [fetchCompany, fetchUsers]);

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı çıkarmak istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/companies/${id}/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
        fetchCompany(); // Refresh to update currentUsers count
      } else {
        alert(data.error || 'Kullanıcı çıkarılamadı');
      }
    } catch (error) {
      console.error('Failed to remove user:', error);
      alert('Kullanıcı çıkarılamadı');
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

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Firma Bulunamadı
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Firma bilgileri yüklenemedi</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
                <Badge
                  className={`${
                    company.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                  } border font-medium px-2.5 py-1`}
                >
                  {company.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base">Firma Detayları</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/companies/${id}/edit`)}
              className="shadow-sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </div>
        </div>

        {/* Stats */}
        <CompanyStatsCard company={company} />

        {/* Tabs */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <Tabs defaultValue="overview" className="space-y-6">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Genel Bakış
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-primary/10">
                  <Users className="w-4 h-4 mr-2" />
                  Kullanıcılar ({users?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="program" className="data-[state=active]:bg-primary/10">
                  <Building2 className="w-4 h-4 mr-2" />
                  Program
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <CompanyProfileCard
                  company={company}
                  onEdit={() => router.push(`/dashboard/companies/${id}/edit`)}
                  canEdit
                />
              </TabsContent>

              <TabsContent value="users" className="space-y-4 mt-0">
                <CompanyUsersList
                  users={users}
                  maxUsers={company.maxUsers}
                  onAddUser={() => router.push(`/dashboard/companies/${id}/users`)}
                  onRemoveUser={handleRemoveUser}
                  canManage
                />
              </TabsContent>

              <TabsContent value="program" className="space-y-4 mt-0">
                <CompanyProgramsList
                  program={program || undefined}
                  onAssignProgram={() => alert('Program atama özelliği yakında eklenecek')}
                  canManage
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
