/**
 * Company Dashboard Reports Page
 *
 * Company user'lar için rapor görüntüleme sayfası
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import {
  FileText,
  Loader2,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';

interface Report {
  id: string;
  title: string;
  reportType: 'interim' | 'monthly' | 'program' | 'company';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  periodYear?: number | null;
  periodMonth?: number | null;
  pdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  interim: 'Ara Rapor',
  monthly: 'Aylık Rapor',
  program: 'Program Raporu',
  company: 'Firma Raporu',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Bekliyor',
  generating: 'Oluşturuluyor',
  completed: 'Tamamlandı',
  failed: 'Başarısız',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  generating: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  generating: <Loader2 className="w-4 h-4 animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  failed: <XCircle className="w-4 h-4" />,
};

export default function CompanyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Company user için sadece kendi company'sine ait raporları getir
      const response = await fetch('/api/reports?limit=50');
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Raporlar alınırken bir sorun oluştu.');
      }

      const data = await response.json();
      setReports(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      toast.error('Raporlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatPeriod = (year?: number | null, month?: number | null) => {
    if (!year || !month) return '-';
    const monthNames = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  const handleDownload = async (reportId: string, pdfUrl: string) => {
    try {
      window.open(pdfUrl, '_blank');
    } catch (err) {
      toast.error('PDF indirilemedi');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
          <p className="text-muted-foreground mt-2">Firma raporlarını görüntüleyin</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
          <p className="text-muted-foreground mt-2">Firma raporlarını görüntüleyin</p>
        </div>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
        <p className="text-muted-foreground mt-2">Firma raporlarını görüntüleyin</p>
      </div>

      {reports.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Henüz rapor yok</h3>
          <p className="text-muted-foreground">
            Firma raporları oluşturulduğunda burada görünecektir.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.title || 'Rapor'}</CardTitle>
                    <CardDescription className="mt-1">
                      {REPORT_TYPE_LABELS[report.reportType] || report.reportType}
                    </CardDescription>
                  </div>
                  <Badge className={STATUS_COLORS[report.status]}>
                    <span className="flex items-center gap-1">
                      {STATUS_ICONS[report.status]}
                      {STATUS_LABELS[report.status]}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.periodYear && report.periodMonth && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatPeriod(report.periodYear, report.periodMonth)}</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Oluşturulma: {format(new Date(report.createdAt), 'dd MMM yyyy HH:mm')}
                </div>

                {report.status === 'completed' && report.pdfUrl && (
                  <Button
                    onClick={() => handleDownload(report.id, report.pdfUrl!)}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF İndir
                  </Button>
                )}

                {report.status === 'completed' && (
                  <Button
                    onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Detayları Görüntüle
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
