/**
 * Program Card Component
 * 
 * Displays a program summary card with key information
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/presentation/components/ui/atoms/card';
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">
              <Link
                href={`/dashboard/programs/${program.id}`}
                className="hover:text-primary transition-colors"
              >
                {program.name}
              </Link>
            </CardTitle>
            {program.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {program.description}
              </p>
            )}
          </div>
          <Badge className={statusColors[program.status]}>
            {ProgramStatusLabels[program.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Location */}
        {program.city && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {program.city}
              {program.region && ` - ${program.region}`}
            </span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {formatDate(program.startDate)} - {formatDate(program.endDate)}
          </span>
        </div>

        {/* Companies */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>
            {program.currentCompanies} / {program.maxCompanies} Firma
          </span>
          <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all"
              style={{
                width: `${(program.currentCompanies / program.maxCompanies) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Program Type */}
        {program.programType && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{program.programType}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/programs/${program.id}`}>Detay</Link>
        </Button>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(program)}>
            Düzenle
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(program)}>
            Sil
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

