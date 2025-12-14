/**
 * Consultant Dashboard Layout
 * Sprint 7: Consultant Management
 * Updated with new DashboardLayout system
 */

import React from 'react';
import { DashboardLayout } from '@/1-presentation/components/features/layout';
import { ConsultantProgramProvider } from '@/5-shared/contexts/ConsultantProgramContext';

export default function ConsultantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsultantProgramProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ConsultantProgramProvider>
  );
}
