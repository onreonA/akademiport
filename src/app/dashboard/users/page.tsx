/**
 * Users List Page
 *
 * Main page for listing and managing users
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/components/ui/atoms/button';
import { UserCard, UserFilters } from '@/presentation/components/features/users';
import { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/enums/UserRole';
import { Plus, Loader2 } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: undefined as UserRole | undefined,
    isActive: true,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
    page: 1,
    limit: 12,
  });

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('page', String(filters.page));
      params.append('limit', String(filters.limit));

      const response = await fetch(`/api/users?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleView = (user: User) => {
    router.push(`/dashboard/users/${user.id}`);
  };

  const handleEdit = (user: User) => {
    router.push(`/dashboard/users/${user.id}/edit`);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`${user.fullName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcılar</h1>
          <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
        </div>
        <Button onClick={() => router.push('/dashboard/users/new')}>
          <Plus className="h-4 w-4 mr-1" />
          Yeni Kullanıcı
        </Button>
      </div>

      {/* Filters */}
      <UserFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground mb-4">Kullanıcı bulunamadı</p>
          <Button onClick={() => router.push('/dashboard/users/new')} variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            İlk Kullanıcıyı Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

