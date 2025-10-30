/**
 * Consultant Companies Page
 * Sprint 7: Consultant Management
 *
 * Tüm programlardaki firmaları listeler
 */

'use client';

import React from 'react';
import { ConsultantProgramProvider } from '@/shared/contexts/ConsultantProgramContext';
import { ConsultantCompanyList } from '@/presentation/components/features/consultant';

export default function ConsultantCompaniesPage() {
  return (
    <ConsultantProgramProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Firmalar</h1>
          <p className="text-muted-foreground mt-2">Atandığınız programlardaki tüm firmalar</p>
        </div>

        <ConsultantCompanyList />
      </div>
    </ConsultantProgramProvider>
  );
}
