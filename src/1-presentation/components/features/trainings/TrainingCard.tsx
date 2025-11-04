'use client';

/**
 * Training Card Component
 *
 * Modern, elegant card design inspired by ProgramCard
 * Consistent layout with fixed button positions
 */

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Play, FileText, Lock, Globe, BookOpen, Eye, Edit, Trash2 } from 'lucide-react';
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
    draft:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    active:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    archived:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  };

  const priorityColors = {
    low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    medium:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    critical:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
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

  const formatShortDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(training);
    }
  };

  return (
    <Card
      className={`group flex flex-col h-full hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary/30 dark:hover:border-primary/30 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick ? handleCardClick : undefined}
    >
      {/* Header with Badges */}
      <CardHeader className="pb-3 space-y-3">
        {/* Badges Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {training.isGlobal ? (
              <Badge variant="secondary" className="text-xs font-medium">
                <Globe className="h-3 w-3 mr-1" />
                Global
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-medium">
                <BookOpen className="h-3 w-3 mr-1" />
                Program Bazlı
              </Badge>
            )}
            {training.isLocked && (
              <Badge variant="outline" className="text-xs font-medium">
                <Lock className="h-3 w-3 mr-1" />
                Kilitli
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              className={`${statusColors[training.status]} border font-medium px-2.5 py-1 text-xs`}
            >
              {statusLabels[training.status]}
            </Badge>
            {training.priority && (
              <Badge
                className={`${priorityColors[training.priority]} border font-medium px-2.5 py-1 text-xs`}
              >
                {priorityLabels[training.priority]}
              </Badge>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
            {onClick ? (
              <span
                className="hover:text-primary transition-colors cursor-pointer"
                onClick={handleCardClick}
              >
                {training.name}
              </span>
            ) : (
              training.name
            )}
          </CardTitle>
          {training.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {training.description}
            </p>
          )}
        </div>
      </CardHeader>

      {/* Content - Flex container for consistent button placement */}
      <CardContent className="flex-1 flex flex-col pt-0 pb-4 space-y-4">
        {/* Progress Section */}
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-gray-900 dark:text-white">İlerleme</span>
              </div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Metrics Cards - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Videos Metric */}
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {videosCount}
            </div>
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Video</div>
          </div>

          {/* Documents Metric */}
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {documentsCount}
            </div>
            <div className="text-xs font-medium text-green-700 dark:text-green-300">Döküman</div>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          {/* Training Type */}
          <div className="flex items-center gap-2 text-sm">
            {training.isGlobal ? (
              <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
            ) : (
              <BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
            )}
            <span className="text-gray-700 dark:text-gray-300">
              {training.isGlobal ? 'Global Eğitim' : 'Program Bazlı Eğitim'}
            </span>
          </div>

          {/* Lock Status */}
          {training.isLocked && (
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Kilitli</span>
            </div>
          )}

          {/* Content Counts */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{videosCount} Video</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{documentsCount} Döküman</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer - Always at bottom with creation date and buttons */}
      <CardFooter
        className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
      >
        {/* Creation Date */}
        <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-400">
          <span>Oluşturulma</span>
          <span className="font-medium">{formatShortDate(training.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          {onEdit && (
            <Button
              size="sm"
              onClick={() => onEdit(training)}
              className="flex-1 group/btn bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none transition-colors"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Detaylar
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              onClick={() => onDelete(training)}
              className="flex-1 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700 shadow-none transition-colors"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Sil
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
