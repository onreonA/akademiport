/**
 * Program Card Component
 *
 * Displays a program summary card with key information
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
import { Calendar, MapPin, Users, Building2 } from 'lucide-react';
import type { Program } from '@/domain/entities/Program';
import { ProgramStatusLabels } from '@/domain/enums/ProgramStatus';

export interface ProgramCardProps {
  program: Program;
  onEdit?: (program: Program) => void;
  onDelete?: (program: Program) => void;
}

export function ProgramCard({ program, onEdit, onDelete }: ProgramCardProps) {
  const statusColors = {
    planned: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    completed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    paused: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
              <Link
                href={`/dashboard/programs/${program.id}`}
                className="hover:text-primary transition-colors"
              >
                {program.name}
              </Link>
            </CardTitle>
            {program.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {program.description}
              </p>
            )}
          </div>
          <Badge className={`${statusColors[program.status]} font-medium px-3 py-1`}>
            {ProgramStatusLabels[program.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location */}
        {program.city && (
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium">
              {program.city}
              {program.region && ` - ${program.region}`}
            </span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-3 text-sm">
          <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-950">
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">
              {formatDate(program.startDate)} - {formatDate(program.endDate)}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.ceil(
                (new Date(program.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              )}{' '}
              gün kaldı
            </span>
          </div>
        </div>

        {/* Companies Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-950">
                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium">
                {program.currentCompanies} / {program.maxCompanies} Firma
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((program.currentCompanies / program.maxCompanies) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-500 ease-out"
              style={{
                width: `${(program.currentCompanies / program.maxCompanies) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Program Type */}
        {program.programType && (
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-950">
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-medium">{program.programType}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 justify-end pt-4">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Link href={`/dashboard/programs/${program.id}`}>Detay</Link>
        </Button>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(program)}
            className="hover:bg-secondary transition-colors"
          >
            Düzenle
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(program)}
            className="hover:bg-destructive/90 transition-colors"
          >
            Sil
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
