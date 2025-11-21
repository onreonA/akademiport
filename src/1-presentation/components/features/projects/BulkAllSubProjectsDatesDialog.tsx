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
import { Calendar, CheckCircle, XCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectAssignmentMatrixDTO } from '@/application/dto/project-assignment.dto';
import { toast } from 'sonner';

interface BulkAllSubProjectsDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrix: ProjectAssignmentMatrixDTO | null;
  projectId: string | null;
  onSubmit?: () => void;
  submitting?: boolean;
}

type DatesState = Record<
  string,
  Record<string, { startDate: string | null; endDate: string | null }>
>;

export function BulkAllSubProjectsDatesDialog({
  open,
  onOpenChange,
  matrix,
  projectId,
  onSubmit,
  submitting = false,
}: BulkAllSubProjectsDatesDialogProps) {
  const [dates, setDates] = useState<DatesState>({});
  const [expandedSubProjects, setExpandedSubProjects] = useState<Set<string>>(new Set());

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
    if (!open || !matrix) {
      const timeoutId = setTimeout(() => {
        setDates({});
        setExpandedSubProjects(new Set());
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    // Tüm alt projeler ve firmalar için tarihleri yükle
    const timeoutId = setTimeout(() => {
      const initial: DatesState = {};
      matrix.subProjects.forEach((subProject) => {
        initial[subProject.id] = {};
        matrix.companies.forEach((company) => {
          const key = `${company.id}::${subProject.id}`;
          const assignment = assignmentMap.get(key);
          initial[subProject.id][company.id] = {
            startDate: assignment?.startDate ?? null,
            endDate: assignment?.endDate ?? null,
          };
        });
      });
      setDates(initial);
      // İlk alt projeyi açık tut
      if (matrix.subProjects.length > 0) {
        setExpandedSubProjects(new Set([matrix.subProjects[0].id]));
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [open, matrix, assignmentMap]);

  const handleDateChange = (
    subProjectId: string,
    companyId: string,
    field: 'startDate' | 'endDate',
    value: string
  ) => {
    if (submitting) return;
    setDates((prev) => ({
      ...prev,
      [subProjectId]: {
        ...(prev[subProjectId] ?? {}),
        [companyId]: {
          ...(prev[subProjectId]?.[companyId] ?? { startDate: null, endDate: null }),
          [field]: value || null,
        },
      },
    }));
  };

  const toggleSubProject = (subProjectId: string) => {
    setExpandedSubProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subProjectId)) {
        newSet.delete(subProjectId);
      } else {
        newSet.add(subProjectId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!projectId || !matrix || submitting) {
      onOpenChange(false);
      return;
    }

    // Tüm alt projeler için tarihleri topla
    const allDates: Array<{
      companyId: string;
      subProjectId: string;
      startDate: string | null;
      endDate: string | null;
    }> = [];

    matrix.subProjects.forEach((subProject) => {
      const subProjectDates = dates[subProject.id] ?? {};
      matrix.companies.forEach((company) => {
        const assignmentExists = assignmentMap.has(`${company.id}::${subProject.id}`);
        if (!assignmentExists) return;

        const companyDates = subProjectDates[company.id] ?? { startDate: null, endDate: null };
        allDates.push({
          companyId: company.id,
          subProjectId: subProject.id,
          startDate: companyDates.startDate ? new Date(companyDates.startDate).toISOString() : null,
          endDate: companyDates.endDate ? new Date(companyDates.endDate).toISOString() : null,
        });
      });
    });

    try {
      const response = await fetch(`/api/projects/${projectId}/dates/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates: allDates }),
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
      console.error('Error submitting bulk dates:', error);
      toast.error(error instanceof Error ? error.message : 'Tarih atamaları kaydedilemedi');
    }
  };

  const handleBulkDateAssign = (subProjectId: string) => {
    const startDate = prompt('Başlangıç tarihi (YYYY-MM-DD formatında):');
    const endDate = prompt('Bitiş tarihi (YYYY-MM-DD formatında):');

    if (!startDate || !endDate) return;

    const newDates: Record<string, { startDate: string | null; endDate: string | null }> = {};
    const subProjectAssignments =
      matrix?.companies.filter((company) => {
        const key = `${company.id}::${subProjectId}`;
        return assignmentMap.has(key);
      }) || [];

    subProjectAssignments.forEach((company) => {
      newDates[company.id] = {
        startDate,
        endDate,
      };
    });

    setDates((prev) => ({
      ...prev,
      [subProjectId]: {
        ...prev[subProjectId],
        ...newDates,
      },
    }));
  };

  const handleShiftDates = (subProjectId: string) => {
    const daysInput = prompt('Kaç gün kaydırılacak? (+30 veya -10 gibi):');
    const days = parseInt(daysInput || '0', 10);

    if (isNaN(days) || days === 0) return;

    const newDates: Record<string, { startDate: string | null; endDate: string | null }> = {};
    const subProjectDates = dates[subProjectId] ?? {};

    Object.keys(subProjectDates).forEach((companyId) => {
      const currentStart = subProjectDates[companyId].startDate;
      const currentEnd = subProjectDates[companyId].endDate;

      if (currentStart && currentEnd) {
        const startDate = new Date(currentStart);
        const endDate = new Date(currentEnd);
        startDate.setDate(startDate.getDate() + days);
        endDate.setDate(endDate.getDate() + days);

        newDates[companyId] = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        };
      }
    });

    setDates((prev) => ({
      ...prev,
      [subProjectId]: {
        ...prev[subProjectId],
        ...newDates,
      },
    }));
  };

  const companiesWithAssignments = useMemo(() => {
    if (!matrix) return [];
    return matrix.companies.map((company) => {
      const assignments = matrix.subProjects
        .map((subProject) => {
          const key = `${company.id}::${subProject.id}`;
          return assignmentMap.has(key) ? subProject.id : null;
        })
        .filter(Boolean) as string[];

      return {
        id: company.id,
        name: company.name,
        city: company.city,
        assignments,
      };
    });
  }, [matrix, assignmentMap]);

  return (
    <Dialog open={open} onOpenChange={(value) => (!submitting ? onOpenChange(value) : null)}>
      <DialogContent className="max-w-4xl lg:max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <DialogTitle className="text-xl">Tüm Alt Projeler İçin Toplu Tarih Ataması</DialogTitle>
          <DialogDescription className="text-sm">
            Tüm alt projeler için firma bazlı tarih atamalarını tek seferde düzenleyebilirsiniz.
            Sadece atanmış firmalar için tarih düzenleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
          {!matrix || matrix.subProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Tarih düzenleyebileceğiniz alt proje bulunamadı.
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {matrix.subProjects.map((subProject) => {
                  const isExpanded = expandedSubProjects.has(subProject.id);
                  const subProjectDates = dates[subProject.id] ?? {};
                  const assignedCompanies = companiesWithAssignments.filter((c) =>
                    c.assignments.includes(subProject.id)
                  );

                  return (
                    <Card key={subProject.id} className="border-border/60">
                      <CardContent className="p-0">
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleSubProject(subProject.id)}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{subProject.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {assignedCompanies.length} firma atanmış
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {assignedCompanies.length} firma
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-border/60 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-foreground">
                                Firma Tarihleri
                              </h4>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBulkDateAssign(subProject.id)}
                                  disabled={submitting || assignedCompanies.length === 0}
                                  className="text-xs"
                                >
                                  <Calendar className="h-3 w-3 mr-1.5" />
                                  Toplu Tarih Ata
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleShiftDates(subProject.id)}
                                  disabled={submitting || assignedCompanies.length === 0}
                                  className="text-xs"
                                >
                                  <ArrowRight className="h-3 w-3 mr-1.5" />
                                  Tarihleri Kaydır
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {assignedCompanies.map((company) => {
                                const companyDates = subProjectDates[company.id] ?? {
                                  startDate: null,
                                  endDate: null,
                                };
                                return (
                                  <div
                                    key={company.id}
                                    className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg border border-border/60 bg-muted/20"
                                  >
                                    <div className="md:col-span-1">
                                      <div className="font-medium text-sm text-foreground">
                                        {company.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {company.city || 'Şehir bilgisi yok'}
                                      </div>
                                    </div>
                                    <div className="md:col-span-1">
                                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                        Başlangıç
                                      </label>
                                      <div className="relative">
                                        <Input
                                          type="date"
                                          value={companyDates.startDate ?? ''}
                                          onChange={(event) =>
                                            handleDateChange(
                                              subProject.id,
                                              company.id,
                                              'startDate',
                                              event.target.value
                                            )
                                          }
                                          disabled={submitting}
                                          className="w-full pr-8"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                      </div>
                                    </div>
                                    <div className="md:col-span-1">
                                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                        Bitiş
                                      </label>
                                      <div className="relative">
                                        <Input
                                          type="date"
                                          value={companyDates.endDate ?? ''}
                                          onChange={(event) =>
                                            handleDateChange(
                                              subProject.id,
                                              company.id,
                                              'endDate',
                                              event.target.value
                                            )
                                          }
                                          disabled={submitting}
                                          className="w-full pr-8"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                      </div>
                                    </div>
                                    <div className="md:col-span-1 flex items-end">
                                      <Badge
                                        variant="default"
                                        className="bg-primary/10 text-primary border-primary/20"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Atanmış
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
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
            disabled={submitting || !projectId || !matrix || matrix.subProjects.length === 0}
          >
            {submitting ? 'Kaydediliyor...' : 'Tüm Tarihleri Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
