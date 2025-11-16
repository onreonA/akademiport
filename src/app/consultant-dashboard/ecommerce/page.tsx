'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EcommercePerformanceTable } from '@/1-presentation/components/features/ecommerce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/atoms/select';
import { Input } from '@/presentation/components/ui/atoms/input';
import { Label } from '@/presentation/components/ui/atoms/label';
import { useConsultantProgram } from '@/5-shared/contexts/ConsultantProgramContext';

interface Program {
  id: string;
  name: string;
}

function ConsultantEcommercePageContent() {
  const searchParams = useSearchParams();
  const programIdFromUrl = searchParams.get('programId') || '';
  const { selectedProgram, setSelectedProgram, programs, isLoading } = useConsultantProgram();
  const [minRevenue, setMinRevenue] = useState<string>('');

  // Set program from URL if provided
  useEffect(() => {
    if (programIdFromUrl && programs.length > 0) {
      const program = programs.find((p) => p.id === programIdFromUrl);
      if (program && (!selectedProgram || selectedProgram.id !== programIdFromUrl)) {
        setSelectedProgram(program);
      }
    }
  }, [programIdFromUrl, programs, selectedProgram, setSelectedProgram]);

  const selectedProgramId = selectedProgram?.id || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">E-ticaret Performans Tablosu</h1>
        <p className="text-muted-foreground mt-2">
          Firmaların e-ticaret performanslarını görüntüleyin ve karşılaştırın
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {!isLoading && programs.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="program">Program:</Label>
            <Select
              value={selectedProgramId || programs[0]?.id || ''}
              onValueChange={(value) => {
                const program = programs.find((p) => p.id === value);
                if (program) {
                  setSelectedProgram(program);
                }
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Program seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Label htmlFor="minRevenue">Min. Gelir:</Label>
          <Input
            id="minRevenue"
            type="number"
            placeholder="0"
            value={minRevenue}
            onChange={(e) => setMinRevenue(e.target.value)}
            className="w-[150px]"
          />
        </div>
      </div>

      {/* Performance Table */}
      {selectedProgramId && (
        <EcommercePerformanceTable
          programId={selectedProgramId}
          minRevenue={minRevenue ? parseFloat(minRevenue) : undefined}
        />
      )}
    </div>
  );
}

export default function ConsultantEcommercePage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <ConsultantEcommercePageContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
