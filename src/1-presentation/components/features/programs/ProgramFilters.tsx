/**
 * Program Filters Component
 *
 * Filter and search programs
 */

'use client';

import * as React from 'react';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Search, X } from 'lucide-react';
import { ProgramStatus, ProgramStatusLabels } from '@/domain/enums/ProgramStatus';

export interface ProgramFiltersProps {
  onFilterChange: (filters: ProgramFilterValues) => void;
  initialFilters?: ProgramFilterValues;
}

export interface ProgramFilterValues {
  search?: string;
  status?: ProgramStatus;
  city?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function ProgramFilters({ onFilterChange, initialFilters = {} }: ProgramFiltersProps) {
  const [filters, setFilters] = React.useState<ProgramFilterValues>(initialFilters);

  const handleFilterChange = (key: keyof ProgramFilterValues, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters: ProgramFilterValues = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ''
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          placeholder="Program adı, açıklama veya şehir ara..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            handleFilterChange('status', value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {Object.entries(ProgramStatusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City Filter */}
        <Input
          placeholder="Şehir"
          value={filters.city || ''}
          onChange={(e) => handleFilterChange('city', e.target.value)}
          className="w-[180px]"
        />

        {/* Sort By */}
        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sıralama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Oluşturma Tarihi</SelectItem>
            <SelectItem value="name">İsim</SelectItem>
            <SelectItem value="startDate">Başlangıç Tarihi</SelectItem>
            <SelectItem value="endDate">Bitiş Tarihi</SelectItem>
            <SelectItem value="status">Durum</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={filters.sortOrder || 'desc'}
          onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sıra" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Azalan</SelectItem>
            <SelectItem value="asc">Artan</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button variant="outline" size="icon" onClick={handleReset}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
