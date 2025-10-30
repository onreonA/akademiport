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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.role,
    filters.isActive,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.limit,
  ]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Kullanıcılar
            </h1>
            <p className="text-muted-foreground text-lg">Sistem kullanıcılarını yönetin</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-sm text-muted-foreground">{users.length} kullanıcı</div>
            </div>
          </div>
          <Button
            onClick={() => router.push('/dashboard/users/new')}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kullanıcı
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6 shadow-lg">
          <UserFilters onFilterChange={handleFilterChange} initialFilters={filters} />
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div className="text-lg text-muted-foreground">Kullanıcılar yükleniyor...</div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Kullanıcı Bulunamadı</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Henüz hiç kullanıcı oluşturulmamış. İlk kullanıcınızı ekleyerek başlayın.
            </p>
            <Button
              onClick={() => router.push('/dashboard/users/new')}
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
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
    </div>
  );
}
