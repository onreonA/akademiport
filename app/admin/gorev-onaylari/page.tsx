'use client';

import AdminLayout from '@/components/admin/AdminLayout';

import ConsultantApprovalClient from './ConsultantApprovalClient';

export default function TaskApprovals() {
  return (
    <AdminLayout
      title='Görev Onayları'
      description='Firma kullanıcılarının tamamladığı görevleri onaylayın veya reddedin'
    >
      <ConsultantApprovalClient />
    </AdminLayout>
  );
}
