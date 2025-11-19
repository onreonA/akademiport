/**
 * Admin Dashboard Layout
 *
 * Admin dashboard sayfaları için layout wrapper
 */

import React from 'react';
import { DashboardLayout } from '@/presentation/components/features/layout';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
