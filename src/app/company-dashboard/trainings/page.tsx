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
  }, [user, authLoading, filters, pagination.page, pagination.limit]);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg text-muted-foreground">Eğitimler yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">Erişim Hatası</h3>
              <p className="text-muted-foreground">Firma bilgisi bulunamadı</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Eğitimlerim
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              Size atanan eğitimleri görüntüleyin ve takip edin
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs md:text-sm text-muted-foreground">
                {stats.total} eğitim • {stats.completed} tamamlandı • {stats.inProgress} devam
                ediyor
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-600 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Toplam Eğitim</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 text-green-600 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tamamlanan</div>
                <div className="text-2xl font-bold">{stats.completed}</div>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 text-orange-600 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Devam Eden</div>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 text-purple-600 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ortalama İlerleme</div>
                <div className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        {stats.total > 0 && (
          <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Genel İlerleme</span>
                <span className="text-sm font-bold">{Math.round(stats.averageProgress)}%</span>
              </div>
              <TrainingProgressBar progress={stats.averageProgress} size="lg" />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button
                  onClick={() => fetchTrainings()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        ) : paginatedTrainings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Eğitim Bulunamadı</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
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
                    <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-3">
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
                  className="px-4 py-2 border rounded-md hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`w-10 h-10 rounded-md ${
                          pagination.page === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'border hover:bg-primary hover:text-primary-foreground'
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= totalPages}
                  className="px-4 py-2 border rounded-md hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
