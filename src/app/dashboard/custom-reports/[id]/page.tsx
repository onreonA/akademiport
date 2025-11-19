/**
 * Custom Report Detail Page
 *
 * Özel rapor detay sayfası - Görüntüleme ve export
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/atoms/tabs';
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Calendar,
  Building2,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface CustomReport {
  id: string;
  name: string;
  description?: string | null;
  reportType: 'dashboard' | 'company' | 'program' | 'custom';
  status: 'draft' | 'saved' | 'scheduled' | 'archived';
  programId?: string | null;
  companyId?: string | null;
  selectedMetrics: string[];
  dateRangeType: string;
  dateRangeStart?: string | null;
  dateRangeEnd?: string | null;
  isScheduled: boolean;
  scheduleCron?: string | null;
  scheduleTimezone?: string | null;
  filters?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard Raporu',
  company: 'Firma Raporu',
  program: 'Program Raporu',
  custom: 'Özel Rapor',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  saved: 'Kaydedildi',
  scheduled: 'Zamanlanmış',
  archived: 'Arşivlendi',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500',
  saved: 'bg-green-500',
  scheduled: 'bg-blue-500',
  archived: 'bg-gray-400',
};

const METRIC_LABELS: Record<string, string> = {
  user_growth: 'Kullanıcı Büyümesi',
  program_activity: 'Program Aktivitesi',
  company_distribution: 'Firma Dağılımı',
  task_completion: 'Görev Tamamlanma',
  company_performance: 'Firma Performansı',
  project_progress: 'Proje İlerlemesi',
  training_completion: 'Eğitim Tamamlanma',
  ecommerce_metrics: 'E-Ticaret Metrikleri',
};

export default function CustomReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [report, setReport] = useState<CustomReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = React.useState<string>('');

  React.useEffect(() => {
    params.then((p) => setReportId(p.id));
  }, [params]);

  useEffect(() => {
    if (!reportId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/custom-reports/${reportId}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Rapor yüklenemedi');
        }

        const data = await response.json();
        setReport(data);
      } catch (error: any) {
        toast.error(error.message || 'Rapor yüklenemedi');
        router.push('/dashboard/custom-reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, router]);

  const handleDelete = async () => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Rapor silinemedi');
      }

      toast.success('Rapor başarıyla silindi');
      router.push('/dashboard/custom-reports');
    } catch (error: any) {
      toast.error(error.message || 'Rapor silinemedi');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/custom-reports/${reportId}/export?format=${format}`);
      if (!response.ok) {
        throw new Error('Export başarısız');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-report-${reportId}.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Rapor başarıyla indirildi');
    } catch (error: any) {
      toast.error(error.message || 'Rapor indirilemedi');
    }
  };

  const formatDateRange = () => {
    if (!report) return null;

    if (report.dateRangeType === 'custom' && report.dateRangeStart && report.dateRangeEnd) {
      return `${format(new Date(report.dateRangeStart), 'dd MMM yyyy', { locale: tr })} - ${format(new Date(report.dateRangeEnd), 'dd MMM yyyy', { locale: tr })}`;
    }

    const rangeLabels: Record<string, string> = {
      last_7_days: 'Son 7 Gün',
      last_30_days: 'Son 30 Gün',
      last_90_days: 'Son 90 Gün',
      last_year: 'Son 1 Yıl',
      all_time: 'Tüm Zamanlar',
    };

    return rangeLabels[report.dateRangeType] || report.dateRangeType;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Rapor bulunamadı</h3>
            <p className="text-muted-foreground mb-4">
              Aradığınız rapor bulunamadı veya silinmiş olabilir.
            </p>
            <Link href="/dashboard/custom-reports">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Raporlara Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/custom-reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri Dön
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{report.name}</h1>
              <Badge className={STATUS_COLORS[report.status]}>{STATUS_LABELS[report.status]}</Badge>
            </div>
            <p className="text-muted-foreground mt-2">{REPORT_TYPE_LABELS[report.reportType]}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/custom-reports/${reportId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </Link>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel İndir
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>
        </div>
      </div>

      {/* Report Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="metrics">Metrikler</TabsTrigger>
          <TabsTrigger value="settings">Ayarlar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapor Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Açıklama</h3>
                  <p className="text-sm">{report.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Rapor Tipi</h3>
                  <p className="text-sm">{REPORT_TYPE_LABELS[report.reportType]}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Durum</h3>
                  <Badge className={STATUS_COLORS[report.status]}>
                    {STATUS_LABELS[report.status]}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tarih Aralığı</h3>
                  <p className="text-sm">{formatDateRange()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Oluşturulma</h3>
                  <p className="text-sm">
                    {format(new Date(report.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seçili Metrikler</CardTitle>
              <CardDescription>
                Bu raporda görüntülenen metrikler ({report.selectedMetrics.length} adet)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.selectedMetrics.map((metricId) => (
                  <div key={metricId} className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">
                      {METRIC_LABELS[metricId] || metricId}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapor Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Zamanlanmış</h3>
                  <p className="text-sm">{report.isScheduled ? 'Evet' : 'Hayır'}</p>
                </div>
                {report.isScheduled && report.scheduleCron && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Cron Expression
                      </h3>
                      <p className="text-sm font-mono">{report.scheduleCron}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Timezone</h3>
                      <p className="text-sm">{report.scheduleTimezone || 'Europe/Istanbul'}</p>
                    </div>
                  </>
                )}
              </div>

              {report.filters && Object.keys(report.filters).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Filtreler</h3>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                    {JSON.stringify(report.filters, null, 2)}
                  </pre>
                </div>
              )}

              {report.metadata && Object.keys(report.metadata).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h3>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                    {JSON.stringify(report.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
