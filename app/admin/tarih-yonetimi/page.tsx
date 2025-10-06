import AdminLayout from '@/components/admin/AdminLayout';
import DateManagementDashboard from '@/components/admin/DateManagementDashboard';

export default function TarihYonetimiPage() {
  return (
    <AdminLayout title='Tarih Yönetimi'>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Tarih Yönetimi</h1>
            <p className='text-gray-600 mt-1'>
              Proje ve görev tarihlerini yönetin, analiz edin ve takip edin
            </p>
          </div>
        </div>

        <DateManagementDashboard />
      </div>
    </AdminLayout>
  );
}
