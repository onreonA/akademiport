/**
 * Template Card Component
 *
 * Modern, elegant card design inspired by ProgramCard
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
import { Calendar, FolderOpen, Copy, Eye, Edit, Trash2, Sparkles } from 'lucide-react';

export interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    _count?: {
      sub_projects: number;
    };
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onPreview?: (id: string) => void;
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: {
    label: 'Düşük',
    color:
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  },
  medium: {
    label: 'Orta',
    color:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  high: {
    label: 'Yüksek',
    color:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  },
  urgent: {
    label: 'Acil',
    color:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  },
  critical: {
    label: 'Kritik',
    color:
      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  },
};

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
}: TemplateCardProps) {
  const formatDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Geçersiz Tarih';
      }
      return dateObj.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Geçersiz Tarih';
    }
  };

  const formatShortDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Geçersiz Tarih';
      }
      return dateObj.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Geçersiz Tarih';
    }
  };

  const priorityInfo = priorityConfig[template.priority] || priorityConfig.medium;
  const subProjectsCount = template._count?.sub_projects || 0;

  return (
    <Card className="group flex flex-col h-full hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary/30 dark:hover:border-primary/30">
      {/* Header with Badges */}
      <CardHeader className="pb-3 space-y-3">
        {/* Badges Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Şablon
          </Badge>
          <Badge
            className={`${priorityInfo.color} border font-medium px-2.5 py-1 shrink-0 text-xs`}
          >
            {priorityInfo.label}
          </Badge>
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
            {template.name}
          </CardTitle>
          {template.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {template.description}
            </p>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col pt-0 pb-4 space-y-4">
        {/* Info Section */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          {/* Alt Proje */}
          <div className="flex items-center gap-2 text-sm">
            <FolderOpen className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">{subProjectsCount}</span> Alt Proje
            </span>
          </div>

          {/* Oluşturulma */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              Oluşturulma: {formatDate(template.created_at)}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer - Always at bottom with buttons */}
      <CardFooter className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
        {/* Action Buttons - 2 rows */}
        <div className="flex gap-2 w-full">
          {onPreview && (
            <Button
              size="sm"
              onClick={() => onPreview(template.id)}
              className="flex-1 group/btn bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none transition-colors"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Önizle
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              onClick={() => onEdit(template.id)}
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-none transition-colors"
            >
              <Edit className="mr-1.5 h-3.5 w-3.5" />
              Düzenle
            </Button>
          )}
        </div>
        <div className="flex gap-2 w-full">
          {onDuplicate && (
            <Button
              size="sm"
              onClick={() => onDuplicate(template.id)}
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-none transition-colors"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Kopyala
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              onClick={() => onDelete(template.id)}
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
