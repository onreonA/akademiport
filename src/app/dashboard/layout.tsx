/**
 * Master Admin Dashboard Layout
 * Layout for /dashboard/* routes
 */

import React from 'react';
import { DashboardLayout } from '@/presentation/components/features/layout';

export default function MasterAdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

