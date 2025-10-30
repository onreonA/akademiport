/**
 * Profile Layout
 * Layout for /profile route
 */

import React from 'react';
import { DashboardLayout } from '@/presentation/components/features/layout';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

