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
  if (programs.length === 0 && !canManage) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Bu kullanıcının atandığı program bulunmuyor
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Atanmış Programlar ({programs.length})</CardTitle>
        {canManage && onAdd && (
          <Button onClick={onAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Program Ekle
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {programs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Henüz program atanmamış</p>
            {canManage && onAdd && (
              <Button onClick={onAdd} variant="outline" size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-1" />
                İlk Programı Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => (
              <div
                key={program.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{program.name}</h4>
                    <Badge variant="secondary">{ProgramStatusLabels[program.status]}</Badge>
                  </div>
                  {program.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {program.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {program.city && <span>{program.city}</span>}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(program.startDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
                {canManage && onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(program.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
