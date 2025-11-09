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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Input } from '@/presentation/components/ui/atoms/input';
import { ScrollArea } from '@/presentation/components/ui/atoms/scroll-area';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Card, CardContent } from '@/presentation/components/ui/atoms/card';
import { Calendar, CheckCircle, XCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectAssignmentMatrixDTO } from '@/application/dto/project-assignment.dto';

interface BulkDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrix: ProjectAssignmentMatrixDTO | null;
  onSubmit: (
    subProjectId: string,
    dates: Array<{ companyId: string; startDate: string | null; endDate: string | null }>
  ) => Promise<void> | void;
  submitting?: boolean;
}

type DatesState = Record<string, { startDate: string | null; endDate: string | null }>;

export function BulkDatesDialog({
  open,
  onOpenChange,
  matrix,
  onSubmit,
  submitting = false,
}: BulkDatesDialogProps) {
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<string | null>(null);
  const [dates, setDates] = useState<DatesState>({});
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const assignmentMap = useMemo(() => {
    if (!matrix) return new Map<string, { startDate: string | null; endDate: string | null }>();
    const map = new Map<string, { startDate: string | null; endDate: string | null }>();
    matrix.assignments
      .filter((assignment) => assignment.subProjectId)
      .forEach((assignment) => {
        const key = `${assignment.companyId}::${assignment.subProjectId}`;
        map.set(key, {
          startDate: assignment.startDate?.split('T')[0] ?? null,
          endDate: assignment.endDate?.split('T')[0] ?? null,
        });
      });
    return map;
  }, [matrix]);

  useEffect(() => {
    if (!open) return;
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      if (matrix && matrix.subProjects.length > 0) {
        setSelectedSubProjectId((current) => current ?? matrix.subProjects[0]?.id ?? null);
      } else {
        setSelectedSubProjectId(null);
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [open, matrix]);

  useEffect(() => {
    if (!open || !matrix || !selectedSubProjectId) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setDates({});
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      const initial: DatesState = {};
      matrix.companies.forEach((company) => {
        const key = `${company.id}::${selectedSubProjectId}`;
        const assignment = assignmentMap.get(key);
        initial[company.id] = {
          startDate: assignment?.startDate ?? null,
          endDate: assignment?.endDate ?? null,
        };
      });

      setDates(initial);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [open, matrix, selectedSubProjectId, assignmentMap]);

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
    if (!selectedSubProjectId || !matrix || submitting) {
      onOpenChange(false);
      return;
    }

    const payload = matrix.companies
      .map((company) => {
        const assignmentExists = assignmentMap.has(`${company.id}::${selectedSubProjectId}`);
        if (!assignmentExists) {
          return null;
        }

        const companyDates = dates[company.id] ?? { startDate: null, endDate: null };
        return {
          companyId: company.id,
          startDate: companyDates.startDate ? new Date(companyDates.startDate).toISOString() : null,
          endDate: companyDates.endDate ? new Date(companyDates.endDate).toISOString() : null,
        };
      })
      .filter(
        (value): value is { companyId: string; startDate: string | null; endDate: string | null } =>
          value !== null
      );

    await onSubmit(selectedSubProjectId, payload);
  };

  const selectedSubProject =
    matrix?.subProjects.find((subProject) => subProject.id === selectedSubProjectId) ?? null;

  const companiesWithAssignment = useMemo(() => {
    if (!matrix || !selectedSubProjectId) return [];
    return matrix.companies.map((company) => {
      const key = `${company.id}::${selectedSubProjectId}`;
      const assignment = assignmentMap.get(key);
      return {
        id: company.id,
        name: company.name,
        city: company.city,
        assigned: Boolean(assignment),
        startDate: dates[company.id]?.startDate ?? null,
        endDate: dates[company.id]?.endDate ?? null,
      };
    });
  }, [matrix, selectedSubProjectId, assignmentMap, dates]);

  const assignedCompaniesCount = useMemo(
    () => companiesWithAssignment.filter((c) => c.assigned).length,
    [companiesWithAssignment]
  );

  const handleBulkDateAssign = () => {
    const startDate = prompt('Başlangıç tarihi (YYYY-MM-DD formatında):');
    const endDate = prompt('Bitiş tarihi (YYYY-MM-DD formatında):');

    if (!startDate || !endDate) return;

    const newDates: DatesState = {};
    companiesWithAssignment.forEach((company) => {
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
    companiesWithAssignment.forEach((company) => {
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

  const selectedSubProjectDescription = selectedSubProject?.description || '';
  const shouldTruncateDescription = selectedSubProjectDescription.length > 100;
  const displayDescription = descriptionExpanded
    ? selectedSubProjectDescription
    : selectedSubProjectDescription.slice(0, 100);

  return (
    <Dialog open={open} onOpenChange={(value) => (!submitting ? onOpenChange(value) : null)}>
      <DialogContent className="max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <DialogTitle className="text-xl">Firma Bazlı Tarihleri Düzenle</DialogTitle>
          <DialogDescription className="text-sm">
            Farklı firmalar aynı alt proje için farklı başlangıç ve bitiş tarihleriyle
            ilerleyebilir. Sadece atanmış firmalar için tarih düzenleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-hidden flex flex-col">
          {/* Alt Proje Seçimi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Alt Proje Seçimi</label>
              {selectedSubProject && (
                <Badge variant="secondary" className="text-xs">
                  {matrix?.subProjects.length || 0} alt proje
                </Badge>
              )}
            </div>
            <Select
              value={selectedSubProjectId ?? undefined}
              onValueChange={(value) => {
                setSelectedSubProjectId(value);
                setDescriptionExpanded(false);
              }}
              disabled={!matrix || matrix.subProjects.length === 0 || submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alt proje seçin" />
              </SelectTrigger>
              <SelectContent>
                {matrix?.subProjects.map((subProject) => (
                  <SelectItem key={subProject.id} value={subProject.id}>
                    {subProject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSubProject?.description && (
              <div className="rounded-md bg-muted/50 p-3 border border-border/60">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {displayDescription}
                  {shouldTruncateDescription && !descriptionExpanded && '...'}
                </p>
                {shouldTruncateDescription && (
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="text-xs text-primary mt-2 hover:underline flex items-center gap-1"
                  >
                    {descriptionExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Daha az göster
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        Devamını gör
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {(!matrix || matrix.companies.length === 0) && (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Tarih düzenleyebileceğiniz firma bulunamadı.
            </div>
          )}

          {/* Desktop Tablo Görünümü */}
          {matrix && matrix.companies.length > 0 && (
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
                      {companiesWithAssignment.map((company) => (
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
                                value={company.startDate ?? ''}
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
                                value={company.endDate ?? ''}
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
                              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                <XCircle className="h-3 w-3 mr-1" />
                                Atanmadı
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>

              {/* Mobil: Card Görünümü */}
              <div className="md:hidden space-y-3 overflow-y-auto flex-1">
                {companiesWithAssignment.map((company) => (
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
                              value={company.startDate ?? ''}
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
                          <label className="text-xs font-medium text-muted-foreground">Bitiş</label>
                          <div className="relative">
                            <Input
                              type="date"
                              value={company.endDate ?? ''}
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
                ))}
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
          <Button onClick={handleSubmit} disabled={submitting || !selectedSubProjectId || !matrix}>
            {submitting ? 'Kaydediliyor...' : 'Tarihleri Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
