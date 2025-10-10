'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ModernNavigation from '@/components/layout/ModernNavigation';
import { useAuthStore } from '@/lib/stores/auth-store';
export default function LoginPage() {
  const [firmEmail, setFirmEmail] = useState('');
  const [firmPassword, setFirmPassword] = useState('');
  const [consultantEmail, setConsultantEmail] = useState('');
  const [consultantPassword, setConsultantPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firmError, setFirmError] = useState('');
  const [consultantError, setConsultantError] = useState('');
  const { signIn } = useAuthStore();
  const router = useRouter();
  const handleFirmLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setFirmError('');
      await signIn(firmEmail, firmPassword);
      // Başarılı giriş sonrası server-side redirect (cookie'nin set edilmesini bekle)
      window.location.href = '/firma';
    } catch (error: any) {
      setFirmError(error.message || 'Firma girişinde bir hata oluştu');
      setIsLoading(false);
    }
  };
  const handleConsultantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setConsultantError('');
      await signIn(consultantEmail, consultantPassword);
      // Başarılı giriş sonrası server-side redirect (cookie'nin set edilmesini bekle)
      window.location.href = '/admin';
    } catch (error: any) {
      setConsultantError(error.message || 'Danışman girişinde bir hata oluştu');
      setIsLoading(false);
    }
  };
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      {/* Modern Navigation */}
      <ModernNavigation />
      {/* Hero Section with Login Forms */}
      <section className='relative py-20 min-h-screen flex items-center'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
          {/* Main Login Container */}
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            {/* Firma Girişi - Sol Panel */}
            <div className='relative'>
              <div className='bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-blue-100 hover:shadow-3xl transition-all duration-500'>
                {/* Header */}
                <div className='text-center mb-8'>
                  <div className='w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
                    <i className='ri-building-2-line text-3xl text-white w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <h2 className='text-3xl font-bold text-gray-900 mb-3'>
                    Firma Girişi
                  </h2>
                  <p className='text-gray-600 leading-relaxed'>
                    Hesabınıza giriş yapın ve e-ihracat yolculuğunuza devam edin
                  </p>
                </div>
                {/* Form */}
                <form
                  onSubmit={handleFirmLogin}
                  className='space-y-6'
                  key='firma-form'
                >
                  <div className='space-y-4'>
                    <div>
                      <label
                        htmlFor='firmEmail'
                        className='block text-sm font-semibold text-gray-700 mb-2'
                      >
                        E-posta Adresi
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <i className='ri-mail-line text-gray-400 w-5 h-5 flex items-center justify-center'></i>
                        </div>
                        <input
                          type='email'
                          id='firmEmail'
                          name='firmEmail'
                          value={firmEmail}
                          onChange={e => setFirmEmail(e.target.value)}
                          className='w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white'
                          placeholder='firma@example.com'
                          autoComplete='off'
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor='firmPassword'
                        className='block text-sm font-semibold text-gray-700 mb-2'
                      >
                        Şifre
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <i className='ri-lock-line text-gray-400 w-5 h-5 flex items-center justify-center'></i>
                        </div>
                        <input
                          type='password'
                          id='firmPassword'
                          name='firmPassword'
                          value={firmPassword}
                          onChange={e => setFirmPassword(e.target.value)}
                          className='w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white'
                          placeholder='••••••••'
                          autoComplete='new-password'
                          required
                        />
                      </div>
                    </div>
                  </div>
                  {firmError && (
                    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center'>
                      <i className='ri-error-warning-line text-red-500 mr-3 w-5 h-5 flex items-center justify-center'></i>
                      {firmError}
                    </div>
                  )}
                  <button
                    type='submit'
                    disabled={isLoading}
                    className='w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl'
                  >
                    {isLoading ? (
                      <span className='flex items-center justify-center'>
                        <i className='ri-loader-4-line animate-spin mr-2 w-5 h-5 flex items-center justify-center'></i>
                        Giriş Yapılıyor...
                      </span>
                    ) : (
                      <span className='flex items-center justify-center'>
                        <i className='ri-login-circle-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                        Giriş Yap
                      </span>
                    )}
                  </button>
                  <div className='text-center'>
                    <Link
                      href='/sifremi-unuttum'
                      className='text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors duration-200'
                    >
                      Şifremi Unuttum
                    </Link>
                  </div>
                </form>
                {/* Features */}
                <div className='mt-8 pt-6 border-t border-gray-100'>
                  <h3 className='text-lg font-bold text-gray-900 mb-6 text-center'>
                    Firma Panelinde Neler Var?
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-orange-50 rounded-xl p-4 border border-orange-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-line-chart-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Süreç Takibi
                        </span>
                      </div>
                    </div>
                    <div className='bg-blue-50 rounded-xl p-4 border border-blue-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-graduation-cap-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Eğitim Yönetimi
                        </span>
                      </div>
                    </div>
                    <div className='bg-green-50 rounded-xl p-4 border border-green-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-file-upload-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Belge Yönetimi
                        </span>
                      </div>
                    </div>
                    <div className='bg-purple-50 rounded-xl p-4 border border-purple-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-message-3-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Danışman İletişim
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='mt-6 text-center'>
                  <span className='text-gray-600 text-sm'>
                    Henüz kaydınız yok mu?{' '}
                    <Link
                      href='/kayit'
                      className='text-orange-600 hover:text-orange-800 font-semibold transition-colors duration-200'
                    >
                      Kayıt Ol
                    </Link>
                  </span>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className='absolute -top-4 -right-4 w-8 h-8 bg-orange-200 rounded-full opacity-60'></div>
              <div className='absolute -bottom-4 -left-4 w-6 h-6 bg-blue-200 rounded-full opacity-60'></div>
            </div>
            {/* Danışman Girişi - Sağ Panel */}
            <div className='relative'>
              <div className='bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 hover:shadow-3xl transition-all duration-500'>
                {/* Header */}
                <div className='text-center mb-8'>
                  <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
                    <i className='ri-user-star-line text-3xl text-white w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <h2 className='text-3xl font-bold text-gray-900 mb-3'>
                    Danışman Girişi
                  </h2>
                  <p className='text-gray-600 leading-relaxed'>
                    Profesyonel panele giriş yapın ve firmalarınızı yönetin
                  </p>
                </div>
                {/* Form */}
                <form
                  onSubmit={handleConsultantLogin}
                  className='space-y-6'
                  key='consultant-form'
                >
                  <div className='space-y-4'>
                    <div>
                      <label
                        htmlFor='consultantEmail'
                        className='block text-sm font-semibold text-gray-700 mb-2'
                      >
                        E-posta Adresi
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <i className='ri-mail-line text-gray-400 w-5 h-5 flex items-center justify-center'></i>
                        </div>
                        <input
                          type='email'
                          id='consultantEmail'
                          name='consultantEmail'
                          value={consultantEmail}
                          onChange={e => setConsultantEmail(e.target.value)}
                          className='w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white'
                          placeholder='danisman@example.com'
                          autoComplete='off'
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor='consultantPassword'
                        className='block text-sm font-semibold text-gray-700 mb-2'
                      >
                        Şifre
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <i className='ri-lock-line text-gray-400 w-5 h-5 flex items-center justify-center'></i>
                        </div>
                        <input
                          type='password'
                          id='consultantPassword'
                          name='consultantPassword'
                          value={consultantPassword}
                          onChange={e => setConsultantPassword(e.target.value)}
                          className='w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white'
                          placeholder='••••••••'
                          autoComplete='new-password'
                          required
                        />
                      </div>
                    </div>
                  </div>
                  {consultantError && (
                    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center'>
                      <i className='ri-error-warning-line text-red-500 mr-3 w-5 h-5 flex items-center justify-center'></i>
                      {consultantError}
                    </div>
                  )}
                  <button
                    type='submit'
                    disabled={isLoading}
                    className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl'
                  >
                    {isLoading ? (
                      <span className='flex items-center justify-center'>
                        <i className='ri-loader-4-line animate-spin mr-2 w-5 h-5 flex items-center justify-center'></i>
                        Giriş Yapılıyor...
                      </span>
                    ) : (
                      <span className='flex items-center justify-center'>
                        <i className='ri-shield-star-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                        Giriş Yap
                      </span>
                    )}
                  </button>
                  <div className='text-center'>
                    <Link
                      href='/sifremi-unuttum'
                      className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200'
                    >
                      Şifremi Unuttum
                    </Link>
                  </div>
                </form>
                {/* Features */}
                <div className='mt-8 pt-6 border-t border-gray-100'>
                  <h3 className='text-lg font-bold text-gray-900 mb-6 text-center'>
                    Danışman Panelinde Neler Var?
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-blue-50 rounded-xl p-4 border border-blue-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-building-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Firma Yönetimi
                        </span>
                      </div>
                    </div>
                    <div className='bg-green-50 rounded-xl p-4 border border-green-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-pulse-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          İlerleme Takibi
                        </span>
                      </div>
                    </div>
                    <div className='bg-purple-50 rounded-xl p-4 border border-purple-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-sticky-note-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Not Yönetimi
                        </span>
                      </div>
                    </div>
                    <div className='bg-indigo-50 rounded-xl p-4 border border-indigo-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-bar-chart-box-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Analiz Araçları
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className='absolute -top-4 -right-4 w-8 h-8 bg-blue-200 rounded-full opacity-60'></div>
              <div className='absolute -bottom-4 -left-4 w-6 h-6 bg-indigo-200 rounded-full opacity-60'></div>
            </div>
          </div>
        </div>
      </section>
      {/* Modern Footer */}
      <footer className='bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white py-12'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
          <div className='text-center'>
            <div className='flex items-center justify-center space-x-3 mb-6'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center'>
                <i className='ri-global-line text-white text-2xl w-7 h-7 flex items-center justify-center'></i>
              </div>
              <span className="font-['Inter'] font-black text-2xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent tracking-tight">
                AKADEMİ PORT
              </span>
            </div>
            <p className='text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto'>
              Türkiye&apos;nin E-İhracat Kapasitesini Birlikte Yükseltiyoruz
            </p>
            <div className='flex flex-wrap justify-center gap-6 text-sm text-gray-400'>
              <div className='flex items-center'>
                <i className='ri-shield-check-line text-green-400 mr-2 w-4 h-4 flex items-center justify-center'></i>
                Güvenli Giriş
              </div>
              <div className='flex items-center'>
                <i className='ri-customer-service-2-line text-blue-400 mr-2 w-4 h-4 flex items-center justify-center'></i>
                7/24 Destek
              </div>
              <div className='flex items-center'>
                <i className='ri-award-line text-orange-400 mr-2 w-4 h-4 flex items-center justify-center'></i>
                Onaylı Platform
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
