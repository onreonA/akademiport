/**
 * Program Card Component
 *
 * Modern, elegant card design inspired by akademiport.com
 * Consistent layout with fixed button positions
 */

'use client';

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
import { Calendar, MapPin, Users, Building2, ChevronRight, Eye, Clock } from 'lucide-react';
import type { Program } from '@/domain/entities/Program';
import { ProgramStatusLabels } from '@/domain/enums/ProgramStatus';

export interface ProgramCardProps {
  program: Program;
  onEdit?: (program: Program) => void;
  onDelete?: (program: Program) => void;
  onDetail?: (program: Program) => void;
  detailLink?: string;
  showEdit?: boolean;
  showDelete?: boolean;
}

export function ProgramCard({
  program,
  onEdit,
  onDelete,
  onDetail,
  detailLink,
  showEdit = true,
  showDelete = true,
}: ProgramCardProps) {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatShortDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const daysRemaining = Math.ceil(
    (new Date(program.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const progressPercentage = Math.round((program.currentCompanies / program.maxCompanies) * 100);

  const durationMonths =
    program.durationMonths ||
    Math.ceil(
      (new Date(program.endDate).getTime() - new Date(program.startDate).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );

  return (
    <Card className="group flex flex-col h-full hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary/30 dark:hover:border-primary/30">
      {/* Header with Badges */}
      <CardHeader className="pb-3 space-y-3">
        {/* Badges Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {program.city && (
              <Badge variant="secondary" className="text-xs font-medium">
                {program.city}
              </Badge>
            )}
            {program.programType && (
              <Badge variant="outline" className="text-xs font-medium">
                {program.programType}
              </Badge>
            )}
          </div>
          <Badge
            className={`${statusColors[program.status]} border font-medium px-2.5 py-1 shrink-0 text-xs`}
          >
            {ProgramStatusLabels[program.status]}
          </Badge>
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
            <Link
              href={`/dashboard/programs/${program.id}`}
              className="hover:text-primary transition-colors"
            >
              {program.name}
            </Link>
          </CardTitle>
          {program.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {program.description}
            </p>
          )}
        </div>
      </CardHeader>

      {/* Content - Flex container for consistent button placement */}
      <CardContent className="flex-1 flex flex-col pt-0 pb-4 space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">Firma İlerlemesi</span>
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {program.currentCompanies} / {program.maxCompanies} Firma
          </div>
        </div>

        {/* Metrics Cards - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Companies Metric */}
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {program.currentCompanies}/{program.maxCompanies}
            </div>
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Firma</div>
          </div>

          {/* Duration/Days Metric */}
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {daysRemaining > 0 ? daysRemaining : 0}
            </div>
            <div className="text-xs font-medium text-green-700 dark:text-green-300">
              {daysRemaining > 0 ? 'Gün Kaldı' : 'Gün Geçti'}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          {/* Location */}
          {program.city && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {program.city}
                {program.region && ` - ${program.region}`}
              </span>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              {formatDate(program.startDate)} - {formatDate(program.endDate)}
            </span>
          </div>

          {/* Duration */}
          {durationMonths > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{durationMonths} Ay Süre</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer - Always at bottom with assignment date and buttons */}
      <CardFooter className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        {/* Assignment Date */}
        <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-400">
          <span>Oluşturulma</span>
          <span className="font-medium">{formatShortDate(program.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          {detailLink ? (
            <Button
              size="sm"
              asChild
              className="flex-1 group/btn bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none transition-colors"
            >
              <Link href={detailLink}>
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Detaylar
              </Link>
            </Button>
          ) : onDetail ? (
            <Button
              size="sm"
              onClick={() => onDetail(program)}
              className="flex-1 group/btn bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none transition-colors"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Detaylar
            </Button>
          ) : (
            <Button
              size="sm"
              asChild
              className="flex-1 group/btn bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none transition-colors"
            >
              <Link href={`/dashboard/programs/${program.id}`}>
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Detaylar
              </Link>
            </Button>
          )}
          {showEdit && onEdit && (
            <Button
              size="sm"
              onClick={() => onEdit(program)}
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-none transition-colors"
            >
              Düzenle
            </Button>
          )}
          {showDelete && onDelete && (
            <Button
              size="sm"
              onClick={() => onDelete(program)}
              className="flex-1 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700 shadow-none transition-colors"
            >
              Sil
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
