'use client';

/**
 * Companies List Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/presentation/components/ui/atoms/button';
import { CompanyCard, CompanyFilters } from '@/presentation/components/features/companies';
import type { Company } from '@/domain/entities/Company';

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [sector, setSector] = useState('all');
  const [isActive, setIsActive] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const limit = 12;

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder: 'desc',
      });

      if (search) params.append('search', search);
      if (city !== 'all') params.append('city', city);
      if (sector !== 'all') params.append('sector', sector);
      if (isActive !== 'all') params.append('isActive', isActive);

      const response = await fetch(`/api/companies?${params}`, {
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        // If response is not ok, try to parse error message
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to fetch companies' }));
        console.error('Failed to fetch companies:', errorData);
        setCompanies([]);
        setTotal(0);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setCompanies(data.data || []);
        setTotal(data.total || 0);
      } else {
        console.error('API returned error:', data.error);
        setCompanies([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      setCompanies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, city, sector, isActive, sortBy, page]);

  // Fetch companies
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleReset = () => {
    setSearch('');
    setCity('all');
    setSector('all');
    setIsActive('all');
    setSortBy('createdAt');
    setPage(1);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/companies/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu firmayı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Extract error message properly
        let errorMessage = 'Firma silinemedi';

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
      fetchCompanies();
      toast.success('Firma başarıyla silindi');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Firma silinirken bir hata oluştu';
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
              Firmalar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              Tüm firmaları görüntüleyin ve yönetin
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {total} firma • Sayfa {page} / {Math.ceil(total / limit)}
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push('/dashboard/companies/new')}
            size="sm"
            className="shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Firma
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
          <CompanyFilters
            search={search}
            city={city}
            sector={sector}
            isActive={isActive}
            sortBy={sortBy}
            onSearchChange={setSearch}
            onCityChange={setCity}
            onSectorChange={setSector}
            onIsActiveChange={setIsActive}
            onSortByChange={setSortBy}
            onReset={handleReset}
          />
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Firmalar yükleniyor...</div>
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
              <Plus className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Firma Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Henüz hiç firma kaydı oluşturulmamış. İlk firmanızı ekleyerek başlayın.
            </p>
            <Button onClick={() => router.push('/dashboard/companies/new')} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              İlk Firmayı Ekle
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
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
