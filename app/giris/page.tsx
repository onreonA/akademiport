'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ModernNavigation from '@/components/layout/ModernNavigation';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // API'ye login isteği gönder
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Cookie'leri gönder
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız');
      }

      // Başarılı login - role'e göre redirect
      setLoading(false);
      
      // Role'e göre yönlendirme
      if (data.user.role.startsWith('firma')) {
        router.push('/firma');
      } else {
        router.push('/admin');
      }
      
    } catch (error: any) {
      setError(error.message || 'Giriş yapılırken bir hata oluştu');
      setLoading(false);
    }
  };
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      {/* Modern Navigation */}
      <ModernNavigation />
      
      {/* Hero Section with Single Login Form */}
      <section className='relative py-20 min-h-screen flex items-center'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl'>
          {/* Single Login Container */}
          <div className='max-w-md mx-auto'>
            <div className='relative'>
              <div className='bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 hover:shadow-3xl transition-all duration-500'>
                {/* Header */}
                <div className='text-center mb-8'>
                  <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
                    <i className='ri-login-circle-line text-3xl text-white w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <h2 className='text-3xl font-bold text-gray-900 mb-3'>
                    Giriş Yap
                  </h2>
                  <p className='text-gray-600 leading-relaxed'>
                    E-posta adresiniz ve şifrenizle sisteme giriş yapın
                  </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleLogin} className='space-y-6'>
                  <div className='space-y-4'>
                    <div>
                      <label htmlFor='email' className='block text-sm font-semibold text-gray-700 mb-2'>
                        E-posta Adresi
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <i className='ri-mail-line text-gray-400 w-5 h-5 flex items-center justify-center'></i>
                        </div>
                        <input
                          type='email'
                          id='email'
                          name='email'
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className='w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white'
                          placeholder='ornek@email.com'
                          autoComplete='email'
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor='password' className='block text-sm font-semibold text-gray-700 mb-2'>
                        Şifre
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <i className='ri-lock-line text-gray-400 w-5 h-5 flex items-center justify-center'></i>
                        </div>
                        <input
                          type='password'
                          id='password'
                          name='password'
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className='w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white'
                          placeholder='••••••••'
                          autoComplete='current-password'
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center'>
                      <i className='ri-error-warning-line text-red-500 mr-3 w-5 h-5 flex items-center justify-center'></i>
                      {error}
                    </div>
                  )}
                  
                  <button
                    type='submit'
                    disabled={loading}
                    className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl'
                  >
                    {loading ? (
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
                      className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200'
                    >
                      Şifremi Unuttum
                    </Link>
                  </div>
                </form>
                
                {/* Features */}
                <div className='mt-8 pt-6 border-t border-gray-100'>
                  <h3 className='text-lg font-bold text-gray-900 mb-6 text-center'>
                    Sisteme Giriş Yaptıktan Sonra
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-blue-50 rounded-xl p-4 border border-blue-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-building-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Firma Paneli
                        </span>
                      </div>
                    </div>
                    <div className='bg-green-50 rounded-xl p-4 border border-green-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-user-star-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Admin Paneli
                        </span>
                      </div>
                    </div>
                    <div className='bg-purple-50 rounded-xl p-4 border border-purple-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-shield-check-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Güvenli Erişim
                        </span>
                      </div>
                    </div>
                    <div className='bg-orange-50 rounded-xl p-4 border border-orange-100'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center'>
                          <i className='ri-zap-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                        </div>
                        <span className='text-gray-700 text-sm font-medium'>
                          Otomatik Yönlendirme
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
                      className='text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200'
                    >
                      Kayıt Ol
                    </Link>
                  </span>
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
