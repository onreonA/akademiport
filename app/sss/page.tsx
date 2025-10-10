'use client';
import Link from 'next/link';
import { useState } from 'react';

import ModernFooter from '@/components/layout/ModernFooter';
import ModernNavigation from '@/components/layout/ModernNavigation';
const faqData = {
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
  { id: 'genel', name: 'Genel Bilgiler', icon: 'ri-information-line' },
  { id: 'basvuru', name: 'Başvuru ve Katılım', icon: 'ri-file-text-line' },
  { id: 'egitim', name: 'Eğitim ve Danışmanlık', icon: 'ri-book-line' },
  { id: 'panel', name: 'Panel Kullanımı', icon: 'ri-dashboard-line' },
  { id: 'teknik', name: 'Teknik Sorunlar', icon: 'ri-tools-line' },
  {
    id: 'tesvikler',
    name: 'Teşvik ve Destekler',
    icon: 'ri-money-dollar-circle-line',
  },
];
export default function SSS() {
  const [activeCategory, setActiveCategory] = useState('genel');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const toggleFaq = (id: number) => {
    setOpenFaqs(prev =>
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    );
  };
  const filteredFaqs = () => {
    let faqs = faqData[activeCategory as keyof typeof faqData] || [];
    if (searchQuery) {
      const allFaqs = Object.values(faqData).flat();
      faqs = allFaqs.filter(
        faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return faqs;
  };
  return (
    <div className='min-h-screen bg-white'>
      {/* Modern Navigation */}
      <ModernNavigation />
      {/* Hero Section */}
      <section className='relative py-24 overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10'></div>
        <div className='relative max-w-6xl mx-auto px-6 text-center'>
          <div className='inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-8'>
            <i className='ri-question-line mr-2 w-4 h-4 flex items-center justify-center'></i>
            Sıkça Sorulan Sorular
          </div>
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
            Sıkça Sorulan
            <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              {' '}
              Sorular
            </span>
          </h1>
          <p className='text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed'>
            Projemizle ilgili en çok merak edilen soruları sizin için derledik.
            Aşağıdan ihtiyacınıza uygun başlığı seçerek hızlıca cevaplara
            ulaşabilirsiniz.
          </p>
          {/* Search Bar */}
          <div className='relative max-w-2xl mx-auto mb-16'>
            <div className='relative'>
              <i className='ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 flex items-center justify-center'></i>
              <input
                type='text'
                placeholder='Soru ara...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm'
              />
            </div>
          </div>
        </div>
      </section>
      {/* Categories and FAQ Content */}
      <section className='py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          {/* Category Tabs */}
          <div className='flex flex-wrap justify-center gap-3 mb-16'>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setSearchQuery('');
                }}
                className={`flex items-center px-6 py-4 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <i
                  className={`${category.icon} mr-2 w-5 h-5 flex items-center justify-center`}
                ></i>
                {category.name}
              </button>
            ))}
          </div>
          {/* FAQ Grid */}
          <div className='grid gap-6'>
            {filteredFaqs().map(faq => (
              <div
                key={faq.id}
                className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className='w-full flex items-center justify-between p-8 text-left hover:bg-gray-50 transition-all duration-300'
                >
                  <h3 className='text-xl font-bold text-gray-900 flex-1 pr-4'>
                    {faq.question}
                  </h3>
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-transform duration-300 ${
                      openFaqs.includes(faq.id) ? 'rotate-180' : ''
                    }`}
                  >
                    <i className='ri-arrow-down-s-line w-5 h-5 flex items-center justify-center'></i>
                  </div>
                </button>
                {openFaqs.includes(faq.id) && (
                  <div className='px-8 pb-8 animate-fade-in'>
                    <div className='border-t border-gray-100 pt-6'>
                      <p className='text-gray-700 text-lg leading-relaxed mb-6'>
                        {faq.answer}
                      </p>
                      {faq.link && (
                        <Link
                          href={faq.link}
                          className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        >
                          <i className='ri-external-link-line mr-2 w-4 h-4 flex items-center justify-center'></i>
                          Daha Fazla Bilgi
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* No Results */}
          {searchQuery && filteredFaqs().length === 0 && (
            <div className='text-center py-16'>
              <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <i className='ri-search-line text-gray-400 text-3xl w-8 h-8 flex items-center justify-center'></i>
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                Sonuç Bulunamadı
              </h3>
              <p className='text-gray-600 mb-8'>
                &quot;{searchQuery}&quot; aramanızla ilgili soru bulunamadı.
                Farklı anahtar kelimeler deneyebilirsiniz.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300'
              >
                Aramayı Temizle
              </button>
            </div>
          )}
        </div>
      </section>
      {/* Contact Support Section */}
      <section className='py-20 bg-gradient-to-r from-blue-600 to-purple-600'>
        <div className='max-w-4xl mx-auto px-6 text-center'>
          <div className='bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20'>
            <div className='w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8'>
              <i className='ri-customer-service-2-line text-white text-3xl w-8 h-8 flex items-center justify-center'></i>
            </div>
            <h2 className='text-4xl font-bold text-white mb-6'>
              Aradığınız Cevabı Bulamadınız mı?
            </h2>
            <p className='text-xl text-white/90 mb-10 leading-relaxed'>
              Uzman ekibimiz size yardımcı olmaya hazır. 7/24 destek hattımızdan
              bize ulaşabilir veya randevu talep edebilirsiniz.
            </p>
            <div className='flex flex-col sm:flex-row gap-6 justify-center'>
              <Link
                href='/iletisim-basvuru'
                className='inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 whitespace-nowrap'
              >
                <i className='ri-message-3-line mr-3 w-5 h-5 flex items-center justify-center'></i>
                İletişime Geçin
              </Link>
              <a
                href='tel:+902123456789'
                className='inline-flex items-center px-8 py-4 bg-white/20 text-white border-2 border-white/30 rounded-2xl font-bold hover:bg-white/30 transition-all duration-300 backdrop-blur-sm whitespace-nowrap'
              >
                <i className='ri-phone-line mr-3 w-5 h-5 flex items-center justify-center'></i>
                0212 345 67 89
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
