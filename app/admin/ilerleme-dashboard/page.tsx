'use client';

import AdminLayout from '@/components/admin/AdminLayout';

import AdminProgressDashboardClient from './AdminProgressDashboardClient';

export default function AdminIlerlemeDashboard() {
  return (
    <AdminLayout
      title='İlerleme Dashboard'
      description='Sistem geneli ilerleme ve performans analizi'
    >
      <AdminProgressDashboardClient />
    </AdminLayout>
  );
}
