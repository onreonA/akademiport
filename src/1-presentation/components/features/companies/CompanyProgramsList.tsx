'use client';

/**
 * Company Programs List Component
 * Sprint 6: Company Management
 */

import React from 'react';
import { Calendar, MapPin, Building2 } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import type { Program } from '@/domain/entities/Program';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';

interface CompanyProgramsListProps {
  program?: Program;
  onAssignProgram?: () => void;
  canManage?: boolean;
}

export function CompanyProgramsList({
  program,
  onAssignProgram,
  canManage = false,
}: CompanyProgramsListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Atanmış Program</h3>
        {canManage && onAssignProgram && (
          <Button onClick={onAssignProgram} size="sm" variant="outline">
            Program Değiştir
          </Button>
        )}
      </div>

      {/* Program Info */}
      {program ? (
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg">{program.name}</h4>
              {program.description && (
                <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
              )}
            </div>
            <Badge
              variant={
                program.status === ProgramStatus.ACTIVE
                  ? 'default'
                  : program.status === ProgramStatus.PLANNED
                    ? 'secondary'
                    : 'outline'
              }
            >
              {program.status === ProgramStatus.ACTIVE
                ? 'Aktif'
                : program.status === ProgramStatus.PLANNED
                  ? 'Planlandı'
                  : program.status === ProgramStatus.COMPLETED
                    ? 'Tamamlandı'
                    : 'İptal'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{program.city}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(program.startDate).toLocaleDateString('tr-TR')} -{' '}
                {new Date(program.endDate).toLocaleDateString('tr-TR')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>
                {program.currentCompanies} / {program.maxCompanies} Firma
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Henüz programa atanmamış</p>
          {canManage && onAssignProgram && (
            <Button onClick={onAssignProgram} size="sm" className="mt-4">
              Program Ata
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

