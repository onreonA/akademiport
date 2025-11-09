import { useMemo, useState, useCallback, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { ProjectAssignmentMatrixDTO } from '@/application/dto/project-assignment.dto';
import { MatrixFilters, MatrixFilters as MatrixFiltersType } from './MatrixFilters';

interface ProjectAssignmentMatrixProps {
  matrix?: ProjectAssignmentMatrixDTO | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onBulkAssign?: () => void;
  onBulkDates?: () => void;
  actionsDisabled?: boolean;
  onSelectionChange?: (selections: Map<string, boolean>) => void;
}

export function ProjectAssignmentMatrix({
  matrix,
  loading = false,
  error,
  onRefresh,
  onBulkAssign,
  onBulkDates,
  actionsDisabled = false,
  onSelectionChange,
}: ProjectAssignmentMatrixProps) {
  // Local state for checkbox selections (for visual feedback)
  const [localSelections, setLocalSelections] = useState<Map<string, boolean>>(new Map());

  // Filter state
  const [filters, setFilters] = useState<MatrixFiltersType>({
    programId: null,
    city: null,
    sector: null,
    search: null,
  });

  const assignmentMap = useMemo(() => {
    if (!matrix) return new Map<string, { startDate: string | null; endDate: string | null }>();

    const map = new Map<string, { startDate: string | null; endDate: string | null }>();
    matrix.assignments
      .filter((cell) => !!cell.subProjectId)
      .forEach((cell) => {
        const key = `${cell.companyId}::${cell.subProjectId}`;
        map.set(key, { startDate: cell.startDate, endDate: cell.endDate });
      });
    return map;
  }, [matrix]);

  // Reset local selections when matrix changes
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      if (matrix) {
        const newSelections = new Map<string, boolean>();
        matrix.assignments
          .filter((cell) => !!cell.subProjectId)
          .forEach((cell) => {
            const key = `${cell.companyId}::${cell.subProjectId}`;
            newSelections.set(key, true);
          });
        setLocalSelections(newSelections);
      } else {
        setLocalSelections(new Map());
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [matrix]);

  const handleCheckboxChange = useCallback(
    (companyId: string, subProjectId: string, checked: boolean) => {
      const key = `${companyId}::${subProjectId}`;
      setLocalSelections((prev) => {
        const newMap = new Map(prev);
        if (checked) {
          newMap.set(key, true);
        } else {
          newMap.delete(key);
        }

        // Notify parent component if callback provided
        if (onSelectionChange) {
          onSelectionChange(newMap);
        }

        return newMap;
      });
    },
    [onSelectionChange]
  );

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    if (!matrix) return [];

    return matrix.companies.filter((company) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!company.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // City filter
      if (filters.city && company.city !== filters.city) {
        return false;
      }

      // Sector filter
      if (filters.sector && company.sector !== filters.sector) {
        return false;
      }

      // Program filter (if implemented)
      // if (filters.programId && company.programId !== filters.programId) {
      //   return false;
      // }

      return true;
    });
  }, [matrix, filters]);

  const hasMatrixData =
    Boolean(matrix) && (matrix?.companies.length ?? 0) > 0 && (matrix?.subProjects.length ?? 0) > 0;
  const disableActions = actionsDisabled || !hasMatrixData;

  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR');
  };

  if (loading && !matrix) {
    return (
      <EnhancedCard className="p-12 text-center shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-3">Atama matrisi hazırlanıyor...</p>
      </EnhancedCard>
    );
  }

  if (error) {
    return (
      <EnhancedCard className="p-8 text-center space-y-4 border-destructive/40">
        <p className="text-sm text-destructive">{error}</p>
        <Button size="sm" onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tekrar Dene
        </Button>
      </EnhancedCard>
    );
  }

  if (!matrix) {
    return (
      <EnhancedCard className="p-8 text-center space-y-2">
        <p className="font-medium text-foreground">Henüz atama verisi bulunmuyor</p>
        <p className="text-sm text-muted-foreground">
          Şirket-Alt Proje ilişkileri tanımlandığında bu alanda göreceksiniz.
        </p>
      </EnhancedCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {matrix && <MatrixFilters matrix={matrix} filters={filters} onFiltersChange={setFilters} />}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Atama Matrisi</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Beta</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredCompanies.length} / {matrix?.companies.length ?? 0} firma ×{' '}
            {matrix?.subProjects.length ?? 0} alt proje
            {filteredCompanies.length !== (matrix?.companies.length ?? 0) && (
              <span className="ml-2 text-xs text-primary">(filtrelenmiş)</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onBulkAssign ? (
            <Button
              size="sm"
              onClick={onBulkAssign}
              disabled={loading || disableActions}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Alt Proje Atamaları
            </Button>
          ) : null}
          {onBulkDates ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={onBulkDates}
              disabled={loading || disableActions}
            >
              Tarihleri Düzenle
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="sticky left-0 bg-muted/50 px-4 py-3 text-left font-medium text-muted-foreground border-b border-r">
                Firma
              </th>
              {matrix.subProjects.map((subProject) => (
                <th
                  key={subProject.id}
                  className="px-4 py-3 text-left font-medium text-muted-foreground border-b"
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
              <tr key={company.id} className="border-b last:border-b-0">
                <td className="sticky left-0 bg-card px-4 py-3 font-medium text-foreground border-r">
                  <div className="flex flex-col">
                    <span>{company.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {company.city || 'Şehir belirtilmemiş'}
                    </span>
                  </div>
                </td>
                {matrix.subProjects.map((subProject) => {
                  const key = `${company.id}::${subProject.id}`;
                  const assignment = assignmentMap.get(key);
                  const isAssigned = Boolean(assignment);
                  const isLocallySelected = localSelections.has(key);
                  const displayChecked = isLocallySelected || isAssigned;

                  return (
                    <td key={subProject.id} className="px-4 py-3 align-top">
                      <div className="space-y-2">
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity">
                          <input
                            type="checkbox"
                            checked={displayChecked}
                            onChange={(e) =>
                              handleCheckboxChange(company.id, subProject.id, e.target.checked)
                            }
                            disabled={actionsDisabled || loading}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <span className="text-muted-foreground">
                            {displayChecked ? 'Atandı' : 'Atanmadı'}
                          </span>
                        </label>
                        {assignment && (
                          <div className="rounded-md border border-dashed border-border/60 p-2 text-xs text-muted-foreground bg-muted/30">
                            <div>
                              <span className="font-medium text-foreground">Başlangıç:</span>{' '}
                              {formatDate(assignment?.startDate)}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Bitiş:</span>{' '}
                              {formatDate(assignment?.endDate)}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EnhancedCard className="p-4 bg-muted/40">
        <p className="text-xs text-muted-foreground">
          Alt proje atamaları ve tarih güncellemeleri için üstteki aksiyonları kullanabilirsiniz.
          Değişiklikler kaydedildiğinde matris otomatik olarak yenilenecektir.
        </p>
        {!hasMatrixData ? (
          <p className="text-xs text-muted-foreground mt-2">
            Atama yapılacak firma veya alt proje olmadığından toplu aksiyonlar devre dışıdır.
          </p>
        ) : null}
      </EnhancedCard>
    </div>
  );
}
