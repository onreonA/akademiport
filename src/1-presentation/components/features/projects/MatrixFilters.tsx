'use client';

import { useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { ProjectAssignmentMatrixDTO } from '@/application/dto/project-assignment.dto';

export interface MatrixFilters {
  programId?: string | null;
  city?: string | null;
  sector?: string | null;
  search?: string | null;
}

interface MatrixFiltersProps {
  matrix: ProjectAssignmentMatrixDTO | null;
  filters: MatrixFilters;
  onFiltersChange: (filters: MatrixFilters) => void;
}

export function MatrixFilters({ matrix, filters, onFiltersChange }: MatrixFiltersProps) {
  // Unique values for filters
  const uniqueCities = useMemo(() => {
    if (!matrix) return [];
    const cities = new Set<string>();
    matrix.companies.forEach((company) => {
      if (company.city) {
        cities.add(company.city);
      }
    });
    return Array.from(cities).sort();
  }, [matrix]);

  const uniqueSectors = useMemo(() => {
    if (!matrix) return [];
    const sectors = new Set<string>();
    matrix.companies.forEach((company) => {
      if (company.sector) {
        sectors.add(company.sector);
      }
    });
    return Array.from(sectors).sort();
  }, [matrix]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.programId || filters.city || filters.sector || filters.search);
  }, [filters]);

  const handleFilterChange = (key: keyof MatrixFilters, value: string | null) => {
    onFiltersChange({
      ...filters,
      [key]: value || null,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      programId: null,
      city: null,
      sector: null,
      search: null,
    });
  };

  if (!matrix || matrix.companies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Filtreler</h4>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Aktif
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearFilters}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Temizle
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Firma Ara</label>
          <Input
            placeholder="Firma adı..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || null)}
            className="h-9"
          />
        </div>

        {/* City Filter */}
        {uniqueCities.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Şehir</label>
            <Select
              value={filters.city || undefined}
              onValueChange={(value) => handleFilterChange('city', value || null)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tüm şehirler" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.city && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFilterChange('city', null)}
                className="h-6 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Temizle
              </Button>
            )}
          </div>
        )}

        {/* Sector Filter */}
        {uniqueSectors.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Sektör</label>
            <Select
              value={filters.sector || undefined}
              onValueChange={(value) => handleFilterChange('sector', value || null)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tüm sektörler" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.sector && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFilterChange('sector', null)}
                className="h-6 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Temizle
              </Button>
            )}
          </div>
        )}

        {/* Program Filter - Not implemented yet, placeholder */}
        {false && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Program</label>
            <Select
              value={filters.programId || undefined}
              onValueChange={(value) => handleFilterChange('programId', value || null)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tüm programlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tüm programlar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
