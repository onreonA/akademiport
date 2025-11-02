'use client';

/**
 * Training Card Component
 *
 * Displays a training summary card with key information
 */

import * as React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Play, FileText, Lock, Globe, BookOpen } from 'lucide-react';
import type { Training } from '@/domain/entities/Training';

export interface TrainingCardProps {
  training: Training;
  videosCount?: number;
  documentsCount?: number;
  progress?: number; // 0-100
  onEdit?: (training: Training) => void;
  onDelete?: (training: Training) => void;
  onClick?: (training: Training) => void;
}

export function TrainingCard({
  training,
  videosCount = 0,
  documentsCount = 0,
  progress,
  onEdit,
  onDelete,
  onClick,
}: TrainingCardProps) {
  const statusColors = {
    draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    archived: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const statusLabels = {
    draft: 'Taslak',
    active: 'Aktif',
    archived: 'Arşivlendi',
  };

  const priorityLabels = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    critical: 'Kritik',
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {onClick ? (
                <button
                  onClick={() => onClick(training)}
                  className="text-left hover:text-primary transition-colors"
                >
                  {training.name}
                </button>
              ) : (
                training.name
              )}
            </CardTitle>
            {training.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {training.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge className={statusColors[training.status]}>{statusLabels[training.status]}</Badge>
            {training.priority && (
              <Badge className={priorityColors[training.priority]} variant="outline">
                {priorityLabels[training.priority]}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {training.isGlobal ? (
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              <span>Global Eğitim</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>Program Bazlı</span>
            </div>
          )}
          {training.isLocked && (
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              <span>Kilitli</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Play className="h-4 w-4" />
            <span>{videosCount} Video</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{documentsCount} Döküman</span>
          </div>
        </div>

        {progress !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">İlerleme</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Oluşturulma: {formatDate(training.createdAt)}
        </div>
      </CardContent>

      {(onEdit || onDelete) && (
        <CardFooter className="flex gap-2 pt-3">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(training)}>
              Düzenle
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(training)}
              className="text-destructive hover:text-destructive"
            >
              Sil
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
