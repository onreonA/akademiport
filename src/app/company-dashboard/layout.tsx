/**
 * Company Dashboard Layout
 * Sprint 7.5: Company User Management
 */

import React from 'react';
import { DashboardLayout } from '@/presentation/components/features/layout';

export default function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout variant="company-dashboard">{children}</DashboardLayout>;
}
