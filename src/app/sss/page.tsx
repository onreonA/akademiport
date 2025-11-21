/**
 * SSS (Sıkça Sorulan Sorular) Sayfası
 * Sprint 22: Public Website
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { ModernNavigation } from '@/1-presentation/components/features/layout/ModernNavigation';
import { ModernFooter } from '@/1-presentation/components/features/layout/ModernFooter';
import {
  HelpCircle,
  Search,
  Info,
  FileText,
  BookOpen,
  LayoutDashboard,
  Wrench,
  DollarSign,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/1-presentation/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/1-presentation/components/ui/atoms/accordion';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  link: string | null;
}

const faqData: Record<string, FAQ[]> = {
  genel: [
    {
      id: 1,
      question: 'Akademi Port nedir ve nasıl çalışır?',
      answer:
        'Akademi Port, firmaların dijital dönüşüm ve e-ihracat süreçlerinde başarılı olmalarını sağlayan kapsamlı bir eğitim ve danışmanlık platformudur. Uzman danışmanlar eşliğinde, firmanızın ihtiyaçlarına özel eğitim programları, proje yönetimi araçları ve analitik raporlama sistemleri sunuyoruz.',
      link: '/program-hakkinda',
    },
    {
      id: 2,
      question: 'Platforma kimler katılabilir?',
      answer:
        "Türkiye'de faaliyet gösteren, ihracat yapan veya ihracat yapmayı planlayan tüm firmalar platforma katılabilir. Özellikle KOBİ'ler ve dijital dönüşüm sürecindeki firmalar için tasarlanmış programlarımız bulunmaktadır.",
      link: null,
    },
    {
      id: 3,
      question: 'Program ücretsiz mi yoksa ücretli mi?',
      answer:
        'Temel eğitim programları ve danışmanlık hizmetleri ücretsiz sunulmaktadır. Gelişmiş özellikler ve özel danışmanlık hizmetleri için farklı paket seçenekleri mevcuttur. Detaylı bilgi için iletişime geçebilirsiniz.',
      link: '/destekler',
    },
    {
      id: 4,
      question: 'Ne kadar süre içinde sonuç alabilirim?',
      answer:
        'Programın süresi firmanızın mevcut durumu ve hedeflerine göre değişiklik gösterir. Ortalama olarak 3-6 ay içinde somut sonuçlar almaya başlarsınız. İlk 30 gün içinde temel eğitimleri tamamlayarak hızlı bir başlangıç yapabilirsiniz.',
      link: null,
    },
  ],
  basvuru: [
    {
      id: 5,
      question: 'Platforma nasıl başvuru yapabilirim?',
      answer:
        "Ana sayfa üzerinden 'Başvuru Yap' butonuna tıklayarak ya da iletişim sayfasından randevu talep ederek başvuru yapabilirsiniz. İlk görüşmede firmanızın durumu değerlendirilerek size özel bir program hazırlanır.",
      link: '/iletisim-basvuru',
    },
    {
      id: 6,
      question: 'Başvuru için hangi belgeler gerekli?',
      answer:
        'Firma faaliyet belgesi, vergi levhası, ihracat kayıt belgesi (varsa) ve firma hakkında genel bilgileri içeren bir sunum dosyası yeterlidir. Değerlendirme sürecinde ilave belgeler istenebilir.',
      link: null,
    },
    {
      id: 7,
      question: 'Başvuru süreci ne kadar sürer?',
      answer:
        'Başvuru formunu doldurduktan sonra 2-3 iş günü içinde sizinle iletişime geçilir. İlk değerlendirme görüşmesi sonrasında 1 hafta içinde programa kabul süreciniz tamamlanır.',
      link: null,
    },
    {
      id: 8,
      question: 'Programa kabul kriterleri nelerdir?',
      answer:
        'Aktif bir firma olma, ihracat potansiyeli bulunma, dijital dönüşüme açık olma ve program süresince aktif katılım gösterebilme temel kriterlerimizdir. Her firma özel olarak değerlendirilir.',
      link: null,
    },
  ],
  egitim: [
    {
      id: 9,
      question: 'Eğitimler nasıl veriliyor?',
      answer:
        'Eğitimler online platform üzerinden video dersleri, canlı webinarlar ve birebir danışmanlık seansları şeklinde verilmektedir. İçerikler firmanızın seviyesine ve ihtiyaçlarına göre kişiselleştirilir.',
      link: '/platform-ozellikleri',
    },
    {
      id: 10,
      question: 'Danışmanlarınızın deneyimi nasıl?',
      answer:
        'Tüm danışmanlarımız en az 10 yıl sektör deneyimine sahip, uluslararası ticaret ve dijital pazarlama alanında uzman kişilerdir. Her danışman belirli sektörlerde specializasyon sahibidir.',
      link: null,
    },
    {
      id: 11,
      question: 'Eğitim programı ne kadar sürüyor?',
      answer:
        'Temel program 3 ay, kapsamlı program 6 ay sürmektedir. Firmanızın ihtiyaçlarına göre program süresi uzatılabilir veya kısaltılabilir. Esnek eğitim takvimi imkanı sunulmaktadır.',
      link: null,
    },
    {
      id: 12,
      question: 'Sertifika veriliyor mu?',
      answer:
        'Evet, program sonunda katılım sertifikası ve başarılı olan firmalara ihracat yeterlilik sertifikası verilmektedir. Bu sertifikalar resmi kurumlarda geçerlidir.',
      link: null,
    },
  ],
  panel: [
    {
      id: 13,
      question: 'Panel üzerinden neler yapabilirim?',
      answer:
        'Panel üzerinden eğitim videolarınızı izleyebilir, projenizin ilerlemesini takip edebilir, danışmanınızla mesajlaşabilir, raporlarınızı görüntüleyebilir ve etkinliklere katılabilirsiniz.',
      link: '/platform-ozellikleri',
    },
    {
      id: 14,
      question: 'Mobil uygulama var mı?',
      answer:
        'Şu anda web tabanlı platform üzerinden hizmet veriyoruz. Platform mobil uyumlu tasarlanmıştır ve tüm cihazlardan rahatlıkla kullanılabilir. Yakın gelecekte mobil uygulama planlanmaktadır.',
      link: null,
    },
    {
      id: 15,
      question: 'Panel kullanımı zor mu?',
      answer:
        'Panel kullanıcı dostu arayüzü ile çok kolay kullanılmaktadır. İlk girişinizde size özel bir tanıtım turu sunulur. Ayrıca 7/24 teknik destek hizmeti mevcuttur.',
      link: null,
    },
    {
      id: 16,
      question: 'Verilerim güvende mi?',
      answer:
        'Evet, tüm verileriniz SSL şifreleme ile korunmaktadır. KVKK uyumlu veri işleme politikalarımız bulunmaktadır. Firma bilgileriniz hiçbir şekilde üçüncü taraflarla paylaşılmaz.',
      link: null,
    },
  ],
  teknik: [
    {
      id: 17,
      question: 'Sisteme giriş yaparken sorun yaşıyorum, ne yapmalıyım?',
      answer:
        "Öncelikle şifrenizi sıfırlamayı deneyiniz. Sorun devam ederse tarayıcınızın cache'ini temizleyin. Hala sorun yaşıyorsanız teknik destek ekibimizle iletişime geçin.",
      link: null,
    },
    {
      id: 18,
      question: 'Video eğitimleri izlerken donma yaşıyorum?',
      answer:
        'İnternet bağlantınızı kontrol edin ve video kalite ayarlarını düşürün. Farklı bir tarayıcı deneyebilir veya sayfayı yenileyebilirsiniz. Sorun devam ederse destek ekibimize bildiriniz.',
      link: null,
    },
    {
      id: 19,
      question: 'Hangi tarayıcıları destekliyorsunuz?',
      answer:
        'Chrome, Firefox, Safari ve Edge tarayıcılarının güncel sürümlerini destekliyoruz. En iyi deneyim için Chrome tarayıcısı önerilmektedir.',
      link: null,
    },
    {
      id: 20,
      question: 'Dosya yükleme sorunu yaşıyorum?',
      answer:
        "Dosya boyutunun 10MB'dan küçük olduğundan ve desteklenen formatlarda (PDF, DOC, XLS, JPG, PNG) olduğundan emin olun. Sorun devam ederse farklı bir dosya formatı deneyin.",
      link: null,
    },
  ],
  tesvikler: [
    {
      id: 21,
      question: 'Hangi teşvik ve desteklerden yararlanabilirim?',
      answer:
        'KOSGEB, İŞKUR, TİM ve TİKA desteklerinden yararlanabilirsiniz. Ayrıca ihracat kredisi, pazara giriş desteği ve fuara katılım destekleri hakkında bilgi alabilirsiniz.',
      link: '/destekler',
    },
    {
      id: 22,
      question: 'Teşvik başvurularında yardım alabilir miyim?',
      answer:
        'Evet, danışmanlarımız teşvik başvuru süreçlerinizde size rehberlik eder. Başvuru formlarının hazırlanmasından onay süreçlerine kadar tüm aşamalarda destek sağlanır.',
      link: null,
    },
    {
      id: 23,
      question: 'Vergi avantajları nelerdir?',
      answer:
        'İhracat kazançları gelir ve kurumlar vergisinden istisnadır. Ayrıca KDV iadesi, gümrük muafiyetleri ve çeşitli vergi indirimleri mevcuttur. Detaylı bilgi için mali müşavirinizle görüşmenizi öneririz.',
      link: null,
    },
    {
      id: 24,
      question: 'Fuar katılım destekleri nasıl alınır?',
      answer:
        'TİM ve İTO üzerinden uluslararası fuarlara katılım destekleri alabilirsiniz. Başvuru süreçleri ve gerekli belgeler hakkında danışmanlarımızdan bilgi alabilirsiniz.',
      link: null,
    },
  ],
};

const categories = [
  { id: 'genel', name: 'Genel Bilgiler', icon: Info },
  { id: 'basvuru', name: 'Başvuru ve Katılım', icon: FileText },
  { id: 'egitim', name: 'Eğitim ve Danışmanlık', icon: BookOpen },
  { id: 'panel', name: 'Panel Kullanımı', icon: LayoutDashboard },
  { id: 'teknik', name: 'Teknik Sorunlar', icon: Wrench },
  { id: 'tesvikler', name: 'Teşvik ve Destekler', icon: DollarSign },
];

export default function SSS() {
  const [activeCategory, setActiveCategory] = useState('genel');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = (): FAQ[] => {
    let faqs = faqData[activeCategory] || [];
    if (searchQuery) {
      const allFaqs = Object.values(faqData).flat();
      faqs = allFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return faqs;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <ModernNavigation />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-8">
            <HelpCircle className="mr-2 w-4 h-4" />
            Sıkça Sorulan Sorular
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Sıkça Sorulan
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}
              Sorular
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Projemizle ilgili en çok merak edilen soruları sizin için derledik. Aşağıdan
            ihtiyacınıza uygun başlığı seçerek hızlıca cevaplara ulaşabilirsiniz.
          </p>
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Soru ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories and FAQ Content */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'flex items-center px-6 py-4 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap',
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                  )}
                >
                  <Icon className="mr-2 w-5 h-5" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs().map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={`faq-${faq.id}`}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-4"
                >
                  <AccordionTrigger className="px-8 py-6 hover:bg-gray-50 transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-900 text-left flex-1 pr-4">
                      {faq.question}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-6">
                    <p className="text-gray-700 leading-relaxed mb-4">{faq.answer}</p>
                    {faq.link && (
                      <Link
                        href={faq.link}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-200"
                      >
                        Daha fazla bilgi
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* No Results */}
          {filteredFaqs().length === 0 && (
            <div className="text-center py-16">
              <Search className="text-6xl text-gray-300 mb-4 w-24 h-24 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
              <p className="text-gray-600 mb-6">Arama kriterlerinize uygun soru bulunmuyor.</p>
              <Button
                onClick={() => {
                  setActiveCategory('genel');
                  setSearchQuery('');
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 mb-6">
              <MessageCircle className="text-blue-600 mr-3 w-6 h-6" />
              <span className="text-blue-800 font-bold text-lg tracking-wide">
                YARDIMA MI İHTİYACINIZ VAR?
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Sorunuz mu var? Bizimle İletişime Geçin
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Aradığınız cevabı bulamadıysanız, uzman ekibimiz size yardımcı olmaya hazır. İletişim
              formunu doldurun veya doğrudan bize ulaşın.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/iletisim-basvuru">
                  <MessageCircle className="mr-3 w-6 h-6" />
                  İletişime Geç
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white border-2 border-gray-300 hover:border-blue-500"
              >
                <Link href="/program-hakkinda">
                  <Info className="mr-3 w-6 h-6" />
                  Programı İncele
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
