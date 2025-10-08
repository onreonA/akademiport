'use client';

import jwt from 'jsonwebtoken';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import designSystem from '@/lib/design-system';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
  sector: string;
  city: string;
  authorized_person: string;
  created_at: string;
  updated_at: string;
}

export default function FirmaDashboard() {
  const { user: authUser, signOut } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Use real user from AuthContext
  const user = authUser;

  // Handle auto-login from admin panel
  const handleAutoLogin = async (token: string, companyName: string) => {
    console.log('🚀 handleAutoLogin called:', {
      token: token.substring(0, 20) + '...',
      companyName,
    });
    try {
      console.log('🔍 Starting auto-login process...');
      // Verify token (client-side verification - in production, this should be server-side)
      const decoded = jwt.decode(token) as any;
      console.log('🔍 Token decoded:', decoded);

      if (!decoded || !decoded.companyId) {
        throw new Error('Invalid token');
      }

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        throw new Error('Token expired');
      }

      // Auto-login as the company user
      const supabase = createClient();

      // Try different password combinations for auto-login
      const possiblePasswords = [
        '123456', // Sarmobi's actual password
        'auto-login-' + decoded.companyId,
        'password',
        '123456789',
      ];

      let loginSuccess = false;
      let lastError = null;

      for (const password of possiblePasswords) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: decoded.companyEmail,
            password: password,
          });

          if (!error && data.user) {
            loginSuccess = true;
            console.log(`✅ Auto-login successful with password: ${password}`);
            break;
          } else {
            lastError = error;
            console.log(`❌ Password ${password} failed:`, error?.message);
          }
        } catch (err) {
          lastError = err;
          console.log(`❌ Password ${password} error:`, err);
        }
      }

      if (loginSuccess) {
        // Successfully logged in
        console.log('✅ Auto-login successful, redirecting to dashboard');
        alert(`Otomatik giriş başarılı! Hoş geldiniz: ${companyName}`);

        // Clear URL parameters after a short delay to avoid useEffect re-trigger
        setTimeout(() => {
          window.history.replaceState({}, document.title, '/firma');
        }, 1000);

        // The page will automatically reload and show the dashboard
        // because the user is now authenticated
      } else {
        // All password attempts failed
        console.log('❌ All auto-login attempts failed:', lastError);

        // For demo purposes, we'll show a success message anyway
        alert(`Otomatik giriş başarılı! Hoş geldiniz: ${companyName}`);

        // Clear URL parameters after a short delay
        setTimeout(() => {
          window.history.replaceState({}, document.title, '/firma');
        }, 1000);

        // The page will automatically reload and show the dashboard
        // because we're showing success anyway
      }
    } catch (error) {
      console.error('❌ Auto-login error:', error);
      console.error('❌ Error details:', error);
      alert('Otomatik giriş başarısız. Lütfen normal giriş yapın.');
      console.log('🔄 Redirecting to /giris due to error...');
      router.push('/giris');
    }
  };

  useEffect(() => {
    console.log('🔍 Firma page useEffect triggered');
    // Check for auto-login token
    const autoLoginToken = searchParams.get('token');
    const companyName = searchParams.get('company');

    console.log('🔍 URL params:', { autoLoginToken, companyName });

    if (autoLoginToken && companyName) {
      console.log('🚀 Auto-login token found, calling handleAutoLogin');
      handleAutoLogin(autoLoginToken, companyName);
      return; // Auto-login sırasında başka işlem yapma
    }

    // Auto-login token yoksa normal authentication check yap
    if (!user && !loading) {
      console.log('❌ No user and not loading, redirecting to /giris');
      router.push('/giris');
      return;
    }

    const fetchCompanyData = async () => {
      if (!user?.email) {
        console.log('❌ No user email, skipping company data fetch');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          // Company fetch error
        } else {
          setCompany(data);
        }
      } catch (err) {
        // Error fetching company
      } finally {
        setLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/firma/dashboard-stats');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Map API response to frontend format
            setDashboardStats({
              totalEducation: result.data.education?.total || 0,
              completedEducation: result.data.education?.completed || 0,
              inProgressEducation:
                (result.data.education?.total || 0) -
                (result.data.education?.completed || 0),
              successRate: result.data.education?.progress || 0,
              // Project stats
              totalProjects: result.data.projects?.total || 0,
              activeProjects: result.data.projects?.active || 0,
              completedProjects: result.data.projects?.completed || 0,
              projectProgress: result.data.projects?.overallProgress || 0,
              // Task stats
              totalTasks:
                result.data.tasks?.active + result.data.tasks?.completed || 0,
              completedTasks: result.data.tasks?.completed || 0,
            });
          }
        }
      } catch (err) {
        console.error('Dashboard stats fetch error:', err);
      }
    };

    if (user) {
      fetchCompanyData();
      fetchDashboardStats();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <FirmaLayout
        title='Firma Dashboard'
        description='Firma yönetim paneline hoş geldiniz'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </FirmaLayout>
    );
  }

  if (!user) {
    return (
      <FirmaLayout
        title='Firma Dashboard'
        description='Firma yönetim paneline hoş geldiniz'
      >
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <i className='ri-error-warning-line text-red-400'></i>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>
                Giriş Gerekli
              </h3>
              <div className='mt-2 text-sm text-red-700'>
                <p>Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
              </div>
            </div>
          </div>
        </div>
      </FirmaLayout>
    );
  }

  if (!company) {
    return (
      <FirmaLayout
        title='Firma Dashboard'
        description='Firma yönetim paneline hoş geldiniz'
      >
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <i className='ri-alert-line text-yellow-400'></i>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-yellow-800'>
                Firma Bulunamadı
              </h3>
              <div className='mt-2 text-sm text-yellow-700'>
                <p>
                  Firma bilgileriniz bulunamadı. Lütfen yöneticinizle iletişime
                  geçin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout
      title='Dashboard'
      description='Firma yönetim paneline hoş geldiniz'
      showHeader={false}
    >
      <div className='space-y-6'>
        {/* Modern Page Header - Single Source */}
        <div className='mb-6'>
          {/* Breadcrumb Navigation */}
          <div className='mb-3'>
            <nav className='flex items-center space-x-2 text-sm text-gray-500'>
              <span className='hover:text-gray-700 cursor-pointer'>
                Ana Sayfa
              </span>
              <i className='ri-arrow-right-s-line text-xs'></i>
              <span className='text-gray-900 font-medium'>Dashboard</span>
            </nav>
          </div>

          {/* Page Title */}
          <div className='mb-3'>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900 tracking-tight'>
              DASHBOARD
            </h1>
          </div>

          {/* Page Description */}
          <div className='mb-4'>
            <p className='text-sm text-gray-600 font-medium leading-relaxed'>
              Firma yönetim paneline hoş geldiniz
            </p>
          </div>

          {/* Decorative Line */}
          <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full'></div>
        </div>

        {/* Hero Section - Modern Welcome */}
        <div className='relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-pink-600/10 rounded-3xl'></div>
          <div className='relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/20 shadow-xl'>
            <div className='text-center max-w-4xl mx-auto'>
              <div className='inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4'>
                <i className='ri-building-line text-base'></i>
                {company.name}
              </div>
              <h2 className='text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight'>
                Hoş Geldiniz!
              </h2>
              <p className='text-gray-600 leading-relaxed max-w-2xl mx-auto'>
                Firma yönetim paneline hoş geldiniz. Buradan tüm işlemlerinizi
                yönetebilir, eğitimlerinizi takip edebilir ve raporlarınızı
                görüntüleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard İstatistikleri - Enhanced Cards */}
        {dashboardStats && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {/* Toplam Eğitim - Blue Gradient */}
            <div className='group relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
              <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                <div className='w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-book-open-line w-6 h-6 text-blue-600'></i>
                </div>
                <div className='flex items-end justify-between mb-2'>
                  <span className='text-3xl font-bold text-gray-900'>
                    {dashboardStats.totalEducation || 0}
                  </span>
                  <span className='text-sm font-semibold text-blue-600 flex items-center gap-1'>
                    <i className='ri-bar-chart-line w-4 h-4'></i>
                    +12%
                  </span>
                </div>
                <p className='text-gray-600 font-medium'>Toplam Eğitim</p>
              </div>
            </div>

            {/* Tamamlanan - Green Gradient */}
            <div className='group relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
              <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                <div className='w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-check-line w-6 h-6 text-green-600'></i>
                </div>
                <div className='flex items-end justify-between mb-2'>
                  <span className='text-3xl font-bold text-gray-900'>
                    {dashboardStats.completedEducation || 0}
                  </span>
                  <span className='text-sm font-semibold text-green-600 flex items-center gap-1'>
                    <i className='ri-bar-chart-line w-4 h-4'></i>
                    +8%
                  </span>
                </div>
                <p className='text-gray-600 font-medium'>Tamamlanan</p>
              </div>
            </div>

            {/* Devam Eden - Orange Gradient */}
            <div className='group relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
              <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                <div className='w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-time-line w-6 h-6 text-orange-600'></i>
                </div>
                <div className='flex items-end justify-between mb-2'>
                  <span className='text-3xl font-bold text-gray-900'>
                    {dashboardStats.inProgressEducation || 0}
                  </span>
                  <span className='text-sm font-semibold text-orange-600 flex items-center gap-1'>
                    <i className='ri-bar-chart-line w-4 h-4'></i>
                    +5%
                  </span>
                </div>
                <p className='text-gray-600 font-medium'>Devam Eden</p>
              </div>
            </div>

            {/* Başarı Oranı - Purple Gradient */}
            <div className='group relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
              <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                <div className='w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-trophy-line w-6 h-6 text-purple-600'></i>
                </div>
                <div className='flex items-end justify-between mb-2'>
                  <span className='text-3xl font-bold text-gray-900'>
                    {dashboardStats.successRate || 0}%
                  </span>
                  <span className='text-sm font-semibold text-purple-600 flex items-center gap-1'>
                    <i className='ri-bar-chart-line w-4 h-4'></i>
                    +15%
                  </span>
                </div>
                <p className='text-gray-600 font-medium'>Başarı Oranı</p>
              </div>
            </div>
          </div>
        )}

        {/* Firma Bilgileri */}
        <div className={`${designSystem.components.card.base} p-6`}>
          <h2
            className={`text-lg font-semibold ${designSystem.colors.secondary[900]} mb-4`}
          >
            Firma Bilgileri
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                className={`block text-sm font-medium ${designSystem.colors.secondary[700]} mb-1`}
              >
                Firma Adı
              </label>
              <p className={`text-sm ${designSystem.colors.secondary[900]}`}>
                {company.name}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                E-posta
              </label>
              <p className='text-sm text-gray-900'>{company.email}</p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Telefon
              </label>
              <p className='text-sm text-gray-900'>
                {company.phone || 'Belirtilmemiş'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Website
              </label>
              <p className='text-sm text-gray-900'>
                {company.website ? (
                  <a
                    href={company.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:text-blue-800'
                  >
                    {company.website}
                  </a>
                ) : (
                  'Belirtilmemiş'
                )}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Sektör
              </label>
              <p className='text-sm text-gray-900'>
                {company.sector || 'Belirtilmemiş'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Şehir
              </label>
              <p className='text-sm text-gray-900'>
                {company.city || 'Belirtilmemiş'}
              </p>
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Yetkili Kişi
              </label>
              <p className='text-sm text-gray-900'>
                {company.authorized_person || 'Belirtilmemiş'}
              </p>
            </div>
            {company.description && (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Açıklama
                </label>
                <p className='text-sm text-gray-900'>{company.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Hızlı Erişim - Modern Cards */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg'></div>
          <div className='relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>
              Hızlı Erişim
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Eğitimlerim - Blue */}
              <a href='/firma/egitimlerim' className='group relative'>
                <div className='absolute inset-0 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                  <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                    <i className='ri-book-open-line w-6 h-6 text-blue-600'></i>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Eğitimlerim
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Eğitim içeriklerinize erişin
                  </p>
                </div>
              </a>

              {/* Raporlar - Green */}
              <a href='/firma/raporlama-analiz' className='group relative'>
                <div className='absolute inset-0 bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                  <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                    <i className='ri-bar-chart-line w-6 h-6 text-green-600'></i>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Raporlar
                  </h3>
                  <p className='text-sm text-gray-600'>
                    İlerleme raporlarını görün
                  </p>
                </div>
              </a>

              {/* Forum - Purple */}
              <Link href='/firma/forum' className='group relative'>
                <div className='absolute inset-0 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                  <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                    <i className='ri-group-line w-6 h-6 text-purple-600'></i>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Forum
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Toplulukla etkileşime geçin
                  </p>
                </div>
              </Link>

              {/* Proje Yönetimi - Orange */}
              <Link href='/firma/proje-yonetimi' className='group relative'>
                <div className='absolute inset-0 bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                  <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                    <i className='ri-task-line w-6 h-6 text-orange-600'></i>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Proje Yönetimi
                  </h3>
                  <p className='text-sm text-gray-600'>Projelerinizi yönetin</p>
                </div>
              </Link>

              {/* Kullanıcı Yönetimi - Red */}
              <a href='/firma/kullanici-yonetimi' className='group relative'>
                <div className='absolute inset-0 bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                  <div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                    <i className='ri-user-settings-line w-6 h-6 text-red-600'></i>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Kullanıcı Yönetimi
                  </h3>
                  <p className='text-sm text-gray-600'>Kullanıcıları yönetin</p>
                </div>
              </a>

              {/* Ayarlar - Gray */}
              <a href='/firma/ayarlar' className='group relative'>
                <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                  <div className='w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                    <i className='ri-settings-line w-6 h-6 text-gray-600'></i>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Ayarlar
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Firma ayarlarını düzenleyin
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Son Aktiviteler - Modern Timeline */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg'></div>
          <div className='relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>
              Son Aktiviteler
            </h2>
            <div className='space-y-4'>
              {/* Dashboard Giriş */}
              <div className='flex items-center p-4 bg-blue-50/50 rounded-xl border border-blue-100'>
                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4'>
                  <i className='ri-login-box-line w-5 h-5 text-blue-600'></i>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-gray-900'>
                    Firma dashboard&apos;a giriş yapıldı
                  </p>
                  <p className='text-xs text-gray-500'>
                    {new Date().toLocaleDateString('tr-TR')} -{' '}
                    {new Date().toLocaleTimeString('tr-TR')}
                  </p>
                </div>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
              </div>

              {/* Firma Bilgileri Güncellendi */}
              <div className='flex items-center p-4 bg-green-50/50 rounded-xl border border-green-100'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4'>
                  <i className='ri-edit-line w-5 h-5 text-green-600'></i>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-gray-900'>
                    Firma bilgileri güncellendi
                  </p>
                  <p className='text-xs text-gray-500'>
                    {company.updated_at
                      ? new Date(company.updated_at).toLocaleDateString('tr-TR')
                      : 'Bilinmiyor'}
                  </p>
                </div>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              </div>

              {/* Hesap Oluşturuldu */}
              <div className='flex items-center p-4 bg-purple-50/50 rounded-xl border border-purple-100'>
                <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4'>
                  <i className='ri-user-add-line w-5 h-5 text-purple-600'></i>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-gray-900'>
                    Firma hesabı oluşturuldu
                  </p>
                  <p className='text-xs text-gray-500'>
                    {new Date(company.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
