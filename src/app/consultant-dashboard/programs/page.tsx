/**
 * Consultant Programs Page
 * Sprint 7: Consultant Management
 * 
 * Consultant'ın atandığı programları listeler
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, MapPin, Building2, Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/atoms/card';
import { Badge } from '@/presentation/components/ui/atoms/badge';
import { Button } from '@/presentation/components/ui/atoms/button';
import { Skeleton } from '@/presentation/components/ui/atoms/skeleton';
import { ConsultantProgramProvider, useConsultantProgram } from '@/shared/contexts/ConsultantProgramContext';
import type { ConsultantProgramDto } from '@/application/dto/consultant';
import { ProgramStatus } from '@/domain/enums/ProgramStatus';

// =====================================================
// INNER COMPONENT
// =====================================================
function ConsultantProgramsContent() {
  const router = useRouter();
  const { programs, setPrograms, setSelectedProgram, isLoading, setIsLoading } = useConsultantProgram();
  const [allPrograms, setAllPrograms] = useState<ConsultantProgramDto[]>([]);

  useEffect(() => {
    fetchAllPrograms();
  }, []);

  const fetchAllPrograms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/consultant/programs?limit=100');
      const data = await response.json();

      if (data.success) {
        setAllPrograms(data.data);
        setPrograms(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgramClick = (program: ConsultantProgramDto) => {
    setSelectedProgram(program);
    router.push('/consultant-dashboard');
  };

  const getStatusLabel = (status: ProgramStatus): string => {
    const labels: Record<ProgramStatus, string> = {
      [ProgramStatus.ACTIVE]: 'Aktif',
      [ProgramStatus.PLANNED]: 'Planlandı',
      [ProgramStatus.COMPLETED]: 'Tamamlandı',
      [ProgramStatus.CANCELLED]: 'İptal',
    };
    return labels[status];
  };

  const getStatusVariant = (status: ProgramStatus) => {
    switch (status) {
      case ProgramStatus.ACTIVE:
        return 'default';
      case ProgramStatus.PLANNED:
        return 'secondary';
      case ProgramStatus.COMPLETED:
        return 'outline';
      case ProgramStatus.CANCELLED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programlarım</h1>
          <p className="text-muted-foreground mt-2">Atandığınız programların listesi</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (allPrograms.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programlarım</h1>
          <p className="text-muted-foreground mt-2">Atandığınız programların listesi</p>
        </div>

        <Card className="p-12 text-center">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Henüz Programa Atanmadınız</h3>
          <p className="text-muted-foreground">
            Sistem yöneticisi tarafından bir programa atandığınızda burada görünecektir.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Programlarım</h1>
        <p className="text-muted-foreground mt-2">
          Toplam {allPrograms.length} programa atandınız
        </p>
      </div>

      {/* Programs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allPrograms.map((program) => (
          <Card
            key={program.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleProgramClick(program)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  {program.city && (
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {program.city}
                    </CardDescription>
                  )}
                </div>
                <Badge variant={getStatusVariant(program.status)}>
                  {getStatusLabel(program.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              {program.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {program.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{program.totalCompanies}</span>
                  <span className="text-muted-foreground">firma</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-green-600">{program.activeCompanies}</span>
                  <span className="text-muted-foreground">aktif</span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDate(program.startDate)} - {formatDate(program.endDate)}
                </span>
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgramClick(program);
                }}
              >
                Firmaları Görüntüle
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// PAGE COMPONENT (with Provider)
// =====================================================
export default function ConsultantProgramsPage() {
  return (
    <ConsultantProgramProvider>
      <ConsultantProgramsContent />
    </ConsultantProgramProvider>
  );
}
