'use client';
import Link from 'next/link';
import { useState } from 'react';

import ModernFooter from '@/components/layout/ModernFooter';
import ModernNavigation from '@/components/layout/ModernNavigation';
const supportSections = [
  {
    id: 'stratejik',
    title: 'Stratejik Danışmanlık',
    icon: 'ri-compass-3-line',
    shortDesc: 'Firma analizi, ürün konumlandırma ve hedef pazar stratejileri',
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    details: {
      description:
        'Firmanızın mevcut durumunu analiz ederek, uluslararası pazarlarda rekabet avantajı sağlayacak stratejiler geliştiriyoruz. Ürünlerinizin doğru konumlandırılması ve hedef pazarlara yönelik özelleştirilmiş yaklaşımlarla büyüme hedeflerinize ulaşmanızı sağlıyoruz.',
      features: [
        'Kapsamlı firma ve ürün analizi',
        'Hedef pazar araştırması ve segmentasyon',
        'Rekabet analizi ve pozisyonlama stratejileri',
        'İhracat potansiyeli değerlendirmesi',
        'Ürün portfolyosu optimizasyonu',
        'Pazarlama stratejisi geliştirme',
      ],
    },
  },
  {
    id: 'dijital',
    title: 'Dijital Altyapı',
    icon: 'ri-settings-3-line',
    shortDesc:
      'Pazaryeri hesap kurulumları, içerik optimizasyonu ve sistem entegrasyonları',
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-600',
    details: {
      description:
        'Dijital ihracat için gerekli tüm teknolojik altyapıyı kuruyor ve optimize ediyoruz. Alibaba, Amazon gibi küresel pazaryerlerinde profesyonel varlığınızı oluştururken, içeriklerinizin uluslararası standartlarda hazırlanmasını sağlıyoruz.',
      features: [
        'Alibaba, Amazon hesap kurulum ve optimizasyonu',
        'Ürün içerik üretimi ve SEO optimizasyonu',
        'Görsel tasarım ve katalog hazırlığı',
        'Çoklu platform entegrasyonu',
        'Otomatik stok ve fiyat senkronizasyonu',
        'Performans takip sistemleri kurulumu',
      ],
    },
  },
  {
    id: 'egitimler',
    title: 'Eğitimler',
    icon: 'ri-graduation-cap-line',
    shortDesc:
      'Video eğitim setleri, interaktif içerikler ve takip edilebilir eğitim ilerlemesi',
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
    details: {
      description:
        'Ekibinizin e-ihracat konusunda uzmanlaşması için tasarlanmış kapsamlı eğitim programları sunuyoruz. İnteraktif video içerikleri ve uygulamalı eğitimlerle teorik bilgiyi pratiğe dönüştürmenizi sağlıyoruz.',
      features: [
        'HD kalitede uzman eğitim videoları',
        'İnteraktif e-öğrenme modülleri',
        'Sertifikalı eğitim programları',
        'Kişiselleştirilmiş öğrenme rotaları',
        'İlerleme takibi ve değerlendirme testleri',
        'Canlı webinar ve workshop oturumları',
      ],
    },
  },
  {
    id: 'tesvik',
    title: 'Teşvik Entegrasyonu',
    icon: 'ri-government-line',
    shortDesc:
      'Devlet destekleri takibi, teşvik başvuruları ve evrak yönlendirme sistemleri',
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-600',
    details: {
      description:
        'Devlet teşvik ve desteklerinden maksimum fayda sağlamanız için tüm süreçleri yönetiyoruz. Başvuru hazırlığından onay sürecine kadar her adımda yanınızdayız ve otomatik hatırlatıcı sistemlerle hiçbir fırsatı kaçırmamanızı sağlıyoruz.',
      features: [
        'Mevcut teşvik fırsatlarının analizi',
        'Başvuru evraklarının hazırlanması',
        'Süreç takibi ve hatırlatıcı sistemler',
        'Uygunluk değerlendirmesi ve danışmanlık',
        'Belge yönetimi ve arşivleme',
        'Onay süreçlerinin hızlandırılması',
      ],
    },
  },
];
export default function Destekler() {
  const [activeSection, setActiveSection] = useState('stratejik');
  return (
    <div className='min-h-screen bg-white'>
      {/* Modern Navigation */}
      <ModernNavigation />
      {/* Hero Section */}
      <section className='relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 py-24 px-4 overflow-hidden'>
        <div className="absolute inset-0 bg-[url('https://readdy.ai/api/search-image?query=modern%20business%20consulting%20digital%20transformation%20professional%20office%20environment%20with%20clean%20minimalist%20background%20corporate%20strategy%20meeting%20room%20soft%20lighting&width=1200&height=600&seq=support-hero&orientation=landscape')] bg-cover bg-center opacity-10"></div>
        <div className='relative max-w-6xl mx-auto text-center'>
          <div className='inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6'>
            <i className='ri-shield-check-line text-blue-400 text-lg mr-2 w-5 h-5 flex items-center justify-center'></i>
            <span className='text-white font-medium'>
              Güvenilir Destek Sistemi
            </span>
          </div>
          <h1 className='text-5xl md:text-6xl font-black text-white mb-6 leading-tight'>
            Firmalara Sağlanan
            <span className='bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
              {' '}
              Destekler
            </span>
          </h1>
          <p className='text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed'>
            E-ihracat yolculuğunuzda ihtiyaç duyacağınız tüm desteği sistematik
            ve profesyonel şekilde sunuyoruz. Her aşamada uzman ekibimiz
            yanınızda.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap'>
              <i className='ri-play-circle-line mr-2 w-5 h-5 flex items-center justify-center'></i>
              Demo İzle
            </button>
            <button className='bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all duration-300 whitespace-nowrap'>
              Detaylı Bilgi Al
            </button>
          </div>
        </div>
      </section>
      {/* Support Overview */}
      <section className='py-20 px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-black text-gray-900 mb-6'>
              Kapsamlı Destek Sistemi
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Dört ana kategoride organize edilmiş destek sistemimizle
              firmanızın e-ihracat dönüşümünü baştan sona profesyonel şekilde
              yönetiyoruz.
            </p>
          </div>
          {/* Support Cards Grid */}
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
            {supportSections.map(section => (
              <div
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`${section.bgColor} ${section.borderColor} border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  activeSection === section.id
                    ? 'ring-4 ring-blue-200 shadow-xl'
                    : ''
                }`}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${section.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}
                >
                  <i
                    className={`${section.icon} text-white text-2xl w-8 h-8 flex items-center justify-center`}
                  ></i>
                </div>
                <h3
                  className={`text-xl font-bold ${section.textColor} mb-3 text-center`}
                >
                  {section.title}
                </h3>
                <p className='text-gray-600 text-sm text-center leading-relaxed'>
                  {section.shortDesc}
                </p>
                <div className='flex justify-center mt-4'>
                  <div
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${section.color} ${activeSection === section.id ? 'animate-pulse' : ''}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          {/* Active Section Details */}
          <div className='bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden'>
            {supportSections.map(
              section =>
                activeSection === section.id && (
                  <div key={section.id} className='p-8 md:p-12'>
                    <div className='flex items-center mb-8'>
                      <div
                        className={`w-20 h-20 bg-gradient-to-r ${section.color} rounded-2xl flex items-center justify-center mr-6`}
                      >
                        <i
                          className={`${section.icon} text-white text-3xl w-10 h-10 flex items-center justify-center`}
                        ></i>
                      </div>
                      <div>
                        <h3 className='text-3xl font-black text-gray-900 mb-2'>
                          {section.title}
                        </h3>
                        <p className='text-gray-600 font-medium'>
                          {section.shortDesc}
                        </p>
                      </div>
                    </div>
                    <div className='grid lg:grid-cols-2 gap-12'>
                      <div>
                        <h4 className='text-xl font-bold text-gray-900 mb-4'>
                          Detaylı Açıklama
                        </h4>
                        <p className='text-gray-700 leading-relaxed text-lg mb-6'>
                          {section.details.description}
                        </p>
                      </div>
                      <div>
                        <h4 className='text-xl font-bold text-gray-900 mb-4'>
                          Sunduğumuz Hizmetler
                        </h4>
                        <div className='space-y-3'>
                          {section.details.features.map((feature, index) => (
                            <div key={index} className='flex items-start'>
                              <div
                                className={`w-6 h-6 bg-gradient-to-r ${section.color} rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0`}
                              >
                                <i className='ri-check-line text-white text-sm w-4 h-4 flex items-center justify-center'></i>
                              </div>
                              <span className='text-gray-700 leading-relaxed'>
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className='py-16 px-4 bg-gradient-to-r from-slate-50 to-gray-50'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4'>
                <i className='ri-trophy-line text-white text-2xl w-8 h-8 flex items-center justify-center'></i>
              </div>
              <div className='text-3xl font-black text-gray-900 mb-2'>500+</div>
              <div className='text-gray-600 font-medium'>Başarılı Proje</div>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4'>
                <i className='ri-global-line text-white text-2xl w-8 h-8 flex items-center justify-center'></i>
              </div>
              <div className='text-3xl font-black text-gray-900 mb-2'>50+</div>
              <div className='text-gray-600 font-medium'>Ülke Deneyimi</div>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4'>
                <i className='ri-team-line text-white text-2xl w-8 h-8 flex items-center justify-center'></i>
              </div>
              <div className='text-3xl font-black text-gray-900 mb-2'>25+</div>
              <div className='text-gray-600 font-medium'>Uzman Danışman</div>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-700 rounded-xl flex items-center justify-center mx-auto mb-4'>
                <i className='ri-medal-line text-white text-2xl w-8 h-8 flex items-center justify-center'></i>
              </div>
              <div className='text-3xl font-black text-gray-900 mb-2'>%95</div>
              <div className='text-gray-600 font-medium'>Memnuniyet Oranı</div>
            </div>
          </div>
        </div>
      </section>
      {/* How to Apply Section */}
      <section className='py-20 px-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden'>
            <div className="absolute inset-0 bg-[url('https://readdy.ai/api/search-image?query=business%20handshake%20partnership%20professional%20meeting%20corporate%20success%20modern%20office%20clean%20background%20trust%20cooperation&width=800&height=400&seq=apply-bg&orientation=landscape')] bg-cover bg-center opacity-10"></div>
            <div className='relative z-10'>
              <div className='w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6'>
                <i className='ri-question-answer-line text-3xl w-10 h-10 flex items-center justify-center'></i>
              </div>
              <h2 className='text-3xl md:text-4xl font-black mb-6'>
                Bu Desteklere Nasıl Başvurabilirim?
              </h2>
              <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed'>
                Destek sürecimiz çok basit. Size özel değerlendirme yaparak en
                uygun destek paketini belirliyoruz ve hemen başlıyoruz.
              </p>
              <div className='grid md:grid-cols-3 gap-6 mb-8'>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <span className='text-lg font-black'>1</span>
                  </div>
                  <h4 className='font-bold mb-2'>İletişim Kurun</h4>
                  <p className='text-blue-100 text-sm'>
                    Uzman ekibimizle görüşme talep edin
                  </p>
                </div>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <span className='text-lg font-black'>2</span>
                  </div>
                  <h4 className='font-bold mb-2'>Analiz Süreci</h4>
                  <p className='text-blue-100 text-sm'>
                    Firmanızın ihtiyaçlarını değerlendiriyoruz
                  </p>
                </div>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <span className='text-lg font-black'>3</span>
                  </div>
                  <h4 className='font-bold mb-2'>Başlangıç</h4>
                  <p className='text-blue-100 text-sm'>
                    Destek sürecinizi başlatıyoruz
                  </p>
                </div>
              </div>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link
                  href='/iletisim-basvuru'
                  className='bg-white text-blue-800 px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap cursor-pointer'
                >
                  <i className='ri-phone-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                  Hemen Başvur
                </Link>
                <button className='bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 px-8 py-4 rounded-xl font-bold transition-all duration-300 whitespace-nowrap'>
                  <i className='ri-calendar-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                  Randevu Al
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Additional Support Info */}
      <section className='py-16 px-4 bg-gradient-to-r from-gray-50 to-slate-50'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-gray-100'>
              <div className='w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center mb-6'>
                <i className='ri-time-line text-white text-2xl w-7 h-7 flex items-center justify-center'></i>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                7/24 Destek
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                Uzman ekibimiz her zaman yanınızda. Acil durumlar için 7 gün 24
                saat destek hattımız açık.
              </p>
            </div>
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-gray-100'>
              <div className='w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-700 rounded-xl flex items-center justify-center mb-6'>
                <i className='ri-shield-check-line text-white text-2xl w-7 h-7 flex items-center justify-center'></i>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Garanti Sistemi
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                Tüm hizmetlerimiz memnuniyet garantili. Sonuçtan memnun
                kalmazsanız ücret iadesi yapıyoruz.
              </p>
            </div>
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-gray-100'>
              <div className='w-14 h-14 bg-gradient-to-r from-rose-500 to-rose-700 rounded-xl flex items-center justify-center mb-6'>
                <i className='ri-rocket-line text-white text-2xl w-7 h-7 flex items-center justify-center'></i>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Hızlı Başlangıç
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                Başvurunuzdan sonra 48 saat içinde süreçlerinizi başlatıyor,
                hızlı sonuçlar alıyorsunuz.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
