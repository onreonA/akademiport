import CompanyDateDashboard from '@/components/firma/CompanyDateDashboard';
import FirmaLayout from '@/components/firma/FirmaLayout';

export default function FirmaTarihYonetimiPage() {
  return (
    <FirmaLayout title='Tarih Yönetimi'>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Tarih Yönetimi</h1>
            <p className='text-gray-600 mt-1'>
              Proje ve görev tarihlerinizi görüntüleyin ve takip edin
            </p>
          </div>
        </div>

        <CompanyDateDashboard />
      </div>
    </FirmaLayout>
  );
}
