/**
 * Destekler Sayfası
 * Sprint 22: Public Website
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { ModernNavigation } from '@/1-presentation/components/features/layout/ModernNavigation';
import { ModernFooter } from '@/1-presentation/components/features/layout/ModernFooter';
import {
  ShieldCheck,
  Compass,
  Settings,
  GraduationCap,
  Building2,
  CheckCircle2,
  Trophy,
  Globe,
  Users,
  Award,
  PlayCircle,
  FileText,
  Calendar,
  Rocket,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/1-presentation/lib/utils';

const supportSections = [
  {
    id: 'stratejik',
    title: 'Stratejik Danışmanlık',
    icon: Compass,
    shortDesc: 'Firma analizi, ürün konumlandırma ve hedef pazar stratejileri',
    color: 'blue',
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
    icon: Settings,
    shortDesc: 'Pazaryeri hesap kurulumları, içerik optimizasyonu ve sistem entegrasyonları',
    color: 'purple',
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
    icon: GraduationCap,
    shortDesc: 'Video eğitim setleri, interaktif içerikler ve takip edilebilir eğitim ilerlemesi',
    color: 'green',
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
    icon: Building2,
    shortDesc: 'Devlet destekleri takibi, teşvik başvuruları ve evrak yönlendirme sistemleri',
    color: 'orange',
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

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    icon: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-700',
    button: 'bg-purple-600 hover:bg-purple-700',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
    gradient: 'from-green-500 to-green-700',
    button: 'bg-green-600 hover:bg-green-700',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    icon: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-700',
    button: 'bg-orange-600 hover:bg-orange-700',
  },
};

export default function Destekler() {
  const [activeSection, setActiveSection] = useState('stratejik');

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <ModernNavigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <ShieldCheck className="text-blue-400 text-lg mr-2 w-5 h-5" />
            <span className="text-white font-medium">Güvenilir Destek Sistemi</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Firmalara Sağlanan
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {' '}
              Destekler
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            E-ihracat yolculuğunuzda ihtiyaç duyacağınız tüm desteği sistematik ve profesyonel
            şekilde sunuyoruz. Her aşamada uzman ekibimiz yanınızda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <PlayCircle className="mr-2 w-5 h-5" />
              Demo İzle
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              Detaylı Bilgi Al
            </Button>
          </div>
        </div>
      </section>

      {/* Support Overview */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-6">Kapsamlı Destek Sistemi</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dört ana kategoride organize edilmiş destek sistemimizle firmanızın e-ihracat
              dönüşümünü baştan sona profesyonel şekilde yönetiyoruz.
            </p>
          </div>

          {/* Support Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {supportSections.map((section) => {
              const Icon = section.icon;
              const colors = colorClasses[section.color as keyof typeof colorClasses];
              return (
                <div
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    colors.bg,
                    colors.border,
                    'border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
                    activeSection === section.id && 'ring-4 ring-blue-200 shadow-xl'
                  )}
                >
                  <div
                    className={cn(
                      'w-16 h-16 bg-gradient-to-r',
                      colors.gradient,
                      'rounded-xl flex items-center justify-center mb-4 mx-auto'
                    )}
                  >
                    <Icon className="text-white w-8 h-8" />
                  </div>
                  <h3 className={cn('text-xl font-bold', colors.text, 'mb-3 text-center')}>
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm text-center leading-relaxed">
                    {section.shortDesc}
                  </p>
                  <div className="flex justify-center mt-4">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full bg-gradient-to-r',
                        colors.gradient,
                        activeSection === section.id && 'animate-pulse'
                      )}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Section Details */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {supportSections.map(
              (section) =>
                activeSection === section.id && (
                  <div key={section.id} className="p-8 md:p-12">
                    <div className="flex items-center mb-8">
                      <div
                        className={cn(
                          'w-20 h-20 bg-gradient-to-r',
                          colorClasses[section.color as keyof typeof colorClasses].gradient,
                          'rounded-2xl flex items-center justify-center mr-6'
                        )}
                      >
                        <section.icon className="text-white w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-gray-900 mb-2">{section.title}</h3>
                        <p className="text-gray-600 font-medium">{section.shortDesc}</p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-12">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4">Detaylı Açıklama</h4>
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">
                          {section.details.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4">
                          Sunduğumuz Hizmetler
                        </h4>
                        <div className="space-y-3">
                          {section.details.features.map((feature, index) => {
                            const colors = colorClasses[section.color as keyof typeof colorClasses];
                            return (
                              <div key={index} className="flex items-start">
                                <div
                                  className={cn(
                                    'w-6 h-6 bg-gradient-to-r',
                                    colors.gradient,
                                    'rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0'
                                  )}
                                >
                                  <CheckCircle2 className="text-white w-4 h-4" />
                                </div>
                                <span className="text-gray-700 leading-relaxed">{feature}</span>
                              </div>
                            );
                          })}
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
      <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white w-8 h-8" />
              </div>
              <div className="text-3xl font-black text-gray-900 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Başarılı Proje</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="text-white w-8 h-8" />
              </div>
              <div className="text-3xl font-black text-gray-900 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Ülke Deneyimi</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-white w-8 h-8" />
              </div>
              <div className="text-3xl font-black text-gray-900 mb-2">25+</div>
              <div className="text-gray-600 font-medium">Uzman Danışman</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="text-white w-8 h-8" />
              </div>
              <div className="text-3xl font-black text-gray-900 mb-2">%95</div>
              <div className="text-gray-600 font-medium">Memnuniyet Oranı</div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="text-white w-10 h-10" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                Bu Desteklere Nasıl Başvurabilirim?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Destek sürecimiz çok basit. Size özel değerlendirme yaparak en uygun destek paketini
                belirliyoruz ve hemen başlıyoruz.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">1. Başvuru Yapın</h3>
                  <p className="text-white/80 text-sm">
                    Online formu doldurarak başvuru sürecini başlatın
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">2. Değerlendirme</h3>
                  <p className="text-white/80 text-sm">
                    Uzmanlarımızla ücretsiz ön görüşme gerçekleştirin
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Rocket className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">3. Başlayın</h3>
                  <p className="text-white/80 text-sm">
                    Size özel destek paketi ile hemen başlayın
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                  <Link href="/iletisim-basvuru">
                    <FileText className="mr-3 w-6 h-6" />
                    Başvuru Yap
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Link href="/program-hakkinda">
                    <ArrowRight className="mr-3 w-6 h-6" />
                    Programı İncele
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
