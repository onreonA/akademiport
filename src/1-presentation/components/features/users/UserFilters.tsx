/**
 * User Filters Component
 *
 * Provides filtering and search functionality for users
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { UserRole, UserRoleLabels } from '@/domain/enums/UserRole';
import { SearchIcon, XCircle } from 'lucide-react';
import { UserSortField } from '@/application/dto/user';

interface UserFiltersProps {
  onFilterChange: (filters: {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    sortBy?: UserSortField;
    sortOrder?: 'asc' | 'desc';
  }) => void;
  initialFilters?: {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    sortBy?: UserSortField;
    sortOrder?: 'asc' | 'desc';
  };
}

const sortOptions: { value: UserSortField; label: string }[] = [
  { value: 'createdAt', label: 'Oluşturulma Tarihi' },
  { value: 'fullName', label: 'İsim' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Rol' },
  { value: 'lastLoginAt', label: 'Son Giriş' },
];

export const UserFilters: React.FC<UserFiltersProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState(
    initialFilters || {
      search: '',
      role: undefined,
      isActive: true,
      sortBy: 'createdAt' as UserSortField,
      sortOrder: 'desc' as const,
    }
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onFilterChange(filters);
    }, 500); // Debounce search input

    return () => clearTimeout(delayDebounceFn);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: undefined,
      isActive: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      {/* Search Row */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kullanıcı adı, email veya telefon ara..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Role Filter */}
        <Select
          value={filters.role || 'all'}
          onValueChange={(value) => handleFilterChange('role', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Roller</SelectItem>
            {Object.entries(UserRoleLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Active Status Filter */}
        <Select
          value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
          onValueChange={(value) =>
            handleFilterChange('isActive', value === 'all' ? undefined : value === 'active')
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value: UserSortField) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={filters.sortOrder || 'desc'}
          onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sortOrder', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sıralama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Azalan</SelectItem>
            <SelectItem value="asc">Artan</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleResetFilters} className="flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Filtreleri Temizle
        </Button>
      </div>
    </div>
  );
};
