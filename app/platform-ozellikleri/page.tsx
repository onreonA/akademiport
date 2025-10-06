'use client';
import Link from 'next/link';
import { useState } from 'react';

import ModernFooter from '@/components/layout/ModernFooter';
import ModernNavigation from '@/components/layout/ModernNavigation';
export default function PlatformOzellikleri() {
  const [activeTab, setActiveTab] = useState('panel');
  const tabData = {
    panel: {
      title: 'Panel Modülleri',
      subtitle: 'Kapsamlı İş Yönetimi',
      icon: 'ri-dashboard-3-line',
      color: 'blue',
      features: [
        {
          title: 'Proje Yönetimi',
          description:
            'Her proje için özel görev tanımlama, ilerleme takibi ve milestone izleme sistemi. Danışman onayları ile adım adım ilerleyin.',
          icon: 'ri-task-line',
          benefits: [
            'Görev bazlı takip',
            'Otomatik bildirimler',
            'İlerleme raporları',
            'Ekip koordinasyonu',
          ],
        },
        {
          title: 'Eğitim Takibi',
          description:
            'Kişiselleştirilmiş eğitim rotaları, video içerikleri ve interaktif testlerle öğrenme deneyimi. Tamamlama oranları ve sertifikalar.',
          icon: 'ri-graduation-cap-line',
          benefits: [
            'Video eğitimler',
            'Interaktif testler',
            'İlerleme analizi',
            'Sertifikasyon',
          ],
        },
        {
          title: 'Etkinlik Planlama',
          description:
            'Webinar, workshop ve mentorluk seanslarının otomatik planlanması. Katılımcı yönetimi ve canlı etkinlik desteği.',
          icon: 'ri-calendar-event-line',
          benefits: [
            'Otomatik planlama',
            'Katılımcı takibi',
            'Canlı yayın desteği',
            'Kayıt sistemi',
          ],
        },
        {
          title: 'Kariyer Havuzu',
          description:
            'Firmalar arası yetenek paylaşımı, iş ilanları ve kariyer gelişim fırsatları. CV havuzu ve eşleştirme algoritmaları.',
          icon: 'ri-user-search-line',
          benefits: [
            'Yetenek eşleştirme',
            'İş ilanları',
            'CV havuzu',
            'Kariyer danışmanlığı',
          ],
        },
        {
          title: 'Firma Yönetimi',
          description:
            'Firma profilleri, yetkilendirmeler ve çoklu kullanıcı desteği. Departman bazlı erişim kontrolü ve izin yönetimi.',
          icon: 'ri-building-2-line',
          benefits: [
            'Çoklu kullanıcı',
            'Yetki yönetimi',
            'Departman kontrolü',
            'Güvenlik protokolleri',
          ],
        },
        {
          title: 'Forum ve Topluluk',
          description:
            'Sektörel forumlar, uzman görüşleri ve firmalar arası deneyim paylaşımı. Moderasyon ve içerik yönetimi.',
          icon: 'ri-discuss-line',
          benefits: [
            'Sektörel forumlar',
            'Uzman desteği',
            'Deneyim paylaşımı',
            'Moderasyon sistemi',
          ],
        },
      ],
    },
    ai: {
      title: 'AI Destekleri',
      subtitle: 'Akıllı İş Asistanları',
      icon: 'ri-robot-line',
      color: 'purple',
      features: [
        {
          title: 'İçerik Optimizasyon Asistanı',
          description:
            'Ürün açıklamaları, pazarlama metinleri ve SEO uyumlu içeriklerin otomatik oluşturulması ve optimizasyonu.',
          icon: 'ri-article-line',
          benefits: [
            'SEO optimizasyonu',
            'Çoklu dil desteği',
            'Otomatik düzenleme',
            'İçerik önerileri',
          ],
        },
        {
          title: 'Stratejik Öneri Sistemi',
          description:
            'Firma verilerine dayalı pazar analizi, rekabet intelligence ve büyüme önerileri. Kişiselleştirilmiş stratejiler.',
          icon: 'ri-lightbulb-line',
          benefits: [
            'Pazar analizi',
            'Rekabet izleme',
            'Büyüme önerileri',
            'Trend analizi',
          ],
        },
        {
          title: 'Otomatik Yönlendirme',
          description:
            'Kullanıcı davranışlarına göre akıllı yönlendirmeler, görev önceliklendirme ve kişisel asistan desteği.',
          icon: 'ri-guide-line',
          benefits: [
            'Akıllı yönlendirme',
            'Öncelik belirleme',
            'Kişisel asistan',
            'Davranış analizi',
          ],
        },
        {
          title: 'Özetleme ve Analiz',
          description:
            'Uzun dokümanların özetlenmesi, rapor analizleri ve önemli bilgilerin çıkarılması. Hızlı karar desteği.',
          icon: 'ri-file-text-line',
          benefits: [
            'Doküman özetleme',
            'Hızlı analiz',
            'Anahtar bilgiler',
            'Karar desteği',
          ],
        },
        {
          title: 'Tahminleme Motoru',
          description:
            'Satış tahminleri, pazar trendleri ve risk analizleri. Gelecek planlaması için veri destekli öngörüler.',
          icon: 'ri-line-chart-line',
          benefits: [
            'Satış tahminleri',
            'Trend analizi',
            'Risk değerlendirmesi',
            'Gelecek planlaması',
          ],
        },
        {
          title: 'Çoklu Dil Çeviri',
          description:
            'Gerçek zamanlı çeviri hizmetleri, kültürel adaptasyon ve uluslararası iletişim desteği.',
          icon: 'ri-translate-2',
          benefits: [
            'Gerçek zamanlı çeviri',
            'Kültürel adaptasyon',
            '50+ dil desteği',
            'Teknik terim sözlüğü',
          ],
        },
      ],
    },
    reports: {
      title: 'Raporlama & İzleme Sistemi',
      subtitle: 'Gelişmiş Analytics',
      icon: 'ri-bar-chart-box-line',
      color: 'green',
      features: [
        {
          title: 'Firma İlerleme Yüzdeleri',
          description:
            'Her proje adımının detaylı takibi, tamamlanma oranları ve başarı metrikleri. Görsel dashboard ile anlık durum.',
          icon: 'ri-progress-3-line',
          benefits: [
            'Anlık ilerleme',
            'Başarı metrikleri',
            'Görsel dashboard',
            'Karşılaştırmalı analiz',
          ],
        },
        {
          title: 'Proje Adımı Takipleri',
          description:
            'Milestone bazlı izleme, gecikme analizleri ve kritik yol hesaplamaları. Proaktif uyarı sistemi.',
          icon: 'ri-roadmap-line',
          benefits: [
            'Milestone takibi',
            'Gecikme analizi',
            'Kritik yol',
            'Proaktif uyarılar',
          ],
        },
        {
          title: 'Eğitim Tamamlama Oranları',
          description:
            'Modül bazlı öğrenme analizi, test sonuçları ve yetkinlik haritaları. Kişiselleştirilmiş öğrenme önerileri.',
          icon: 'ri-medal-line',
          benefits: [
            'Modül analizi',
            'Test sonuçları',
            'Yetkinlik haritası',
            'Öğrenme önerileri',
          ],
        },
        {
          title: 'Kullanıcı Aktivite Analizi',
          description:
            'Platform kullanım detayları, aktiflik seviyeleri ve etkileşim metrikleri. Kullanıcı deneyimi optimizasyonu.',
          icon: 'ri-user-line',
          benefits: [
            'Aktivite takibi',
            'Etkileşim analizi',
            'Kullanım istatistikleri',
            'UX optimizasyon',
          ],
        },
        {
          title: 'Gelişmiş Filtreleme',
          description:
            'Çoklu parametreli filtreleme sistemi, özel sorgu oluşturma ve veri segmentasyonu. Esnek raporlama araçları.',
          icon: 'ri-filter-3-line',
          benefits: [
            'Çoklu filtreleme',
            'Özel sorgular',
            'Veri segmentasyonu',
            'Esnek raporlar',
          ],
        },
        {
          title: 'Grafiksel Analiz',
          description:
            'Interaktif grafikler, trend analizleri ve karşılaştırmalı görselleştirmeler. Export ve paylaşım özellikleri.',
          icon: 'ri-pie-chart-line',
          benefits: [
            'Interaktif grafikler',
            'Trend analizi',
            'Karşılaştırma',
            'Export özelliği',
          ],
        },
      ],
    },
  };
  const currentTab = tabData[activeTab as keyof typeof tabData];
  return (
    <div className='min-h-screen bg-white'>
      {/* Modern Navigation */}
      <ModernNavigation />
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-slate-50 to-blue-50 py-20 overflow-hidden'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5'
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20technology%20dashboard%20interface%20with%20multiple%20screens%20showing%20analytics%2C%20AI%20features%2C%20and%20management%20tools.%20Clean%20professional%20design%20with%20blue%20and%20purple%20gradients%2C%20representing%20advanced%20business%20intelligence%20platform.%20High-tech%20visualization%20style&width=1920&height=800&seq=platform-hero&orientation=landscape')`,
          }}
        ></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-6'>
              <i className='ri-cpu-line text-blue-600 mr-2 w-5 h-5 flex items-center justify-center'></i>
              <span className='text-blue-800 font-semibold text-sm tracking-wide'>
                PLATFORM ÖZELLİKLERİ
              </span>
            </div>
            <h1 className='text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'>
                Gelişmiş
              </span>{' '}
              Platform
              <br />
              <span className='text-gray-900'>Altyapısı</span>
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed'>
              İhracat Akademi&apos;nin güçlü teknoloji altyapısı, yapay zeka
              destekli araçları ve kapsamlı yönetim modülleriyle işinizi bir üst
              seviyeye taşıyın.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/demo-izle'
                className='inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl'
              >
                <i className='ri-play-circle-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                Demo İzle
              </Link>
              <Link
                href='/ucretsiz-deneme'
                className='inline-flex items-center bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-800 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg'
              >
                <i className='ri-gift-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                Ücretsiz Deneme
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Platform Features Tabs */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Tab Navigation */}
          <div className='flex flex-col lg:flex-row gap-2 bg-gray-100 rounded-2xl p-2 mb-12 max-w-4xl mx-auto'>
            {Object.entries(tabData).map(([key, tab]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === key
                    ? `bg-white text-${tab.color}-600 shadow-lg`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <i
                  className={`${tab.icon} mr-3 w-5 h-5 flex items-center justify-center`}
                ></i>
                {tab.title}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div className='transition-all duration-500 ease-in-out'>
            {/* Header */}
            <div className='text-center mb-12'>
              <div
                className={`inline-flex items-center bg-${currentTab.color}-100 rounded-full px-6 py-2 mb-4`}
              >
                <i
                  className={`${currentTab.icon} text-${currentTab.color}-600 mr-2 w-5 h-5 flex items-center justify-center`}
                ></i>
                <span
                  className={`text-${currentTab.color}-800 font-semibold text-sm tracking-wide`}
                >
                  {currentTab.title.toUpperCase()}
                </span>
              </div>
              <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
                {currentTab.subtitle}
              </h2>
              <div
                className={`w-24 h-1 bg-gradient-to-r from-${currentTab.color}-500 to-${currentTab.color}-600 mx-auto`}
              ></div>
            </div>
            {/* Features Grid */}
            <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-8'>
              {currentTab.features.map((feature, index) => (
                <div
                  key={index}
                  className={`group bg-white rounded-2xl p-8 border border-${currentTab.color}-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
                >
                  <div className='mb-6'>
                    <div
                      className={`w-16 h-16 bg-gradient-to-br from-${currentTab.color}-500 to-${currentTab.color}-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <i
                        className={`${feature.icon} text-2xl text-white w-8 h-8 flex items-center justify-center`}
                      ></i>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-3'>
                      {feature.title}
                    </h3>
                    <p className='text-gray-600 leading-relaxed mb-6'>
                      {feature.description}
                    </p>
                  </div>
                  <div className='space-y-3'>
                    <div
                      className={`text-${currentTab.color}-700 font-semibold text-sm mb-3`}
                    >
                      Temel Özellikler:
                    </div>
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div
                        key={benefitIndex}
                        className='flex items-center text-sm text-gray-700'
                      >
                        <i
                          className={`ri-check-line text-${currentTab.color}-600 mr-3 w-4 h-4 flex items-center justify-center`}
                        ></i>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <div className='mt-6 pt-6 border-t border-gray-100'>
                    <Link
                      href={`/kesfet-${activeTab}`}
                      className={`inline-flex items-center text-${currentTab.color}-600 hover:text-${currentTab.color}-700 font-semibold text-sm transition-colors duration-200 cursor-pointer`}
                    >
                      Bu modülü keşfet
                      <i className='ri-arrow-right-line ml-2 w-4 h-4 flex items-center justify-center'></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Technology Stack */}
      <section className='py-20 bg_gradient_to_br from_gray_50 to_slate_50'>
        <div className='max_w_7xl mx_auto px_4 sm:px_6 lg:px_8'>
          <div className='text_center mb_16'>
            <div className='inline-flex items_center bg_gradient_to_r from_indigo_100 to_purple_100 rounded_full px_6 py_2 mb_6'>
              <i className='ri_stack_line text_indigo_600 mr_2 w_5 h_5 flex items_center justify_center'></i>
              <span className='text_indigo_800 font_semi_bold text_sm tracking_wide'>
                TEKNOLOJİ ALTYAPISI
              </span>
            </div>
            <h2 className='text_4xl lg:text_5xl font_bold text_gray_900 mb_6'>
              <span className='text_transparent bg_clip_text bg_gradient_to_r from_indigo_600 to_purple_600'>
                Güvenilir
              </span>{' '}
              ve
              <span className='text_transparent bg_clip_text bg_gradient_to_r from_purple_600 to_pink_600'>
                {' '}
                Ölçeklenebilir
              </span>
            </h2>
            <p className='text_xl text_gray_600 max_w_3xl mx_auto'>
              En güncel teknolojilerle inşa edilmiş, güvenli ve performanslı
              platform altyapımız.
            </p>
          </div>
          <div className='grid md:grid_cols_2 lg:grid_cols_4 gap_8'>
            {/* Bulut Altyapı */}
            <div className='bg_white rounded_2xl p_8 text_center shadow_lg border border_gray_100 hover:shadow_xl transition_all duration_300 hover:-translate_y_1'>
              <div className='w_16 h_16 bg_gradient_to_br from_blue_500 to_blue_600 rounded_2xl flex items_center justify_center mx_auto mb_4'>
                <i className='ri_cloud_line text_2xl text_white w_8 h_8 flex items_center justify_center'></i>
              </div>
              <h3 className='text_lg font_bold text_gray_900 mb_3'>
                Bulut Altyapı
              </h3>
              <p className='text_gray_600 text_sm'>
                %99.9 uptime garantisi ile kesintisiz hizmet
              </p>
            </div>
            {/* Güvenlik */}
            <div className='bg_white rounded_2xl p_8 text_center shadow_lg border border_gray_100 hover:shadow_xl transition_all duration_300 hover:-translate_y_1'>
              <div className='w_16 h_16 bg_gradient_to_br from_green_500 to_green_600 rounded_2xl flex items_center justify_center mx_auto mb_4'>
                <i className='ri_shield_check_line text_2xl text_white w_8 h_8 flex items_center justify_center'></i>
              </div>
              <h3 className='text_lg font_bold text_gray_900 mb_3'>Güvenlik</h3>
              <p className='text_gray_600 text_sm'>
                ISO 27001 sertifikalı güvenlik protokolleri
              </p>
            </div>
            {/* Performans */}
            <div className='bg_white rounded_2xl p_8 text_center shadow_lg border border_gray_100 hover:shadow_xl transition_all duration_300 hover:-translate_y_1'>
              <div className='w_16 h_16 bg_gradient_to_br from_orange_500 to_orange_600 rounded_2xl flex items_center justify_center mx_auto mb_4'>
                <i className='ri_speed_up_line text_2xl text_white w_8 h_8 flex items_center justify_center'></i>
              </div>
              <h3 className='text_lg font_bold text_gray_900 mb_3'>
                Performans
              </h3>
              <p className='text_gray_600 text_sm'>
                Milisaniye hızında yanıt süreleri
              </p>
            </div>
            {/* Ölçeklenebilirlik */}
            <div className='bg_white rounded_2xl p_8 text_center shadow_lg border border_gray_100 hover:shadow_xl transition_all duration_300 hover:-translate_y_1'>
              <div className='w_16 h_16 bg_gradient_to_br from_purple_500 to_purple_600 rounded_2xl flex items_center justify_center mx_auto mb_4'>
                <i className='ri_expand_diagonal_line text_2xl text_white w_8 h_8 flex items_center justify_center'></i>
              </div>
              <h3 className='text_lg font_bold text_gray_900 mb_3'>
                Ölçeklenebilirlik
              </h3>
              <p className='text_gray_600 text_sm'>
                Büyüyen ihtiyaçlarınıza uyum sağlar
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Platform Statistics */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl lg:text-4xl font-bold mb-4'>
                Platform Performansı
              </h2>
              <p className='text-blue-100 text-lg max-w-2xl mx-auto'>
                Güçlü altyapımız sayesinde elde ettiğimiz etkileyici performans
                metrikleri.
              </p>
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
              <div className='text-center'>
                <div className='text-4xl font-bold mb-2 text-yellow-300'>
                  10,000+
                </div>
                <div className='text-blue-100'>Günlük İşlem</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold mb-2 text-green-300'>
                  99.9%
                </div>
                <div className='text-blue-100'>Sistem Uptime</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold mb-2 text-orange-300'>
                  &lt;100ms
                </div>
                <div className='text-blue-100'>Yanıt Süresi</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold mb-2 text-pink-300'>50+</div>
                <div className='text-blue-100'>Entegrasyon</div>
              </div>
            </div>
            <div className='mt-12 text-center'>
              <Link
                href='/teknik-detaylar'
                className='inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg'
              >
                <i className='ri-information-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                Teknik Detayları İncele
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Future Roadmap */}
      <section className='py-20 bg-gradient-to-br from-slate-50 to-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-2 mb-6'>
              <i className='ri-roadmap-line text-purple-600 mr-2 w-5 h-5 flex items-center justify-center'></i>
              <span className='text-purple-800 font-semibold text-sm tracking-wide'>
                GELECEK VİZYONU
              </span>
            </div>
            <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
              Platform
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'>
                {' '}
                Yol Haritası
              </span>
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Sürekli gelişen platformumuzun gelecek özelliklerini ve
              yeniliklerini keşfedin.
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-8'>
            {/* Q1 2024 */}
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center mb-6'>
                <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4'>
                  <i className='ri-calendar-line text-white w-6 h-6 flex items-center justify-center'></i>
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900'>Q1 2024</h3>
                  <p className='text-purple-600 text-sm'>Yeni Özellikler</p>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='flex items-start'>
                  <i className='ri-check-line text-green-500 mr-3 mt-1 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-700'>Gelişmiş AI Chatbot</span>
                </div>
                <div className='flex items-start'>
                  <i className='ri-check-line text-green-500 mr-3 mt-1 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-700'>Mobil Uygulama v2.0</span>
                </div>
                <div className='flex items-start'>
                  <i className='ri-time-line text-purple-500 mr-3 mt-1 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-700'>Blockchain Entegrasyonu</span>
                </div>
              </div>
            </div>
            {/* Q2-Q3 2024 */}
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center mb-6'>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4'>
                  <i className='ri-rocket-line text-white w-6 h-6 flex items-center justify-center'></i>
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900'>
                    Q2-Q3 2024
                  </h3>
                  <p className='text-blue-600 text-sm'>Gelişim Aşaması</p>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='flex items-start'>
                  <i className='ri-time-line text-blue-500 mr-3 mt-1 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-700'>IoT Sensör Entegrasyonu</span>
                </div>
                <div className='flex items-start'>
                  <i className='ri-time-line text-blue-500 mr-3 mt-1 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-700'>
                    Gelişmiş Analitik Dashboard
                  </span>
                </div>
                <div className='flex items-start'>
                  <i className='ri-time-line text-blue-500 mr-3 mt-1 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-700'>AR/VR Eğitim Modülleri</span>
                </div>
              </div>
            </div>
            {/* Q4 2024+ */}
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center mb-6'>
                <div className='w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4'>
                  <i className='ri-lightbulb-line text-white w-6 h-6 flex items-center justify-center'></i>
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900'>Q4 2024+</h3>
                  <p className='text-indigo-600 text-sm'>Vizyon Projeler</p>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='flex items-start'>
                  <i className='ri-time-line text-indigo-500 mr-3 mt-1 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-700'>Metaverse İş Alanları</span>
                </div>
                <div className='flex items-start'>
                  <i className='ri-time-line text-indigo-500 mr-3 mt-1 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-700'>
                    Kuantum Güvenlik Protokolleri
                  </span>
                </div>
                <div className='flex items-start'>
                  <i className='ri-time-line text-indigo-500 mr-3 mt-1 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-700'>Global AI Network</span>
                </div>
              </div>
            </div>
          </div>
          {/* CTA */}
          <div className='mt-16 text-center'>
            <div className='bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white'>
              <h3 className='text-2xl font-bold mb-4'>
                Geleceği Şekillendirin
              </h3>
              <p className='text-purple-100 mb-6 max-w-2xl mx-auto'>
                Platform geliştirme sürecine katılın ve önerilerinizle geleceği
                birlikte şekillendirelim.
              </p>
              <Link
                href='/oneri-gonder'
                className='inline-flex items-center bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 cursor-pointer whitespace-nowrap'
              >
                <i className='ri-lightbulb-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                Öneri Gönder
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
