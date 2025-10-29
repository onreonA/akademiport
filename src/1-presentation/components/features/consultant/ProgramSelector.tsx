/**
 * Program Selector Component
 * Sprint 7: Consultant Management
 *
 * Consultant'ın programlarını seçmesi için dropdown
 */

'use client';

import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/presentation/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { useConsultantProgram } from '@/shared/contexts/ConsultantProgramContext';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';
import type { Program } from '@/domain/entities/Program';

// =====================================================
// TYPES
// =====================================================

interface ProgramSelectorProps {
  onProgramChange?: (program: Program | null) => void;
  className?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export function ProgramSelector({ onProgramChange, className }: ProgramSelectorProps) {
  const { selectedProgram, setSelectedProgram, programs, setPrograms, isLoading, setIsLoading } =
    useConsultantProgram();

  // Fetch programs on mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Notify parent when program changes
  useEffect(() => {
    if (onProgramChange) {
      onProgramChange(selectedProgram);
    }
  }, [selectedProgram, onProgramChange]);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/consultant/programs');
      const data = await response.json();

      if (data.success) {
        const programList = data.data.map((item: any) => item.program);
        setPrograms(programList);

        // Auto-select first program if none selected
        if (!selectedProgram && programList.length > 0) {
          setSelectedProgram(programList[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    if (program) {
      setSelectedProgram(program);
    }
  };

  const getStatusLabel = (status: ProgramStatus): string => {
    const labels: Record<ProgramStatus, string> = {
      [ProgramStatus.ACTIVE]: 'Aktif',
      [ProgramStatus.PLANNED]: 'Planlandı',
      [ProgramStatus.COMPLETED]: 'Tamamlandı',
      [ProgramStatus.CANCELLED]: 'İptal',
    };
    return labels[status];
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className={cn('text-muted-foreground', className)}>
        <span>Program bulunamadı</span>
      </div>
    );
  }

  return (
    <Select value={selectedProgram?.id || ''} onValueChange={handleValueChange}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="Program seçin..." />
      </SelectTrigger>
      <SelectContent>
        {programs.map((program) => (
          <SelectItem key={program.id} value={program.id}>
            <div className="flex items-center gap-2">
              <span>{program.name}</span>
              <Badge
                variant={
                  program.status === ProgramStatus.ACTIVE
                    ? 'default'
                    : program.status === ProgramStatus.PLANNED
                      ? 'secondary'
                      : 'outline'
                }
                className="text-xs"
              >
                {getStatusLabel(program.status)}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

