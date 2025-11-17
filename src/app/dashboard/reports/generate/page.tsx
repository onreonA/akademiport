/**
 * Generate Report Page
 *
 * Yeni rapor oluşturma sayfası
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { ArrowLeft, FileText, Loader2, Calendar, Building2, FolderKanban } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'monthly', label: 'Aylık Rapor' },
  { value: 'interim', label: 'Ara Rapor' },
  { value: 'program', label: 'Program Raporu' },
  { value: 'company', label: 'Firma Raporu' },
  { value: 'ministry', label: 'Bakanlık Raporu' },
];

const MONTHS = [
  { value: '1', label: 'Ocak' },
  { value: '2', label: 'Şubat' },
  { value: '3', label: 'Mart' },
  { value: '4', label: 'Nisan' },
  { value: '5', label: 'Mayıs' },
  { value: '6', label: 'Haziran' },
  { value: '7', label: 'Temmuz' },
  { value: '8', label: 'Ağustos' },
  { value: '9', label: 'Eylül' },
  { value: '10', label: 'Ekim' },
  { value: '11', label: 'Kasım' },
  { value: '12', label: 'Aralık' },
];

export default function GenerateReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportType: 'monthly',
    companyId: '',
    programId: '',
    projectId: '',
    subProjectId: '',
    periodYear: new Date().getFullYear(),
    periodMonth: new Date().getMonth() + 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        reportType: formData.reportType,
      };

      if (formData.companyId) payload.companyId = formData.companyId;
      if (formData.programId) payload.programId = formData.programId;
      if (formData.projectId) payload.projectId = formData.projectId;
      if (formData.subProjectId) payload.subProjectId = formData.subProjectId;

      if (formData.reportType === 'monthly') {
        payload.periodYear = formData.periodYear;
        payload.periodMonth = formData.periodMonth;
      }

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Rapor oluşturulamadı');
      }

      const data = await response.json();
      toast.success('Rapor oluşturuluyor...');
      router.push(`/dashboard/reports/${data.reportId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rapor oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/reports')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Rapor Oluştur
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mt-1">
              AI destekli rapor oluşturma
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Rapor Bilgileri</CardTitle>
            <CardDescription>Rapor tipini seçin ve gerekli bilgileri doldurun</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="reportType">Rapor Tipi *</Label>
                <Select
                  value={formData.reportType}
                  onValueChange={(value) => setFormData({ ...formData, reportType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rapor tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Monthly Report Period */}
              {formData.reportType === 'monthly' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodYear">Yıl *</Label>
                    <Input
                      id="periodYear"
                      type="number"
                      min="2020"
                      max="2100"
                      value={formData.periodYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          periodYear: parseInt(e.target.value) || new Date().getFullYear(),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodMonth">Ay *</Label>
                    <Select
                      value={formData.periodMonth.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, periodMonth: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ay seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Company ID (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="companyId">Firma ID (Opsiyonel)</Label>
                <Input
                  id="companyId"
                  placeholder="Firma ID"
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                />
              </div>

              {/* Program ID (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="programId">Program ID (Opsiyonel)</Label>
                <Input
                  id="programId"
                  placeholder="Program ID"
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                />
              </div>

              {/* Project ID (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="projectId">Proje ID (Opsiyonel)</Label>
                <Input
                  id="projectId"
                  placeholder="Proje ID"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                />
              </div>

              {/* Sub Project ID (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="subProjectId">Alt Proje ID (Opsiyonel)</Label>
                <Input
                  id="subProjectId"
                  placeholder="Alt Proje ID"
                  value={formData.subProjectId}
                  onChange={(e) => setFormData({ ...formData, subProjectId: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/reports')}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Rapor Oluştur
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
