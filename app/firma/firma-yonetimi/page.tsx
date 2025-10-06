'use client';
import { useCallback, useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';
interface CompanyData {
  id: string;
  name: string;
  sector: string;
  authorizedPerson: string;
  email: string;
  phone: string;
  registrationDate: string;
  projectProgress: number;
  educationProgress: {
    completed: number;
    total: number;
    completionRate: number;
  };
  activeTasks: number;
  pendingDocuments: number;
  consultant: {
    name: string;
    expertise: string;
    photo: string;
    email: string;
    lastMessage: string;
    unreadMessages: number;
  };
}
const ProgressCircle = ({
  percentage,
  size = 120,
  strokeWidth = 8,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg width={size} height={size} className='transform -rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='#e5e7eb'
          strokeWidth={strokeWidth}
          fill='none'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='#3b82f6'
          strokeWidth={strokeWidth}
          fill='none'
          strokeDasharray={strokeDasharray}
          strokeLinecap='round'
          className='transition-all duration-500'
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-2xl font-bold text-gray-900'>{percentage}%</span>
        <span className='text-xs text-gray-600'>Tamamlandı</span>
      </div>
    </div>
  );
};
const ProgressBar = ({
  percentage,
  label,
  total,
  completed,
}: {
  percentage: number;
  label: string;
  total: number;
  completed: number;
}) => (
  <div className='mb-4'>
    <div className='flex items-center justify-between mb-2'>
      <span className='text-sm font-medium text-gray-700'>{label}</span>
      <span className='text-sm text-gray-600'>
        {completed}/{total}
      </span>
    </div>
    <div className='w-full bg-gray-200 rounded-full h-3'>
      <div
        className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500'
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);
export default function FirmaYonetimi() {
  const { user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('genel-bakis');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const fetchCompanyData = useCallback(async () => {
    if (!user?.email) return;
    try {
      const response = await fetch('/api/firma/me', {
        headers: {
          'X-User-Email': user.email,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const company = data.data;
        // Transform API data to match our interface
        setCompanyData({
          id: company.id,
          name: company.name || 'Firma Adı Belirtilmemiş',
          sector: company.industry || company.sector || 'Belirtilmemiş',
          authorizedPerson:
            company.authorized_person ||
            company.authorizedPerson ||
            'Belirtilmemiş',
          email: company.email,
          phone: company.phone || 'Belirtilmemiş',
          registrationDate: company.created_at
            ? new Date(company.created_at).toLocaleDateString('tr-TR')
            : 'Belirtilmemiş',
          projectProgress:
            company.progress_percentage || company.progressPercentage || 0,
          educationProgress: {
            completed: 0, // Will be fetched separately
            total: 20,
            completionRate: 0,
          },
          activeTasks: 0, // Will be fetched separately
          pendingDocuments: 0, // Will be fetched separately
          consultant: {
            name: company.consultant_name || 'Danışman Atanmamış',
            expertise: company.consultant_expertise || 'Belirtilmemiş',
            photo: '/api/placeholder/60/60',
            email: company.consultant_email || 'Belirtilmemiş',
            lastMessage: 'Henüz mesaj bulunmuyor.',
            unreadMessages: 0,
          },
        });
        // Fetch additional data
        await Promise.all([
          fetchEducationProgress(company.id),
          fetchActiveTasks(company.id),
          fetchPendingDocuments(company.id),
        ]);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [user]);
  // Fetch company data from API
  useEffect(() => {
    if (user?.email) {
      fetchCompanyData();
    }
  }, [user, fetchCompanyData]);
  const fetchEducationProgress = async (companyId: string) => {
    try {
      const response = await fetch(
        `/api/company/education-assignments?company_id=${companyId}`
      );
      if (response.ok) {
        const data = await response.json();
        const completed =
          data.data?.filter((item: any) => item.status === 'completed')
            .length || 0;
        const total = data.data?.length || 0;
        setCompanyData(prev =>
          prev
            ? {
                ...prev,
                educationProgress: {
                  completed,
                  total,
                  completionRate:
                    total > 0 ? Math.round((completed / total) * 100) : 0,
                },
              }
            : null
        );
      }
    } catch (error) {}
  };
  const fetchActiveTasks = async (companyId: string) => {
    try {
      const response = await fetch(`/api/projects?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        const activeTasks =
          data.data?.filter((project: any) => project.status === 'active')
            .length || 0;
        setCompanyData(prev =>
          prev
            ? {
                ...prev,
                activeTasks,
              }
            : null
        );
      }
    } catch (error) {}
  };
  const fetchPendingDocuments = async (companyId: string) => {
    try {
      // This would be a separate API endpoint for documents
      // For now, we'll set it to 0
      setCompanyData(prev =>
        prev
          ? {
              ...prev,
              pendingDocuments: 0,
            }
          : null
      );
    } catch (error) {}
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Firma Yönetimi'
        description='Firma bilgilerinizi yönetin'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Sayfa Yükleniyor
            </h3>
            <p className='text-gray-600'>Firma verileriniz hazırlanıyor...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Firma Yönetimi'
      description='Firma bilgilerinizi yönetin'
    >
      <div className='flex-1'>
        <main className='p-6'>
          <div className='max-w-7xl mx-auto'>
            {/* Tab Navigation */}
            <div className='bg-white border-b'>
              <div className='px-8'>
                <nav className='flex space-x-8'>
                  {[
                    {
                      id: 'genel-bakis',
                      name: 'Genel Bakış',
                      icon: 'ri-pie-chart-line',
                    },
                    {
                      id: 'firma-profili',
                      name: 'Firma Profili',
                      icon: 'ri-building-line',
                    },
                    {
                      id: 'egitim-durumu',
                      name: 'Eğitim Durumu',
                      icon: 'ri-graduation-cap-line',
                    },
                    {
                      id: 'belgeler',
                      name: 'Belgeler',
                      icon: 'ri-file-list-line',
                    },
                    {
                      id: 'islem-gecmisi',
                      name: 'İşlem Geçmişi',
                      icon: 'ri-time-line',
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
              {activeTab === 'genel-bakis' && (
                <div className='space-y-6'>
                  <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                      Firma Yönetimi
                    </h1>
                    <p className='text-gray-600'>
                      Firma profilinizi görüntüleyin ve yönetin
                    </p>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    <div className='bg-white p-6 rounded-lg shadow-sm border'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-600'>
                            Kayıt Durumu
                          </p>
                          <p className='text-2xl font-bold text-green-600'>
                            Tamamlandı
                          </p>
                        </div>
                        <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                          <i className='ri-checkbox-circle-line text-2xl text-green-600'></i>
                        </div>
                      </div>
                    </div>
                    <div className='bg-white p-6 rounded-lg shadow-sm border'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-600'>
                            Eğitim İlerlemesi
                          </p>
                          <p className='text-2xl font-bold text-blue-600'>
                            {companyData?.educationProgress.completionRate}%
                          </p>
                        </div>
                        <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                          <i className='ri-graduation-cap-line text-2xl text-blue-600'></i>
                        </div>
                      </div>
                    </div>
                    <div className='bg-white p-6 rounded-lg shadow-sm border'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-600'>
                            Aktif Projeler
                          </p>
                          <p className='text-2xl font-bold text-purple-600'>
                            3
                          </p>
                        </div>
                        <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                          <i className='ri-folder-line text-2xl text-purple-600'></i>
                        </div>
                      </div>
                    </div>
                    <div className='bg-white p-6 rounded-lg shadow-sm border'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-600'>
                            Uyarılar
                          </p>
                          <p className='text-2xl font-bold text-orange-600'>
                            2
                          </p>
                        </div>
                        <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                          <i className='ri-alert-line text-2xl text-orange-600'></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                      <h4 className='text-lg font-semibold text-gray-900 mb-6'>
                        Genel İlerleme
                      </h4>
                      <div className='flex items-center justify-center'>
                        <ProgressCircle
                          percentage={companyData?.projectProgress || 0}
                        />
                      </div>
                      <div className='mt-4 text-center'>
                        <p className='text-sm text-gray-600'>
                          Proje ilerlemesi:{' '}
                          <span className='font-semibold'>
                            {companyData?.projectProgress}%
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                      <h4 className='text-lg font-semibold text-gray-900 mb-6'>
                        Danışman Bilgileri
                      </h4>
                      <div className='flex items-center gap-4'>
                        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
                          <i className='ri-user-line text-2xl text-blue-600'></i>
                        </div>
                        <div className='flex-1'>
                          <h5 className='font-semibold text-gray-900'>
                            {companyData?.consultant.name}
                          </h5>
                          <p className='text-sm text-gray-600'>
                            {companyData?.consultant.expertise}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {companyData?.consultant.email}
                          </p>
                        </div>
                      </div>
                      <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                        <p className='text-sm text-gray-700'>
                          {companyData?.consultant.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'firma-profili' && (
                <div className='space-y-6'>
                  <div className='mb-8'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                      Firma Profili
                    </h2>
                    <p className='text-gray-600'>
                      Firma bilgilerinizi görüntüleyin ve düzenleyin
                    </p>
                  </div>
                  <div className='bg-white rounded-lg shadow-sm border'>
                    <div className='p-6 border-b'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Temel Bilgiler
                        </h3>
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg'
                        >
                          {isEditing ? 'Kaydet' : 'Düzenle'}
                        </button>
                      </div>
                    </div>
                    <div className='p-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Firma Adı
                          </label>
                          <p className='text-gray-900'>{companyData?.name}</p>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Sektör
                          </label>
                          <p className='text-gray-900'>{companyData?.sector}</p>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Yetkili Kişi
                          </label>
                          <p className='text-gray-900'>
                            {companyData?.authorizedPerson}
                          </p>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            E-posta
                          </label>
                          <p className='text-gray-900'>{companyData?.email}</p>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Telefon
                          </label>
                          <p className='text-gray-900'>{companyData?.phone}</p>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Kayıt Tarihi
                          </label>
                          <p className='text-gray-900'>
                            {companyData?.registrationDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'egitim-durumu' && (
                <div className='space-y-6'>
                  <div className='mb-8'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                      Eğitim Durumu
                    </h2>
                    <p className='text-gray-600'>
                      Eğitim modüllerinizin ilerleme durumunu görüntüleyin
                    </p>
                  </div>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                      <h4 className='text-lg font-semibold text-gray-900 mb-6'>
                        Genel İlerleme
                      </h4>
                      <div className='flex items-center justify-center'>
                        <ProgressCircle
                          percentage={
                            companyData?.educationProgress.completionRate || 0
                          }
                        />
                      </div>
                      <div className='mt-4 text-center'>
                        <p className='text-sm text-gray-600'>
                          <span className='font-semibold'>
                            {companyData?.educationProgress.completed}
                          </span>{' '}
                          / {companyData?.educationProgress.total} modül
                          tamamlandı
                        </p>
                      </div>
                    </div>
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                      <h4 className='text-lg font-semibold text-gray-900 mb-6'>
                        Modül Detayları
                      </h4>
                      <div className='space-y-4'>
                        <ProgressBar
                          percentage={85}
                          label='E-İhracat Temelleri'
                          total={8}
                          completed={7}
                        />
                        <ProgressBar
                          percentage={60}
                          label='Dijital Pazarlama'
                          total={5}
                          completed={3}
                        />
                        <ProgressBar
                          percentage={40}
                          label='Sektör Analizi'
                          total={6}
                          completed={2}
                        />
                        <ProgressBar
                          percentage={0}
                          label='İhracat Finansmanı'
                          total={4}
                          completed={0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'belgeler' && (
                <div className='space-y-6'>
                  <div className='mb-8'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                      Belgeler
                    </h2>
                    <p className='text-gray-600'>
                      Firma belgelerinizi görüntüleyin ve yönetin
                    </p>
                  </div>
                  <div className='bg-white rounded-lg shadow-sm border'>
                    <div className='p-6 border-b'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Belgeler
                        </h3>
                        <p className='text-sm text-gray-500'>
                          Sadece görüntüleme - Yükleme admin tarafından yapılır
                        </p>
                      </div>
                    </div>
                    <div className='p-6'>
                      <div className='text-center py-8'>
                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                          <i className='ri-file-text-line text-gray-400 text-2xl'></i>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>
                          Henüz Belge Yüklenmemiş
                        </h3>
                        <p className='text-gray-600'>
                          Belgeleriniz admin tarafından yüklendiğinde burada
                          görünecek
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'islem-gecmisi' && (
                <div className='space-y-6'>
                  <div className='mb-8'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                      İşlem Geçmişi
                    </h2>
                    <p className='text-gray-600'>
                      Tüm sistem aktivitelerinizi görüntüleyin
                    </p>
                  </div>
                  <div className='bg-white rounded-lg shadow-sm border'>
                    <div className='p-6 border-b'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Son İşlemler
                      </h3>
                    </div>
                    <div className='p-6'>
                      <div className='text-center py-8'>
                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                          <i className='ri-time-line text-gray-400 text-2xl'></i>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>
                          Henüz İşlem Geçmişi Yok
                        </h3>
                        <p className='text-gray-600'>
                          Sistem aktiviteleriniz burada görünecek
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </FirmaLayout>
  );
}
