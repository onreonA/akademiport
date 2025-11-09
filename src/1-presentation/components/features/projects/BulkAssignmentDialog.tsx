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
import { Checkbox } from '@/presentation/components/ui/atoms/checkbox';
import { ScrollArea } from '@/presentation/components/ui/atoms/scroll-area';
import { Input } from '@/presentation/components/ui/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { ProjectAssignmentMatrixDTO } from '@/application/dto/project-assignment.dto';
import { cn } from '@/presentation/lib/utils';
import { Filter, X, CheckSquare, Square, Users, Layers } from 'lucide-react';

interface BulkAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrix: ProjectAssignmentMatrixDTO | null;
  onSubmit: (
    assignments: Array<{
      companyId: string;
      subProjectIds: string[];
    }>
  ) => Promise<void> | void;
  submitting?: boolean;
}

type SelectionState = Record<string, string[]>;

export function BulkAssignmentDialog({
  open,
  onOpenChange,
  matrix,
  onSubmit,
  submitting = false,
}: BulkAssignmentDialogProps) {
  const [selection, setSelection] = useState<SelectionState>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);

  const companies = matrix?.companies ?? [];
  const subProjects = matrix?.subProjects ?? [];

  // Unique values for filters
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    companies.forEach((company) => {
      if (company.city) {
        cities.add(company.city);
      }
    });
    return Array.from(cities).sort();
  }, [companies]);

  const uniqueSectors = useMemo(() => {
    const sectors = new Set<string>();
    companies.forEach((company) => {
      if (company.sector) {
        sectors.add(company.sector);
      }
    });
    return Array.from(sectors).sort();
  }, [companies]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      if (searchFilter && !company.name.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }
      if (cityFilter && company.city !== cityFilter) {
        return false;
      }
      if (sectorFilter && company.sector !== sectorFilter) {
        return false;
      }
      return true;
    });
  }, [companies, searchFilter, cityFilter, sectorFilter]);

  const assignmentMap = useMemo(() => {
    if (!matrix) return new Map<string, true>();
    const map = new Map<string, true>();
    matrix.assignments
      .filter((assignment) => assignment.subProjectId)
      .forEach((assignment) => {
        const key = `${assignment.companyId}::${assignment.subProjectId}`;
        map.set(key, true);
      });
    return map;
  }, [matrix]);

  useEffect(() => {
    if (!open || !matrix) return;
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      const initial: SelectionState = {};
      companies.forEach((company) => {
        const selectedSubProjects = subProjects
          .filter((subProject) => assignmentMap.has(`${company.id}::${subProject.id}`))
          .map((subProject) => subProject.id);
        initial[company.id] = selectedSubProjects;
      });
      setSelection(initial);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [open, matrix, assignmentMap, companies, subProjects]);

  const toggleSelection = (companyId: string, subProjectId: string) => {
    if (submitting) return;
    setSelection((prev) => {
      const current = new Set(prev[companyId] ?? []);
      if (current.has(subProjectId)) {
        current.delete(subProjectId);
      } else {
        current.add(subProjectId);
      }
      return { ...prev, [companyId]: Array.from(current) };
    });
  };

  const toggleRow = (companyId: string, checked: boolean) => {
    if (submitting) return;
    setSelection((prev) => ({
      ...prev,
      [companyId]: checked ? subProjects.map((subProject) => subProject.id) : [],
    }));
  };

  const isRowFullySelected = (companyId: string) => {
    if (subProjects.length === 0) return false;
    const selected = selection[companyId] ?? [];
    return selected.length === subProjects.length && selected.length > 0;
  };

  const isRowPartiallySelected = (companyId: string) => {
    if (subProjects.length === 0) return false;
    const selected = selection[companyId] ?? [];
    return selected.length > 0 && selected.length < subProjects.length;
  };

  const handleSubmit = async () => {
    if (submitting || filteredCompanies.length === 0) {
      onOpenChange(false);
      return;
    }

    // Only submit filtered companies
    const payload = filteredCompanies.map((company) => ({
      companyId: company.id,
      subProjectIds: selection[company.id] ?? [],
    }));

    await onSubmit(payload);
  };

  const totalSelectedPairs = useMemo(() => {
    return Object.values(selection).reduce((acc, subProjects) => acc + subProjects.length, 0);
  }, [selection]);

  const stats = useMemo(() => {
    const totalCompanies = filteredCompanies.length;
    const companiesWithAssignments = filteredCompanies.filter(
      (company) => (selection[company.id]?.length ?? 0) > 0
    ).length;
    const totalAssignments = totalSelectedPairs;
    const averageAssignmentsPerCompany =
      companiesWithAssignments > 0 ? totalAssignments / companiesWithAssignments : 0;

    return {
      totalCompanies,
      companiesWithAssignments,
      totalAssignments,
      averageAssignmentsPerCompany: Math.round(averageAssignmentsPerCompany * 10) / 10,
    };
  }, [filteredCompanies, selection, totalSelectedPairs]);

  const handleSelectAllCompanies = () => {
    if (submitting) return;
    const newSelection: SelectionState = {};
    filteredCompanies.forEach((company) => {
      newSelection[company.id] = subProjects.map((sp) => sp.id);
    });
    setSelection((prev) => ({ ...prev, ...newSelection }));
  };

  const handleClearAllCompanies = () => {
    if (submitting) return;
    const newSelection: SelectionState = {};
    filteredCompanies.forEach((company) => {
      newSelection[company.id] = [];
    });
    setSelection((prev) => ({ ...prev, ...newSelection }));
  };

  const hasActiveFilters = Boolean(searchFilter || cityFilter || sectorFilter);

  return (
    <Dialog open={open} onOpenChange={(value) => (!submitting ? onOpenChange(value) : null)}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <DialogTitle className="text-xl">Alt Proje Atamalarını Yönet</DialogTitle>
          <DialogDescription className="text-sm">
            Firmalar ve alt projeler arasındaki ilişkiyi hızlıca düzenleyin. Bir alt proje
            seçildiğinde o alt projeye bağlı tüm görevler firma ile paylaşılır.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="space-y-3 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">Filtreler</h4>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearchFilter('');
                    setCityFilter(null);
                    setSectorFilter(null);
                  }}
                  className="h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Temizle
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Firma Ara</label>
                <Input
                  placeholder="Firma adı..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="h-9"
                />
              </div>
              {uniqueCities.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Şehir</label>
                  <Select
                    value={cityFilter || undefined}
                    onValueChange={(value) => setCityFilter(value || null)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tüm şehirler" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {uniqueSectors.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Sektör</label>
                  <Select
                    value={sectorFilter || undefined}
                    onValueChange={(value) => setSectorFilter(value || null)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tüm sektörler" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Stats and Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  <span className="font-semibold text-foreground">
                    {stats.companiesWithAssignments}
                  </span>{' '}
                  / {stats.totalCompanies} firma
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>
                  <span className="font-semibold text-foreground">{stats.totalAssignments}</span>{' '}
                  toplam atama
                </span>
              </div>
              {stats.companiesWithAssignments > 0 && (
                <div>
                  Ortalama:{' '}
                  <span className="font-semibold text-foreground">
                    {stats.averageAssignmentsPerCompany}
                  </span>{' '}
                  alt proje/firma
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSelectAllCompanies}
                disabled={submitting || filteredCompanies.length === 0}
                className="text-xs"
              >
                <CheckSquare className="h-3 w-3 mr-1.5" />
                Tümünü Seç
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAllCompanies}
                disabled={submitting || filteredCompanies.length === 0}
                className="text-xs"
              >
                <Square className="h-3 w-3 mr-1.5" />
                Tümünü Temizle
              </Button>
            </div>
          </div>
          {filteredCompanies.length === 0 || subProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              {filteredCompanies.length === 0
                ? 'Filtre kriterlerine uygun firma bulunamadı.'
                : 'Atama yapılacak firma veya alt proje bulunamadı.'}
            </div>
          ) : null}
          <ScrollArea className="flex-1 min-h-0 rounded-lg border border-border/60 bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-56">
                    Firma
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-32">
                    Toplu
                  </th>
                  {subProjects.map((subProject) => (
                    <th
                      key={subProject.id}
                      className="px-4 py-3 text-left font-medium text-muted-foreground"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{subProject.name}</span>
                        {subProject.description ? (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {subProject.description}
                          </span>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
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
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className={cn(
                            'justify-start',
                            isRowFullySelected(company.id) ? 'bg-primary/10 text-primary' : ''
                          )}
                          onClick={() => toggleRow(company.id, true)}
                          disabled={submitting}
                        >
                          Hepsini Ata
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="justify-start"
                          onClick={() => toggleRow(company.id, false)}
                          disabled={submitting}
                        >
                          Temizle
                        </Button>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Checkbox
                            checked={
                              isRowFullySelected(company.id) ||
                              (isRowPartiallySelected(company.id) ? 'indeterminate' : false)
                            }
                            onCheckedChange={(value) => toggleRow(company.id, Boolean(value))}
                            className="h-4 w-4"
                            disabled={submitting}
                          />
                          <span>Tüm alt projeler</span>
                        </div>
                      </div>
                    </td>
                    {subProjects.map((subProject) => {
                      const selected = selection[company.id]?.includes(subProject.id) ?? false;
                      return (
                        <td key={subProject.id} className="px-4 py-3 align-top">
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => toggleSelection(company.id, subProject.id)}
                              className="h-4 w-4"
                              disabled={submitting}
                            />
                            <span className="text-xs text-muted-foreground">
                              {selected ? 'Atandı' : 'Atanmadı'}
                            </span>
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
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
            disabled={submitting || !matrix || filteredCompanies.length === 0}
          >
            {submitting
              ? 'Kaydediliyor...'
              : `Değişiklikleri Kaydet (${stats.totalAssignments} atama)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
