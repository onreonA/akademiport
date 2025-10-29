/**
 * Consultant Dashboard Layout
 * Sprint 7: Consultant Management
 */

import React from 'react';
import { ConsultantHeader } from '@/presentation/components/features/consultant';

export default function ConsultantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <ConsultantHeader />
      <main>{children}</main>
    </div>
  );
}
