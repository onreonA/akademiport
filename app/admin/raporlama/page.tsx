import AdminLayout from '@/components/admin/AdminLayout';
import DateComplianceReport from '@/components/admin/DateComplianceReport';

export default function RaporlamaPage() {
  return (
    <AdminLayout title='Raporlama & Analiz'>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Raporlama & Analiz
            </h1>
            <p className='text-gray-600 mt-1'>
              Proje ve görev tarih uyumluluk raporları, performans analizleri
            </p>
          </div>
        </div>

        <DateComplianceReport />
      </div>
    </AdminLayout>
  );
}
