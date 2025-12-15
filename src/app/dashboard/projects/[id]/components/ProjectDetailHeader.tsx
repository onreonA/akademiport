'use client';

import { useState } from 'react';
import { Building2, Calendar, UserRound, Pencil } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';
import { Button } from '@/presentation/components/ui/atoms/button';
import ConsultantChangeDialog from '@/presentation/components/features/projects/ConsultantChangeDialog';

interface ProjectDetailHeaderProps {
  name: string;
  statusLabel: string;
  statusColorClass: string;
  priorityLabel: string | null;
  priorityColorClass: string | null;
  companyName: string | null;
  consultantName: string | null;
  consultantId?: string | null;
  projectId: string;
  startDate: string | null;
  endDate: string | null;
  onConsultantChanged?: () => void;
}

export function ProjectDetailHeader({
  name,
  statusLabel,
  statusColorClass,
  priorityLabel,
  priorityColorClass,
  companyName,
  consultantName,
  consultantId,
  projectId,
  startDate,
  endDate,
  onConsultantChanged,
}: ProjectDetailHeaderProps) {
  const [consultantDialogOpen, setConsultantDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${statusColorClass} border font-medium px-3 py-1 text-xs`}>
              {statusLabel}
            </Badge>
            {priorityLabel && priorityColorClass ? (
              <Badge className={`${priorityColorClass} border font-medium px-3 py-1 text-xs`}>
                {priorityLabel}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col">
          {companyName ? (
            <EnhancedCard className="flex items-center gap-3 rounded-xl border border-gray-200/60 bg-white/90 p-3 dark:border-gray-800/60 dark:bg-gray-900/80">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Firma</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{companyName}</p>
              </div>
            </EnhancedCard>
          ) : null}
          {consultantName ? (
            <EnhancedCard className="flex items-center gap-3 rounded-xl border border-gray-200/60 bg-white/90 p-3 dark:border-gray-800/60 dark:bg-gray-900/80 group/consultant">
              <UserRound className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Danışman</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {consultantName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover/consultant:opacity-100 transition-opacity h-7 w-7 p-0"
                onClick={() => setConsultantDialogOpen(true)}
                title="Danışman değiştir"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </EnhancedCard>
          ) : (
            <EnhancedCard className="flex items-center gap-3 rounded-xl border border-gray-200/60 bg-white/90 p-3 dark:border-gray-800/60 dark:bg-gray-900/80">
              <UserRound className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Danışman</p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-sm font-semibold text-gray-900 dark:text-white"
                  onClick={() => setConsultantDialogOpen(true)}
                >
                  Danışman Ata
                </Button>
              </div>
            </EnhancedCard>
          )}
          <EnhancedCard className="flex items-center gap-3 rounded-xl border border-gray-200/60 bg-white/90 p-3 dark:border-gray-800/60 dark:bg-gray-900/80">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tarih</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {startDate && endDate
                  ? `${startDate} → ${endDate}`
                  : startDate || endDate || 'Belirlenmemiş'}
              </p>
            </div>
          </EnhancedCard>
        </div>
      </div>
      <ConsultantChangeDialog
        open={consultantDialogOpen}
        onOpenChange={setConsultantDialogOpen}
        projectId={projectId}
        currentConsultantId={consultantId}
        currentConsultantName={consultantName}
        onSuccess={onConsultantChanged}
      />
    </div>
  );
}
