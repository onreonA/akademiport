'use client';

/**
 * Company Users Management Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { CompanyUsersList } from '@/presentation/components/features/companies';
import type { Company } from '@/domain/entities/Company';
import type { User } from '@/domain/entities/User';

export default function CompanyUsersPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
    fetchUsers();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/companies/${id}`);
      const data = await response.json();

      if (data.success) {
        setCompany(data.data);
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
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAddUser = () => {
    alert('Kullanıcı ekleme özelliği yakında eklenecek');
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
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">{company.name}</p>
        </div>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Firma Kullanıcıları</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyUsersList
            users={users}
            maxUsers={company.maxUsers}
            onAddUser={handleAddUser}
            onRemoveUser={handleRemoveUser}
            canManage
          />
        </CardContent>
      </Card>
    </div>
  );
}
