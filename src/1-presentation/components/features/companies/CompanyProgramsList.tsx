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
  const statusColors = {
    [ProgramStatus.PLANNED]:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    [ProgramStatus.ACTIVE]:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    [ProgramStatus.COMPLETED]:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    [ProgramStatus.PAUSED]:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    [ProgramStatus.CANCELLED]:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Atanmış Program</h3>
        {canManage && onAssignProgram && (
          <Button onClick={onAssignProgram} size="sm" variant="outline" className="shadow-sm">
            Program Değiştir
          </Button>
        )}
      </div>

      {/* Program Info */}
      {program ? (
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                {program.name}
              </h4>
              {program.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {program.description}
                </p>
              )}
            </div>
            <Badge
              className={`${statusColors[program.status] || statusColors[ProgramStatus.PLANNED]} border font-medium`}
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
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span>{program.city || 'Belirtilmemiş'}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span>
                {new Date(program.startDate).toLocaleDateString('tr-TR')} -{' '}
                {new Date(program.endDate).toLocaleDateString('tr-TR')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span>
                {program.currentCompanies} / {program.maxCompanies} Firma
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p>Henüz programa atanmamış</p>
          {canManage && onAssignProgram && (
            <Button onClick={onAssignProgram} size="sm" className="mt-4 shadow-sm">
              Program Ata
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
