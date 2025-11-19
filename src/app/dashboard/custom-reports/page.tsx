/**
 * Custom Reports List Page
 *
 * Özel rapor listesi ve yönetimi
 */

'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';
import {
  FileText,
  Loader2,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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

export default function CustomReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) {
        // Search will be handled on backend if needed
      }

      if (filterType !== 'all') {
        params.append('reportType', filterType);
      }

      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/custom-reports?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Raporlar yüklenemedi');
      }

      setReports(data.reports || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      toast.error(error.message || 'Raporlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, filterType, filterStatus]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-reports/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Rapor silinemedi');
      }

      toast.success('Rapor başarıyla silindi');
      fetchReports();
    } catch (error: any) {
      toast.error(error.message || 'Rapor silinemedi');
    }
  };

  const handleExport = async (id: string) => {
    try {
      const response = await fetch(`/api/custom-reports/${id}/export?format=pdf`);
      if (!response.ok) {
        throw new Error('Export başarısız');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Rapor başarıyla indirildi');
    } catch (error: any) {
      toast.error(error.message || 'Rapor indirilemedi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Özel Raporlar</h1>
          <p className="text-muted-foreground mt-2">
            Özel raporlarınızı oluşturun, yönetin ve görüntüleyin
          </p>
        </div>
        <Link href="/dashboard/custom-reports/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Rapor Oluştur
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Rapor ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-[200px]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Rapor Tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tipler</SelectItem>
                  {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz rapor yok</h3>
            <p className="text-muted-foreground mb-4">
              İlk özel raporunuzu oluşturmak için yukarıdaki butona tıklayın.
            </p>
            <Link href="/dashboard/custom-reports/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Rapor Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {REPORT_TYPE_LABELS[report.reportType]}
                      </CardDescription>
                    </div>
                    <Badge className={STATUS_COLORS[report.status]}>
                      {STATUS_LABELS[report.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {report.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {report.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(report.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </span>
                    </div>
                    {report.selectedMetrics.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {report.selectedMetrics.length} metrik seçildi
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/custom-reports/${report.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Görüntüle
                      </Button>
                    </Link>
                    <Link href={`/dashboard/custom-reports/${report.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleExport(report.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(report.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Toplam {total} rapor, sayfa {page} / {Math.ceil(total / limit)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
