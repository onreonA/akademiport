/**
 * Programs List Page
 * 
 * Main page for viewing and managing programs
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Spinner } from '@/presentation/components/ui/atoms/spinner';
import { ProgramCard } from '@/presentation/components/features/programs/ProgramCard';
import { ProgramFilters, type ProgramFilterValues } from '@/presentation/components/features/programs/ProgramFilters';
import { Plus, AlertCircle } from 'lucide-react';
import type { Program } from '@/domain/entities/Program';

export default function ProgramsPage() {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<ProgramFilterValues>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchPrograms = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.city) params.append('city', filters.city);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/programs?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Programlar yüklenemedi');
      }

      setPrograms(data.data || []);
      if (data.pagination) {
        setPagination((prev) => ({ ...prev, ...data.pagination }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleFilterChange = (newFilters: ProgramFilterValues) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleDelete = async (program: Program) => {
    if (!confirm(`"${program.name}" programını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/programs/${program.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Program silinemedi');
      }

      // Refresh list
      fetchPrograms();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Program silinirken bir hata oluştu');
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programlar</h1>
          <p className="text-muted-foreground">
            Tüm e-ihracat dönüşüm programlarını yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/programs/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Program
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <ProgramFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-medium">{error}</p>
          <Button onClick={fetchPrograms}>Tekrar Dene</Button>
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-lg text-muted-foreground">Program bulunamadı</p>
          <Button asChild>
            <Link href="/dashboard/programs/new">
              <Plus className="mr-2 h-4 w-4" />
              İlk Programı Oluştur
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Önceki
              </Button>
              <span className="text-sm text-muted-foreground">
                Sayfa {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

