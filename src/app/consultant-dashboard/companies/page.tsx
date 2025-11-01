/**
 * Consultant Companies Page
 * Sprint 7: Consultant Management
 *
 * Tüm programlardaki firmaları listeler
 */

'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ConsultantProgramProvider } from '@/shared/contexts/ConsultantProgramContext';
import {
  ProgramSelector,
  ConsultantCompanyList,
} from '@/presentation/components/features/consultant';
import { EnhancedCard } from '@/presentation/components/ui/atoms/enhanced-card';

export default function ConsultantCompaniesPage() {
  return (
    <ConsultantProgramProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Firmalar</h1>
          <p className="text-muted-foreground mt-2">Atandığınız programlardaki tüm firmalar</p>
        </div>

        {/* Program Selector */}
        <EnhancedCard variant="glass" className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Program Seçin
            </h3>
            <p className="text-sm text-muted-foreground">
              Firmaları görüntülemek için bir program seçin
            </p>
          </div>
          <ProgramSelector />
        </EnhancedCard>

        {/* Company List */}
        <ConsultantCompanyList />
      </div>
    </ConsultantProgramProvider>
  );
}
