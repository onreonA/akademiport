/**
 * Consultant Programs Page
 * Sprint 7: Consultant Management
 *
 * Consultant'ın atandığı programları listeler
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, AlertCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/atoms/button';
import { ProgramCard } from '@/presentation/components/features/programs/ProgramCard';
import {
  ConsultantProgramProvider,
  useConsultantProgram,
} from '@/shared/contexts/ConsultantProgramContext';
import type { ConsultantProgramWithStats } from '@/application/dto/consultant';
import type { Program } from '@/domain/entities/Program';

// =====================================================
// INNER COMPONENT
// =====================================================
function ConsultantProgramsContent() {
  const router = useRouter();
  const { setPrograms, setSelectedProgram, isLoading, setIsLoading } = useConsultantProgram();
  const [allPrograms, setAllPrograms] = useState<ConsultantProgramWithStats[]>([]);

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

  const handleProgramClick = (program: Program) => {
    const item = allPrograms.find((p) => p.program.id === program.id);
    if (item) {
      setSelectedProgram(item.program);
      router.push('/consultant-dashboard');
    }
  };

  const handleDetailClick = (program: Program) => {
    // Navigate to consultant program detail page
    router.push(`/consultant-dashboard/programs/${program.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                Programlar yükleniyor...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (allPrograms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
              <FolderKanban className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Henüz Programa Atanmadınız
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Sistem yöneticisi tarafından bir programa atandığınızda burada görünecektir.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Convert ConsultantProgramWithStats to Program for ProgramCard
  const programList: Program[] = allPrograms.map((item) => ({
    ...item.program,
    // ProgramCard expects specific fields
    currentCompanies: item.companiesCount,
    maxCompanies: item.program.maxCompanies || item.companiesCount || 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Programlarım
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg">
              Atandığınız e-ihracat dönüşüm programları
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {allPrograms.length} program
              </div>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programList.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onDetail={handleDetailClick}
              showEdit={false}
              showDelete={false}
            />
          ))}
        </div>
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
