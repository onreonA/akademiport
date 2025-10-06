'use client';

import FirmaLayout from '@/components/firma/FirmaLayout';

import ProgressDashboardClient from './ProgressDashboardClient';

export default function IlerlemeDashboard() {
  return (
    <FirmaLayout
      title='İlerleme Dashboard'
      description='Projelerinizin ve görevlerinizin ilerlemesini takip edin'
      showHeader={false}
    >
      <ProgressDashboardClient />
    </FirmaLayout>
  );
}
