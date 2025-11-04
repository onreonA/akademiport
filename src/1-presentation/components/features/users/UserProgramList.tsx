/**
 * User Program List Component
 *
 * Displays and manages user's assigned programs
 */

'use client';

import * as React from 'react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
import { Program } from '@/domain/entities/Program';
import { ProgramStatusLabels } from '@/domain/enums/ProgramStatus';
import { Plus, X, Calendar } from 'lucide-react';

export interface UserProgramListProps {
  programs: Program[];
  onAdd?: () => void;
  onRemove?: (programId: string) => void;
  canManage?: boolean;
}

export const UserProgramList: React.FC<UserProgramListProps> = ({
  programs,
  onAdd,
  onRemove,
  canManage = false,
}) => {
  const statusColors = {
    planned:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    active:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    completed:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    paused:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    cancelled:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Atanmış Programlar ({programs.length})
        </h3>
        {canManage && onAdd && (
          <Button onClick={onAdd} size="sm" className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Program Ekle
          </Button>
        )}
      </div>

      {/* Programs List */}
      {programs.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p>Henüz program atanmamış</p>
          {canManage && onAdd && (
            <Button onClick={onAdd} variant="outline" size="sm" className="mt-4 shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              İlk Programı Ekle
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {programs.map((program) => (
            <div
              key={program.id}
              className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {program.name}
                  </h4>
                  <Badge
                    className={`${statusColors[program.status] || statusColors.planned} border font-medium`}
                  >
                    {ProgramStatusLabels[program.status]}
                  </Badge>
                </div>
                {program.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {program.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {program.city && <span>{program.city}</span>}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {new Date(program.startDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
              {canManage && onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(program.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
