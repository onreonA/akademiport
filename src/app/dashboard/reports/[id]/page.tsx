/**
 * Report Detail Page
 *
 * Rapor detay sayfası - AI analizi, içerik ve PDF download
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
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  AlertTriangle,
  Lightbulb,
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
  subProjectId?: string | null;
  periodYear?: number | null;
  periodMonth?: number | null;
  content: Record<string, any>;
  aiAnalysis?: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    riskScore: number;
    successProbability: number;
  } | null;
  pdfUrl?: string | null;
  pdfGeneratedAt?: string | null;
  emailSent: boolean;
  emailSentAt?: string | null;
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

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = React.useState<string>('');

  React.useEffect(() => {
    params.then((p) => setReportId(p.id));
  }, [params]);

  useEffect(() => {
    if (!reportId) return;
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Rapor alınırken bir sorun oluştu.');
      }

      const data = await response.json();
      setReport(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      toast.error('Rapor yüklenemedi');
    } finally {
      setLoading(false);
    }
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

  const getRiskLevel = (score: number) => {
    if (score >= 75) return { level: 'Yüksek', color: 'text-red-600 dark:text-red-400' };
    if (score >= 50) return { level: 'Orta', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'Düşük', color: 'text-green-600 dark:text-green-400' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-400">{error || 'Rapor bulunamadı'}</p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/dashboard/reports')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Raporlara Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/reports')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {report.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{REPORT_TYPE_LABELS[report.reportType]}</Badge>
                <Badge className={STATUS_COLORS[report.status]}>
                  {STATUS_LABELS[report.status]}
                </Badge>
                {report.periodYear && report.periodMonth && (
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatPeriod(report.periodYear, report.periodMonth)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {report.pdfUrl && (
            <Button onClick={() => window.open(report.pdfUrl!, '_blank')} disabled={!report.pdfUrl}>
              <Download className="w-4 h-4 mr-2" />
              PDF İndir
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="content">İçerik</TabsTrigger>
            {report.aiAnalysis && <TabsTrigger value="analysis">AI Analizi</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Analysis Summary */}
            {report.aiAnalysis && (
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    AI Analiz Özeti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Özet</p>
                    <p className="text-gray-900 dark:text-white">{report.aiAnalysis.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Skoru</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {report.aiAnalysis.riskScore}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
                        <Badge
                          variant="outline"
                          className={getRiskLevel(report.aiAnalysis.riskScore).color}
                        >
                          {getRiskLevel(report.aiAnalysis.riskScore).level}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Başarı Olasılığı
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {report.aiAnalysis.successProbability}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Report Info */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Rapor Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Oluşturulma Tarihi
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {format(new Date(report.createdAt), 'dd MMMM yyyy HH:mm')}
                    </p>
                  </div>
                  {report.pdfGeneratedAt && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        PDF Oluşturulma Tarihi
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {format(new Date(report.pdfGeneratedAt), 'dd MMMM yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                  {report.emailSent && report.emailSentAt && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Email Gönderilme Tarihi
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {format(new Date(report.emailSentAt), 'dd MMMM yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Rapor İçeriği</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(report.content, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          {report.aiAnalysis && (
            <TabsContent value="analysis" className="space-y-6">
              {/* Summary */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle>Özet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 dark:text-white">{report.aiAnalysis.summary}</p>
                </CardContent>
              </Card>

              {/* Strengths */}
              {report.aiAnalysis.strengths.length > 0 && (
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Güçlü Yönler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.aiAnalysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                          <span className="text-gray-900 dark:text-white">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Weaknesses */}
              {report.aiAnalysis.weaknesses.length > 0 && (
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      Zayıf Yönler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.aiAnalysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                          <span className="text-gray-900 dark:text-white">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {report.aiAnalysis.recommendations.length > 0 && (
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Öneriler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.aiAnalysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                          <span className="text-gray-900 dark:text-white">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
