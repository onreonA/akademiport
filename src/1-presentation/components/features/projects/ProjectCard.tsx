/**
 * Project Card Component
 *
 * Modern, elegant card design inspired by ProgramCard
 * Consistent layout with fixed button positions
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
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
import {
  Building2,
  User,
  Calendar,
  Eye,
  Trash2,
  FolderKanban,
  TrendingUp,
  Pencil,
} from 'lucide-react';
import ConsultantChangeDialog from './ConsultantChangeDialog';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  companyName?: string;
  consultantName?: string;
  consultantId?: string | null;
  createdAt: string;
  start_date?: string;
  end_date?: string;
}

export interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onConsultantChanged?: () => void;
}

export function ProjectCard({ project, onEdit, onDelete, onConsultantChanged }: ProjectCardProps) {
  const [consultantDialogOpen, setConsultantDialogOpen] = useState(false);

  const statusColors = {
    planning:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    active:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    on_hold:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    completed:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    cancelled:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    todo: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    in_progress:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    review:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    done: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  };

  const priorityColors = {
    low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    medium:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    urgent:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    critical:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const statusLabels: Record<string, string> = {
    planning: 'Planlama',
    active: 'Aktif',
    on_hold: 'Beklemede',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
    todo: 'Yapılacak',
    in_progress: 'Devam Ediyor',
    review: 'İncelemede',
    done: 'Tamamlandı',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    urgent: 'Acil',
    critical: 'Kritik',
  };

  const formatShortDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const progressPercentage = project.progress || 0;

  return (
    <Card className="group flex flex-col h-full hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary/30 dark:hover:border-primary/30">
      {/* Header with Badges */}
      <CardHeader className="pb-3 space-y-3">
        {/* Badges Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {project.companyName && (
              <Badge variant="secondary" className="text-xs font-medium">
                <Building2 className="h-3 w-3 mr-1" />
                {project.companyName}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              className={`${statusColors[project.status as keyof typeof statusColors] || statusColors.todo} border font-medium px-2.5 py-1 text-xs`}
            >
              {statusLabels[project.status as keyof typeof statusLabels] || project.status}
            </Badge>
            {project.priority && (
              <Badge
                className={`${priorityColors[project.priority as keyof typeof priorityColors] || priorityColors.medium} border font-medium px-2.5 py-1 text-xs`}
              >
                {priorityLabels[project.priority as keyof typeof priorityLabels] ||
                  project.priority}
              </Badge>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
            {project.name}
          </CardTitle>
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {project.description}
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
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">İlerleme</span>
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
        </div>

        {/* Metrics Cards - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Company Metric */}
          {project.companyName && (
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-xs font-medium text-purple-700 dark:text-purple-300 truncate">
                {project.companyName}
              </div>
            </div>
          )}

          {/* Consultant Metric */}
          {project.consultantName ? (
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800 group/consultant relative">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-xs font-medium text-green-700 dark:text-green-300 truncate">
                {project.consultantName}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 opacity-0 group-hover/consultant:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConsultantDialogOpen(true);
                }}
                title="Danışman değiştir"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <FolderKanban className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs font-medium text-gray-700 dark:text-gray-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConsultantDialogOpen(true);
                }}
              >
                Danışman Ata
              </Button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          {/* Company */}
          {project.companyName && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {project.companyName}
              </span>
            </div>
          )}

          {/* Consultant */}
          {project.consultantName && (
            <div className="flex items-center gap-2 text-sm group/consultant-info">
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                {project.consultantName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover/consultant-info:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConsultantDialogOpen(true);
                }}
                title="Danışman değiştir"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Dates */}
          {project.start_date && project.end_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                {formatDate(project.start_date)} - {formatDate(project.end_date)}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer - Always at bottom with creation date and buttons */}
      <CardFooter className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        {/* Creation Date */}
        <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-gray-400">
          <span>Oluşturulma</span>
          <span className="font-medium">{formatShortDate(project.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          <Button
            size="sm"
            asChild
            className="flex-1 group/btn bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none transition-colors"
          >
            <Link href={`/dashboard/projects/${project.id}`}>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Detaylar
            </Link>
          </Button>
          {onDelete && (
            <Button
              size="sm"
              onClick={() => onDelete(project)}
              className="flex-1 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700 shadow-none transition-colors"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Sil
            </Button>
          )}
        </div>
      </CardFooter>
      <ConsultantChangeDialog
        open={consultantDialogOpen}
        onOpenChange={setConsultantDialogOpen}
        projectId={project.id}
        currentConsultantId={project.consultantId}
        currentConsultantName={project.consultantName}
        onSuccess={onConsultantChanged}
      />
    </Card>
  );
}
