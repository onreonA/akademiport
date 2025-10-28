'use client';

/**
 * Companies List Page
 * Sprint 6: Company Management
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  CompanyCard,
  CompanyFilters,
} from '@/presentation/components/features/companies';
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firmalar</h1>
          <p className="text-muted-foreground">Tüm firmaları görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={() => router.push('/dashboard/companies/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Firma
        </Button>
      </div>

      {/* Filters */}
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

      {/* Companies Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Firma bulunamadı</p>
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
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Önceki
              </Button>
              <span className="text-sm text-muted-foreground">
                Sayfa {page} / {Math.ceil(total / limit)}
              </span>
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
  );
}

