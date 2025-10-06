'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import ModernFooter from '@/components/layout/ModernFooter';
import ModernNavigation from '@/components/layout/ModernNavigation';
interface SuccessStory {
  id: number;
  company: string;
  sector: string;
  city: string;
  logo: string;
  summary: string;
  beforeState: string;
  transformation: string;
  results: string;
  consultantNote: string;
  testimonial: string;
  managerName: string;
  managerTitle: string;
  growth: string;
  tags: string[];
}
const successStories: SuccessStory[] = [
  {
    id: 1,
    company: 'Demir Tekstil A.Ş.',
    sector: 'Tekstil ve Konfeksiyon',
    city: 'Bursa',
    logo: 'https://readdy.ai/api/search-image?query=Modern%20textile%20company%20logo%20with%20geometric%20patterns%2C%20professional%20business%20logo%20design%20in%20blue%20colors%2C%20representing%20Turkish%20textile%20industry.%20Clean%20minimalist%20logo%20style&width=80&height=80&seq=textile-logo-001&orientation=squarish',
    summary:
      "Yerel üretimden küresel e-ticaret devi Amazon ve Alibaba'ya uzanan başarı hikayesi",
    beforeState:
      'Sadece yerel pazarlarda faaliyet gösteren orta ölçekli tekstil firması. E-ihracat deneyimi sıfır, dijital varlığı minimal.',
    transformation:
      '12 aylık danışmanlık sürecinde Alibaba Verified hesabı kurulumu, Amazon seller merkezi optimizasyonu, ürün katalog dijitalleştirilmesi ve uluslararası pazarlama stratejisi geliştirildi.',
    results:
      "İlk 6 ayda 25 ülkeye sipariş, %400 ciro artışı, 150+ yeni müşteri kazanımı, Alibaba'da Gold Supplier statüsü",
    consultantNote:
      "Demir Tekstil'in dönüşümü, geleneksel üretim anlayışından dijital ticaret zihniyetine geçişin mükemmel bir örneğidir.",
    testimonial:
      "Hiç hayal etmediğimiz boyutlarda siparişler almaya başladık. Alibaba ve Amazon'daki varlığımız artık şirketimizin omurgası haline geldi.",
    managerName: 'Ayşe Demir',
    managerTitle: 'Genel Müdür',
    growth: '+400%',
    tags: ['E-Ticaret', 'Alibaba', 'Amazon', 'Tekstil'],
  },
  {
    id: 2,
    company: 'Kaya Gıda San. Tic. Ltd.',
    sector: 'Gıda ve İçecek',
    city: 'İzmir',
    logo: 'https://readdy.ai/api/search-image?query=Professional%20food%20industry%20company%20logo%2C%20modern%20agricultural%20and%20food%20processing%20business%20emblem%20in%20green%20colors%2C%20representing%20Turkish%20food%20export%20company.%20Corporate%20logo%20design&width=80&height=80&seq=food-logo-002&orientation=squarish',
    summary:
      'SWOT analizi ile hedef pazar stratejisi değiştiren gıda firmasının Avrupa açılımı',
    beforeState:
      'Yerel gıda üreticisi olarak 15 yıldır faaliyet gösteriyordu. İhracat tecrübesi olmayan firma, yanlış hedef pazarlara odaklanıyordu.',
    transformation:
      'Detaylı SWOT analizi sonrası hedef pazar yeniden belirlendi. Organik ürünler için AB sertifikasyonu alındı, dijital katalog oluşturuldu ve B2B pazaryerlerinde aktif hale gelindi.',
    results:
      '8 AB ülkesine düzenli ihracat, %250 ROI, organik ürün segmentinde lider konuma gelme, 50+ distribütör anlaşması',
    consultantNote:
      'Doğru pazar analizi ve stratejik yönlendirme ile nasıl hızlı büyüme yakalanabileceğinin güzel bir örneği.',
    testimonial:
      'SWOT raporumuz gerçekten gözlerimizi açtı. Artık doğru müşterilere, doğru ürünlerle ulaşıyoruz. Bu kadar hızlı büyümeyi beklemiyorduk.',
    managerName: 'Mehmet Kaya',
    managerTitle: 'Kurucu Ortak',
    growth: '+250%',
    tags: ['SWOT', 'Gıda', 'AB', 'Organik'],
  },
  {
    id: 3,
    company: 'TechFlow Yazılım',
    sector: 'Teknoloji ve Yazılım',
    city: 'İstanbul',
    logo: 'https://readdy.ai/api/search-image?query=Modern%20technology%20software%20company%20logo%2C%20clean%20minimalist%20tech%20business%20emblem%20with%20circuit%20patterns%20in%20blue%20and%20green%20colors%2C%20representing%20Turkish%20software%20export%20company.%20High-tech%20logo%20design&width=80&height=80&seq=tech-logo-003&orientation=squarish',
    summary:
      'AI destekli içerik üretimi ile 10 kat hızlanan dijital pazarlama süreçleri',
    beforeState:
      'Yazılım geliştirme şirketi olarak güçlü teknik altyapıya sahipti ancak pazarlama içerikleri ve satış süreçlerinde zorluk yaşıyordu.',
    transformation:
      "AI destekli içerik üretim sistemleri entegre edildi, otomatik pazarlama funnel'ları oluşturuldu ve uluslararası müşteri edinim stratejileri geliştirildi.",
    results:
      'İçerik üretim hızında 10 kat artış, 15 ülkeye yazılım ihracatı, SaaS modeli ile recurring revenue oluşturma',
    consultantNote:
      'Teknoloji şirketlerinin en büyük sorunu teknik yetkinliği pazarlama başarısına çevirememe. TechFlow bu dönüşümü başarıyla gerçekleştirdi.',
    testimonial:
      'AI asistanlarla içerik üretimimiz çok hızlandı. Artık teknik yeteneklerimizi dünya pazarlarında etkili şekilde sunabiliyoruz.',
    managerName: 'Zeynep Özkan',
    managerTitle: 'CEO & Kurucu',
    growth: '10x',
    tags: ['AI', 'Yazılım', 'SaaS', 'Teknoloji'],
  },
  {
    id: 4,
    company: 'Anadolu Mobilya',
    sector: 'Mobilya ve Dekorasyon',
    city: 'Kayseri',
    logo: 'https://readdy.ai/api/search-image?query=Traditional%20Turkish%20furniture%20company%20logo%2C%20handcrafted%20wooden%20furniture%20business%20emblem%20in%20brown%20and%20gold%20colors%2C%20representing%20artisan%20furniture%20export%20company.%20Classic%20elegant%20logo%20design&width=80&height=80&seq=furniture-logo-004&orientation=squarish',
    summary: 'Geleneksel mobilyacılıktan modern e-ihracat platformlarına geçiş',
    beforeState:
      '60 yıllık aile işletmesi, geleneksel üretim ve satış yöntemleri kullanıyor, dijital pazarlama deneyimi yoktu.',
    transformation:
      'Ürün fotoğrafları profesyonelce çekildi, 360° görüntüleme teknolojisi eklendi, B2B platformlarda mağaza açıldı ve uluslararası fuarlara dijital katılım sağlandı.',
    results:
      '12 ülkeye konteyner ihracatı, %180 ciro artışı, premium müşteri segmentine ulaşım, dijital showroom oluşturma',
    consultantNote:
      'Geleneksel sektörlerin dijital dönüşüm potansiyeli Anadolu Mobilya örneğinde net şekilde görülmektedir.',
    testimonial:
      'Babamdan devraldığım bu işletmeyi artık torunlarımız da gururla sürdürebilir. Dünya pazarlarındaki yerimizi aldık.',
    managerName: 'Hasan Demir',
    managerTitle: 'Yönetim Kurulu Başkanı',
    growth: '+180%',
    tags: ['Mobilya', 'Geleneksel', 'B2B', 'Aile Şirketi'],
  },
  {
    id: 5,
    company: 'BioNatura Kozmetik',
    sector: 'Kozmetik ve Kişisel Bakım',
    city: 'Antalya',
    logo: 'https://readdy.ai/api/search-image?query=Natural%20cosmetics%20company%20logo%2C%20organic%20beauty%20products%20business%20emblem%20with%20leaf%20patterns%20in%20green%20and%20pink%20colors%2C%20representing%20Turkish%20cosmetic%20export%20company.%20Eco-friendly%20logo%20design&width=80&height=80&seq=cosmetic-logo-005&orientation=squarish',
    summary:
      'Doğal kozmetik markasının Avrupa ve Amerika pazarlarındaki hızlı yükselişi',
    beforeState:
      'Küçük ölçekli doğal kozmetik üreticisi, sadece yerel satış noktalarında ürünler bulunuyordu.',
    transformation:
      'Organik sertifikasyon süreçleri tamamlandı, influencer pazarlama stratejileri geliştirildi, Amazon ve Etsy mağazaları açıldı, sosyal medya pazarlama optimize edildi.',
    results:
      'ABD ve AB pazarlarına giriş, %320 online satış artışı, 5 dilde ürün katalogları, 100+ influencer ortaklığı',
    consultantNote:
      "Doğal kozmetik sektöründeki global trend'i doğru okuyarak pazarlama stratejisini buna göre şekillendirdi.",
    testimonial:
      "Doğal ürünlerimiz artık dünya çapında tanınıyor. Amerika'dan gelen siparişler bile var. Bu başarıyı hayal bile edemezdik.",
    managerName: 'Elif Yılmaz',
    managerTitle: 'Kurucu ve Ürün Geliştirme Müdürü',
    growth: '+320%',
    tags: ['Kozmetik', 'Doğal', 'ABD', 'Influencer'],
  },
  {
    id: 6,
    company: 'Karadeniz Çay & Baharat',
    sector: 'Tarım ve Gıda',
    city: 'Rize',
    logo: 'https://readdy.ai/api/search-image?query=Traditional%20tea%20and%20spice%20company%20logo%2C%20Turkish%20agricultural%20products%20business%20emblem%20with%20tea%20leaf%20and%20spice%20patterns%20in%20dark%20green%20and%20gold%20colors%2C%20representing%20regional%20export%20company.%20Heritage%20logo%20design&width=80&height=80&seq=tea-logo-006&orientation=squarish',
    summary: 'Bölgesel çay üreticisinden küresel premium marka dönüşümü',
    beforeState:
      'Sadece Türkiye pazarında faaliyet gösteren geleneksel çay ve baharat üreticisiydi, marka değeri düşüktü.',
    transformation:
      'Premium ambalajlama ile marka yenilendi, storytelling odaklı pazarlama stratejisi geliştirildi, specialty coffee shop zincirleriyle B2B anlaşmalar yapıldı.',
    results:
      '20+ ülkeye ihracat, premium segment lideri, %200 kar marjı artışı, uluslararası çay yarışmalarında ödüller',
    consultantNote:
      'Yerel ürünlerin premium konumlandırma ile nasıl küresel marka haline gelebileceğinin örneği.',
    testimonial:
      "Çayımız artık Avrupa'nın en seçkin kafelerinde servis ediliyor. Rize çayına verdiğimiz değer nihayet takdir görüyor.",
    managerName: 'Ahmet Koç',
    managerTitle: 'İhracat Müdürü',
    growth: '+200%',
    tags: ['Çay', 'Premium', 'Marka', 'B2B'],
  },
];
export default function BasariHikayeleri() {
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Tümü');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const sectors = [
    'Tümü',
    'Tekstil ve Konfeksiyon',
    'Gıda ve İçecek',
    'Teknoloji ve Yazılım',
    'Mobilya ve Dekorasyon',
    'Kozmetik ve Kişisel Bakım',
    'Tarım ve Gıda',
  ];
  const filteredStories = successStories.filter(story => {
    const matchesFilter =
      activeFilter === 'Tümü' || story.sector === activeFilter;
    const matchesSearch =
      story.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.sector.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  return (
    <div className='min-h-screen bg-white'>
      {/* Modern Navigation */}
      <ModernNavigation />
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 py-20 overflow-hidden'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5'
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Success%20celebration%20background%20with%20upward%20arrows%2C%20business%20growth%20charts%2C%20trophy%20elements%2C%20and%20achievement%20symbols.%20Professional%20corporate%20success%20visualization%20with%20blue%2C%20purple%20and%20green%20gradient%20colors.%20Motivational%20business%20success%20imagery&width=1920&height=800&seq=success-hero-bg-001&orientation=landscape')`,
          }}
        ></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-8 py-3 mb-8'>
            <i className='ri-trophy-fill text-green-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
            <span className='text-green-800 font-bold text-lg tracking-wide'>
              BAŞARI HİKAYELERİ
            </span>
          </div>
          <h1 className='text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight'>
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-600'>
              Onlar Başardı.
            </span>
            <br />
            <span className='text-gray-900'>Sırada Siz Varsınız.</span>
          </h1>
          <p className='text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed'>
            Bu platformla e-ihracat yolculuğuna çıkan firmaların gerçek
            deneyimlerini ve başarı hikayelerini keşfedin. Her biri ilham
            verici, her biri gerçek.
          </p>
          <div className='flex flex-col sm:flex-row gap-6 justify-center mb-16'>
            <Link
              href='#hikayeler'
              className='inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-1'
            >
              <i className='ri-arrow-down-line mr-3 w-6 h-6 flex items-center justify-center'></i>
              Hikayeleri Keşfet
            </Link>
            <Link
              href='/basvuru'
              className='inline-flex items-center bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:-translate-y-1'
            >
              <i className='ri-rocket-line mr-3 w-6 h-6 flex items-center justify-center'></i>
              Siz de Başlayın
            </Link>
          </div>
          {/* Stats */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='text-4xl lg:text-5xl font-bold text-blue-600 mb-2'>
                1000+
              </div>
              <div className='text-gray-600 font-medium'>Başarılı Firma</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl lg:text-5xl font-bold text-purple-600 mb-2'>
                %300
              </div>
              <div className='text-gray-600 font-medium'>Ortalama Büyüme</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl lg:text-5xl font-bold text-green-600 mb-2'>
                75+
              </div>
              <div className='text-gray-600 font-medium'>Hedef Ülke</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl lg:text-5xl font-bold text-orange-600 mb-2'>
                ₺2.5B
              </div>
              <div className='text-gray-600 font-medium'>Toplam İhracat</div>
            </div>
          </div>
        </div>
      </section>
      {/* Filter and Search Section */}
      <section
        id='hikayeler'
        className='py-12 bg-white border-b border-gray-100'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col lg:flex-row gap-6 items-center justify-between'>
            {/* Search */}
            <div className='relative flex-1 max-w-md'>
              <i className='ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 flex items-center justify-center'></i>
              <input
                type='text'
                placeholder='Firma, şehir veya sektör ara...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm'
              />
            </div>
            {/* Filters */}
            <div className='flex flex-wrap gap-2'>
              {sectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => setActiveFilter(sector)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    activeFilter === sector
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Stories Grid */}
      <section className='py-20 bg-gradient-to-br from-gray-50 to-blue-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 xl:grid-cols-3 gap-8'>
            {filteredStories.map(story => (
              <div
                key={story.id}
                className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer'
                onClick={() => setSelectedStory(story)}
              >
                {/* Card Header */}
                <div className='p-6 pb-0'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center space-x-4'>
                      <Image
                        src={story.logo}
                        alt={`${story.company} Logo`}
                        width={64}
                        height={64}
                        className='w-16 h-16 rounded-xl object-cover border-2 border-gray-100'
                      />
                      <div>
                        <h3 className='text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200'>
                          {story.company}
                        </h3>
                        <p className='text-gray-600 text-sm'>{story.sector}</p>
                        <div className='flex items-center mt-1'>
                          <i className='ri-map-pin-line text-gray-400 mr-1 w-4 h-4 flex items-center justify-center'></i>
                          <span className='text-gray-500 text-sm'>
                            {story.city}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='bg-green-100 rounded-full px-3 py-1'>
                      <span className='text-green-700 font-bold text-sm'>
                        {story.growth}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Card Body */}
                <div className='px-6 pb-6'>
                  <p className='text-gray-700 mb-6 leading-relaxed'>
                    {story.summary}
                  </p>
                  {/* Tags */}
                  <div className='flex flex-wrap gap-2 mb-6'>
                    {story.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Action Button */}
                  <button className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 group-hover:shadow-lg'>
                    Detayları Gör
                    <i className='ri-arrow-right-line ml-2 w-4 h-4 inline-flex items-center justify-center'></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* No Results */}
          {filteredStories.length === 0 && (
            <div className='text-center py-16'>
              <i className='ri-search-line text-6xl text-gray-300 mb-4 w-24 h-24 flex items-center justify-center mx-auto'></i>
              <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                Sonuç Bulunamadı
              </h3>
              <p className='text-gray-600 mb-6'>
                Arama kriterlerinize uygun başarı hikayesi bulunmuyor.
              </p>
              <button
                onClick={() => {
                  setActiveFilter('Tümü');
                  setSearchTerm('');
                }}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap'
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </section>
      {/* Detail Modal */}
      {selectedStory && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            {/* Modal Header */}
            <div className='sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-2xl z-10'>
              <div className='flex items-center space-x-4'>
                <Image
                  src={selectedStory.logo}
                  alt={`${selectedStory.company} Logo`}
                  width={48}
                  height={48}
                  className='w-12 h-12 rounded-lg object-cover'
                />
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    {selectedStory.company}
                  </h2>
                  <p className='text-gray-600'>
                    {selectedStory.sector} • {selectedStory.city}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className='w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer'
              >
                <i className='ri-close-line text-gray-600 text-xl w-6 h-6 flex items-center justify-center'></i>
              </button>
            </div>
            {/* Modal Content */}
            <div className='p-6 space-y-8'>
              {/* Firma Hakkında */}
              <div>
                <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                  <i className='ri-building-line text-blue-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
                  Firma Hakkında
                </h3>
                <p className='text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-6'>
                  {selectedStory.summary}
                </p>
              </div>
              {/* Önceki Durum */}
              <div>
                <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                  <i className='ri-time-line text-orange-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
                  Katılımdan Önceki Durum
                </h3>
                <p className='text-gray-700 leading-relaxed bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500'>
                  {selectedStory.beforeState}
                </p>
              </div>
              {/* Dönüşüm Süreci */}
              <div>
                <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                  <i className='ri-rocket-line text-purple-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
                  Platformla Kat Edilen Yol
                </h3>
                <p className='text-gray-700 leading-relaxed bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500'>
                  {selectedStory.transformation}
                </p>
              </div>
              {/* Sonuçlar */}
              <div>
                <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                  <i className='ri-trophy-line text-green-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
                  Elde Edilen Somut Sonuçlar
                </h3>
                <div className='bg-green-50 rounded-xl p-6 border-l-4 border-green-500'>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    {selectedStory.results}
                  </p>
                  <div className='bg-green-100 rounded-lg p-4 text-center'>
                    <span className='text-3xl font-bold text-green-700'>
                      {selectedStory.growth}
                    </span>
                    <p className='text-green-600 font-medium'>Büyüme Oranı</p>
                  </div>
                </div>
              </div>
              {/* Danışman Görüşü */}
              <div>
                <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                  <i className='ri-user-heart-line text-indigo-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
                  Danışman Görüşü
                </h3>
                <div className='bg-indigo-50 rounded-xl p-6 border-l-4 border-indigo-500 relative'>
                  <i className='ri-double-quotes-l text-4xl text-indigo-300 absolute top-4 left-4'></i>
                  <p className='text-gray-700 leading-relaxed italic pl-12'>
                    {selectedStory.consultantNote}
                  </p>
                </div>
              </div>
              {/* Firma Yöneticisi Alıntısı */}
              <div>
                <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
                  <i className='ri-chat-quote-line text-blue-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
                  Firma Yöneticisinden
                </h3>
                <div className='bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500 relative'>
                  <i className='ri-double-quotes-l text-4xl text-blue-300 absolute top-4 left-4'></i>
                  <p className='text-gray-700 leading-relaxed italic pl-12 mb-6'>
                    {selectedStory.testimonial}
                  </p>
                  <div className='flex items-center'>
                    <Image
                      src={`https://readdy.ai/api/search-image?query=Professional%20Turkish%20business%20executive%20portrait%2C%20${selectedStory.managerName}%2C%20confident%20business%20leader%20in%20modern%20office%20setting%2C%20representing%20success%20story%20testimonial.%20Professional%20headshot%20photography&width=60&height=60&seq=manager-${selectedStory.id}&orientation=squarish`}
                      alt={selectedStory.managerName}
                      width={48}
                      height={48}
                      className='w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-200'
                    />
                    <div>
                      <p className='font-semibold text-gray-900'>
                        {selectedStory.managerName}
                      </p>
                      <p className='text-blue-600 text-sm'>
                        {selectedStory.managerTitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tags */}
              <div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Etiketler
                </h3>
                <div className='flex flex-wrap gap-3'>
                  {selectedStory.tags.map((tag, index) => (
                    <span
                      key={index}
                      className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='max-w-4xl mx-auto text-white'>
            <div className='inline-flex items-center bg-white/20 rounded-full px-6 py-3 mb-8'>
              <i className='ri-question-line text-white mr-3 w-6 h-6 flex items-center justify-center'></i>
              <span className='font-bold text-lg tracking-wide'>
                SIZ DE BAŞLAMAYA HAZIR MISINIZ?
              </span>
            </div>
            <h2 className='text-4xl lg:text-5xl font-bold mb-8 leading-tight'>
              Bu Desteklere Nasıl Başvurabilirim?
            </h2>
            <p className='text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed'>
              Siz de bu başarı hikayelerinin bir parçası olmak istiyorsanız,
              hemen başvurunuzu yapın ve dönüşüm yolculuğunuza başlayın.
            </p>
            <div className='grid md:grid-cols-3 gap-8 mb-12'>
              <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20'>
                <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-file-text-line text-3xl text-white w-8 h-8 flex items-center justify-center'></i>
                </div>
                <h3 className='text-xl font-bold mb-2'>1. Başvuru Yapın</h3>
                <p className='text-white/80 text-sm'>
                  Online formu doldurarak başvuru sürecini başlatın
                </p>
              </div>
              <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20'>
                <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-calendar-check-line text-3xl text-white w-8 h-8 flex items-center justify-center'></i>
                </div>
                <h3 className='text-xl font-bold mb-2'>2. Danışmanlık Alın</h3>
                <p className='text-white/80 text-sm'>
                  Uzmanlarımızla ücretsiz ön görüşme gerçekleştirin
                </p>
              </div>
              <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20'>
                <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-rocket-line text-3xl text-white w-8 h-8 flex items-center justify-center'></i>
                </div>
                <h3 className='text-xl font-bold mb-2'>3. Başarıya Ulaşın</h3>
                <p className='text-white/80 text-sm'>
                  12 aylık program ile hedeflerinize ulaşın
                </p>
              </div>
            </div>
            <div className='flex flex-col sm:flex-row gap-6 justify-center'>
              <Link
                href='/basvuru'
                className='inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              >
                <i className='ri-send-plane-line mr-3 w-6 h-6 flex items-center justify-center'></i>
                Başvuru Yap
              </Link>
              <Link
                href='/randevu'
                className='inline-flex items-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:-translate-y-1'
              >
                <i className='ri-phone-line mr-3 w-6 h-6 flex items-center justify-center'></i>
                Ücretsiz Randevu
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
