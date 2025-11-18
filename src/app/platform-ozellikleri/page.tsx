/**
 * Platform Özellikleri Sayfası
 * Sprint 22: Public Website
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { ModernNavigation } from '@/1-presentation/components/features/layout/ModernNavigation';
import { ModernFooter } from '@/1-presentation/components/features/layout/ModernFooter';
import {
  ArrowRight,
  Cpu,
  PlayCircle,
  Gift,
  LayoutDashboard,
  GraduationCap,
  Calendar,
  UserSearch,
  Building2,
  MessageSquare,
  FileText,
  Lightbulb,
  Navigation,
  TrendingUp,
  Languages,
  Target,
  BookOpen,
  BarChart3,
  Filter,
  PieChart,
  Cloud,
  ShieldCheck,
  Zap,
  Expand,
  CheckCircle2,
  Map,
  Calendar as CalendarIcon,
  Rocket,
  Lightbulb as LightbulbIcon,
  Info,
  Clock,
} from 'lucide-react';
import { cn } from '@/1-presentation/lib/utils';

const tabData = {
  panel: {
    title: 'Panel Modülleri',
    subtitle: 'Kapsamlı İş Yönetimi',
    icon: LayoutDashboard,
    color: 'blue',
    features: [
      {
        title: 'Proje Yönetimi',
        description:
          'Her proje için özel görev tanımlama, ilerleme takibi ve milestone izleme sistemi. Danışman onayları ile adım adım ilerleyin.',
        icon: Target,
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
        icon: GraduationCap,
        benefits: ['Video eğitimler', 'Interaktif testler', 'İlerleme analizi', 'Sertifikasyon'],
      },
      {
        title: 'Etkinlik Planlama',
        description:
          'Webinar, workshop ve mentorluk seanslarının otomatik planlanması. Katılımcı yönetimi ve canlı etkinlik desteği.',
        icon: Calendar,
        benefits: ['Otomatik planlama', 'Katılımcı takibi', 'Canlı yayın desteği', 'Kayıt sistemi'],
      },
      {
        title: 'Kariyer Havuzu',
        description:
          'Firmalar arası yetenek paylaşımı, iş ilanları ve kariyer gelişim fırsatları. CV havuzu ve eşleştirme algoritmaları.',
        icon: UserSearch,
        benefits: ['Yetenek eşleştirme', 'İş ilanları', 'CV havuzu', 'Kariyer danışmanlığı'],
      },
      {
        title: 'Firma Yönetimi',
        description:
          'Firma profilleri, yetkilendirmeler ve çoklu kullanıcı desteği. Departman bazlı erişim kontrolü ve izin yönetimi.',
        icon: Building2,
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
        icon: MessageSquare,
        benefits: ['Sektörel forumlar', 'Uzman desteği', 'Deneyim paylaşımı', 'Moderasyon sistemi'],
      },
    ],
  },
  ai: {
    title: 'AI Destekleri',
    subtitle: 'Akıllı İş Asistanları',
    icon: Zap,
    color: 'purple',
    features: [
      {
        title: 'İçerik Optimizasyon Asistanı',
        description:
          'Ürün açıklamaları, pazarlama metinleri ve SEO uyumlu içeriklerin otomatik oluşturulması ve optimizasyonu.',
        icon: FileText,
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
        icon: Lightbulb,
        benefits: ['Pazar analizi', 'Rekabet izleme', 'Büyüme önerileri', 'Trend analizi'],
      },
      {
        title: 'Otomatik Yönlendirme',
        description:
          'Kullanıcı davranışlarına göre akıllı yönlendirmeler, görev önceliklendirme ve kişisel asistan desteği.',
        icon: Navigation,
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
        icon: FileText,
        benefits: ['Doküman özetleme', 'Hızlı analiz', 'Anahtar bilgiler', 'Karar desteği'],
      },
      {
        title: 'Tahminleme Motoru',
        description:
          'Satış tahminleri, pazar trendleri ve risk analizleri. Gelecek planlaması için veri destekli öngörüler.',
        icon: TrendingUp,
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
        icon: Languages,
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
    icon: BarChart3,
    color: 'green',
    features: [
      {
        title: 'Firma İlerleme Yüzdeleri',
        description:
          'Her proje adımının detaylı takibi, tamamlanma oranları ve başarı metrikleri. Görsel dashboard ile anlık durum.',
        icon: Target,
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
        icon: Map,
        benefits: ['Milestone takibi', 'Gecikme analizi', 'Kritik yol', 'Proaktif uyarılar'],
      },
      {
        title: 'Eğitim Tamamlama Oranları',
        description:
          'Modül bazlı öğrenme analizi, test sonuçları ve yetkinlik haritaları. Kişiselleştirilmiş öğrenme önerileri.',
        icon: BookOpen,
        benefits: ['Modül analizi', 'Test sonuçları', 'Yetkinlik haritası', 'Öğrenme önerileri'],
      },
      {
        title: 'Kullanıcı Aktivite Analizi',
        description:
          'Platform kullanım detayları, aktiflik seviyeleri ve etkileşim metrikleri. Kullanıcı deneyimi optimizasyonu.',
        icon: BarChart3,
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
        icon: Filter,
        benefits: ['Çoklu filtreleme', 'Özel sorgular', 'Veri segmentasyonu', 'Esnek raporlar'],
      },
      {
        title: 'Grafiksel Analiz',
        description:
          'Interaktif grafikler, trend analizleri ve karşılaştırmalı görselleştirmeler. Export ve paylaşım özellikleri.',
        icon: PieChart,
        benefits: ['Interaktif grafikler', 'Trend analizi', 'Karşılaştırma', 'Export özelliği'],
      },
    ],
  },
};

export default function PlatformOzellikleri() {
  const [activeTab, setActiveTab] = useState<keyof typeof tabData>('panel');
  const currentTab = tabData[activeTab];
  const TabIcon = currentTab.icon;

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <ModernNavigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-6">
              <Cpu className="text-blue-600 mr-2 w-5 h-5" />
              <span className="text-blue-800 font-semibold text-sm tracking-wide">
                PLATFORM ÖZELLİKLERİ
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Gelişmiş
              </span>{' '}
              Platform
              <br />
              <span className="text-gray-900">Altyapısı</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Akademi Port&apos;un güçlü teknoloji altyapısı, yapay zeka destekli araçları ve
              kapsamlı yönetim modülleriyle işinizi bir üst seviyeye taşıyın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/platform-ozellikleri">
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Demo İzle
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white border-2 border-gray-300 hover:border-blue-500"
              >
                <Link href="/iletisim-basvuru">
                  <Gift className="mr-2 w-5 h-5" />
                  Ücretsiz Deneme
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Tabs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex flex-col lg:flex-row gap-2 bg-gray-100 rounded-2xl p-2 mb-12 max-w-4xl mx-auto">
            {(Object.keys(tabData) as Array<keyof typeof tabData>).map((key) => {
              const tab = tabData[key];
              const Icon = tab.icon;
              const isActive = activeTab === key;
              const colorClasses = {
                blue: isActive
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50',
                purple: isActive
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50',
                green: isActive
                  ? 'bg-white text-green-600 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50',
              };
              const iconColorClasses = {
                blue: isActive ? 'text-blue-600' : '',
                purple: isActive ? 'text-purple-600' : '',
                green: isActive ? 'text-green-600' : '',
              };
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap',
                    colorClasses[tab.color as keyof typeof colorClasses]
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 w-5 h-5',
                      iconColorClasses[tab.color as keyof typeof iconColorClasses]
                    )}
                  />
                  {tab.title}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="transition-all duration-500 ease-in-out">
            {/* Header */}
            <div className="text-center mb-12">
              {(() => {
                const headerColorClasses = {
                  blue: 'bg-blue-100 text-blue-800',
                  purple: 'bg-purple-100 text-purple-800',
                  green: 'bg-green-100 text-green-800',
                };
                const iconColorClasses = {
                  blue: 'text-blue-600',
                  purple: 'text-purple-600',
                  green: 'text-green-600',
                };
                const dividerColorClasses = {
                  blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
                  purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
                  green: 'bg-gradient-to-r from-green-500 to-green-600',
                };
                return (
                  <>
                    <div
                      className={cn(
                        'inline-flex items-center rounded-full px-6 py-2 mb-4',
                        headerColorClasses[currentTab.color as keyof typeof headerColorClasses]
                      )}
                    >
                      <TabIcon
                        className={cn(
                          'mr-2 w-5 h-5',
                          iconColorClasses[currentTab.color as keyof typeof iconColorClasses]
                        )}
                      />
                      <span className="font-semibold text-sm tracking-wide">
                        {currentTab.title.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                      {currentTab.subtitle}
                    </h2>
                    <div
                      className={cn(
                        'w-24 h-1 mx-auto',
                        dividerColorClasses[currentTab.color as keyof typeof dividerColorClasses]
                      )}
                    ></div>
                  </>
                );
              })()}
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {currentTab.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                const borderColorClasses = {
                  blue: 'border-blue-100',
                  purple: 'border-purple-100',
                  green: 'border-green-100',
                };
                const iconGradientClasses = {
                  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
                  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
                  green: 'bg-gradient-to-br from-green-500 to-green-600',
                };
                const textColorClasses = {
                  blue: 'text-blue-700',
                  purple: 'text-purple-700',
                  green: 'text-green-700',
                };
                const checkColorClasses = {
                  blue: 'text-blue-600',
                  purple: 'text-purple-600',
                  green: 'text-green-600',
                };
                const linkColorClasses = {
                  blue: 'text-blue-600 hover:text-blue-700',
                  purple: 'text-purple-600 hover:text-purple-700',
                  green: 'text-green-600 hover:text-green-700',
                };
                return (
                  <div
                    key={index}
                    className={cn(
                      'group bg-white rounded-2xl p-8 border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2',
                      borderColorClasses[currentTab.color as keyof typeof borderColorClasses]
                    )}
                  >
                    <div className="mb-6">
                      <div
                        className={cn(
                          'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300',
                          iconGradientClasses[currentTab.color as keyof typeof iconGradientClasses]
                        )}
                      >
                        <FeatureIcon className="text-2xl text-white w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                    </div>
                    <div className="space-y-3">
                      <div
                        className={cn(
                          'font-semibold text-sm mb-3',
                          textColorClasses[currentTab.color as keyof typeof textColorClasses]
                        )}
                      >
                        Temel Özellikler:
                      </div>
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center text-sm text-gray-700">
                          <CheckCircle2
                            className={cn(
                              'mr-3 w-4 h-4',
                              checkColorClasses[currentTab.color as keyof typeof checkColorClasses]
                            )}
                          />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <Link
                        href={`/platform-ozellikleri#${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                        className={cn(
                          'inline-flex items-center font-semibold text-sm transition-colors duration-200',
                          linkColorClasses[currentTab.color as keyof typeof linkColorClasses]
                        )}
                      >
                        Bu modülü keşfet
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full px-6 py-2 mb-6">
              <Cpu className="text-indigo-600 mr-2 w-5 h-5" />
              <span className="text-indigo-800 font-semibold text-sm tracking-wide">
                TEKNOLOJİ ALTYAPISI
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Güvenilir
              </span>{' '}
              ve
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {' '}
                Ölçeklenebilir
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En güncel teknolojilerle inşa edilmiş, güvenli ve performanslı platform altyapımız.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Bulut Altyapı */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Cloud className="text-2xl text-white w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Bulut Altyapı</h3>
              <p className="text-gray-600 text-sm">%99.9 uptime garantisi ile kesintisiz hizmet</p>
            </div>
            {/* Güvenlik */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-2xl text-white w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Güvenlik</h3>
              <p className="text-gray-600 text-sm">ISO 27001 sertifikalı güvenlik protokolleri</p>
            </div>
            {/* Performans */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-2xl text-white w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Performans</h3>
              <p className="text-gray-600 text-sm">Milisaniye hızında yanıt süreleri</p>
            </div>
            {/* Ölçeklenebilirlik */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Expand className="text-2xl text-white w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Ölçeklenebilirlik</h3>
              <p className="text-gray-600 text-sm">Büyüyen ihtiyaçlarınıza uyum sağlar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Platform Performansı</h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Güçlü altyapımız sayesinde elde ettiğimiz etkileyici performans metrikleri.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-yellow-300">10,000+</div>
                <div className="text-blue-100">Günlük İşlem</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-green-300">99.9%</div>
                <div className="text-blue-100">Sistem Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-orange-300">&lt;100ms</div>
                <div className="text-blue-100">Yanıt Süresi</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-pink-300">50+</div>
                <div className="text-blue-100">Entegrasyon</div>
              </div>
            </div>
            <div className="mt-12 text-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                <Link href="/platform-ozellikleri">
                  <Info className="mr-2 w-5 h-5" />
                  Teknik Detayları İncele
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Future Roadmap */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-2 mb-6">
              <Map className="text-purple-600 mr-2 w-5 h-5" />
              <span className="text-purple-800 font-semibold text-sm tracking-wide">
                GELECEK VİZYONU
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Platform
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {' '}
                Yol Haritası
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sürekli gelişen platformumuzun gelecek özelliklerini ve yeniliklerini keşfedin.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Q1 2024 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <CalendarIcon className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Q1 2025</h3>
                  <p className="text-purple-600 text-sm">Yeni Özellikler</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle2 className="text-green-500 mr-3 mt-1 w-4 h-4" />
                  <span className="text-gray-700">Gelişmiş AI Chatbot</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="text-green-500 mr-3 mt-1 w-4 h-4" />
                  <span className="text-gray-700">Mobil Uygulama v2.0</span>
                </div>
                <div className="flex items-start">
                  <Clock className="text-purple-500 mr-3 mt-1 w-4 h-4" />
                  <span className="text-gray-700">Blockchain Entegrasyonu</span>
                </div>
              </div>
            </div>
            {/* Q2-Q3 2024 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <Rocket className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Q2-Q3 2025</h3>
                  <p className="text-blue-600 text-sm">Gelişim Aşaması</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Clock className="text-blue-500 mr-3 mt-1 w-4 h-4" />
                  <span className="text-gray-700">IoT Sensör Entegrasyonu</span>
                </div>
                <div className="flex items-start">
                  <Clock className="text-blue-500 mr-3 mt-1 w-4 h-4" />
                  <span className="text-gray-700">Gelişmiş Analitik Dashboard</span>
                </div>
                <div className="flex items-start">
                  <Clock className="text-blue-500 mr-3 mt-1 w-4 h-4" />
                  <span className="text-gray-700">AR/VR Eğitim Modülleri</span>
                </div>
              </div>
            </div>
            {/* Q4 2024+ */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                  <LightbulbIcon className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Q4 2025+</h3>
                  <p className="text-indigo-600 text-sm">Vizyon Projeler</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Clock className="text-indigo-500 mr-3 mt-1 w-4 h-4" />
                  <span className="text-gray-700">Metaverse İş Alanları</span>
                </div>
                <div className="flex items-start">
                  <Clock className="text-indigo-500 mr-3 mt-1 w-4 h-4" />
                  <span className="text-gray-700">Kuantum Güvenlik Protokolleri</span>
                </div>
                <div className="flex items-start">
                  <Clock className="text-indigo-500 mr-3 mt-1 w-4 h-4" />
                  <span className="text-gray-700">Global AI Network</span>
                </div>
              </div>
            </div>
          </div>
          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Geleceği Şekillendirin</h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Platform geliştirme sürecine katılın ve önerilerinizle geleceği birlikte
                şekillendirelim.
              </p>
              <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-50">
                <Link href="/iletisim-basvuru">
                  <LightbulbIcon className="mr-2 w-5 h-5" />
                  Öneri Gönder
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
