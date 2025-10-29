/**
 * Consultant Dashboard Layout
 * Sprint 7: Consultant Management
 * Updated with new DashboardLayout system
 */

import React from 'react';
import { DashboardLayout } from '@/presentation/components/features/layout';

export default function ConsultantDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
