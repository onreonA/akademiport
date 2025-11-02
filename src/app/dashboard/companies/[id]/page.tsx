'use client';

/**
 * Company Detail Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
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

  useEffect(() => {
    fetchCompany();
    fetchUsers();
  }, [id]);

  const fetchCompany = async () => {
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
  };

  const fetchUsers = async () => {
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
  };

  const fetchProgram = async (programId: string) => {
    try {
      const response = await fetch(`/api/programs/${programId}`);
      const data = await response.json();

      if (data.success) {
        setProgram(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch program:', error);
    }
  };

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
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Yükleniyor...</p>
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">Firma Detayları</p>
        </div>
      </div>

      {/* Stats */}
      <CompanyStatsCard company={company} />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar ({users?.length || 0})</TabsTrigger>
          <TabsTrigger value="program">Program</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CompanyProfileCard
            company={company}
            onEdit={() => router.push(`/dashboard/companies/${id}/edit`)}
            canEdit
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <CompanyUsersList
            users={users}
            maxUsers={company.maxUsers}
            onAddUser={() => router.push(`/dashboard/companies/${id}/users`)}
            onRemoveUser={handleRemoveUser}
            canManage
          />
        </TabsContent>

        <TabsContent value="program" className="space-y-4">
          <CompanyProgramsList
            program={program || undefined}
            onAssignProgram={() => alert('Program atama özelliği yakında eklenecek')}
            canManage
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
