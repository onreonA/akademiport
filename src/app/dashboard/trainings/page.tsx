/**
 * Trainings List Page
 *
 * Main page for viewing and managing trainings
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/presentation/components/ui/atoms/button';
import { TrainingCard } from '@/presentation/components/features/trainings';
import { Plus, AlertCircle, Filter } from 'lucide-react';
import type { Training } from '@/domain/entities/Training';
import { toast } from 'sonner';

export default function TrainingsPage() {
  const [trainings, setTrainings] = React.useState<Training[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState({
    search: '',
    status: '',
    priority: '',
    isGlobal: '',
  });
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  const fetchTrainings = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.isGlobal !== '') {
        params.append('isGlobal', filters.isGlobal === 'true' ? 'true' : 'false');
      }
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/trainings?${params.toString()}`);
      const data = await response.json();

      console.log('🔍 API Response:', { data, status: response.status });
      console.log('🔍 Trainings:', data.trainings);
      console.log('🔍 Total:', data.total);

      if (!response.ok) {
        throw new Error(data.error || 'Eğitimler yüklenemedi');
      }

      setTrainings(data.trainings || []);
      setPagination((prev) => ({ ...prev, total: data.total || 0 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      toast.error(err instanceof Error ? err.message : 'Eğitimler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleDelete = async (training: Training) => {
    if (!confirm(`"${training.name}" eğitimini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/trainings/${training.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eğitim silinemedi');
      }

      toast.success('Eğitim başarıyla silindi');
      fetchTrainings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eğitim silinirken bir hata oluştu');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Eğitimler
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              Tüm eğitimleri yönetin
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs md:text-sm text-muted-foreground">
                {pagination.total} eğitim • Sayfa {pagination.page} / {totalPages || 1}
              </div>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/dashboard/trainings/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Eğitim
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Arama
              </label>
              <input
                type="text"
                placeholder="Eğitim ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Tümü</option>
                <option value="draft">Taslak</option>
                <option value="active">Aktif</option>
                <option value="archived">Arşivlendi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Öncelik</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Tümü</option>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="critical">Kritik</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tip</label>
              <select
                value={filters.isGlobal}
                onChange={(e) => handleFilterChange('isGlobal', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Tümü</option>
                <option value="true">Global</option>
                <option value="false">Program Bazlı</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg text-muted-foreground">Eğitimler yükleniyor...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchTrainings} variant="outline">
                  Tekrar Dene
                </Button>
              </div>
            </div>
          </div>
        ) : trainings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Eğitim Bulunamadı</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Henüz hiç eğitim oluşturulmamış. İlk eğitiminizi oluşturarak başlayın.
            </p>
            <Button
              asChild
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Link href="/dashboard/trainings/new">
                <Plus className="mr-2 h-4 w-4" />
                İlk Eğitimi Oluştur
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Trainings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainings.map((training) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  onClick={(t) => (window.location.href = `/dashboard/trainings/${t.id}/edit`)}
                  onEdit={(t) => (window.location.href = `/dashboard/trainings/${t.id}/edit`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Önceki
                </Button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                  disabled={pagination.page >= totalPages}
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
