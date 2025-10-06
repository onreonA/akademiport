'use client';

import { useState } from 'react';
import {
  RiAddLine,
  RiArrowRightLine,
  RiBarChartLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiDashboardLine,
  RiEyeLine,
  RiFileTextLine,
  RiFlagLine,
  RiFolderLine,
  RiLineChartLine,
  RiMessageLine,
  RiNotificationLine,
  RiRocketLine,
  RiSettingsLine,
  RiStarLine,
  RiTeamLine,
  RiUserLine,
} from 'react-icons/ri';

export default function TestDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      <div className='bg-gradient-to-br from-blue-600 via-purple-700 to-orange-500 py-16 text-white relative overflow-hidden'>
        <div className='absolute inset-0 bg-black/20'></div>
        <div className='absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse'></div>
        <div className='absolute top-20 right-20 w-16 h-16 bg-white/5 rounded-full animate-bounce'></div>
        <div className='absolute bottom-10 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse'></div>

        <div className='relative z-10 max-w-7xl mx-auto px-6'>
          <div className='inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/30'>
            <RiStarLine className='text-white mr-2 w-5 h-5' />
            <span className='text-white font-semibold text-sm tracking-wide'>
              TEST DASHBOARD - YENİ TASARIM SİSTEMİ
            </span>
          </div>

          <h1 className='text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight'>
            Etkileyici
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300'>
              {' '}
              Dashboard{' '}
            </span>
            Tasarımı
          </h1>

          <p className='text-xl text-white/90 mb-8 leading-relaxed max-w-3xl'>
            Comprehensive design test sayfasından çıkarılan tüm tasarım
            elementlerini kullanarak oluşturulan modern firma dashboard örneği.
          </p>

          <div className='flex flex-col sm:flex-row gap-4'>
            <button className='inline-flex items-center bg-white text-blue-600 text-lg px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg'>
              <RiEyeLine className='mr-2 w-5 h-5' />
              Detayları İncele
            </button>
            <button className='inline-flex items-center bg-transparent border-2 border-white text-white text-lg px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300'>
              <RiRocketLine className='mr-2 w-5 h-5' />
              Test Et
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className='relative inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 text-white text-lg px-6 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300'
            >
              <RiNotificationLine className='mr-2 w-5 h-5' />
              Bildirimler
              <span className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                3
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className='absolute top-32 right-6 z-30 bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 max-h-96 overflow-y-auto'>
          <div className='p-4 border-b border-gray-100'>
            <h3 className='font-semibold text-gray-900'>Bildirimler</h3>
          </div>
          <div className='p-4 space-y-3'>
            {[
              {
                title: 'Yeni mesaj',
                description: 'Ahmet Yılmaz size mesaj gönderdi',
                time: '2 dk önce',
                unread: true,
              },
              {
                title: 'Proje güncellendi',
                description: 'E-ticaret projesi tamamlandı',
                time: '15 dk önce',
                unread: true,
              },
              {
                title: 'Toplantı hatırlatması',
                description: 'Yarın saat 14:00 toplantısı var',
                time: '1 saat önce',
                unread: false,
              },
            ].map((notification, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${
                  notification.unread
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900 mb-1'>
                      {notification.title}
                    </h4>
                    <p className='text-gray-600 text-sm mb-2'>
                      {notification.description}
                    </p>
                    <p className='text-gray-500 text-xs'>{notification.time}</p>
                  </div>
                  {notification.unread && (
                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-1'></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className='p-4 border-t border-gray-100'>
            <button className='w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm'>
              Tüm Bildirimleri Gör
            </button>
          </div>
        </div>
      )}

      {/* Stats Section - Enhanced */}
      <div className='max-w-7xl mx-auto px-6 -mt-8 relative z-20'>
        <div className='grid md:grid-cols-4 gap-6 mb-12'>
          {/* Toplam Projeler - Blue Gradient */}
          <div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer'>
            <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white relative'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10'></div>
              <div className='absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8'></div>
              <div className='relative z-10'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                    <RiFileTextLine className='text-white text-2xl' />
                  </div>
                  <div className='text-right'>
                    <div className='flex items-center text-green-300 text-sm font-semibold mb-1'>
                      <RiLineChartLine className='w-4 h-4 mr-1' />
                      +24%
                    </div>
                    <div className='text-white/60 text-xs'>Bu ay</div>
                  </div>
                </div>
                <div className='text-3xl font-bold mb-2'>1,247</div>
                <div className='text-white/90 text-sm font-medium'>
                  Toplam Projeler
                </div>
              </div>
            </div>
            <div className='p-4 bg-gray-50'>
              <div className='flex items-center justify-between text-xs text-gray-600'>
                <span>Aktif: 892</span>
                <span>Tamamlanan: 355</span>
              </div>
            </div>
          </div>

          {/* Tamamlanan Görevler - Green Gradient */}
          <div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer'>
            <div className='bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white relative'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10'></div>
              <div className='absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8'></div>
              <div className='relative z-10'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                    <RiCheckLine className='text-white text-2xl' />
                  </div>
                  <div className='text-right'>
                    <div className='flex items-center text-green-300 text-sm font-semibold mb-1'>
                      <RiLineChartLine className='w-4 h-4 mr-1' />
                      +12%
                    </div>
                    <div className='text-white/60 text-xs'>Bu hafta</div>
                  </div>
                </div>
                <div className='text-3xl font-bold mb-2'>3,892</div>
                <div className='text-white/90 text-sm font-medium'>
                  Tamamlanan Görevler
                </div>
              </div>
            </div>
            <div className='p-4 bg-gray-50'>
              <div className='flex items-center justify-between text-xs text-gray-600'>
                <span>Bekleyen: 156</span>
                <span>Devam Eden: 89</span>
              </div>
            </div>
          </div>

          {/* Aktif Kullanıcılar - Purple Gradient */}
          <div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer'>
            <div className='bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white relative'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10'></div>
              <div className='absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8'></div>
              <div className='relative z-10'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                    <RiUserLine className='text-white text-2xl' />
                  </div>
                  <div className='text-right'>
                    <div className='flex items-center text-green-300 text-sm font-semibold mb-1'>
                      <RiLineChartLine className='w-4 h-4 mr-1' />
                      +8%
                    </div>
                    <div className='text-white/60 text-xs'>Bu ay</div>
                  </div>
                </div>
                <div className='text-3xl font-bold mb-2'>892</div>
                <div className='text-white/90 text-sm font-medium'>
                  Aktif Kullanıcılar
                </div>
              </div>
            </div>
            <div className='p-4 bg-gray-50'>
              <div className='flex items-center justify-between text-xs text-gray-600'>
                <span>Çevrimiçi: 234</span>
                <span>Son 7 gün: 892</span>
              </div>
            </div>
          </div>

          {/* Başarı Oranı - Orange Gradient */}
          <div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer'>
            <div className='bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white relative'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10'></div>
              <div className='absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8'></div>
              <div className='relative z-10'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                    <RiFlagLine className='text-white text-2xl' />
                  </div>
                  <div className='text-right'>
                    <div className='flex items-center text-green-300 text-sm font-semibold mb-1'>
                      <RiLineChartLine className='w-4 h-4 mr-1' />
                      +15%
                    </div>
                    <div className='text-white/60 text-xs'>Bu ay</div>
                  </div>
                </div>
                <div className='text-3xl font-bold mb-2'>96%</div>
                <div className='text-white/90 text-sm font-medium'>
                  Başarı Oranı
                </div>
              </div>
            </div>
            <div className='p-4 bg-gray-50'>
              <div className='flex items-center justify-between text-xs text-gray-600'>
                <span>Hedef: 95%</span>
                <span className='text-green-600 font-semibold'>✓ Aşıldı</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-6 pb-16'>
        {/* Tab Navigation */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden'>
          <div className='flex overflow-x-auto'>
            {[
              { id: 'overview', label: 'Genel Bakış', icon: RiDashboardLine },
              { id: 'projects', label: 'Projeler', icon: RiFolderLine },
              { id: 'analytics', label: 'Analitik', icon: RiBarChartLine },
              { id: 'team', label: 'Takım', icon: RiTeamLine },
              { id: 'settings', label: 'Ayarlar', icon: RiSettingsLine },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className='mr-2 w-5 h-5' />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Left Column */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Recent Projects */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
              <div className='p-6 border-b border-gray-100'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-bold text-gray-900'>
                    Son Projeler
                  </h2>
                  <button className='text-blue-600 hover:text-blue-700 font-medium flex items-center'>
                    Tümünü Gör
                    <RiArrowRightLine className='ml-1 w-4 h-4' />
                  </button>
                </div>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {[
                    {
                      title: 'E-İhracat Platform Geliştirme',
                      status: 'Aktif',
                      progress: 75,
                      team: 8,
                      deadline: '15 Şubat 2024',
                      priority: 'Yüksek',
                      color: 'blue',
                    },
                    {
                      title: 'Mobil Uygulama Entegrasyonu',
                      status: 'Beklemede',
                      progress: 45,
                      team: 5,
                      deadline: '28 Şubat 2024',
                      priority: 'Orta',
                      color: 'yellow',
                    },
                    {
                      title: 'API Optimizasyonu',
                      status: 'Tamamlandı',
                      progress: 100,
                      team: 3,
                      deadline: '10 Ocak 2024',
                      priority: 'Düşük',
                      color: 'green',
                    },
                  ].map((project, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedProject(project)}
                      className='group bg-gray-50 rounded-xl p-4 hover:bg-blue-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200 hover:shadow-lg transform hover:-translate-y-1'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              project.color === 'blue'
                                ? 'bg-blue-500'
                                : project.color === 'yellow'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                          ></div>
                          <h3 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                            {project.title}
                          </h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === 'Aktif'
                              ? 'bg-green-100 text-green-700'
                              : project.status === 'Beklemede'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <div className='mb-3'>
                        <div className='flex items-center justify-between text-sm text-gray-600 mb-1'>
                          <span>İlerleme</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              project.color === 'blue'
                                ? 'bg-blue-500'
                                : project.color === 'yellow'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center space-x-4'>
                          <span className='text-gray-500 flex items-center'>
                            <RiTeamLine className='mr-1 w-4 h-4' />
                            {project.team} kişi
                          </span>
                          <span className='text-gray-500 flex items-center'>
                            <RiCalendarLine className='mr-1 w-4 h-4' />
                            {project.deadline}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            project.priority === 'Yüksek'
                              ? 'bg-red-100 text-red-700'
                              : project.priority === 'Orta'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {project.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
              <div className='p-6 border-b border-gray-100'>
                <h2 className='text-xl font-bold text-gray-900'>
                  Son Aktiviteler
                </h2>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {[
                    {
                      icon: RiUserLine,
                      title: 'Yeni kullanıcı kaydı',
                      description: 'Ahmet Yılmaz sisteme katıldı',
                      time: '2 dakika önce',
                      color: 'blue',
                    },
                    {
                      icon: RiCheckLine,
                      title: 'Görev tamamlandı',
                      description: 'API entegrasyonu başarıyla tamamlandı',
                      time: '15 dakika önce',
                      color: 'green',
                    },
                    {
                      icon: RiStarLine,
                      title: 'Yeni proje oluşturuldu',
                      description: 'E-ticaret platformu projesi başlatıldı',
                      time: '1 saat önce',
                      color: 'purple',
                    },
                    {
                      icon: RiMessageLine,
                      title: 'Yeni mesaj',
                      description: 'Müşteri geri bildirimi alındı',
                      time: '2 saat önce',
                      color: 'orange',
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className='flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors'
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activity.color === 'blue'
                            ? 'bg-blue-100'
                            : activity.color === 'green'
                              ? 'bg-green-100'
                              : activity.color === 'purple'
                                ? 'bg-purple-100'
                                : 'bg-orange-100'
                        }`}
                      >
                        <activity.icon
                          className={`w-5 h-5 ${
                            activity.color === 'blue'
                              ? 'text-blue-600'
                              : activity.color === 'green'
                                ? 'text-green-600'
                                : activity.color === 'purple'
                                  ? 'text-purple-600'
                                  : 'text-orange-600'
                          }`}
                        />
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900 mb-1'>
                          {activity.title}
                        </h3>
                        <p className='text-gray-600 text-sm mb-1'>
                          {activity.description}
                        </p>
                        <p className='text-gray-500 text-xs'>{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-8'>
            {/* Quick Actions */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
              <div className='p-6 border-b border-gray-100'>
                <h2 className='text-xl font-bold text-gray-900'>
                  Hızlı İşlemler
                </h2>
              </div>
              <div className='p-6'>
                <div className='grid grid-cols-2 gap-4'>
                  {[
                    { icon: RiAddLine, label: 'Yeni Proje', color: 'blue' },
                    {
                      icon: RiUserLine,
                      label: 'Kullanıcı Ekle',
                      color: 'green',
                    },
                    {
                      icon: RiFileTextLine,
                      label: 'Rapor Oluştur',
                      color: 'purple',
                    },
                    { icon: RiSettingsLine, label: 'Ayarlar', color: 'gray' },
                  ].map((action, index) => (
                    <button
                      key={index}
                      className={`p-4 rounded-xl border-2 border-transparent hover:border-${action.color}-200 transition-all duration-300 group ${
                        action.color === 'blue'
                          ? 'hover:bg-blue-50'
                          : action.color === 'green'
                            ? 'hover:bg-green-50'
                            : action.color === 'purple'
                              ? 'hover:bg-purple-50'
                              : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                          action.color === 'blue'
                            ? 'bg-blue-100 group-hover:bg-blue-200'
                            : action.color === 'green'
                              ? 'bg-green-100 group-hover:bg-green-200'
                              : action.color === 'purple'
                                ? 'bg-purple-100 group-hover:bg-purple-200'
                                : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}
                      >
                        <action.icon
                          className={`w-6 h-6 ${
                            action.color === 'blue'
                              ? 'text-blue-600'
                              : action.color === 'green'
                                ? 'text-green-600'
                                : action.color === 'purple'
                                  ? 'text-purple-600'
                                  : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <p className='text-sm font-medium text-gray-700 group-hover:text-gray-900'>
                        {action.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
              <div className='p-6 border-b border-gray-100'>
                <h2 className='text-xl font-bold text-gray-900'>
                  Takım Üyeleri
                </h2>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {[
                    {
                      name: 'Ahmet Yılmaz',
                      role: 'Proje Yöneticisi',
                      avatar: 'AY',
                      status: 'online',
                      color: 'blue',
                    },
                    {
                      name: 'Fatma Kaya',
                      role: 'Frontend Developer',
                      avatar: 'FK',
                      status: 'online',
                      color: 'green',
                    },
                    {
                      name: 'Mehmet Demir',
                      role: 'Backend Developer',
                      avatar: 'MD',
                      status: 'away',
                      color: 'yellow',
                    },
                    {
                      name: 'Ayşe Özkan',
                      role: 'UI/UX Designer',
                      avatar: 'AÖ',
                      status: 'offline',
                      color: 'gray',
                    },
                  ].map((member, index) => (
                    <div
                      key={index}
                      className='flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors'
                    >
                      <div className='relative'>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            member.color === 'blue'
                              ? 'bg-blue-500'
                              : member.color === 'green'
                                ? 'bg-green-500'
                                : member.color === 'yellow'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                          }`}
                        >
                          {member.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            member.status === 'online'
                              ? 'bg-green-500'
                              : member.status === 'away'
                                ? 'bg-yellow-500'
                                : 'bg-gray-400'
                          }`}
                        ></div>
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900'>
                          {member.name}
                        </h3>
                        <p className='text-gray-600 text-sm'>{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
              <div className='p-6 border-b border-gray-100'>
                <h2 className='text-xl font-bold text-gray-900'>Performans</h2>
              </div>
              <div className='p-6'>
                <div className='h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center'>
                  <div className='text-center'>
                    <RiBarChartLine className='w-12 h-12 text-blue-400 mx-auto mb-2' />
                    <p className='text-gray-600 text-sm'>Performans Grafiği</p>
                    <p className='text-gray-500 text-xs'>
                      Bu alan chart kütüphanesi ile doldurulacak
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-100'>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {selectedProject.title}
                </h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors'
                >
                  <RiCloseLine className='w-4 h-4 text-gray-600' />
                </button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              <div className='grid md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>
                    Proje Bilgileri
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Durum:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedProject.status === 'Aktif'
                            ? 'bg-green-100 text-green-700'
                            : selectedProject.status === 'Beklemede'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {selectedProject.status}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Öncelik:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedProject.priority === 'Yüksek'
                            ? 'bg-red-100 text-red-700'
                            : selectedProject.priority === 'Orta'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {selectedProject.priority}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Takım:</span>
                      <span className='text-gray-900'>
                        {selectedProject.team} kişi
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Son Tarih:</span>
                      <span className='text-gray-900'>
                        {selectedProject.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>İlerleme</h3>
                  <div className='space-y-3'>
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Genel İlerleme</span>
                        <span>{selectedProject.progress}%</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-3'>
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            selectedProject.color === 'blue'
                              ? 'bg-blue-500'
                              : selectedProject.color === 'yellow'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${selectedProject.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className='grid grid-cols-3 gap-2 text-center'>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-lg font-bold text-gray-900'>
                          12
                        </div>
                        <div className='text-xs text-gray-600'>Tamamlanan</div>
                      </div>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-lg font-bold text-gray-900'>3</div>
                        <div className='text-xs text-gray-600'>Devam Eden</div>
                      </div>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-lg font-bold text-gray-900'>2</div>
                        <div className='text-xs text-gray-600'>Bekleyen</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-semibold text-gray-900 mb-3'>
                  Son Aktiviteler
                </h3>
                <div className='space-y-3'>
                  {[
                    {
                      action: 'Görev tamamlandı',
                      user: 'Ahmet Yılmaz',
                      time: '2 saat önce',
                    },
                    {
                      action: 'Yeni dosya eklendi',
                      user: 'Fatma Kaya',
                      time: '4 saat önce',
                    },
                    {
                      action: 'Yorum yapıldı',
                      user: 'Mehmet Demir',
                      time: '6 saat önce',
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                        <RiUserLine className='w-4 h-4 text-blue-600' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm text-gray-900'>
                          {activity.action}
                        </p>
                        <p className='text-xs text-gray-600'>
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='p-6 border-t border-gray-100 flex space-x-3'>
              <button className='flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all duration-300'>
                Projeyi Düzenle
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className='px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors'
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className='fixed bottom-8 right-8 z-40'>
        <button className='w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group'>
          <RiAddLine className='w-6 h-6 group-hover:rotate-90 transition-transform duration-300' />
        </button>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className='fixed inset-0 z-20'
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
