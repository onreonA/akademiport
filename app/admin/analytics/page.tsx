import AdminLayout from '@/components/admin/AdminLayout';

import AssignmentAnalytics from './AssignmentAnalytics';

export default function AnalyticsPage() {
  return (
    <AdminLayout
      title='Analytics Dashboard'
      description='Proje atama analitikleri ve performans raporları'
    >
      <div className='space-y-6'>
        <AssignmentAnalytics />
      </div>
    </AdminLayout>
  );
}
