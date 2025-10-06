'use client';
import Link from 'next/link';

import FirmaLayout from '@/components/firma/FirmaLayout';
export default function FirmaEgitimlerimPage() {
  return (
    <FirmaLayout
      title='Eğitimlerim'
      description='Eğitim içeriklerinize erişin ve ilerlemenizi takip edin'
    >
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Education Categories */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <Link href='/firma/egitimlerim/videolar' className='group'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group-hover:scale-105'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
                    <i className='ri-play-circle-line text-blue-600 text-xl'></i>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                      Video Eğitimleri
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Video tabanlı eğitim içerikleri
                    </p>
                  </div>
                </div>
                <p className='text-gray-600 text-sm'>
                  YouTube videoları ile interaktif eğitim deneyimi yaşayın.
                </p>
              </div>
            </Link>
            <Link href='/firma/egitimlerim/dokumanlar' className='group'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group-hover:scale-105'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors'>
                    <i className='ri-file-text-line text-green-600 text-xl'></i>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors'>
                      Dökümanlar
                    </h3>
                    <p className='text-sm text-gray-600'>
                      PDF ve döküman eğitimleri
                    </p>
                  </div>
                </div>
                <p className='text-gray-600 text-sm'>
                  PDF, Word ve PowerPoint dökümanları ile detaylı bilgi edinin.
                </p>
              </div>
            </Link>
            <Link href='/firma/egitimlerim/ilerleme' className='group'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group-hover:scale-105'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors'>
                    <i className='ri-pie-chart-line text-purple-600 text-xl'></i>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors'>
                      İlerleme Takibi
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Eğitim ilerleme raporları
                    </p>
                  </div>
                </div>
                <p className='text-gray-600 text-sm'>
                  Eğitim setlerinizin ve dökümanlarınızın ilerleme durumunu
                  takip edin.
                </p>
              </div>
            </Link>
          </div>
          {/* Quick Stats */}
          <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-play-circle-line text-blue-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>0</p>
                  <p className='text-sm text-gray-600'>Atanan Video Seti</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-file-text-line text-green-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>0</p>
                  <p className='text-sm text-gray-600'>Atanan Döküman</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-pie-chart-line text-purple-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>0%</p>
                  <p className='text-sm text-gray-600'>Genel İlerleme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
