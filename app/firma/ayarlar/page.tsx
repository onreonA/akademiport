'use client';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
interface CompanyData {
  id: string;
  name: string;
  authorizedPerson: string;
}
export default function FirmaAyarlari() {
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('genel-ayarlar');
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    // Mock company data for now
    setCompanyData({
      id: '1',
      name: 'Mundo',
      authorizedPerson: 'Mundo Yetkili',
    });
    // Hızlı yükleme için loading'i false yap
    setLoading(false);
    return () => clearInterval(timer);
  }, []);
  if (loading) {
    return (
      <FirmaLayout
        title='Ayarlar'
        description='Firma ayarlarınızı yönetin ve düzenleyin'
      >
        <div className='p-6'>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Sayfa Yükleniyor
                </h3>
                <p className='text-gray-600'>Ayarlar hazırlanıyor...</p>
              </div>
            </div>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Ayarlar'
      description='Firma ayarlarınızı yönetin ve düzenleyin'
    >
      <main className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='space-y-6'>
            {/* Başlık */}
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                ⚙️ Genel Ayarlar
              </h1>
              <p className='text-gray-600'>
                Firma ayarlarınızı yönetin ve sistem tercihlerinizi düzenleyin
              </p>
            </div>
            {/* Tab Navigation */}
            <div className='bg-white border-b'>
              <div className='px-8'>
                <nav className='flex space-x-8'>
                  {[
                    {
                      id: 'genel-ayarlar',
                      name: 'Genel Ayarlar',
                      icon: 'ri-settings-3-line',
                    },
                    {
                      id: 'bildirimler',
                      name: 'Bildirimler',
                      icon: 'ri-notification-3-line',
                    },
                    {
                      id: 'güvenlik',
                      name: 'Güvenlik',
                      icon: 'ri-shield-check-line',
                    },
                    {
                      id: 'entegrasyonlar',
                      name: 'Entegrasyonlar',
                      icon: 'ri-plug-line',
                    },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className={`${tab.icon} text-lg`}></i>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            {/* Tab Content */}
            <div className='p-8'>
              {activeTab === 'genel-ayarlar' && (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Firma Bilgileri */}
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        🏢 Firma Bilgileri
                      </h3>
                      <div className='space-y-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Firma Adı
                          </label>
                          <input
                            type='text'
                            defaultValue={companyData?.name}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Yetkili Kişi
                          </label>
                          <input
                            type='text'
                            defaultValue={companyData?.authorizedPerson}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          />
                        </div>
                        <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700'>
                          Bilgileri Güncelle
                        </button>
                      </div>
                    </div>
                    {/* Sistem Bilgileri */}
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        💻 Sistem Bilgileri
                      </h3>
                      <div className='space-y-3'>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Mevcut Saat:
                          </span>
                          <span
                            className='text-sm text-gray-900 font-mono'
                            suppressHydrationWarning={true}
                          >
                            {currentTime.toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>Tarih:</span>
                          <span className='text-sm text-gray-900'>
                            {currentTime.toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-600'>
                            Sistem Durumu:
                          </span>
                          <span className='text-sm text-green-600 font-medium'>
                            Aktif
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Dil ve Bölge */}
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        🌍 Dil ve Bölge
                      </h3>
                      <div className='space-y-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Dil
                          </label>
                          <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                            <option value='tr'>Türkçe</option>
                            <option value='en'>English</option>
                            <option value='de'>Deutsch</option>
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Saat Dilimi
                          </label>
                          <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                            <option value='Europe/Istanbul'>
                              İstanbul (UTC+3)
                            </option>
                            <option value='Europe/London'>
                              Londra (UTC+0)
                            </option>
                            <option value='America/New_York'>
                              New York (UTC-5)
                            </option>
                          </select>
                        </div>
                        <button className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700'>
                          Ayarları Kaydet
                        </button>
                      </div>
                    </div>
                    {/* Tema Ayarları */}
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        🎨 Tema Ayarları
                      </h3>
                      <div className='space-y-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Tema
                          </label>
                          <div className='space-y-2'>
                            <label className='flex items-center'>
                              <input
                                type='radio'
                                name='theme'
                                value='light'
                                defaultChecked
                                className='mr-2'
                              />
                              <span className='text-sm'>Açık Tema</span>
                            </label>
                            <label className='flex items-center'>
                              <input
                                type='radio'
                                name='theme'
                                value='dark'
                                className='mr-2'
                              />
                              <span className='text-sm'>Koyu Tema</span>
                            </label>
                            <label className='flex items-center'>
                              <input
                                type='radio'
                                name='theme'
                                value='auto'
                                className='mr-2'
                              />
                              <span className='text-sm'>Otomatik</span>
                            </label>
                          </div>
                        </div>
                        <button className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700'>
                          Temayı Uygula
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'bildirimler' && (
                <div className='space-y-6'>
                  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      🔔 Bildirim Ayarları
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            Email Bildirimleri
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Önemli güncellemeler için email al
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            defaultChecked
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            Sistem Bildirimleri
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Tarayıcı bildirimleri göster
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input type='checkbox' className='sr-only peer' />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            Eğitim Hatırlatmaları
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Eğitim tamamlama hatırlatmaları
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            defaultChecked
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'güvenlik' && (
                <div className='space-y-6'>
                  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      🔒 Güvenlik Ayarları
                    </h3>
                    <div className='space-y-4'>
                      <div>
                        <h4 className='font-medium text-gray-900 mb-2'>
                          Şifre Değiştir
                        </h4>
                        <div className='space-y-3'>
                          <input
                            type='password'
                            placeholder='Mevcut şifre'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          />
                          <input
                            type='password'
                            placeholder='Yeni şifre'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          />
                          <input
                            type='password'
                            placeholder='Yeni şifre (tekrar)'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          />
                          <button className='w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700'>
                            Şifreyi Değiştir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'entegrasyonlar' && (
                <div className='space-y-6'>
                  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      🔌 Entegrasyonlar
                    </h3>
                    <div className='space-y-4'>
                      <div className='text-center py-8'>
                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                          <i className='ri-plug-line text-gray-400 text-2xl'></i>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>
                          Henüz Entegrasyon Yok
                        </h3>
                        <p className='text-gray-600'>
                          Gelecekte üçüncü parti entegrasyonlar burada görünecek
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </FirmaLayout>
  );
}
