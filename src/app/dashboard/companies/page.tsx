'use client';

/**
 * Companies List Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
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

  // Fetch companies
  useEffect(() => {
    fetchCompanies();
  }, [search, city, sector, isActive, sortBy, page]);

  const fetchCompanies = async () => {
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

      const response = await fetch(`/api/companies?${params}`);
      const data = await response.json();

      if (data.success) {
        setCompanies(data.data);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

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

      if (data.success) {
        fetchCompanies();
      } else {
        alert(data.error || 'Firma silinemedi');
      }
    } catch (error) {
      console.error('Failed to delete company:', error);
      alert('Firma silinemedi');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Firmalar
            </h1>
            <p className="text-muted-foreground text-lg">Tüm firmaları görüntüleyin ve yönetin</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-sm text-muted-foreground">
                {total} firma • Sayfa {page} / {Math.ceil(total / limit)}
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push('/dashboard/companies/new')}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Firma
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6 shadow-lg">
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
              <div className="text-lg text-muted-foreground">Firmalar yükleniyor...</div>
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Firma Bulunamadı</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Henüz hiç firma kaydı oluşturulmamış. İlk firmanızı ekleyerek başlayın.
            </p>
            <Button
              onClick={() => router.push('/dashboard/companies/new')}
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
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
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
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
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
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
