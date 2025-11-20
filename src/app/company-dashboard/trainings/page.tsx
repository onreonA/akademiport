/**
 * Company Trainings Page
 * Sprint 9: Training Management
 *
 * Company'nin atanan eğitimlerini görüntüleme sayfası
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { TrainingCard } from '@/presentation/components/features/trainings';
import { TrainingProgressBar } from '@/presentation/components/features/trainings';
import { AlertCircle, Filter, GraduationCap } from 'lucide-react';
import type { Training } from '@/domain/entities/Training';
import { toast } from 'sonner';
import { useAuth } from '@/5-shared/hooks/useAuth';

interface CompanyTrainingWithTraining {
  id: string;
  companyId: string;
  trainingId: string;
  assignedBy: string;
  assignedAt: Date;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  training: Training;
  progress?: number; // 0-100 (calculated separately)
  videosCount?: number;
  documentsCount?: number;
}

export default function CompanyTrainingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [trainings, setTrainings] = React.useState<CompanyTrainingWithTraining[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState({
    search: '',
    status: '',
  });
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  React.useEffect(() => {
    if (!authLoading && user?.companyId) {
      fetchTrainings();
    }
  }, [user, authLoading, filters, pagination.page, pagination.limit, fetchTrainings]);

  const fetchTrainings = React.useCallback(async () => {
    if (!user?.companyId) {
      setError('Firma bilgisi bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/companies/${user.companyId}/trainings`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eğitimler yüklenemedi');
      }

      // Map trainings - API already returns CompanyTrainingWithTraining format
      const companyTrainings: CompanyTrainingWithTraining[] = (data.trainings || []).map(
        (ct: any) => ({
          id: ct.id,
          companyId: ct.companyId,
          trainingId: ct.trainingId,
          assignedBy: ct.assignedBy,
          assignedAt: new Date(ct.assignedAt),
          status: ct.status || 'assigned',
          createdAt: new Date(ct.createdAt),
          updatedAt: new Date(ct.updatedAt),
          training: ct.training, // Training object is already included
          progress: 0, // Will be calculated from progress API
          videosCount: ct.videosCount || 0,
          documentsCount: ct.documentsCount || 0,
        })
      );

      setTrainings(companyTrainings);
      setPagination((prev) => ({ ...prev, total: companyTrainings.length }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      toast.error(err instanceof Error ? err.message : 'Eğitimler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const filteredTrainings = React.useMemo(() => {
    let filtered = trainings;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (ct) =>
          ct.training.name.toLowerCase().includes(searchLower) ||
          ct.training.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((ct) => ct.status === filters.status);
    }

    return filtered;
  }, [trainings, filters]);

  const totalPages = Math.ceil(filteredTrainings.length / pagination.limit);
  const paginatedTrainings = filteredTrainings.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const stats = React.useMemo(() => {
    const total = trainings.length;
    const completed = trainings.filter((t) => t.status === 'completed').length;
    const inProgress = trainings.filter((t) => t.status === 'in_progress').length;
    const assigned = trainings.filter((t) => t.status === 'assigned').length;
    const averageProgress =
      trainings.length > 0
        ? trainings.reduce((sum, t) => sum + (t.progress || 0), 0) / trainings.length
        : 0;

    return { total, completed, inProgress, assigned, averageProgress };
  }, [trainings]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Eğitimler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!user?.companyId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Erişim Hatası</h3>
            <p className="text-gray-600 dark:text-gray-400">Firma bilgisi bulunamadı</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Eğitimlerim
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              Size atanan eğitimleri görüntüleyin ve takip edin
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {stats.total} eğitim • {stats.completed} tamamlandı • {stats.inProgress} devam
                ediyor
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Eğitim</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tamamlanan</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.completed}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Devam Eden</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.inProgress}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ortalama İlerleme</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(stats.averageProgress)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        {stats.total > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Genel İlerleme
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {Math.round(stats.averageProgress)}%
                </span>
              </div>
              <TrainingProgressBar progress={stats.averageProgress} size="lg" />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                <Filter className="h-4 w-4" />
                Arama
              </label>
              <input
                type="text"
                placeholder="Eğitim ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Durum</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">Tümü</option>
                <option value="assigned">Atanmış</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
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
                <button
                  onClick={() => fetchTrainings()}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 shadow-sm"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        ) : paginatedTrainings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Eğitim Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {filters.search || filters.status
                ? 'Arama kriterlerinize uygun eğitim bulunamadı.'
                : 'Henüz size atanmış bir eğitim bulunmuyor.'}
            </p>
          </div>
        ) : (
          <>
            {/* Trainings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTrainings.map((companyTraining) => (
                <div key={companyTraining.id} className="space-y-3">
                  <TrainingCard
                    training={companyTraining.training}
                    onClick={(t) => router.push(`/company-dashboard/trainings/${t.id}`)}
                    progress={companyTraining.progress}
                    videosCount={companyTraining.videosCount}
                    documentsCount={companyTraining.documentsCount}
                  />
                  {companyTraining.progress !== undefined && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-sm">
                      <TrainingProgressBar
                        progress={companyTraining.progress}
                        label="İlerleme"
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Önceki
                </button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-md transition-colors shadow-sm ${
                          pagination.page === pageNum
                            ? 'bg-primary text-white'
                            : 'border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
