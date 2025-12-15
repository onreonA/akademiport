'use client';

import { useState, useEffect } from 'react';
import {
  useEcommerceMetrics,
  useCreateEcommerceMetrics,
  useUpdateEcommerceMetrics,
} from '@/1-presentation/hooks/useEcommerce';
import { EcommerceMetricsForm } from '@/1-presentation/components/features/ecommerce';
import { CreateEcommerceMetricsDto } from '@/2-application/dtos/ecommerce';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/atoms/dialog';
import { Plus, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  EcommercePlatformType,
  EcommercePlatformTypeLabels,
} from '@/3-domain/enums/EcommerceEnums';
import { EcommerceMetricsChart } from '@/1-presentation/components/features/analytics/EcommerceMetricsChart';

export default function CompanyEcommercePage() {
  const [companyId, setCompanyId] = useState<string>('');
  const [programId, setProgramId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMetrics, setEditingMetrics] = useState<any>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setIsLoadingUserData(true);
      const response = await fetch('/api/auth/me');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Auth me response:', data);

      // API returns { success: true, data: user } format
      const user = data.success ? data.data : data.user || data;

      if (user?.companyId) {
        setCompanyId(user.companyId);
        // Fetch company to get programId
        const companyResponse = await fetch(`/api/companies/${user.companyId}`);

        if (!companyResponse.ok) {
          throw new Error(`HTTP error! status: ${companyResponse.status}`);
        }

        const companyData = await companyResponse.json();
        console.log('Company response:', companyData);

        const company = companyData.success ? companyData.data : companyData;

        if (company?.programId) {
          setProgramId(company.programId);
        } else {
          console.error('Program ID not found in company data:', companyData);
          toast.error('Program bilgisi bulunamadı');
        }
      } else {
        console.error('Company ID not found in user data:', data);
        toast.error('Firma bilgisi bulunamadı');
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      toast.error('Kullanıcı bilgileri yüklenemedi');
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const {
    data: metricsData,
    isLoading,
    refetch,
  } = useEcommerceMetrics({
    companyId: companyId || undefined,
    programId: programId || undefined,
  });

  const createMetrics = useCreateEcommerceMetrics();
  const updateMetrics = useUpdateEcommerceMetrics();

  const handleCreate = async (data: CreateEcommerceMetricsDto) => {
    try {
      await createMetrics.mutateAsync(data);
      toast.success('Metrikler başarıyla kaydedildi');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Metrikler kaydedilemedi');
    }
  };

  const handleUpdate = async (data: CreateEcommerceMetricsDto) => {
    if (!editingMetrics) return;

    try {
      await updateMetrics.mutateAsync({
        id: editingMetrics.id,
        data: {
          alibabaVisitors: data.alibabaVisitors,
          alibabaProducts: data.alibabaProducts,
          alibabaRfqCount: data.alibabaRfqCount,
          alibabaOrders: data.alibabaOrders,
          alibabaRevenue: data.alibabaRevenue,
          b2cVisitors: data.b2cVisitors,
          b2cProducts: data.b2cProducts,
          b2cOrders: data.b2cOrders,
          b2cRevenue: data.b2cRevenue,
          notes: data.notes,
        },
      });
      toast.success('Metrikler başarıyla güncellendi');
      setEditingMetrics(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Metrikler güncellenemedi');
    }
  };

  const metrics = metricsData?.metrics || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              E-ticaret Metrikleri
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Aylık e-ticaret verilerinizi giriniz ve performansınızı takip edin
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Metrik Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni E-ticaret Metrikleri</DialogTitle>
                <DialogDescription>
                  Bu ay için e-ticaret metriklerinizi giriniz. Her platform için ayrı kayıt
                  oluşturabilirsiniz.
                </DialogDescription>
              </DialogHeader>
              {isLoadingUserData ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Firma ve program bilgileri yükleniyor...</p>
                </div>
              ) : companyId && programId ? (
                <EcommerceMetricsForm
                  companyId={companyId}
                  programId={programId}
                  onSubmit={handleCreate}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isSubmitting={createMetrics.isPending}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">Firma veya program bilgisi bulunamadı.</p>
                  <Button onClick={fetchCurrentUser} variant="outline">
                    Tekrar Dene
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Metrics Chart */}
        {metrics.length > 0 && (
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                E-ticaret Trend Analizi
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Aylık gelir, sipariş ve ziyaretçi trendinizi görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EcommerceMetricsChart
                data={metrics
                  .sort((a: any, b: any) => {
                    const dateA = new Date(a.periodYear, a.periodMonth - 1);
                    const dateB = new Date(b.periodYear, b.periodMonth - 1);
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map((metric: any) => ({
                    month: `${metric.periodYear}-${String(metric.periodMonth).padStart(2, '0')}`,
                    revenue:
                      metric.platformType === EcommercePlatformType.ALIBABA
                        ? metric.alibabaRevenue
                        : metric.b2cRevenue,
                    orders:
                      metric.platformType === EcommercePlatformType.ALIBABA
                        ? metric.alibabaOrders
                        : metric.b2cOrders,
                    visitors:
                      metric.platformType === EcommercePlatformType.ALIBABA
                        ? metric.alibabaVisitors
                        : metric.b2cVisitors,
                  }))}
                height={400}
              />
            </CardContent>
          </Card>
        )}

        {/* Metrics List */}
        {metrics.length === 0 ? (
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Henüz Metrik Kaydı Yok
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    E-ticaret performansınızı takip etmek için ilk metrik kaydınızı oluşturun
                  </p>
                </div>
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Metrik Kaydını Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Metrik Kayıtları
            </h2>
            {metrics.map((metric: any) => (
              <Card
                key={metric.id}
                className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {metric.periodYear} - {metric.periodMonth}. Ay -{' '}
                        {EcommercePlatformTypeLabels[metric.platformType as EcommercePlatformType]}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(metric.createdAt).toLocaleDateString('tr-TR')} tarihinde
                        oluşturuldu
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMetrics(metric)}
                      className="shrink-0"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Düzenle
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {metric.platformType === EcommercePlatformType.ALIBABA ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ziyaretçi</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.alibabaVisitors.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ürün</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.alibabaProducts.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">RFQ</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.alibabaRfqCount.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sipariş</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.alibabaOrders.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gelir</p>
                        <p className="text-2xl font-bold text-primary">
                          {metric.alibabaRevenue.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ziyaretçi</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.b2cVisitors.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ürün</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.b2cProducts.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sipariş</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.b2cOrders.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gelir</p>
                        <p className="text-2xl font-bold text-primary">
                          {metric.b2cRevenue.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {metric.notes && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notlar:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{metric.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        {editingMetrics && (
          <Dialog open={!!editingMetrics} onOpenChange={(open) => !open && setEditingMetrics(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Metrikleri Düzenle</DialogTitle>
                <DialogDescription>
                  E-ticaret metriklerinizi güncelleyebilirsiniz.
                </DialogDescription>
              </DialogHeader>
              <EcommerceMetricsForm
                metrics={editingMetrics}
                companyId={companyId}
                programId={programId}
                onSubmit={handleUpdate}
                onCancel={() => setEditingMetrics(null)}
                isSubmitting={updateMetrics.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
