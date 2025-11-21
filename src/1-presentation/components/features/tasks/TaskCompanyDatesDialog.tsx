'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/atoms/dialog';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Input } from '@/presentation/components/ui/atoms/input';
import { ScrollArea } from '@/presentation/components/ui/atoms/scroll-area';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Calendar, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  city: string | null;
  sector: string | null;
  assigned: boolean;
  startDate: string | null;
  endDate: string | null;
}

interface TaskCompanyDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  onSubmit?: () => void;
  submitting?: boolean;
}

type DatesState = Record<string, { startDate: string | null; endDate: string | null }>;

export function TaskCompanyDatesDialog({
  open,
  onOpenChange,
  taskId,
  onSubmit,
  submitting = false,
}: TaskCompanyDatesDialogProps) {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [dates, setDates] = useState<DatesState>({});

  useEffect(() => {
    if (open && taskId) {
      fetchTaskCompanies();
    } else {
      setCompanies([]);
      setDates({});
      setTaskTitle('');
    }
  }, [open, taskId]);

  const fetchTaskCompanies = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/companies`);
      if (!response.ok) {
        throw new Error('Firmalar yüklenemedi');
      }

      const data = await response.json();
      setTaskTitle(data.task?.title || '');
      setCompanies(data.companies || []);

      // Mevcut tarihleri state'e yükle
      const initialDates: DatesState = {};
      (data.companies || []).forEach((company: Company) => {
        initialDates[company.id] = {
          startDate: company.startDate ?? null,
          endDate: company.endDate ?? null,
        };
      });
      setDates(initialDates);
    } catch (error) {
      console.error('Error fetching task companies:', error);
      toast.error('Firmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (companyId: string, field: 'startDate' | 'endDate', value: string) => {
    if (submitting) {
      return;
    }
    setDates((prev) => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [field]: value || null,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!taskId || submitting) {
      onOpenChange(false);
      return;
    }

    const payload = companies
      .filter((company) => company.assigned)
      .map((company) => {
        const companyDates = dates[company.id] ?? { startDate: null, endDate: null };
        return {
          companyId: company.id,
          startDate: companyDates.startDate ? new Date(companyDates.startDate).toISOString() : null,
          endDate: companyDates.endDate ? new Date(companyDates.endDate).toISOString() : null,
        };
      });

    try {
      const response = await fetch(`/api/tasks/${taskId}/dates/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates: payload }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Tarih atamaları kaydedilemedi');
      }

      const result = await response.json();
      toast.success('Tarih atamaları başarıyla kaydedildi', {
        description: `${result.updatedCount || 0} kayıt güncellendi`,
      });

      if (onSubmit) {
        onSubmit();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting task dates:', error);
      toast.error(error instanceof Error ? error.message : 'Tarih atamaları kaydedilemedi');
    }
  };

  const handleBulkDateAssign = () => {
    const startDate = prompt('Başlangıç tarihi (YYYY-MM-DD formatında):');
    const endDate = prompt('Bitiş tarihi (YYYY-MM-DD formatında):');

    if (!startDate || !endDate) return;

    const newDates: DatesState = {};
    companies.forEach((company) => {
      if (company.assigned) {
        newDates[company.id] = {
          startDate,
          endDate,
        };
      }
    });

    setDates((prev) => ({ ...prev, ...newDates }));
  };

  const handleShiftDates = () => {
    const daysInput = prompt('Kaç gün kaydırılacak? (+30 veya -10 gibi):');
    const days = parseInt(daysInput || '0', 10);

    if (isNaN(days) || days === 0) return;

    const newDates: DatesState = {};
    companies.forEach((company) => {
      if (company.assigned && dates[company.id]) {
        const currentStart = dates[company.id].startDate;
        const currentEnd = dates[company.id].endDate;

        if (currentStart && currentEnd) {
          const startDate = new Date(currentStart);
          const endDate = new Date(currentEnd);
          startDate.setDate(startDate.getDate() + days);
          endDate.setDate(endDate.getDate() + days);

          newDates[company.id] = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          };
        }
      }
    });

    setDates((prev) => ({ ...prev, ...newDates }));
  };

  const assignedCompaniesCount = useMemo(
    () => companies.filter((c) => c.assigned).length,
    [companies]
  );

  return (
    <Dialog open={open} onOpenChange={(value) => (!submitting ? onOpenChange(value) : null)}>
      <DialogContent className="max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <DialogTitle className="text-xl">Görev İçin Firma Bazlı Tarihleri Düzenle</DialogTitle>
          <DialogDescription className="text-sm">
            {taskTitle && <span className="font-medium text-foreground">{taskTitle}</span>} görevi
            için farklı firmalar farklı başlangıç ve bitiş tarihleriyle ilerleyebilir. Sadece alt
            projeye atanmış firmalar için tarih düzenleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Firmalar yükleniyor...</p>
              </div>
            </div>
          ) : companies.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Bu göreve atanmış firma bulunamadı. Önce alt projeye firma ataması yapmalısınız.
            </div>
          ) : (
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Firma Tarihleri ({assignedCompaniesCount} atanmış)
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDateAssign}
                    disabled={submitting || assignedCompaniesCount === 0}
                    className="text-xs"
                  >
                    <Calendar className="h-3 w-3 mr-1.5" />
                    Toplu Tarih Ata
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShiftDates}
                    disabled={submitting || assignedCompaniesCount === 0}
                    className="text-xs"
                  >
                    <ArrowRight className="h-3 w-3 mr-1.5" />
                    Tarihleri Kaydır
                  </Button>
                </div>
              </div>

              {/* Desktop: Tablo */}
              <div className="hidden md:block flex-1 min-h-0">
                <ScrollArea className="h-full rounded-lg border border-border/60 bg-card">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground w-56">
                          Firma
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground w-36">
                          Başlangıç
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground w-36">
                          Bitiş
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground w-40">
                          Durum
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company) => {
                        const companyDates = dates[company.id] ?? {
                          startDate: company.startDate,
                          endDate: company.endDate,
                        };
                        return (
                          <tr
                            key={company.id}
                            className="border-b last:border-b-0 even:bg-muted/20 hover:bg-muted/40 transition-colors"
                          >
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{company.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {company.city || 'Şehir bilgisi yok'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <Input
                                  type="date"
                                  value={companyDates.startDate ?? ''}
                                  onChange={(event) =>
                                    handleDateChange(company.id, 'startDate', event.target.value)
                                  }
                                  disabled={!company.assigned || submitting}
                                  className="w-full pr-8"
                                  placeholder="Başlangıç tarihi"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <Input
                                  type="date"
                                  value={companyDates.endDate ?? ''}
                                  onChange={(event) =>
                                    handleDateChange(company.id, 'endDate', event.target.value)
                                  }
                                  disabled={!company.assigned || submitting}
                                  className="w-full pr-8"
                                  placeholder="Bitiş tarihi"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {company.assigned ? (
                                <Badge
                                  variant="default"
                                  className="bg-primary/10 text-primary border-primary/20"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Atama mevcut
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-muted text-muted-foreground"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Atanmadı
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>

              {/* Mobil: Card Görünümü */}
              <div className="md:hidden space-y-3 overflow-y-auto flex-1">
                {companies.map((company) => {
                  const companyDates = dates[company.id] ?? {
                    startDate: company.startDate,
                    endDate: company.endDate,
                  };
                  return (
                    <Card key={company.id} className="border-border/60">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{company.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {company.city || 'Şehir bilgisi yok'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                              Başlangıç
                            </label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={companyDates.startDate ?? ''}
                                onChange={(event) =>
                                  handleDateChange(company.id, 'startDate', event.target.value)
                                }
                                disabled={!company.assigned || submitting}
                                className="w-full pr-8"
                              />
                              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                              Bitiş
                            </label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={companyDates.endDate ?? ''}
                                onChange={(event) =>
                                  handleDateChange(company.id, 'endDate', event.target.value)
                                }
                                disabled={!company.assigned || submitting}
                                className="w-full pr-8"
                              />
                              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>
                        </div>
                        <div>
                          {company.assigned ? (
                            <Badge
                              variant="default"
                              className="bg-primary/10 text-primary border-primary/20"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Atama mevcut
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                              <XCircle className="h-3 w-3 mr-1" />
                              Atanmadı
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !taskId || companies.length === 0 || loading}
          >
            {submitting ? 'Kaydediliyor...' : 'Tarihleri Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
