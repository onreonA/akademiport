/**
 * Custom Reports Management Page
 *
 * Kullanıcıların özel raporlarını görüntüleme, oluşturma ve yönetme sayfası
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/atoms/table';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/atoms/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/atoms/dropdown-menu';
import { CustomReportBuilder } from '@/1-presentation/components/features/reports/CustomReportBuilder';
import { Plus, MoreVertical, Edit, Trash2, FileText, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface CustomReport {
  id: string;
  name: string;
  description: string | null;
  reportType: string;
  status: string;
  selectedMetrics: string[];
  dateRangeType: string;
  isScheduled: boolean;
  lastGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  saved: 'Kaydedilmiş',
  scheduled: 'Zamanlanmış',
  archived: 'Arşivlenmiş',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500',
  saved: 'bg-blue-500',
  scheduled: 'bg-green-500',
  archived: 'bg-gray-400',
};

export default function CustomReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/custom-reports');
      if (!response.ok) {
        throw new Error('Raporlar yüklenemedi');
      }
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      toast.error('Raporlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/custom-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Rapor oluşturulamadı');
      }

      toast.success('Rapor başarıyla oluşturuldu');
      setIsCreateDialogOpen(false);
      loadReports();
    } catch (error: any) {
      toast.error(error.message || 'Rapor oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-reports/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Rapor silinemedi');
      }

      toast.success('Rapor başarıyla silindi');
      loadReports();
    } catch (error) {
      toast.error('Rapor silinemedi');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/reports/custom/${id}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Özel Raporlar</h1>
          <p className="text-muted-foreground mt-1">
            Kendi özel raporlarınızı oluşturun ve yönetin
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Rapor Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Özel Rapor Oluştur</DialogTitle>
              <DialogDescription>
                Raporunuz için metrikleri, tarih aralığını ve diğer ayarları seçin
              </DialogDescription>
            </DialogHeader>
            <CustomReportBuilder
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Raporlarım</CardTitle>
          <CardDescription>Oluşturduğunuz özel raporların listesi</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Henüz rapor oluşturmadınız</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                İlk Raporunuzu Oluşturun
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rapor Adı</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Metrikler</TableHead>
                  <TableHead>Tarih Aralığı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Oluşturulma</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.reportType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {report.selectedMetrics.slice(0, 2).map((metric) => (
                          <Badge key={metric} variant="secondary" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                        {report.selectedMetrics.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{report.selectedMetrics.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {report.dateRangeType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[report.status] || 'bg-gray-500'}>
                        {STATUS_LABELS[report.status] || report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.lastGeneratedAt ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(report.lastGeneratedAt), 'dd MMM yyyy')}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Henüz oluşturulmadı</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(report.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(report.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
