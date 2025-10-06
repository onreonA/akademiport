import FirmaLayout from '@/components/firma/FirmaLayout';

import CompanyReportsClient from './CompanyReportsClient';

export default function CompanyReportsPage() {
  return (
    <FirmaLayout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Raporlarım</h1>
            <p className='text-gray-600 mt-1'>
              Tamamladığınız alt projeler için aldığınız değerlendirme raporları
            </p>
          </div>
        </div>

        <CompanyReportsClient />
      </div>
    </FirmaLayout>
  );
}
