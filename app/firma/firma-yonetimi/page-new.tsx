'use client';
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Edit,
  FileText,
  Save,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import AnimatedSidebar from '@/components/layout/AnimatedSidebar';
import MinimalHeader from '@/components/layout/MinimalHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LoadingState from '@/components/ui/LoadingState';
import PageTitle from '@/components/ui/PageTitle';
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
export default function FirmaYonetimi() {
  const { user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('genel-bakis');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [unreadNotifications] = useState(2);
  // Fetch company data from API
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch company basic data
        const companyResponse = await fetch('/api/firma/me', {
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': user.email,
          },
        });
        if (companyResponse.ok) {
          const companyResponseData = await companyResponse.json();
          const companyData = companyResponseData.data || companyResponseData;
          setCompanyData({
            id: companyData.id,
            name: companyData.name,
            sector: companyData.industry || 'Belirtilmemiş',
            authorizedPerson: companyData.authorized_person || 'Belirtilmemiş',
            email: companyData.email || user.email,
            phone: companyData.phone || 'Belirtilmemiş',
            registrationDate: companyData.created_at,
            projectProgress: 78,
            educationProgress: {
              completed: 12,
              total: 16,
              completionRate: 75,
            },
            activeTasks: 5,
            pendingDocuments: 3,
            consultant: {
              name: 'Danışman Adı',
              expertise: 'E-İhracat Uzmanı',
              photo:
                'https://readdy.ai/api/search-image?query=Professional%20business%20consultant%20woman%2C%20smiling%2C%20modern%20office%20background%2C%20professional%20headshot%2C%20high%20quality%2C%20realistic',
              email: 'danisman@ihracatakademi.com',
              lastMessage: 'Merhaba! Size nasıl yardımcı olabilirim?',
              unreadMessages: 0,
            },
          });
        } else {
          setCompanyData({
            id: '1',
            name: 'Firma Adı (API Hatası)',
            sector: 'Sektör',
            authorizedPerson: 'Yetkili Kişi',
            email: user.email,
            phone: 'Telefon',
            registrationDate: 'Tarih',
            projectProgress: 78,
            educationProgress: {
              completed: 12,
              total: 16,
              completionRate: 75,
            },
            activeTasks: 5,
            pendingDocuments: 3,
            consultant: {
              name: 'Danışman',
              expertise: 'Danışmanlık',
              photo: '/api/placeholder/60/60',
              email: 'danisman@ihracatakademi.com',
              lastMessage: 'Mesaj',
              unreadMessages: 0,
            },
          });
        }
      } catch (error) {
        setCompanyData({
          id: '1',
          name: 'Firma Adı (API Hatası)',
          sector: 'Sektör',
          authorizedPerson: 'Yetkili Kişi',
          email: user.email,
          phone: 'Telefon',
          registrationDate: 'Tarih',
          projectProgress: 78,
          educationProgress: {
            completed: 12,
            total: 16,
            completionRate: 75,
          },
          activeTasks: 5,
          pendingDocuments: 3,
          consultant: {
            name: 'Danışman',
            expertise: 'Danışmanlık',
            photo: '/api/placeholder/60/60',
            email: 'danisman@ihracatakademi.com',
            lastMessage: 'Mesaj',
            unreadMessages: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [user]);
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {}
  };
  if (loading || !companyData) {
    return (
      <div className='flex flex-col h-screen bg-gray-50'>
        <MinimalHeader onSidebarToggle={() => {}} />
        <div className='flex flex-1'>
          <div className='hidden md:block'>
            <AnimatedSidebar collapsed={false} onToggle={() => {}} />
          </div>
          <div className='flex-1 flex flex-col'>
            <main className='flex-1 overflow-auto p-6'>
              <LoadingState
                type='skeleton'
                message='Firma verileri yükleniyor...'
              />
            </main>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      {/* Minimal Header - Full Width */}
      <MinimalHeader
        onSidebarToggle={() => {
          setSidebarCollapsed(!sidebarCollapsed);
          setMobileSidebarOpen(!mobileSidebarOpen);
        }}
      />
      {/* Main Content with Sidebar */}
      <div className='flex flex-1'>
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        {/* Animated Sidebar */}
        <div className='hidden md:block'>
          <AnimatedSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div className='fixed left-0 top-16 h-full w-64 bg-white shadow-lg z-50 md:hidden'>
            <AnimatedSidebar
              collapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
            />
          </div>
        )}
        {/* Content Area */}
        <div className='flex-1 flex flex-col'>
          <main className='flex-1 overflow-auto p-6'>
            {/* Breadcrumb */}
            <Breadcrumb className='mb-4' />
            {/* Page Title */}
            <PageTitle
              title='Firma Yönetimi'
              subtitle='Firma profilinizi görüntüleyin ve yönetin'
              icon={<Building size={20} />}
              className='mb-6'
            />
            {/* Tab Navigation */}
            <div className='bg-white border-b rounded-t-lg'>
              <div className='px-6'>
                <nav className='flex space-x-8'>
                  {[
                    {
                      id: 'genel-bakis',
                      name: 'Genel Bakış',
                      icon: <Building size={16} />,
                    },
                    {
                      id: 'firma-profili',
                      name: 'Firma Profili',
                      icon: <FileText size={16} />,
                    },
                    {
                      id: 'egitim-durumu',
                      name: 'Eğitim Durumu',
                      icon: <CheckCircle size={16} />,
                    },
                    {
                      id: 'belgeler',
                      name: 'Belgeler',
                      icon: <FileText size={16} />,
                    },
                    {
                      id: 'islem-gecmisi',
                      name: 'İşlem Geçmişi',
                      icon: <Calendar size={16} />,
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
                      {tab.icon}
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            {/* Tab Content */}
            <div className='bg-white rounded-b-lg shadow-sm border border-gray-100'>
              <div className='p-6'>
                {activeTab === 'genel-bakis' && (
                  <div className='space-y-6'>
                    {/* Stats Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                      <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-green-100 text-sm font-medium'>
                              Kayıt Durumu
                            </p>
                            <p className='text-2xl font-bold'>Tamamlandı</p>
                          </div>
                          <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                            <CheckCircle size={24} />
                          </div>
                        </div>
                      </div>
                      <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-blue-100 text-sm font-medium'>
                              Eğitim İlerlemesi
                            </p>
                            <p className='text-2xl font-bold'>
                              {companyData.educationProgress.completionRate}%
                            </p>
                          </div>
                          <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                            <CheckCircle size={24} />
                          </div>
                        </div>
                      </div>
                      <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-purple-100 text-sm font-medium'>
                              Aktif Projeler
                            </p>
                            <p className='text-2xl font-bold'>3</p>
                          </div>
                          <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                            <FileText size={24} />
                          </div>
                        </div>
                      </div>
                      <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-orange-100 text-sm font-medium'>
                              Uyarılar
                            </p>
                            <p className='text-2xl font-bold'>2</p>
                          </div>
                          <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                            <AlertTriangle size={24} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Active Warnings */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
                      <div className='p-6 border-b'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Aktif Uyarılar
                        </h3>
                      </div>
                      <div className='p-6 space-y-4'>
                        <div className='flex items-center justify-between p-4 bg-red-50 rounded-lg'>
                          <div className='flex items-center space-x-3'>
                            <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
                              <AlertTriangle
                                size={16}
                                className='text-red-600'
                              />
                            </div>
                            <div>
                              <p className='font-medium text-gray-900'>
                                DYS Kayıt Eksik
                              </p>
                              <p className='text-sm text-gray-600'>
                                Dijital Yeterlilik Sınav kaydınızı tamamlayınız
                              </p>
                            </div>
                          </div>
                          <button className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors'>
                            İşlem Gerekli
                          </button>
                        </div>
                        <div className='flex items-center justify-between p-4 bg-yellow-50 rounded-lg'>
                          <div className='flex items-center space-x-3'>
                            <div className='w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center'>
                              <AlertTriangle
                                size={16}
                                className='text-yellow-600'
                              />
                            </div>
                            <div>
                              <p className='font-medium text-gray-900'>
                                SWOT Analizi Eksik
                              </p>
                              <p className='text-sm text-gray-600'>
                                Firma SWOT analizinizi tamamlayınız
                              </p>
                            </div>
                          </div>
                          <button className='px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors'>
                            Tamamla
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Assigned Consultant */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
                      <div className='p-6 border-b'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Atanmış Danışman
                        </h3>
                      </div>
                      <div className='p-6'>
                        <div className='flex items-center space-x-4'>
                          <Image
                            src={companyData.consultant.photo}
                            alt='Danışman'
                            width={64}
                            height={64}
                            className='w-16 h-16 rounded-full object-cover'
                          />
                          <div className='flex-1'>
                            <h4 className='text-lg font-semibold text-gray-900'>
                              {companyData.consultant.name}
                            </h4>
                            <p className='text-gray-600'>
                              {companyData.consultant.expertise}
                            </p>
                            <p className='text-sm text-gray-500'>
                              Elektronik Sektörü Uzmanı
                            </p>
                          </div>
                          <div className='flex space-x-2'>
                            <button className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors'>
                              Mesaj Gönder
                            </button>
                            <button className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors'>
                              Randevu Al
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'firma-profili' && (
                  <div className='space-y-6'>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
                      <div className='p-6 border-b flex items-center justify-between'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Firma Profili
                        </h3>
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors'
                          >
                            <Edit size={16} className='mr-2 inline' />
                            Düzenle
                          </button>
                        ) : (
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => setIsEditing(false)}
                              className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors'
                            >
                              <Save size={16} className='mr-2 inline' />
                              Kaydet
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors'
                            >
                              <X size={16} className='mr-2 inline' />
                              İptal
                            </button>
                          </div>
                        )}
                      </div>
                      <div className='p-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Firma Adı
                            </label>
                            <p className='text-gray-900 font-medium'>
                              {companyData.name}
                            </p>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Yetkili Kişi
                            </label>
                            <p className='text-gray-900'>
                              {companyData.authorizedPerson}
                            </p>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              E-posta
                            </label>
                            <p className='text-gray-900'>{companyData.email}</p>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Telefon
                            </label>
                            <p className='text-gray-900'>{companyData.phone}</p>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Sektör
                            </label>
                            <p className='text-gray-900'>
                              {companyData.sector}
                            </p>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Kayıt Tarihi
                            </label>
                            <p className='text-gray-900'>
                              {new Date(
                                companyData.registrationDate
                              ).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'egitim-durumu' && (
                  <div className='space-y-6'>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
                      <div className='p-6 border-b'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Eğitim Durumu
                        </h3>
                      </div>
                      <div className='p-6'>
                        <div className='flex items-center justify-between mb-4'>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>
                              Genel İlerleme
                            </p>
                            <p className='text-2xl font-bold text-blue-600'>
                              {companyData.educationProgress.completionRate}%
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm text-gray-600'>Tamamlanan</p>
                            <p className='text-lg font-semibold'>
                              {companyData.educationProgress.completed}/
                              {companyData.educationProgress.total}
                            </p>
                          </div>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-3'>
                          <div
                            className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500'
                            style={{
                              width: `${companyData.educationProgress.completionRate}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'belgeler' && (
                  <div className='space-y-6'>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
                      <div className='p-6 border-b'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Belgeler
                        </h3>
                      </div>
                      <div className='p-6'>
                        <p className='text-gray-600'>
                          Belge yönetimi özelliği yakında eklenecek.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'islem-gecmisi' && (
                  <div className='space-y-6'>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
                      <div className='p-6 border-b'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          İşlem Geçmişi
                        </h3>
                      </div>
                      <div className='p-6'>
                        <p className='text-gray-600'>
                          İşlem geçmişi özelliği yakında eklenecek.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
