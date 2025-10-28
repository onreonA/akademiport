'use client';

/**
 * Company Filters Component
 * Sprint 6: Company Management
 */

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';

interface CompanyFiltersProps {
  search: string;
  city: string;
  sector: string;
  isActive: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onReset: () => void;
}

export function CompanyFilters({
  search,
  city,
  sector,
  isActive,
  sortBy,
  onSearchChange,
  onCityChange,
  onSectorChange,
  onIsActiveChange,
  onSortByChange,
  onReset,
}: CompanyFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Firma adı, şehir veya sektör ara..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* City Filter */}
        <Select value={city} onValueChange={onCityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Şehir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Şehirler</SelectItem>
            <SelectItem value="İstanbul">İstanbul</SelectItem>
            <SelectItem value="Ankara">Ankara</SelectItem>
            <SelectItem value="İzmir">İzmir</SelectItem>
            <SelectItem value="Bursa">Bursa</SelectItem>
            <SelectItem value="Antalya">Antalya</SelectItem>
          </SelectContent>
        </Select>

        {/* Sector Filter */}
        <Select value={sector} onValueChange={onSectorChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sektör" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Sektörler</SelectItem>
            <SelectItem value="Teknoloji">Teknoloji</SelectItem>
            <SelectItem value="Finans">Finans</SelectItem>
            <SelectItem value="Sağlık">Sağlık</SelectItem>
            <SelectItem value="Eğitim">Eğitim</SelectItem>
            <SelectItem value="Üretim">Üretim</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={isActive} onValueChange={onIsActiveChange}>
          <SelectTrigger>
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Pasif</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">En Yeni</SelectItem>
            <SelectItem value="name">İsim (A-Z)</SelectItem>
            <SelectItem value="city">Şehir</SelectItem>
            <SelectItem value="sector">Sektör</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onReset}>
          Filtreleri Temizle
        </Button>
      </div>
    </div>
  );
}

