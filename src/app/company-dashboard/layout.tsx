/**
 * Company Dashboard Layout
 * Layout for /company-dashboard/* routes
 */

import React from 'react';
import { DashboardLayout } from '@/presentation/components/features/layout';

export default function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

