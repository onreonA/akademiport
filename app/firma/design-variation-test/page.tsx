'use client';

import { useState } from 'react';
import {
  RiArrowRightLine,
  RiAwardLine,
  RiBarChartLine,
  RiCheckLine,
  RiFileTextLine,
  RiFireLine,
  RiGlobalLine,
  RiMessageLine,
  RiPlayLine,
  RiRocketLine,
  RiShieldLine,
  RiStarLine,
  RiTeamLine,
  RiTimeLine,
  RiTrophyLine,
  RiUserLine,
} from 'react-icons/ri';

export default function DesignVariationTestPage() {
  const [activeSection, setActiveSection] = useState('hero');

  // Mock data for demonstration
  const mockData = {
    stats: [
      {
        label: 'Toplam Kurs',
        value: '24',
        icon: RiFileTextLine,
        color: 'blue',
        trend: '+12%',
      },
      {
        label: 'Tamamlanan',
        value: '18',
        icon: RiCheckLine,
        color: 'green',
        trend: '+8%',
      },
      {
        label: 'Aktif Öğrenci',
        value: '1,247',
        icon: RiUserLine,
        color: 'purple',
        trend: '+24%',
      },
      {
        label: 'Başarı Oranı',
        value: '94%',
        icon: RiTrophyLine,
        color: 'orange',
        trend: '+5%',
      },
    ],
    courses: [
      {
        id: 1,
        title: 'İhracat Temelleri ve Stratejileri',
        instructor: 'Dr. Mehmet Yılmaz',
        duration: '2 saat 45 dakika',
        students: 1247,
        rating: 4.8,
        price: '₺299',
        category: 'Temel Eğitim',
        level: 'Başlangıç',
        progress: 85,
        thumbnail: '/api/placeholder/300/200',
        tags: ['İhracat', 'Strateji', 'Pazarlama'],
        isCompleted: false,
        isFeatured: true,
      },
      {
        id: 2,
        title: 'Uluslararası Ticaret Hukuku',
        instructor: 'Av. Ayşe Demir',
        duration: '3 saat 20 dakika',
        students: 892,
        rating: 4.9,
        price: '₺399',
        category: 'Hukuk',
        level: 'İleri',
        progress: 60,
        thumbnail: '/api/placeholder/300/200',
        tags: ['Hukuk', 'Uluslararası', 'Ticaret'],
        isCompleted: true,
        isFeatured: false,
      },
      {
        id: 3,
        title: 'Dijital Pazarlama ve E-İhracat',
        instructor: 'Prof. Dr. Can Özkan',
        duration: '4 saat 15 dakika',
        students: 2156,
        rating: 4.7,
        price: '₺499',
        category: 'Dijital',
        level: 'Orta',
        progress: 30,
        thumbnail: '/api/placeholder/300/200',
        tags: ['Dijital', 'E-ticaret', 'Pazarlama'],
        isCompleted: false,
        isFeatured: true,
      },
    ],
    achievements: [
      {
        title: 'İlk Kurs Tamamlandı',
        icon: RiAwardLine,
        points: 100,
        color: 'gold',
      },
      {
        title: '5 Kurs Tamamlandı',
        icon: RiTrophyLine,
        points: 500,
        color: 'silver',
      },
      {
        title: 'Haftalık Hedef',
        icon: RiStarLine,
        points: 200,
        color: 'bronze',
      },
      {
        title: 'Topluluk Lideri',
        icon: RiStarLine,
        points: 1000,
        color: 'platinum',
      },
    ],
  };

  const getColorClasses = (
    color: string,
    type: 'bg' | 'text' | 'border' = 'bg'
  ) => {
    const colors = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        text: 'text-blue-600',
        border: 'border-blue-200',
        light: 'bg-blue-50',
        accent: 'text-blue-400',
      },
      green: {
        bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
        text: 'text-green-600',
        border: 'border-green-200',
        light: 'bg-green-50',
        accent: 'text-green-400',
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
        text: 'text-purple-600',
        border: 'border-purple-200',
        light: 'bg-purple-50',
        accent: 'text-purple-400',
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-500 to-red-600',
        text: 'text-orange-600',
        border: 'border-orange-200',
        light: 'bg-orange-50',
        accent: 'text-orange-400',
      },
      gold: {
        bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        light: 'bg-yellow-50',
        accent: 'text-yellow-400',
      },
      silver: {
        bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
        text: 'text-gray-600',
        border: 'border-gray-200',
        light: 'bg-gray-50',
        accent: 'text-gray-400',
      },
      bronze: {
        bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
        text: 'text-orange-600',
        border: 'border-orange-200',
        light: 'bg-orange-50',
        accent: 'text-orange-400',
      },
      platinum: {
        bg: 'bg-gradient-to-br from-indigo-400 to-purple-600',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        light: 'bg-indigo-50',
        accent: 'text-indigo-400',
      },
    };
    return colors[color as keyof typeof colors]?.[type] || colors.blue[type];
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      {/* Navigation Pills */}
      <div className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex flex-wrap gap-2'>
            {[
              { id: 'hero', label: 'Hero Section', icon: RiRocketLine },
              { id: 'stats', label: 'İstatistikler', icon: RiBarChartLine },
              { id: 'courses', label: 'Kurslar', icon: RiFileTextLine },
              { id: 'achievements', label: 'Başarımlar', icon: RiAwardLine },
              { id: 'features', label: 'Özellikler', icon: RiStarLine },
              { id: 'testimonials', label: 'Yorumlar', icon: RiMessageLine },
              { id: 'cta', label: 'Çağrı', icon: RiFireLine },
            ].map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-white/60 text-gray-600 hover:bg-white hover:text-blue-600 border border-gray-200/50'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8 space-y-12'>
        {/* Hero Section */}
        {activeSection === 'hero' && (
          <section className='relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-pink-600/10 rounded-3xl'></div>
            <div className='relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 shadow-xl'>
              <div className='text-center max-w-4xl mx-auto'>
                <div className='inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6'>
                  <RiFireLine className='w-4 h-4' />
                  Yeni Nesil Eğitim Platformu
                </div>
                <h1 className='text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight'>
                  İhracat Dünyasına
                  <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block'>
                    Adım Atın
                  </span>
                </h1>
                <p className='text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto'>
                  Uzman eğitmenlerden alacağınız profesyonel eğitimlerle ihracat
                  sektöründe başarıya ulaşın. İnteraktif videolar, gerçek
                  projeler ve sertifikalı programlar.
                </p>
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <button className='group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-1'>
                    <span className='flex items-center gap-2'>
                      Hemen Başla
                      <RiArrowRightLine className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                    </span>
                  </button>
                  <button className='group bg-white/80 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg border border-gray-200/50 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
                    <span className='flex items-center gap-2'>
                      <RiPlayLine className='w-5 h-5' />
                      Demo İzle
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Section */}
        {activeSection === 'stats' && (
          <section>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Platform İstatistikleri
              </h2>
              <p className='text-gray-600'>
                Gerçek zamanlı performans verileri
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {mockData.stats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = getColorClasses(stat.color);
                return (
                  <div key={index} className='group relative'>
                    <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                    <div className='relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                      <div
                        className={`w-12 h-12 ${colorClasses.light} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                      </div>
                      <div className='flex items-end justify-between mb-2'>
                        <span className='text-3xl font-bold text-gray-900'>
                          {stat.value}
                        </span>
                        <span
                          className={`text-sm font-semibold ${colorClasses.text} flex items-center gap-1`}
                        >
                          <RiBarChartLine className='w-4 h-4' />
                          {stat.trend}
                        </span>
                      </div>
                      <p className='text-gray-600 font-medium'>{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Courses Section */}
        {activeSection === 'courses' && (
          <section>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Öne Çıkan Kurslar
              </h2>
              <p className='text-gray-600'>En popüler eğitim programlarımız</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {mockData.courses.map(course => (
                <div key={course.id} className='group relative'>
                  <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                  <div className='relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100'>
                    {/* Course Thumbnail */}
                    <div className='relative h-48 bg-gradient-to-br from-blue-100 to-purple-100'>
                      <div className='absolute inset-0 bg-black/20'></div>
                      <div className='absolute top-4 left-4 flex gap-2'>
                        {course.isFeatured && (
                          <span className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1'>
                            <RiStarLine className='w-3 h-3' />
                            Öne Çıkan
                          </span>
                        )}
                        <span className='bg-white/90 text-gray-700 px-3 py-1 rounded-full text-xs font-medium'>
                          {course.level}
                        </span>
                      </div>
                      <div className='absolute bottom-4 right-4'>
                        <button className='w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors'>
                          <RiPlayLine className='w-6 h-6 text-gray-700' />
                        </button>
                      </div>
                      {course.isCompleted && (
                        <div className='absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                          <RiCheckLine className='w-5 h-5 text-white' />
                        </div>
                      )}
                    </div>

                    {/* Course Content */}
                    <div className='p-6'>
                      <div className='flex items-center gap-2 mb-3'>
                        <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium'>
                          {course.category}
                        </span>
                        <span className='text-gray-400'>•</span>
                        <span className='text-gray-500 text-sm flex items-center gap-1'>
                          <RiTimeLine className='w-4 h-4' />
                          {course.duration}
                        </span>
                      </div>

                      <h3 className='text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                        {course.title}
                      </h3>

                      <p className='text-gray-600 text-sm mb-4 flex items-center gap-1'>
                        <RiUserLine className='w-4 h-4' />
                        {course.instructor}
                      </p>

                      {/* Progress Bar */}
                      {course.progress > 0 && (
                        <div className='mb-4'>
                          <div className='flex justify-between text-xs text-gray-500 mb-1'>
                            <span>İlerleme</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300'
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className='flex flex-wrap gap-1 mb-4'>
                        {course.tags.map((tag, index) => (
                          <span
                            key={index}
                            className='bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs'
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Rating & Price */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div className='flex items-center gap-1'>
                            {[...Array(5)].map((_, i) => (
                              <RiStarLine
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className='text-sm text-gray-600'>
                            {course.rating}
                          </span>
                          <span className='text-xs text-gray-400'>
                            ({course.students})
                          </span>
                        </div>
                        <div className='text-right'>
                          <div className='text-lg font-bold text-gray-900'>
                            {course.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements Section */}
        {activeSection === 'achievements' && (
          <section>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Başarım Sistemi
              </h2>
              <p className='text-gray-600'>
                İlerlemenizi takip edin ve rozetler kazanın
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {mockData.achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                const colorClasses = getColorClasses(achievement.color);
                return (
                  <div key={index} className='group relative'>
                    <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-1'></div>
                    <div className='relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 text-center'>
                      <div
                        className={`w-16 h-16 ${colorClasses.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        <Icon className='w-8 h-8 text-white' />
                      </div>
                      <h3 className='text-lg font-bold text-gray-900 mb-2'>
                        {achievement.title}
                      </h3>
                      <div
                        className={`inline-flex items-center gap-1 ${colorClasses.text} font-semibold`}
                      >
                        <RiStarLine className='w-4 h-4' />
                        {achievement.points} puan
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Features Section */}
        {activeSection === 'features' && (
          <section>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Platform Özellikleri
              </h2>
              <p className='text-gray-600'>Neden bizi tercih etmelisiniz?</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {[
                {
                  icon: RiRocketLine,
                  title: 'Hızlı Öğrenme',
                  description:
                    'Adaptif algoritmalar ile kişiselleştirilmiş öğrenme deneyimi',
                  color: 'blue',
                },
                {
                  icon: RiShieldLine,
                  title: 'Güvenli Platform',
                  description: 'End-to-end şifreleme ile verileriniz güvende',
                  color: 'green',
                },
                {
                  icon: RiTeamLine,
                  title: 'Uzman Eğitmenler',
                  description:
                    'Sektörde deneyimli profesyonellerden eğitim alın',
                  color: 'purple',
                },
                {
                  icon: RiBarChartLine,
                  title: 'İlerleme Takibi',
                  description: 'Detaylı analizlerle performansınızı ölçün',
                  color: 'orange',
                },
                {
                  icon: RiGlobalLine,
                  title: '7/24 Erişim',
                  description:
                    'İstediğiniz zaman, istediğiniz yerden eğitim alın',
                  color: 'blue',
                },
                {
                  icon: RiAwardLine,
                  title: 'Sertifika Programı',
                  description: 'Tamamladığınız kurslar için resmi sertifikalar',
                  color: 'gold',
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                const colorClasses = getColorClasses(feature.color);
                return (
                  <div key={index} className='group relative'>
                    <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                    <div className='relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                      <div
                        className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        <Icon className='w-6 h-6 text-white' />
                      </div>
                      <h3 className='text-xl font-bold text-gray-900 mb-3'>
                        {feature.title}
                      </h3>
                      <p className='text-gray-600 leading-relaxed'>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {activeSection === 'testimonials' && (
          <section>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Öğrenci Yorumları
              </h2>
              <p className='text-gray-600'>Başarı hikayelerimiz</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {[
                {
                  name: 'Ahmet Yılmaz',
                  company: 'ABC İhracat Ltd.',
                  content:
                    'Bu platform sayesinde ihracat süreçlerimi tamamen öğrendim. Artık kendi işimi kurabilecek seviyeye geldim.',
                  rating: 5,
                  avatar: '/api/placeholder/60/60',
                  color: 'blue',
                },
                {
                  name: 'Ayşe Demir',
                  company: 'XYZ Trading Co.',
                  content:
                    'Eğitmenler gerçekten uzman. Pratik örnekler ve gerçek hayat deneyimleri paylaşıyorlar.',
                  rating: 5,
                  avatar: '/api/placeholder/60/60',
                  color: 'green',
                },
                {
                  name: 'Mehmet Kaya',
                  company: 'Global Export Inc.',
                  content:
                    'Sertifika programı çok değerli. Müşterilerimle görüşürken güven veriyor.',
                  rating: 5,
                  avatar: '/api/placeholder/60/60',
                  color: 'purple',
                },
              ].map((testimonial, index) => {
                const colorClasses = getColorClasses(testimonial.color);
                return (
                  <div key={index} className='group relative'>
                    <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2'></div>
                    <div className='relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100'>
                      <div className='flex items-center gap-1 mb-4'>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <RiStarLine
                            key={i}
                            className='w-5 h-5 text-yellow-400 fill-current'
                          />
                        ))}
                      </div>
                      <p className='text-gray-700 mb-6 leading-relaxed italic'>
                        &quot;{testimonial.content}&quot;
                      </p>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-12 h-12 ${colorClasses.bg} rounded-full flex items-center justify-center`}
                        >
                          <RiUserLine className='w-6 h-6 text-white' />
                        </div>
                        <div>
                          <h4 className='font-bold text-gray-900'>
                            {testimonial.name}
                          </h4>
                          <p className='text-sm text-gray-600'>
                            {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA Section */}
        {activeSection === 'cta' && (
          <section className='relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'></div>
            <div className='absolute inset-0 bg-black/20'></div>
            <div className='relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 text-center'>
              <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
                Hemen Başlayın, Başarıya Ulaşın!
              </h2>
              <p className='text-white/90 text-lg mb-8 max-w-2xl mx-auto'>
                Binlerce öğrenci gibi siz de ihracat dünyasında başarılı olun.
                İlk kursunuzu ücretsiz deneyin!
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button className='group bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                  <span className='flex items-center gap-2'>
                    Ücretsiz Başla
                    <RiArrowRightLine className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </span>
                </button>
                <button className='group bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/30 hover:bg-white/30 transition-all duration-300 hover:-translate-y-1'>
                  <span className='flex items-center gap-2'>
                    <RiMessageLine className='w-5 h-5' />
                    Danışmanlık Al
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
