/**
 * Reports List Page
 *
 * AI destekli rapor listesi ve yönetimi
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
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface Report {
  id: string;
  title: string;
  reportType: 'interim' | 'monthly' | 'program' | 'company' | 'ministry';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  companyId?: string | null;
  programId?: string | null;
  projectId?: string | null;
  periodYear?: number | null;
  periodMonth?: number | null;
  pdfUrl?: string | null;
  emailSent: boolean;
  aiAnalysis?: {
    summary: string;
    riskScore: number;
    successProbability: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  interim: 'Ara Rapor',
  monthly: 'Aylık Rapor',
  program: 'Program Raporu',
  company: 'Firma Raporu',
  ministry: 'Bakanlık Raporu',
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

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (reportTypeFilter !== 'all') {
        params.append('reportType', reportTypeFilter);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('limit', limit.toString());
      params.append('offset', ((page - 1) * limit).toString());

      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Raporlar alınırken bir sorun oluştu.');
      }

      const data = await response.json();
      setReports(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      toast.error('Raporlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [reportTypeFilter, statusFilter, page, limit]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleFilterChange = () => {
    setPage(1);
    fetchReports();
  };

  const handleGenerateReport = async () => {
    router.push('/dashboard/reports/generate');
  };

  const formatPeriod = (year?: number | null, month?: number | null) => {
    if (!year || !month) return null;
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

  const filteredReports = reports.filter((report) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.title.toLowerCase().includes(searchLower) ||
        REPORT_TYPE_LABELS[report.reportType]?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Raporlar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              AI destekli ilerleme raporları ve analizler
            </p>
          </div>
          <Button onClick={handleGenerateReport} className="w-full md:w-auto">
            <FileText className="w-4 h-4 mr-2" />
            Yeni Rapor Oluştur
          </Button>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ara</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rapor ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rapor Tipi
                </label>
                <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm Tipler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Tipler</SelectItem>
                    <SelectItem value="interim">Ara Rapor</SelectItem>
                    <SelectItem value="monthly">Aylık Rapor</SelectItem>
                    <SelectItem value="program">Program Raporu</SelectItem>
                    <SelectItem value="company">Firma Raporu</SelectItem>
                    <SelectItem value="ministry">Bakanlık Raporu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Durum
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm Durumlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="generating">Oluşturuluyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleFilterChange} variant="outline" size="sm">
                Filtrele
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-400">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-gray-200 dark:border-gray-800 shadow-sm">
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
        )}

        {/* Reports List */}
        {!loading && !error && (
          <>
            {filteredReports.length === 0 ? (
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Henüz rapor yok
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    İlk raporunuzu oluşturmak için yukarıdaki butona tıklayın.
                  </p>
                  <Button onClick={handleGenerateReport}>
                    <FileText className="w-4 h-4 mr-2" />
                    Yeni Rapor Oluştur
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 line-clamp-2">
                            {report.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {REPORT_TYPE_LABELS[report.reportType]}
                            </Badge>
                            <Badge className={`text-xs ${STATUS_COLORS[report.status]}`}>
                              <span className="flex items-center gap-1">
                                {STATUS_ICONS[report.status]}
                                {STATUS_LABELS[report.status]}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {report.periodYear && report.periodMonth && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{formatPeriod(report.periodYear, report.periodMonth)}</span>
                          </div>
                        )}
                        {report.aiAnalysis && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Risk: {report.aiAnalysis.riskScore}/100
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Başarı: {report.aiAnalysis.successProbability}%
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(report.createdAt), 'dd MMM yyyy')}
                          </span>
                          {report.pdfUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(report.pdfUrl!, '_blank');
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
    </div>
  );
}
