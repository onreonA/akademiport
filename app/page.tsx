'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import ModernFooter from '@/components/layout/ModernFooter';
import ModernNavigation from '@/components/layout/ModernNavigation';
export default function Home() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <div className='min-h-screen bg-white'>
      {/* Modern Navigation */}
      <ModernNavigation />
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-blue-600 via-purple-700 to-orange-500 py-20 overflow-hidden'>
        {/* Animated Background Elements - Only render on client */}
        {isClient && (
          <div className='absolute inset-0'>
            <div className='absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse'></div>
            <div className='absolute top-40 right-20 w-24 h-24 bg-orange-300/20 rounded-full animate-bounce'></div>
            <div className='absolute bottom-20 left-1/4 w-20 h-20 bg-blue-300/30 rounded-full animate-pulse'></div>
            <div className='absolute bottom-40 right-1/3 w-16 h-16 bg-purple-300/25 rounded-full animate-bounce'></div>
          </div>
        )}
        <div className='relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            {/* Left Content */}
            <div className='text-left relative z-10'>
              <div className='inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/30'>
                <i className='ri-flag-2-line text-white mr-2 w-5 h-5 flex items-center justify-center'></i>
                <span className='text-white font-semibold text-sm tracking-wide'>
                  TİCARET BAKANLIĞI DESTEKLİ
                </span>
              </div>
              <h1 className='text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight'>
                Türkiye&apos;nin E-İhracat Kapasitesini
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300'>
                  {' '}
                  Birlikte Yükseltiyoruz
                </span>
              </h1>
              <p className='text-xl text-white/90 mb-8 leading-relaxed'>
                Ticaret Bakanlığı destekleriyle, sanayi ve ticaret odalarının
                organizasyonunda yürütülen bu proje; üretici firmaları 12 ay
                süren bir e-ihracat dönüşüm yolculuğuna davet ediyor.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 mb-8'>
                <Link
                  href='/program-hakkinda'
                  className='inline-flex items-center bg-white text-blue-600 text-lg px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg'
                >
                  <i className='ri-information-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                  Programı İncele
                </Link>
                <Link
                  href='/iletisim-basvuru'
                  className='inline-flex items-center bg-transparent border-2 border-white text-white text-lg px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 cursor-pointer whitespace-nowrap'
                >
                  Başvuru Yap
                  <i className='ri-arrow-right-line ml-2 w-5 h-5 flex items-center justify-center'></i>
                </Link>
              </div>
              {/* Success Metrics */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
                  <div className='text-2xl font-bold text-white'>1000+</div>
                  <div className='text-white/80 text-sm'>Katılımcı Firma</div>
                </div>
                <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
                  <div className='text-2xl font-bold text-white'>50+</div>
                  <div className='text-white/80 text-sm'>Hedef Ülke</div>
                </div>
                <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
                  <div className='text-2xl font-bold text-white'>%300</div>
                  <div className='text-white/80 text-sm'>İhracat Artışı</div>
                </div>
              </div>
            </div>
            {/* Right Content - Interactive Map */}
            <div className='relative'>
              {/* Main Turkey Map Container */}
              <div className='relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl'>
                <div className='relative'>
                  <Image
                    src='https://readdy.ai/api/search-image?query=Turkey%20country%20map%20with%20major%20cities%20marked%2C%20digital%20network%20connections%20between%20cities%2C%20glowing%20connection%20lines%2C%20modern%20tech%20visualization%20style%2C%20blue%20and%20orange%20color%20scheme%2C%20representing%20e-commerce%20and%20digital%20trade%20networks%20across%20Turkish%20cities%20including%20Istanbul%2C%20Ankara%2C%20Izmir%2C%20Bursa%2C%20Antalya.%20Clean%20minimalist%20background%20with%20subtle%20glow%20effects&width=600&height=400&seq=turkey-map-001&orientation=landscape'
                    alt='Türkiye E-İhracat Haritası'
                    width={600}
                    height={400}
                    className='w-full h-auto rounded-2xl'
                  />
                  {/* City Markers - Only animate on client */}
                  <div className='absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2'>
                    <div className='relative'>
                      <div
                        className={`w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg ${isClient ? 'animate-pulse' : ''}`}
                      ></div>
                      <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-semibold text-gray-800 whitespace-nowrap'>
                        İstanbul
                      </div>
                    </div>
                  </div>
                  <div className='absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2'>
                    <div className='relative'>
                      <div
                        className={`w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg ${isClient ? 'animate-pulse' : ''}`}
                      ></div>
                      <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-semibold text-gray-800 whitespace-nowrap'>
                        Ankara
                      </div>
                    </div>
                  </div>
                  <div className='absolute top-2/3 left-1/5 transform -translate-x-1/2 -translate-y-1/2'>
                    <div className='relative'>
                      <div
                        className={`w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-lg ${isClient ? 'animate-pulse' : ''}`}
                      ></div>
                      <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-semibold text-gray-800 whitespace-nowrap'>
                        İzmir
                      </div>
                    </div>
                  </div>
                  {/* Digital Trade Icons */}
                  <div className='absolute top-4 right-4 flex space-x-2'>
                    <div className='w-8 h-8 bg-blue-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20'>
                      <i className='ri-global-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                    </div>
                    <div className='w-8 h-8 bg-orange-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20'>
                      <i className='ri-shopping-cart-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                    </div>
                    <div className='w-8 h-8 bg-purple-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20'>
                      <i className='ri-truck-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                    </div>
                  </div>
                </div>
                {/* Stats Overlay */}
                <div className='mt-6 grid grid-cols-2 gap-4'>
                  <div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3'>
                        <i className='ri-line-chart-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                      </div>
                      <div>
                        <div className='text-white font-bold text-sm'>
                          Aktif Projeler
                        </div>
                        <div className='text-white/70 text-xs'>250+ Firma</div>
                      </div>
                    </div>
                  </div>
                  <div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3'>
                        <i className='ri-medal-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                      </div>
                      <div>
                        <div className='text-white font-bold text-sm'>
                          Başarı Oranı
                        </div>
                        <div className='text-white/70 text-xs'>%85 Artış</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Elements - Only animate on client */}
              {isClient && (
                <>
                  <div className='absolute -top-6 -right-6 w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce'>
                    <i className='ri-rocket-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <div className='absolute -bottom-4 -left-4 w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-pulse'>
                    <i className='ri-star-fill text-white text-sm w-5 h-5 flex items-center justify-center'></i>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Program Özeti Kartları */}
      <section className='py-20 bg-gradient-to-br from-slate-50 to-blue-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
          {/* Header */}
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-6'>
              Program Özeti
            </h2>
            <div className='w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6'></div>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              İhracat Akademi programının 3 ana bileşeni ile firmanızı küresel
              pazarlarda başarıya ulaştırın.
            </p>
          </div>
          {/* Ana Kartlar */}
          <div className='grid lg:grid-cols-3 gap-8 mb-12'>
            {/* Danışmanlık Kartı */}
            <div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-blue-100'>
              <div className='p-8'>
                <div className='relative mb-6'>
                  <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg'>
                    <i className='ri-user-heart-line text-3xl text-white w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <div className='absolute -top-2 -right-2 w-6 h-6 bg-blue-200 rounded-full'></div>
                  <div className='absolute -bottom-1 -left-1 w-4 h-4 bg-blue-300 rounded-full'></div>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
                  Danışmanlık
                </h3>
                <p className='text-gray-600 text-center mb-6'>
                  12 ay boyunca her firmaya özel uzman eşleştirmesi
                </p>
                <div className='space-y-3 mb-6'>
                  <div className='flex items-center text-sm text-gray-700'>
                    <i className='ri-check-line text-blue-600 mr-3 w-4 h-4 flex items-center justify-center'></i>
                    <span>Kişiselleştirilmiş strateji geliştirme</span>
                  </div>
                  <div className='flex items-center text-sm text-gray-700'>
                    <i className='ri-check-line text-blue-600 mr-3 w-4 h-4 flex items-center justify-center'></i>
                    <span>Haftalık mentorluk seansları</span>
                  </div>
                  <div className='flex items-center text-sm text-gray-700'>
                    <i className='ri-check-line text-blue-600 mr-3 w-4 h-4 flex items-center justify-center'></i>
                    <span>Pazar analizi ve hedef belirleme</span>
                  </div>
                </div>
                <div className='border-t border-gray-100 pt-4'>
                  <div className='bg-blue-50 rounded-lg px-4 py-2 text-center'>
                    <span className='text-blue-700 font-semibold text-sm'>
                      12 Ay Sürekli Destek
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Eğitim ve Altyapı Kartı */}
            <div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-orange-100'>
              <div className='p-8'>
                <div className='relative mb-6'>
                  <div className='w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg'>
                    <i className='ri-graduation-cap-line text-3xl text-white w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <div className='absolute -top-2 -right-2 w-6 h-6 bg-orange-200 rounded-full'></div>
                  <div className='absolute -bottom-1 -left-1 w-4 h-4 bg-orange-300 rounded-full'></div>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
                  Eğitim ve Altyapı
                </h3>
                <p className='text-gray-600 text-center mb-6'>
                  Panel üzerinden modüler eğitimler, video arşivi ve yapay zekâ
                  destekli asistanlar
                </p>
                <div className='space-y-3 mb-6'>
                  <div className='flex items-center text-sm text-gray-700'>
                    <i className='ri-check-line text-orange-600 mr-3 w-4 h-4 flex items-center justify-center'></i>
                    <span>İnteraktif video eğitimleri</span>
                  </div>
                  <div className='flex items-center text-sm text-gray-700'>
                    <i className='ri-check-line text-orange-600 mr-3 w-4 h-4 flex items-center justify-center'></i>
                    <span>AI destekli öğrenme asistanı</span>
                  </div>
                  <div className='flex items-center text-sm text-gray-700'>
                    <i className='ri-check-line text-orange-600 mr-3 w-4 h-4 flex items-center justify-center'></i>
                    <span>Modüler eğitim sistemi</span>
                  </div>
                </div>
                <div className='border-t border-gray-100 pt-4'>
                  <div className='bg-orange-50 rounded-lg px-4 py-2 text-center'>
                    <span className='text-orange-700 font-semibold text-sm'>
                      Sınırsız Erişim
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Destek ve Entegrasyon Kartı */}
            <div className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-green-100'>
              <div className='p-8'>
                <div className='relative mb-6'>
                  <div className='w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg'>
                    <i className='ri-settings-3-line text-3xl text-white w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <div className='absolute -top-2 -right-2 w-6 h-6 bg-green-200 rounded-full'></div>
                  <div className='absolute -bottom-1 -left-1 w-4 h-4 bg-green-300 rounded-full'></div>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
                  Destek ve Entegrasyon
                </h3>
                <p className='text-gray-600 text-center mb-6'>
                  Devlet teşvikleri, pazaryeri hesapları, web altyapısı ve
                  dijital varlık kurulumu
                </p>
                <div className='space-y-3 mb-6'>
                  <div className='flex items-center text-sm text-gray-700'>
                    <i className='ri-check-line text-green-600 mr-3 w-4 h-4 flex items-center justify-center'></i>
                    <span>Teşvik başvuru desteği</span>
                  </div>
                  <div className='flex items-center text-sm text-gray-700'>
                    <i className='ri-check-line text-green-600 mr-3 w-4 h-4 flex items-center justify-center'></i>
                    <span>Pazaryeri entegrasyonları</span>
                  </div>
                  <div className='flex items-center text-sm text-gray-700'>
                    <i className='ri-check-line text-green-600 mr-3 w-4 h-4 flex items-center justify-center'></i>
                    <span>Teknik altyapı kurulumu</span>
                  </div>
                </div>
                <div className='border-t border-gray-100 pt-4'>
                  <div className='bg-green-50 rounded-lg px-4 py-2 text-center'>
                    <span className='text-green-700 font-semibold text-sm'>
                      Kapsamlı Destek
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Alt Bilgi Kutusu */}
          <div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100'>
            <div className='text-center'>
              <h4 className='text-2xl font-bold text-gray-900 mb-4'>
                Neden İhracat Akademi?
              </h4>
              <p className='text-gray-600 mb-6 max-w-4xl mx-auto'>
                Türkiye&apos;nin en kapsamlı e-ihracat programı ile firmanızı
                sadece 12 ayda küresel bir marka haline getirin. Uzman
                danışmanlarımız, modern eğitim sistemimiz ve teknik altyapımızla
                başarınız garantili.
              </p>
              <div className='flex flex-wrap justify-center gap-4'>
                <div className='bg-blue-50 rounded-full px-6 py-2'>
                  <span className='text-blue-700 font-semibold'>
                    500+ Başarılı Firma
                  </span>
                </div>
                <div className='bg-orange-50 rounded-full px-6 py-2'>
                  <span className='text-orange-700 font-semibold'>
                    50+ Ülkeye İhracat
                  </span>
                </div>
                <div className='bg-green-50 rounded-full px-6 py-2'>
                  <span className='text-green-700 font-semibold'>
                    %300 Ciro Artışı
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Dönüşüm Modeli Bölümü */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-full px-6 py-2 mb-6'>
              <i className='ri-brain-line text-purple-600 mr-2 w-5 h-5 flex items-center justify-center'></i>
              <span className='text-purple-800 font-semibold text-sm tracking-wide'>
                DİJİTAL DÖNÜŞÜM
              </span>
            </div>
            <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
              Bu Bir Danışmanlık Değil,
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600'>
                {' '}
                Dönüşüm Modelidir
              </span>
            </h2>
            <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
              Bu sistem yalnızca bir danışmanlık hizmeti değildir. Her firma,
              kendi dijital paneline sahip olur. Bu panelde tüm proje adımları,
              eğitimler, raporlar ve görevler dijital olarak tanımlıdır. Her
              aşama, gelişim takibi ve danışman onayıyla ilerler.
            </p>
          </div>
          <div className='relative'>
            {/* Ana Açıklama Kutusu */}
            <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 lg:p-12 mb-12 border border-blue-100 shadow-lg'>
              <div className='grid lg:grid-cols-2 gap-12 items-center'>
                <div>
                  <div className='mb-8'>
                    <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4'>
                      <i className='ri-dashboard-3-line text-2xl text-white w-8 h-8 flex items-center justify-center'></i>
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                      Kişisel Dijital Panel
                    </h3>
                    <p className='text-gray-600 leading-relaxed'>
                      Her firma için özelleştirilmiş dijital panel ile tüm
                      süreçler şeffaf ve takip edilebilir. Proje ilerlemesi,
                      eğitim durumu ve performans metrikleri anlık olarak
                      görüntülenebilir.
                    </p>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <div
                      className={`w-3 h-3 bg-blue-500 rounded-full ${isClient ? 'animate-pulse' : ''}`}
                    ></div>
                    <span className='text-blue-700 font-medium text-sm'>
                      Canlı İzleme Aktif
                    </span>
                  </div>
                </div>
                <div className='relative'>
                  <Image
                    src='https://readdy.ai/api/search-image?query=Modern%20digital%20dashboard%20interface%20showing%20project%20management%2C%20analytics%20charts%2C%20progress%20tracking%2C%20and%20educational%20modules.%20Clean%20professional%20UI%20design%20with%20blue%20and%20purple%20color%20scheme%2C%20showing%20task%20completion%2C%20video%20training%20progress%2C%20calendar%20events%2C%20and%20AI%20assistant%20features.%20High-tech%20business%20software%20interface%20style&width=600&height=400&seq=dashboard-ui-001&orientation=landscape'
                    alt='Dijital Panel Arayüzü'
                    width={600}
                    height={400}
                    className='rounded-2xl shadow-xl w-full h-auto object-cover'
                  />
                  <div className='absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg'>
                    <i className='ri-notification-3-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                </div>
              </div>
            </div>
            {/* Özellikler Grid */}
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Görev Bazlı Proje Yönetimi */}
              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <div className='flex items-center mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4'>
                    <i className='ri-task-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <h4 className='text-lg font-bold text-gray-900'>
                    Görev Bazlı Proje Yönetimi
                  </h4>
                </div>
                <p className='text-gray-600 text-sm mb-4'>
                  Her proje adımı açık görevlere bölünür ve takip edilir.
                  Tamamlanan görevler otomatik olarak işaretlenir.
                </p>
                <div className='flex items-center'>
                  <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
                  <span className='text-green-600 text-xs font-medium'>
                    Otomatik İlerleme Takibi
                  </span>
                </div>
              </div>
              {/* Video ve Doküman Eğitim Yönetimi */}
              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <div className='flex items-center mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-4'>
                    <i className='ri-play-circle-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <h4 className='text-lg font-bold text-gray-900'>
                    Video & Doküman Eğitim
                  </h4>
                </div>
                <p className='text-gray-600 text-sm mb-4'>
                  Kişiselleştirilmiş eğitim modülleri ile kendi hızınızda
                  öğrenin. İzleme oranları ve test sonuçları takip edilir.
                </p>
                <div className='flex items-center'>
                  <div className='w-2 h-2 bg-orange-500 rounded-full mr-2'></div>
                  <span className='text-orange-600 text-xs font-medium'>
                    Kişisel Öğrenme Yolu
                  </span>
                </div>
              </div>
              {/* Canlı Etkinlik Takvimi */}
              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <div className='flex items-center mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4'>
                    <i className='ri-calendar-event-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <h4 className='text-lg font-bold text-gray-900'>
                    Canlı Etkinlik Takvimi
                  </h4>
                </div>
                <p className='text-gray-600 text-sm mb-4'>
                  Webinar, workshop ve mentorluk seansları otomatik olarak
                  planlanır ve hatırlatıcılar gönderilir.
                </p>
                <div className='flex items-center'>
                  <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
                  <span className='text-green-600 text-xs font-medium'>
                    Otomatik Planlama
                  </span>
                </div>
              </div>
              {/* Otomatik Raporlama */}
              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <div className='flex items-center mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4'>
                    <i className='ri-bar-chart-box-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <h4 className='text-lg font-bold text-gray-900'>
                    Otomatik Raporlama
                  </h4>
                </div>
                <p className='text-gray-600 text-sm mb-4'>
                  SWOT analizi, performans raporları ve ilerleme
                  değerlendirmeleri otomatik olarak oluşturulur.
                </p>
                <div className='flex items-center'>
                  <div className='w-2 h-2 bg-purple-500 rounded-full mr-2'></div>
                  <span className='text-purple-600 text-xs font-medium'>
                    Akıllı Analiz
                  </span>
                </div>
              </div>
              {/* AI Destekli İçerik */}
              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-2'>
                <div className='flex items-center mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-4'>
                    <i className='ri-robot-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <h4 className='text-lg font-bold text-gray-900'>
                    Yapay Zekâ Destekli İçerik Üretimi
                  </h4>
                </div>
                <p className='text-gray-600 text-sm mb-4'>
                  AI asistanlar ürün açıklamaları, pazarlama metinleri ve
                  stratejik öneriler oluşturur. Kişiselleştirilmiş içerik
                  önerileri ve otomatik optimizasyon.
                </p>
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center'>
                    <div className='w-2 h-2 bg-indigo-500 rounded-full mr-2'></div>
                    <span className='text-indigo-600 text-xs font-medium'>
                      24/7 AI Asistan
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-2 h-2 bg-purple-500 rounded-full mr-2'></div>
                    <span className='text-purple-600 text-xs font-medium'>
                      Otomatik Optimizasyon
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* CTA Alanı */}
            <div className='mt-12 text-center'>
              <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white'>
                <h3 className='text-2xl font-bold mb-4'>
                  Dönüşümünüzü Hemen Başlatın
                </h3>
                <p className='text-blue-100 mb-6 max-w-2xl mx-auto'>
                  Geleneksel danışmanlık hizmetlerinin ötesinde, teknoloji
                  destekli bir dönüşüm deneyimi yaşayın.
                </p>
                <Link
                  href='/demo-talep'
                  className='inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 cursor-pointer whitespace-nowrap'
                >
                  Demo Talep Et
                  <i className='ri-arrow-right-line ml-2 w-5 h-5 flex items-center justify-center'></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Kimler Bu Programa Katılmalı Bölümü */}
      <section className='py-20 bg-gradient-to-br from-gray-50 to-blue-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
          {/* Header */}
          <div className='text-center mb-16'>
            <div className='inline-flex items-center bg-gradient-to-r from-blue-100 to-green-100 rounded-full px-6 py-2 mb-6'>
              <i className='ri-team-line text-blue-600 mr-2 w-5 h-5 flex items-center justify-center'></i>
              <span className='text-blue-800 font-semibold text-sm tracking-wide'>
                HEDEF KİTLE
              </span>
            </div>
            <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
              Kimler Bu Programa
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600'>
                {' '}
                Katılmalı?
              </span>
            </h2>
            <div className='w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto mb-6'></div>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
              E-ihracat ekosisteminin güçlenmesi için farklı sektörlerden
              aktörleri bir araya getiriyoruz.
            </p>
          </div>
          {/* İkili Kolon Yapısı */}
          <div className='grid lg:grid-cols-2 gap-12'>
            {/* Üretici Firmalar */}
            <div className='bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-blue-100 hover:shadow-2xl transition-all duration-300'>
              <div className='mb-8'>
                <div className='flex items-center mb-6'>
                  <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg'>
                    <i className='ri-building-2-line text-2xl text-white w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <div>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      Üretici Firmalar İçin
                    </h3>
                    <div className='w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mt-2'></div>
                  </div>
                </div>
                <p className='text-gray-600 mb-8 leading-relaxed'>
                  Küresel pazarlara açılmak isteyen ve ihracat potansiyeli olan
                  firmalar için özel tasarlanmış program.
                </p>
              </div>
              <div className='space-y-6'>
                {/* Global Pazarlara Açılmak İsteyen KOBİ'ler */}
                <div className='group bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500 hover:bg-blue-100 transition-all duration-300'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-global-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-lg font-bold text-gray-900 mb-2'>
                        Global Pazarlara Açılmak İsteyen KOBİ&apos;ler
                      </h4>
                      <p className='text-gray-600 text-sm'>
                        Yerel pazardaki deneyiminizi uluslararası sahada
                        büyütmeye hazır olan orta ölçekli işletmeler.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Lojistik ve İçerik Eksikliği */}
                <div className='group bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500 hover:bg-orange-100 transition-all duration-300'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-truck-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-lg font-bold text-gray-900 mb-2'>
                        Lojistik, İçerik, Pazar Bilgisi Eksikliği Yaşayan
                        Üreticiler
                      </h4>
                      <p className='text-gray-600 text-sm'>
                        Kaliteli ürün üretiyor ancak ihracat süreçleri konusunda
                        desteğe ihtiyaç duyan firmalar.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Devlet Desteklerinden Yararlanmak İsteyen Markalar */}
                <div className='group bg-green-50 rounded-xl p-6 border-l-4 border-green-500 hover:bg-green-100 transition-all duration-300'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-government-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-lg font-bold text-gray-900 mb-2'>
                        Devlet Desteklerinden Yararlanmak İsteyen Markalar
                      </h4>
                      <p className='text-gray-600 text-sm'>
                        Mevcut teşvik ve destekleri etkin kullanarak ihracat
                        kapasitesini artırmak isteyen markalar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* İstatistik Kutusu */}
              <div className='mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6'>
                <div className='flex items-center justify-between'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-700'>500+</div>
                    <div className='text-blue-600 text-sm'>Katılımcı Firma</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-700'>%85</div>
                    <div className='text-blue-600 text-sm'>Başarı Oranı</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-700'>50+</div>
                    <div className='text-blue-600 text-sm'>Hedef Ülke</div>
                  </div>
                </div>
              </div>
            </div>
            {/* STK ve Oda Yöneticileri */}
            <div className='bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-green-100 hover:shadow-2xl transition-all duration-300'>
              <div className='mb-8'>
                <div className='flex items-center mb-6'>
                  <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg'>
                    <i className='ri-community-line text-2xl text-white w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <div>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      STK ve Oda Yöneticileri İçin
                    </h3>
                    <div className='w-16 h-1 bg-gradient-to-r from-green-500 to-green-600 mt-2'></div>
                  </div>
                </div>
                <p className='text-gray-600 mb-8 leading-relaxed'>
                  Bölgesel kalkınmaya öncülük eden ve üye firmalarına değer
                  katmak isteyen kurumlar için stratejik ortaklık.
                </p>
              </div>
              <div className='space-y-6'>
                {/* İhracat Yetkinliği Artırmak İsteyen Kurumlar */}
                <div className='group bg-green-50 rounded-xl p-6 border-l-4 border-green-500 hover:bg-green-100 transition-all duration-300'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-line-chart-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-lg font-bold text-gray-900 mb-2'>
                        İllerindeki Firmaların İhracat Yetkinliğini Artırmak
                        İsteyen Kurumlar
                      </h4>
                      <p className='text-gray-600 text-sm'>
                        Üye firmalarının küresel pazarlarda rekabet gücünü
                        artırarak bölgesel ekonomiyi güçlendirme hedefi olan
                        kurumlar.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Bakanlık Desteklerini Organize Edecek Yapılar */}
                <div className='group bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500 hover:bg-purple-100 transition-all duration-300'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-shield-star-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-lg font-bold text-gray-900 mb-2'>
                        Bakanlık Desteklerini Organize Edecek Şemsiye Yapılar
                      </h4>
                      <p className='text-gray-600 text-sm'>
                        Devlet desteklerini etkin şekilde koordine ederek
                        maksimum faydayı sağlamak isteyen kuruluşlar.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Dijital ve AI Destekli Modeller */}
                <div className='group bg-indigo-50 rounded-xl p-6 border-l-4 border-indigo-500 hover:bg-indigo-100 transition-all duration-300'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-robot-2-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-lg font-bold text-gray-900 mb-2'>
                        Dijital ve Yapay Zekâ Destekli Sürdürülebilir Modeller
                        Arayan Aktörler
                      </h4>
                      <p className='text-gray-600 text-sm'>
                        Teknoloji odaklı, ölçeklenebilir ve sürdürülebilir
                        çözümlerle geleceği şekillendirmek isteyen öncü
                        kurumlar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* İstatistik Kutusu */}
              <div className='mt-8 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6'>
                <div className='flex items-center justify-between'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-700'>
                      150+
                    </div>
                    <div className='text-green-600 text-sm'>Ortak Kurum</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-700'>%90</div>
                    <div className='text-green-600 text-sm'>Memnuniyet</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-700'>25+</div>
                    <div className='text-green-600 text-sm'>İl Kapsamı</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Alt CTA Alanı */}
          <div className='mt-16'>
            <div className='bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-3xl p-8 lg:p-12 text-white text-center shadow-2xl'>
              <div className='max-w-4xl mx-auto'>
                <div className='mb-6'>
                  <div className='inline-flex items-center bg-white/20 rounded-full px-6 py-2 mb-4'>
                    <i className='ri-star-line text-yellow-300 mr-2 w-5 h-5 flex items-center justify-center'></i>
                    <span className='text-white font-semibold text-sm tracking-wide'>
                      ÖZEL DAVET
                    </span>
                  </div>
                  <h3 className='text-3xl lg:text-4xl font-bold mb-4'>
                    Hangi Kategoride Olursanız Olun
                  </h3>
                  <p className='text-xl text-white/90 leading-relaxed'>
                    Türkiye&apos;nin e-ihracat dönüşümüne öncülük edin. Size
                    özel hazırlanmış programa katılın ve sektörünüzde lider
                    konuma gelin.
                  </p>
                </div>
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <Link
                    href='/firma-basvuru'
                    className='inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 cursor-pointer whitespace-nowrap'
                  >
                    <i className='ri-building-2-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                    Firma Olarak Katıl
                  </Link>
                  <Link
                    href='/kurum-basvuru'
                    className='inline-flex items-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 cursor-pointer whitespace-nowrap'
                  >
                    <i className='ri-community-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                    Kurum Olarak Ortaklık
                  </Link>
                </div>
                <div className='mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80'>
                  <div className='flex items-center'>
                    <i className='ri-check-line text-green-300 mr-2 w-4 h-4 flex items-center justify-center'></i>
                    Ücretsiz İlk Danışmanlık
                  </div>
                  <div className='flex items-center'>
                    <i className='ri-check-line text-green-300 mr-2 w-4 h-4 flex items-center justify-center'></i>
                    Özel İndirim Fırsatları
                  </div>
                  <div className='flex items-center'>
                    <i className='ri-check-line text-green-300 mr-2 w-4 h-4 flex items-center justify-center'></i>
                    Öncelikli Destek
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Partnership Section */}
      <section className='py-20 bg-gradient-to-br from-slate-50 to-blue-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
          {/* Header */}
          <div className='text-center mb-16'>
            <div className='inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-6 py-2 mb-6'>
              <i className='ri-trophy-line text-green-600 mr-2 w-5 h-5 flex items-center justify-center'></i>
              <span className='text-green-800 font-semibold text-sm tracking-wide'>
                BAŞARI HİKAYELERİ
              </span>
            </div>
            <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600'>
                📈 Gerçek Başarı
              </span>
              <span className='text-gray-900'> Hikayeleri</span>
            </h2>
            <div className='w-24 h-1 bg-gradient-to-r from-green-600 to-blue-600 mx-auto mb-6'></div>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
              İhracat Akademi ile dönüşüm yaşayan firmaların gerçek deneyimleri
              ve başarı öykülerini keşfedin.
            </p>
          </div>
          {/* Slider Container */}
          <div className='relative'>
            <div className='bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100'>
              {/* Success Stories Slider */}
              <div className='grid md:grid-cols-3 gap-8 mb-12'>
                {/* Story 1 - Alibaba & Amazon */}
                <div className='group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
                  <div className='mb-6'>
                    <div className='flex items-center mb-4'>
                      <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3'>
                        <i className='ri-global-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                      </div>
                      <div>
                        <h4 className='font-bold text-gray-900 text-sm'>
                          Küresel E-Ticaret
                        </h4>
                        <p className='text-blue-600 text-xs'>Tekstil Firması</p>
                      </div>
                    </div>
                    <div className='relative'>
                      <i className='ri-double-quotes-l text-4xl text-blue-300 mb-4'></i>
                      <blockquote className='text-gray-800 font-medium text-lg leading-relaxed mb-4'>
                        &quot;Alibaba Verified hesabımızla B2B de Amazon&apos;la
                        da B2C de siparişlerimizi almaya başladık.&quot;
                      </blockquote>
                      <i className='ri-double-quotes-r text-4xl text-blue-300 absolute -bottom-2 right-0'></i>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <Image
                        src='https://readdy.ai/api/search-image?query=Professional%20Turkish%20business%20owner%2C%20middle-aged%20woman%20in%20business%20attire%2C%20confident%20and%20successful%2C%20modern%20office%20background%2C%20representing%20textile%20industry%20success%20story.%20Professional%20headshot%20style%20photography%20with%20blue%20color%20scheme&width=60&height=60&seq=success-story-1&orientation=squarish'
                        alt='Müşteri'
                        width={40}
                        height={40}
                        className='w-10 h-10 rounded-full object-cover mr-3 border-2 border-blue-300'
                      />
                      <div>
                        <p className='font-semibold text-gray-900 text-sm'>
                          Ayşe Demir
                        </p>
                        <p className='text-blue-600 text-xs'>
                          CEO, Demir Tekstil
                        </p>
                      </div>
                    </div>
                    <div className='bg-green-100 rounded-full px-3 py-1'>
                      <span className='text-green-700 font-bold text-xs'>
                        +400% Büyüme
                      </span>
                    </div>
                  </div>
                </div>
                {/* Story 2 - SWOT Analizi */}
                <div className='group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
                  <div className='mb-6'>
                    <div className='flex items-center mb-4'>
                      <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3'>
                        <i className='ri-line-chart-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                      </div>
                      <div>
                        <h4 className='font-bold text-gray-900 text-sm'>
                          Strateji Dönüşümü
                        </h4>
                        <p className='text-purple-600 text-xs'>Gıda Firması</p>
                      </div>
                    </div>
                    <div className='relative'>
                      <i className='ri-double-quotes-l text-4xl text-purple-300 mb-4'></i>
                      <blockquote className='text-gray-800 font-medium text-lg leading-relaxed mb-4'>
                        &quot;SWOT raporu sonrası hedef pazar stratejimiz
                        değişti. Artık doğru müşterilere ulaşıyoruz.&quot;
                      </blockquote>
                      <i className='ri-double-quotes-r text-4xl text-purple-300 absolute -bottom-2 right-0'></i>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <Image
                        src='https://readdy.ai/api/search-image?query=Professional%20Turkish%20businessman%2C%20middle-aged%20man%20in%20business%20suit%2C%20confident%20expression%2C%20modern%20office%20environment%2C%20representing%20food%20industry%20executive.%20Professional%20headshot%20photography%20with%20purple%20color%20theme&width=60&height=60&seq=success-story-2&orientation=squarish'
                        alt='Müşteri'
                        width={40}
                        height={40}
                        className='w-10 h-10 rounded-full object-cover mr-3 border-2 border-purple-300'
                      />
                      <div>
                        <p className='font-semibold text-gray-900 text-sm'>
                          Mehmet Kaya
                        </p>
                        <p className='text-purple-600 text-xs'>
                          Genel Müdür, Kaya Gıda
                        </p>
                      </div>
                    </div>
                    <div className='bg-orange-100 rounded-full px-3 py-1'>
                      <span className='text-orange-700 font-bold text-xs'>
                        %250 ROI
                      </span>
                    </div>
                  </div>
                </div>
                {/* Story 3 - AI İçerik */}
                <div className='group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
                  <div className='mb-6'>
                    <div className='flex items-center mb-4'>
                      <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3'>
                        <i className='ri-robot-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                      </div>
                      <div>
                        <h4 className='font-bold text-gray-900 text-sm'>
                          AI Verimliliği
                        </h4>
                        <p className='text-green-600 text-xs'>
                          Teknoloji Firması
                        </p>
                      </div>
                    </div>
                    <div className='relative'>
                      <i className='ri-double-quotes-l text-4xl text-green-300 mb-4'></i>
                      <blockquote className='text-gray-800 font-medium text-lg leading-relaxed mb-4'>
                        &quot;İçeriklerimizi yapay zekâ ile 10 kat hızlı
                        hazırlıyoruz. Zamandan tasarruf muazzam.&quot;
                      </blockquote>
                      <i className='ri-double-quotes-r text-4xl text-green-300 absolute -bottom-2 right-0'></i>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <Image
                        src='https://readdy.ai/api/search-image?query=Young%20professional%20Turkish%20tech%20entrepreneur%2C%20woman%20in%20modern%20casual%20business%20attire%2C%20innovative%20and%20tech-savvy%20appearance%2C%20contemporary%20office%20setting.%20Professional%20portrait%20with%20green%20color%20theme&width=60&height=60&seq=success-story-3&orientation=squarish'
                        alt='Müşteri'
                        width={40}
                        height={40}
                        className='w-10 h-10 rounded-full object-cover mr-3 border-2 border-green-300'
                      />
                      <div>
                        <p className='font-semibold text-gray-900 text-sm'>
                          Zeynep Özkan
                        </p>
                        <p className='text-green-600 text-xs'>
                          Kurucu, TechFlow
                        </p>
                      </div>
                    </div>
                    <div className='bg-blue-100 rounded-full px-3 py-1'>
                      <span className='text-blue-700 font-bold text-xs'>
                        10x Hız
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Navigation Dots */}
              <div className='flex justify-center space-x-2 mb-8'>
                <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                <div className='w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 cursor-pointer transition-colors duration-200'></div>
                <div className='w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 cursor-pointer transition-colors duration-200'></div>
                <div className='w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 cursor-pointer transition-colors duration-200'></div>
              </div>
              {/* Stats Bar */}
              <div className='bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mb-8'>
                <div className='grid md:grid-cols-4 gap-6 text-center'>
                  <div>
                    <div className='text-3xl font-bold text-blue-600 mb-1'>
                      1000+
                    </div>
                    <div className='text-gray-600 text-sm'>
                      Başarılı Dönüşüm
                    </div>
                  </div>
                  <div>
                    <div className='text-3xl font-bold text-purple-600 mb-1'>
                      %85
                    </div>
                    <div className='text-gray-600 text-sm'>İhracat Artışı</div>
                  </div>
                  <div>
                    <div className='text-3xl font-bold text-green-600 mb-1'>
                      50+
                    </div>
                    <div className='text-gray-600 text-sm'>Ülkeye Erişim</div>
                  </div>
                  <div>
                    <div className='text-3xl font-bold text-orange-600 mb-1'>
                      ₺100M+
                    </div>
                    <div className='text-gray-600 text-sm'>Toplam İhracat</div>
                  </div>
                </div>
              </div>
              {/* CTA Button */}
              <div className='text-center'>
                <Link
                  href='/basari-hikayeleri'
                  className='inline-flex items-center bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl'
                >
                  <i className='ri-trophy-line mr-3 w-5 h-5 flex items-center justify-center'></i>
                  Tüm Başarı Hikayeleri
                  <i className='ri-arrow-right-line ml-3 w-5 h-5 flex items-center justify-center'></i>
                </Link>
              </div>
            </div>
            {/* Background Decorations */}
            <div className='absolute -top-8 -left-8 w-24 h-24 bg-green-200 rounded-full opacity-20'></div>
            <div className='absolute -bottom-8 -right-8 w-32 h-32 bg-blue-200 rounded-full opacity-20'></div>
            <div className='absolute top-1/2 -right-16 w-16 h-16 bg-purple-200 rounded-full opacity-20'></div>
          </div>
        </div>
      </section>
      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
