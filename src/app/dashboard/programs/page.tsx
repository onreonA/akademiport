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
import {
  ProgramFilters,
  type ProgramFilterValues,
} from '@/presentation/components/features/programs/ProgramFilters';
import { Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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
        // Extract error message properly
        let errorMessage = 'Program silinemedi';

        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (typeof data.error === 'object' && data.error !== null) {
            // If error is an object, try to extract message
            if ('message' in data.error) {
              errorMessage = String(data.error.message);
            } else {
              errorMessage = JSON.stringify(data.error);
            }
          } else {
            errorMessage = String(data.error);
          }
        }

        throw new Error(errorMessage);
      }

      // Refresh list
      fetchPrograms();

      // Show success message
      toast.success('Program başarıyla silindi');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Program silinirken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Programlar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              Tüm e-ihracat dönüşüm programlarını yönetin
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {pagination.total} program • Sayfa {pagination.page} / {pagination.totalPages}
              </div>
            </div>
          </div>
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/dashboard/programs/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Program
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
          <ProgramFilters onFilterChange={handleFilterChange} initialFilters={filters} />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                Programlar yükleniyor...
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Hata Oluştu
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <Button onClick={fetchPrograms} variant="outline">
                  Tekrar Dene
                </Button>
              </div>
            </div>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
              <Plus className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Program Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Henüz hiç program oluşturulmamış. İlk programınızı oluşturarak başlayın.
            </p>
            <Button asChild variant="outline">
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
                <ProgramCard key={program.id} program={program} onDelete={handleDelete} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
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
    </div>
  );
}
