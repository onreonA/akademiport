import AdminLayout from '@/components/admin/AdminLayout';

import SubProjectReportsClient from './SubProjectReportsClient';

export default function SubProjectReportsPage() {
  return (
    <AdminLayout title='Alt Proje Raporları'>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Alt Proje Raporları
            </h1>
            <p className='text-gray-600 mt-1'>
              Tamamlanan alt projeler için danışman değerlendirme raporları
            </p>
          </div>
        </div>

        <SubProjectReportsClient />
      </div>
    </AdminLayout>
  );
}
