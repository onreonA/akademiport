'use client';

import { useState } from 'react';
import {
  RiArrowRightLine,
  RiBarChartLine,
  RiBuildingLine,
  RiCodeLine,
  RiDatabaseLine,
  RiEyeLine,
  RiFolderLine,
  RiHeartLine,
  RiLightbulbLine,
  RiPlayLine,
  RiRocketLine,
  RiSettingsLine,
  RiStarLine,
  RiThunderstormsLine,
} from 'react-icons/ri';

import FirmaLayout from '@/components/firma/FirmaLayout';

export default function KartTasarimTest() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Tüm Kartlar', icon: RiFolderLine },
    { id: 'gradient', label: 'Gradient Kartlar', icon: RiBarChartLine },
    { id: 'glass', label: 'Glassmorphism', icon: RiEyeLine },
    { id: 'minimal', label: 'Minimal', icon: RiSettingsLine },
    { id: 'creative', label: 'Yaratıcı', icon: RiLightbulbLine },
  ];

  const cards = [
    // 1. Klasik Gradient Proje Kartı
    {
      id: 1,
      type: 'gradient',
      title: 'E-ticaret Platform Geliştirme',
      subtitle: 'ABC Teknoloji',
      description:
        'Modern e-ticaret platformu geliştirme projesi. Kullanıcı dostu arayüz ve güvenli ödeme sistemi.',
      status: 'active',
      priority: 'high',
      progress: 75,
      deadline: '2024-12-31',
      stats: {
        tasks: 24,
        files: 156,
        comments: 89,
        milestones: 8,
      },
      icon: RiRocketLine,
      color: 'blue',
    },
    // 2. Glassmorphism Kart
    {
      id: 2,
      type: 'glass',
      title: 'Mobil Uygulama Entegrasyonu',
      subtitle: 'XYZ Yazılım',
      description:
        'iOS ve Android mobil uygulama geliştirme ve API entegrasyonu.',
      status: 'planning',
      priority: 'medium',
      progress: 30,
      deadline: '2024-11-30',
      stats: {
        tasks: 12,
        files: 45,
        comments: 23,
        milestones: 4,
      },
      icon: RiCodeLine,
      color: 'purple',
    },
    // 3. Minimal Tasarım Kartı
    {
      id: 3,
      type: 'minimal',
      title: 'Web Sitesi Yenileme',
      subtitle: 'DEF Danışmanlık',
      description: 'Kurumsal web sitesi yenileme ve SEO optimizasyonu.',
      status: 'completed',
      priority: 'low',
      progress: 100,
      deadline: '2024-10-15',
      stats: {
        tasks: 8,
        files: 32,
        comments: 15,
        milestones: 3,
      },
      icon: RiBuildingLine,
      color: 'green',
    },
    // 4. Yaratıcı Neon Kart
    {
      id: 4,
      type: 'creative',
      title: 'AI Chatbot Geliştirme',
      subtitle: 'Tech Innovations',
      description:
        'Yapay zeka destekli chatbot geliştirme ve doğal dil işleme.',
      status: 'active',
      priority: 'urgent',
      progress: 45,
      deadline: '2024-12-15',
      stats: {
        tasks: 18,
        files: 67,
        comments: 42,
        milestones: 6,
      },
      icon: RiThunderstormsLine,
      color: 'neon',
    },
    // 5. Premium Kart
    {
      id: 5,
      type: 'creative',
      title: 'Premium Dashboard',
      subtitle: 'Vip Solutions',
      description:
        'Lüks ve premium dashboard tasarımı ile gelişmiş analitik araçları.',
      status: 'active',
      priority: 'high',
      progress: 60,
      deadline: '2024-11-20',
      stats: {
        tasks: 35,
        files: 89,
        comments: 67,
        milestones: 12,
      },
      icon: RiStarLine,
      color: 'gold',
    },
    // 6. Futuristik Kart
    {
      id: 6,
      type: 'creative',
      title: 'Blockchain Entegrasyonu',
      subtitle: 'Crypto Labs',
      description:
        'Blockchain teknolojisi entegrasyonu ve güvenli veri transferi.',
      status: 'planning',
      priority: 'high',
      progress: 15,
      deadline: '2025-01-30',
      stats: {
        tasks: 28,
        files: 124,
        comments: 56,
        milestones: 9,
      },
      icon: RiDatabaseLine,
      color: 'cyber',
    },
    // 7. Organik Kart
    {
      id: 7,
      type: 'creative',
      title: 'Ekolojik Çözümler',
      subtitle: 'Green Tech',
      description:
        'Çevre dostu teknoloji çözümleri ve sürdürülebilir geliştirme.',
      status: 'active',
      priority: 'medium',
      progress: 80,
      deadline: '2024-11-10',
      stats: {
        tasks: 14,
        files: 38,
        comments: 29,
        milestones: 5,
      },
      icon: RiHeartLine,
      color: 'green',
    },
    // 8. Hologram Kartı
    {
      id: 8,
      type: 'creative',
      title: 'AR/VR Deneyimi',
      subtitle: 'Virtual Reality Inc',
      description: 'Artırılmış ve sanal gerçeklik deneyimi geliştirme.',
      status: 'paused',
      priority: 'medium',
      progress: 25,
      deadline: '2025-02-28',
      stats: {
        tasks: 41,
        files: 178,
        comments: 93,
        milestones: 15,
      },
      icon: RiEyeLine,
      color: 'hologram',
    },
  ];

  const filteredCards = cards.filter(
    card => activeTab === 'all' || card.type === activeTab
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'from-green-500 to-emerald-600';
      case 'completed':
        return 'from-blue-500 to-blue-600';
      case 'planning':
        return 'from-yellow-500 to-orange-500';
      case 'paused':
        return 'from-orange-500 to-red-500';
      case 'cancelled':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <FirmaLayout
      title='Kart Tasarım Test Merkezi'
      description='Farklı kart tasarımları ve yaratıcı örnekler'
      showHeader={false}
    >
      <div className='space-y-6'>
        {/* Modern Page Header */}
        <div className='mb-6'>
          <div className='mb-3'>
            <nav className='flex items-center space-x-2 text-sm text-gray-500'>
              <span className='hover:text-gray-700 cursor-pointer'>
                Ana Sayfa
              </span>
              <i className='ri-arrow-right-s-line text-xs'></i>
              <span className='text-gray-900 font-medium'>
                Kart Tasarım Test
              </span>
            </nav>
          </div>
          <div className='mb-3'>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900 tracking-tight'>
              KART TASARIM TEST MERKEZİ
            </h1>
          </div>
          <div className='mb-4'>
            <p className='text-sm text-gray-600 font-medium leading-relaxed'>
              Farklı kart tasarımları ve yaratıcı örnekler
            </p>
          </div>
          <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full'></div>
        </div>

        {/* Info Card */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 mb-8'>
          <div className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                  Tasarım Kategorileri
                </h2>
                <p className='text-gray-600'>
                  Farklı kart tasarımları ve yaratıcı örnekler
                </p>
              </div>
              <div className='flex items-center space-x-2 text-sm text-gray-500'>
                <RiFolderLine className='w-4 h-4' />
                <span>{filteredCards.length} kart</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden'>
          <div className='flex overflow-x-auto'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className='mr-2 w-5 h-5' />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredCards.map(card => {
            // 1. Klasik Gradient Proje Kartı
            if (card.type === 'gradient') {
              return (
                <div
                  key={card.id}
                  className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer'
                >
                  <div
                    className={`bg-gradient-to-r ${getStatusColor(card.status)} p-4 text-white relative`}
                  >
                    <div className='absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8'></div>
                    <div className='absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6'></div>

                    <div className='relative z-10'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                            <card.icon className='text-white text-lg' />
                          </div>
                          <div>
                            <h3 className='text-lg font-bold text-white group-hover:text-yellow-200 transition-colors'>
                              {card.title}
                            </h3>
                            <p className='text-white/80 text-sm'>
                              {card.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className='flex flex-col items-end space-y-1'>
                          <span className='px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white'>
                            {card.status}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(card.priority)}`}
                          >
                            {card.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='p-6'>
                    <p className='text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed'>
                      {card.description}
                    </p>

                    <div className='grid grid-cols-2 gap-3 mb-4'>
                      <div className='bg-blue-50 rounded-lg p-3 text-center'>
                        <div className='text-lg font-bold text-blue-600'>
                          {card.stats.tasks}
                        </div>
                        <div className='text-xs text-blue-600 font-medium'>
                          Görevler
                        </div>
                      </div>
                      <div className='bg-purple-50 rounded-lg p-3 text-center'>
                        <div className='text-lg font-bold text-purple-600'>
                          {card.stats.files}
                        </div>
                        <div className='text-xs text-purple-600 font-medium'>
                          Dosyalar
                        </div>
                      </div>
                      <div className='bg-green-50 rounded-lg p-3 text-center'>
                        <div className='text-lg font-bold text-green-600'>
                          {card.stats.comments}
                        </div>
                        <div className='text-xs text-green-600 font-medium'>
                          Yorumlar
                        </div>
                      </div>
                      <div className='bg-orange-50 rounded-lg p-3 text-center'>
                        <div className='text-lg font-bold text-orange-600'>
                          {card.stats.milestones}
                        </div>
                        <div className='text-xs text-orange-600 font-medium'>
                          Milestone
                        </div>
                      </div>
                    </div>

                    <div className='mb-6'>
                      <div className='flex items-center justify-between text-sm mb-2'>
                        <span className='text-gray-600 font-medium'>
                          İlerleme
                        </span>
                        <span className='font-bold text-gray-900'>
                          {card.progress}%
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                        <div
                          className='h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 shadow-sm'
                          style={{ width: `${card.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105'>
                      <RiPlayLine className='w-4 h-4' />
                      Detayları Görüntüle
                    </button>
                  </div>
                </div>
              );
            }

            // 2. Glassmorphism Kart
            if (card.type === 'glass') {
              return (
                <div
                  key={card.id}
                  className='group bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border border-white/30 overflow-hidden cursor-pointer'
                >
                  <div className='p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg'>
                          <card.icon className='text-white text-xl' />
                        </div>
                        <div>
                          <h3 className='text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors'>
                            {card.title}
                          </h3>
                          <p className='text-gray-600 text-sm'>
                            {card.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className='flex flex-col items-end space-y-1'>
                        <span className='px-3 py-1 text-xs font-medium bg-white/30 backdrop-blur-sm rounded-full text-gray-800 border border-white/50'>
                          {card.status}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(card.priority)}`}
                        >
                          {card.priority}
                        </span>
                      </div>
                    </div>

                    <p className='text-gray-700 text-sm mb-6 leading-relaxed'>
                      {card.description}
                    </p>

                    <div className='bg-white/30 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/50'>
                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-gray-700 font-medium text-sm'>
                          İlerleme
                        </span>
                        <span className='font-bold text-gray-900'>
                          {card.progress}%
                        </span>
                      </div>
                      <div className='w-full bg-white/50 rounded-full h-2'>
                        <div
                          className='h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500'
                          style={{ width: `${card.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-3 mb-6'>
                      <div className='bg-white/30 backdrop-blur-sm rounded-xl p-3 text-center border border-white/50'>
                        <div className='text-lg font-bold text-gray-900'>
                          {card.stats.tasks}
                        </div>
                        <div className='text-xs text-gray-600 font-medium'>
                          Görevler
                        </div>
                      </div>
                      <div className='bg-white/30 backdrop-blur-sm rounded-xl p-3 text-center border border-white/50'>
                        <div className='text-lg font-bold text-gray-900'>
                          {card.stats.files}
                        </div>
                        <div className='text-xs text-gray-600 font-medium'>
                          Dosyalar
                        </div>
                      </div>
                    </div>

                    <button className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105'>
                      <RiEyeLine className='w-4 h-4' />
                      İncele
                    </button>
                  </div>
                </div>
              );
            }

            // 3. Minimal Kart
            if (card.type === 'minimal') {
              return (
                <div
                  key={card.id}
                  className='group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden cursor-pointer hover:border-gray-300'
                >
                  <div className='p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                          <card.icon className='text-gray-600 text-lg' />
                        </div>
                        <div>
                          <h3 className='text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                            {card.title}
                          </h3>
                          <p className='text-gray-500 text-sm'>
                            {card.subtitle}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(card.priority)}`}
                      >
                        {card.priority}
                      </span>
                    </div>

                    <p className='text-gray-600 text-sm mb-4 leading-relaxed'>
                      {card.description}
                    </p>

                    <div className='space-y-3 mb-4'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-500'>Görevler</span>
                        <span className='font-medium text-gray-900'>
                          {card.stats.tasks}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-500'>Dosyalar</span>
                        <span className='font-medium text-gray-900'>
                          {card.stats.files}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-500'>İlerleme</span>
                        <span className='font-medium text-gray-900'>
                          {card.progress}%
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-1.5'>
                        <div
                          className='h-1.5 rounded-full bg-blue-500 transition-all duration-300'
                          style={{ width: `${card.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button className='w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2'>
                      <RiArrowRightLine className='w-4 h-4' />
                      Detaylar
                    </button>
                  </div>
                </div>
              );
            }

            // 4. Yaratıcı Kartlar
            if (card.type === 'creative') {
              if (card.color === 'neon') {
                // Neon Kart
                return (
                  <div
                    key={card.id}
                    className='group bg-black rounded-2xl shadow-2xl hover:shadow-neon transition-all duration-300 hover:-translate-y-2 border border-cyan-500/30 overflow-hidden cursor-pointer'
                  >
                    <div className='bg-gradient-to-r from-cyan-500 to-blue-500 p-4 relative'>
                      <div className='absolute inset-0 bg-black/20'></div>
                      <div className='relative z-10'>
                        <div className='flex items-center justify-between mb-3'>
                          <div className='flex items-center space-x-2'>
                            <div className='w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                              <card.icon className='text-white text-lg' />
                            </div>
                            <div>
                              <h3 className='text-lg font-bold text-white group-hover:text-cyan-300 transition-colors'>
                                {card.title}
                              </h3>
                              <p className='text-white/80 text-sm'>
                                {card.subtitle}
                              </p>
                            </div>
                          </div>
                          <div className='flex flex-col items-end space-y-1'>
                            <span className='px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30'>
                              {card.status}
                            </span>
                            <span className='px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full'>
                              {card.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='p-6 bg-black text-white'>
                      <p className='text-gray-300 text-sm mb-4 leading-relaxed'>
                        {card.description}
                      </p>

                      <div className='grid grid-cols-2 gap-3 mb-4'>
                        <div className='bg-cyan-500/10 rounded-lg p-3 text-center border border-cyan-500/20'>
                          <div className='text-lg font-bold text-cyan-400'>
                            {card.stats.tasks}
                          </div>
                          <div className='text-xs text-cyan-400 font-medium'>
                            Görevler
                          </div>
                        </div>
                        <div className='bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/20'>
                          <div className='text-lg font-bold text-blue-400'>
                            {card.stats.files}
                          </div>
                          <div className='text-xs text-blue-400 font-medium'>
                            Dosyalar
                          </div>
                        </div>
                      </div>

                      <div className='mb-6'>
                        <div className='flex items-center justify-between text-sm mb-2'>
                          <span className='text-gray-400 font-medium'>
                            İlerleme
                          </span>
                          <span className='font-bold text-white'>
                            {card.progress}%
                          </span>
                        </div>
                        <div className='w-full bg-gray-800 rounded-full h-3 overflow-hidden'>
                          <div
                            className='h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 shadow-lg'
                            style={{ width: `${card.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <button className='w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105'>
                        <RiThunderstormsLine className='w-4 h-4' />
                        Aktif Et
                      </button>
                    </div>
                  </div>
                );
              }

              if (card.color === 'gold') {
                // Altın Premium Kart
                return (
                  <div
                    key={card.id}
                    className='group bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-yellow-200 overflow-hidden cursor-pointer'
                  >
                    <div className='bg-gradient-to-r from-yellow-400 to-amber-500 p-4 relative'>
                      <div className='absolute top-2 right-2'>
                        <RiStarLine className='w-6 h-6 text-white' />
                      </div>
                      <div className='absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8'></div>
                      <div className='absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6'></div>

                      <div className='relative z-10'>
                        <div className='flex items-center justify-between mb-3'>
                          <div className='flex items-center space-x-2'>
                            <div className='w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                              <card.icon className='text-white text-lg' />
                            </div>
                            <div>
                              <h3 className='text-lg font-bold text-white group-hover:text-yellow-200 transition-colors'>
                                {card.title}
                              </h3>
                              <p className='text-white/80 text-sm'>
                                {card.subtitle}
                              </p>
                            </div>
                          </div>
                          <div className='flex flex-col items-end space-y-1'>
                            <span className='px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white'>
                              PREMIUM
                            </span>
                            <span className='px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white'>
                              {card.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='p-6'>
                      <p className='text-gray-700 text-sm mb-4 leading-relaxed'>
                        {card.description}
                      </p>

                      <div className='grid grid-cols-2 gap-3 mb-4'>
                        <div className='bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200'>
                          <div className='text-lg font-bold text-yellow-600'>
                            {card.stats.tasks}
                          </div>
                          <div className='text-xs text-yellow-600 font-medium'>
                            Görevler
                          </div>
                        </div>
                        <div className='bg-amber-50 rounded-lg p-3 text-center border border-amber-200'>
                          <div className='text-lg font-bold text-amber-600'>
                            {card.stats.files}
                          </div>
                          <div className='text-xs text-amber-600 font-medium'>
                            Dosyalar
                          </div>
                        </div>
                      </div>

                      <div className='mb-6'>
                        <div className='flex items-center justify-between text-sm mb-2'>
                          <span className='text-gray-600 font-medium'>
                            İlerleme
                          </span>
                          <span className='font-bold text-gray-900'>
                            {card.progress}%
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                          <div
                            className='h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500 shadow-sm'
                            style={{ width: `${card.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <button className='w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105'>
                        <RiStarLine className='w-4 h-4' />
                        Premium Erişim
                      </button>
                    </div>
                  </div>
                );
              }

              // Diğer yaratıcı kartlar için basit versiyonlar
              return (
                <div
                  key={card.id}
                  className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer'
                >
                  <div className='bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white relative'>
                    <div className='relative z-10'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                            <card.icon className='text-white text-lg' />
                          </div>
                          <div>
                            <h3 className='text-lg font-bold text-white group-hover:text-yellow-200 transition-colors'>
                              {card.title}
                            </h3>
                            <p className='text-white/80 text-sm'>
                              {card.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='p-6'>
                    <p className='text-gray-600 text-sm mb-4 leading-relaxed'>
                      {card.description}
                    </p>

                    <div className='mb-6'>
                      <div className='flex items-center justify-between text-sm mb-2'>
                        <span className='text-gray-600 font-medium'>
                          İlerleme
                        </span>
                        <span className='font-bold text-gray-900'>
                          {card.progress}%
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                        <div
                          className='h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 shadow-sm'
                          style={{ width: `${card.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105'>
                      <RiPlayLine className='w-4 h-4' />
                      Detayları Görüntüle
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </FirmaLayout>
  );
}
