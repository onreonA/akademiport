'use client';
import Image from 'next/image';
import Link from 'next/link';

import ModernFooter from '@/components/layout/ModernFooter';
import ModernNavigation from '@/components/layout/ModernNavigation';
export default function ProgramHakkinda() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Navigation */}
      <ModernNavigation />
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-blue-50 via-purple-50 to-white py-24 overflow-hidden'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5'
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Advanced%20digital%20transformation%20technology%20background%20showing%20AI%20neural%20networks%2C%20global%20connectivity%2C%20data%20flow%20visualization%20and%20modern%20business%20ecosystem.%20Clean%20minimalist%20design%20with%20blue%20and%20purple%20gradient%20colors%2C%20representing%20next-generation%20e-export%20platform%20innovation&width=1920&height=1000&seq=program-hero-bg&orientation=landscape')`,
          }}
        ></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='max-w-4xl mx-auto'>
            <div className='inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-8 py-3 mb-8'>
              <i className='ri-book-open-line text-blue-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
              <span className='text-blue-800 font-bold text-lg tracking-wide'>
                📘 PROGRAM HAKKINDA
              </span>
            </div>
            <h1 className='text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight'>
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'>
                Yeni Nesil
              </span>
              <br />
              E-İhracat Dönüşüm Modeli
            </h1>
            <p className='text-2xl text-gray-600 mb-12 leading-relaxed max-w-5xl mx-auto'>
              Bu program,{' '}
              <strong className='text-blue-700'>
                Ticaret Bakanlığı destekleriyle
              </strong>{' '}
              organize edilen, sanayi ve ticaret odalarının koordinasyonunda
              yürütülen bir e-ihracat gelişim modelidir. Amaç; üretici
              firmaların dijital ihracat altyapısını kurmak, bu süreci
              profesyonel danışmanlık, eğitim ve yapay zekâ destekli araçlarla
              yönetilebilir hale getirmektir.
            </p>
            <div className='flex flex-col sm:flex-row gap-6 justify-center'>
              <Link
                href='/basvuru'
                className='inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-10 py-5 rounded-2xl font-bold transition-all duration-300 cursor-pointer whitespace-nowrap shadow-2xl hover:shadow-3xl transform hover:-translate-y-1'
              >
                <i className='ri-rocket-line mr-3 w-6 h-6 flex items-center justify-center'></i>
                Programa Katıl
              </Link>
              <Link
                href='/demo'
                className='inline-flex items-center bg-white text-blue-600 border-2 border-blue-600 text-xl px-10 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl'
              >
                <i className='ri-play-circle-line mr-3 w-6 h-6 flex items-center justify-center'></i>
                Demo İzle
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* 12 Aylık Danışmanlık Bölümü */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-16 items-center'>
            {/* Sol Taraf - İçerik */}
            <div>
              <div className='inline-flex items-center bg-orange-100 rounded-full px-6 py-2 mb-6'>
                <i className='ri-calendar-check-line text-orange-600 mr-2 w-5 h-5 flex items-center justify-center'></i>
                <span className='text-orange-800 font-semibold text-sm tracking-wide'>
                  12 AYLIK SÜREÇ
                </span>
              </div>
              <h2 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight'>
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600'>
                  Adım Adım
                </span>
                <br />
                Danışmanlık Sistemi
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Firmalara özel dijital paneller tanımlanır. Bu paneller
                aracılığıyla tüm süreç yönetilir ve her adım profesyonel
                danışmanlar tarafından kontrol edilir.
              </p>
              {/* Süreç Adımları */}
              <div className='space-y-4'>
                <div className='flex items-start space-x-4 p-4 bg-orange-50 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300'>
                  <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <i className='ri-search-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <div>
                    <h4 className='text-lg font-bold text-gray-900 mb-2'>
                      Mevcut Durum Analizi
                    </h4>
                    <p className='text-gray-600 text-sm'>
                      Firmanızın mevcut kapasitesi, güçlü yönleri ve gelişim
                      alanlarının detaylı analizi
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300'>
                  <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <i className='ri-store-3-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <div>
                    <h4 className='text-lg font-bold text-gray-900 mb-2'>
                      Pazaryeri Açılış Süreçleri
                    </h4>
                    <p className='text-gray-600 text-sm'>
                      Alibaba, Amazon ve diğer küresel platformlarda hesap açma
                      ve optimizasyon
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4 p-4 bg-purple-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300'>
                  <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <i className='ri-edit-box-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <div>
                    <h4 className='text-lg font-bold text-gray-900 mb-2'>
                      Ürün İçeriklerinin Dijital Optimizasyonu
                    </h4>
                    <p className='text-gray-600 text-sm'>
                      Ürün açıklamaları, görseller ve SEO optimizasyonu ile
                      görünürlük artışı
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4 p-4 bg-green-50 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300'>
                  <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <i className='ri-play-circle-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <div>
                    <h4 className='text-lg font-bold text-gray-900 mb-2'>
                      Eğitim Videoları ve Raporlamalar
                    </h4>
                    <p className='text-gray-600 text-sm'>
                      Kişiselleştirilmiş eğitim modülleri ve düzenli performans
                      raporları
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-200 hover:shadow-lg transition-all duration-300'>
                  <div className='w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <i className='ri-government-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <div>
                    <h4 className='text-lg font-bold text-gray-900 mb-2'>
                      Devlet Teşvikleri Başvuru Hazırlıkları
                    </h4>
                    <p className='text-gray-600 text-sm'>
                      Mevcut desteklerden maksimum faydalanma stratejileri ve
                      başvuru süreçleri
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4 p-4 bg-pink-50 rounded-2xl border border-pink-200 hover:shadow-lg transition-all duration-300'>
                  <div className='w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <i className='ri-robot-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <div>
                    <h4 className='text-lg font-bold text-gray-900 mb-2'>
                      AI Destekli İçerik Üretimi & Görev Takibi
                    </h4>
                    <p className='text-gray-600 text-sm'>
                      Yapay zeka ile otomatik içerik oluşturma ve akıllı
                      ilerleme ölçümleri
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Sağ Taraf - Görsel */}
            <div className='relative'>
              <div className='relative bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl p-8 shadow-2xl'>
                <Image
                  src='https://readdy.ai/api/search-image?query=Professional%20business%20consultation%20meeting%20with%20Turkish%20consultants%20and%20company%20executives%20around%20a%20modern%20conference%20table%2C%20reviewing%20digital%20transformation%20roadmap%20documents%20and%20charts.%20Modern%20office%20environment%20with%20digital%20screens%20showing%20project%20timeline%2C%20task%20completion%20progress%2C%20and%20analytics%20dashboards.%20Clean%20corporate%20photography%20style%20with%20orange%20and%20blue%20color%20theme&width=600&height=700&seq=consultation-process&orientation=portrait'
                  alt='12 Aylık Danışmanlık Süreci'
                  width={600}
                  height={700}
                  className='rounded-2xl w-full h-auto object-cover shadow-xl'
                />
                {/* Floating Elements */}
                <div className='absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse'>
                  <i className='ri-time-line text-white text-2xl w-8 h-8 flex items-center justify-center'></i>
                </div>
                <div className='absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-2xl border border-orange-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                    <span className='text-gray-700 font-semibold text-sm'>
                      Sürekli İzleme Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Yapay Zeka Destekli Sistem */}
      <section className='py-24 bg-gradient-to-br from-gray-50 to-purple-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-full px-8 py-3 mb-8'>
              <i className='ri-robot-2-line text-purple-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
              <span className='text-purple-800 font-bold text-lg tracking-wide'>
                YAPAY ZEKA TEKNOLOJİSİ
              </span>
            </div>
            <h2 className='text-4xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight'>
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600'>
                Yapay Zeka Destekli
              </span>
              <br />
              Akıllı Sistem
            </h2>
            <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
              Platform; eğitim takibi, raporlama, belge yönetimi, danışman-firma
              etkileşimi ve proje ilerlemesini otomatik yöneten akıllı bir
              sistem sunar. Tüm süreçler belgelenir, izlenir ve ölçümlenebilir
              hale gelir.
            </p>
          </div>
          {/* Ana Grid */}
          <div className='grid lg:grid-cols-2 gap-16 items-center mb-16'>
            {/* Sol - Görsel */}
            <div className='relative'>
              <Image
                src='https://readdy.ai/api/search-image?query=Futuristic%20AI%20dashboard%20interface%20showing%20intelligent%20automation%20features%2C%20machine%20learning%20analytics%2C%20real-time%20data%20processing%2C%20and%20smart%20recommendation%20systems.%20Modern%20holographic-style%20UI%20with%20purple%20and%20blue%20neon%20colors%2C%20displaying%20task%20automation%2C%20document%20management%2C%20progress%20tracking%2C%20and%20AI%20assistant%20features.%20High-tech%20sci-fi%20style%20visualization&width=700&height=500&seq=ai-system-interface&orientation=landscape'
                alt='AI Destekli Sistem Arayüzü'
                width={700}
                height={500}
                className='rounded-3xl shadow-2xl w-full h-auto object-cover'
              />
              {/* Floating AI Elements */}
              <div className='absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce'>
                <i className='ri-brain-line text-white text-3xl w-10 h-10 flex items-center justify-center'></i>
              </div>
              <div className='absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-2xl border-2 border-purple-200'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-700 mb-1'>
                    99.9%
                  </div>
                  <div className='text-purple-600 text-sm'>
                    Otomatik Doğruluk
                  </div>
                </div>
              </div>
            </div>
            {/* Sağ - İçerik */}
            <div>
              <div className='space-y-6'>
                {/* Özellik 1 */}
                <div className='group bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-dashboard-3-line text-white text-xl w-7 h-7 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-xl font-bold text-gray-900 mb-3'>
                        Otomatik Eğitim Takibi
                      </h4>
                      <p className='text-gray-600 leading-relaxed'>
                        AI algoritmaları öğrenme hızınızı analiz eder,
                        kişiselleştirilmiş eğitim planları oluşturur ve
                        ilerlemenizi gerçek zamanlı olarak izler. Eksik konuları
                        tespit ederek otomatik hatırlatıcılar gönderir.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Özellik 2 */}
                <div className='group bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-bar-chart-grouped-line text-white text-xl w-7 h-7 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-xl font-bold text-gray-900 mb-3'>
                        Akıllı Raporlama Sistemi
                      </h4>
                      <p className='text-gray-600 leading-relaxed'>
                        Performans verilerinizi analiz ederek otomatik raporlar
                        oluşturur. SWOT analizleri, pazar fırsatları ve gelişim
                        önerileri yapay zeka tarafından hazırlanır ve düzenli
                        olarak güncellenir.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Özellik 3 */}
                <div className='group bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-file-text-line text-white text-xl w-7 h-7 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-xl font-bold text-gray-900 mb-3'>
                        Otomatik Belge Yönetimi
                      </h4>
                      <p className='text-gray-600 leading-relaxed'>
                        Tüm belgeler AI tarafından kategorize edilir, aranabilir
                        hale getirilir ve gerekli zamanlarda otomatik olarak
                        danışmanlarınızla paylaşılır. Doküman kaybı ve
                        karışıklık tamamen ortadan kalkar.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Özellik 4 */}
                <div className='group bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                      <i className='ri-message-3-line text-white text-xl w-7 h-7 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='text-xl font-bold text-gray-900 mb-3'>
                        Danışman-Firma Etkileşimi
                      </h4>
                      <p className='text-gray-600 leading-relaxed'>
                        AI asistan 7/24 sorularınızı yanıtlar, acil konuları
                        danışmanlarınıza yönlendirir ve toplantı zamanlarını
                        otomatik olarak optimize eder. Komunikasyon hiç bu kadar
                        etkili olmamıştı.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* İstatistik Kutuları */}
          <div className='grid md:grid-cols-4 gap-8'>
            <div className='bg-white rounded-2xl p-6 text-center shadow-lg border border-purple-100 hover:shadow-2xl transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-speed-up-line text-white text-2xl w-8 h-8 flex items-center justify-center'></i>
              </div>
              <div className='text-3xl font-bold text-purple-700 mb-2'>10x</div>
              <div className='text-purple-600 text-sm'>Hız Artışı</div>
            </div>
            <div className='bg-white rounded-2xl p-6 text-center shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-error-warning-line text-white text-2xl w-8 h-8 flex items-center justify-center'></i>
              </div>
              <div className='text-3xl font-bold text-blue-700 mb-2'>%95</div>
              <div className='text-blue-600 text-sm'>Hata Azaltma</div>
            </div>
            <div className='bg-white rounded-2xl p-6 text-center shadow-lg border border-green-100 hover:shadow-2xl transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-time-line text-white text-2xl w-8 h-8 flex items-center justify-center'></i>
              </div>
              <div className='text-3xl font-bold text-green-700 mb-2'>24/7</div>
              <div className='text-green-600 text-sm'>Destek</div>
            </div>
            <div className='bg-white rounded-2xl p-6 text-center shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-funds-line text-white text-2xl w-8 h-8 flex items-center justify-center'></i>
              </div>
              <div className='text-3xl font-bold text-orange-700 mb-2'>
                %300
              </div>
              <div className='text-orange-600 text-sm'>Verimlilik</div>
            </div>
          </div>
        </div>
      </section>
      {/* Kimin İçin Tasarlandı */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-8 py-3 mb-8'>
              <i className='ri-team-line text-green-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
              <span className='text-green-800 font-bold text-lg tracking-wide'>
                HEDEF KİTLE
              </span>
            </div>
            <h2 className='text-4xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight'>
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600'>
                Kimin İçin
              </span>
              <br />
              Tasarlandı?
            </h2>
            <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
              Akademi Port, Türkiye&apos;nin dijital ihracat ekosistemini
              güçlendirmek için farklı sektörlerden aktörleri bir araya getiren
              kapsamlı bir platformdur.
            </p>
          </div>
          {/* Hedef Kitle Kartları */}
          <div className='grid lg:grid-cols-2 gap-12 mb-16'>
            {/* Üretici Firmalar */}
            <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
              <div className='text-center mb-8'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
                  <i className='ri-building-2-line text-white text-3xl w-10 h-10 flex items-center justify-center'></i>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                  Üretici Firmalar
                </h3>
                <div className='w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto'></div>
              </div>
              <div className='space-y-4'>
                <div className='bg-white rounded-xl p-4 shadow-lg border border-blue-100'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <i className='ri-global-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 text-sm'>
                        Global Pazarlara Açılmak İsteyen KOBİ&apos;ler
                      </h4>
                      <p className='text-gray-600 text-xs'>
                        Uluslararası ticarette büyümek isteyen orta ölçekli
                        işletmeler
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white rounded-xl p-4 shadow-lg border border-purple-100'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <i className='ri-truck-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 text-sm'>
                        Lojistik ve İçerik Desteği İhtiyacı Olan Firmalar
                      </h4>
                      <p className='text-gray-600 text-xs'>
                        Kaliteli ürün üreten ancak ihracat süreçlerinde destek
                        arayan işletmeler
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white rounded-xl p-4 shadow-lg border border-green-100'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <i className='ri-government-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 text-sm'>
                        Devlet Desteklerinden Yararlanmak İsteyen Markalar
                      </h4>
                      <p className='text-gray-600 text-xs'>
                        Mevcut teşvikleri etkin kullanarak büyümek isteyen
                        firmalar
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='mt-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 text-center'>
                <div className='text-lg font-bold text-blue-700 mb-1'>
                  500+ Katılımcı
                </div>
                <div className='text-blue-600 text-sm'>Başarılı Dönüşüm</div>
              </div>
            </div>
            {/* STK ve Oda Yöneticileri */}
            <div className='bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'>
              <div className='text-center mb-8'>
                <div className='w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
                  <i className='ri-community-line text-white text-3xl w-10 h-10 flex items-center justify-center'></i>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                  Sanayi ve Ticaret Odaları
                </h3>
                <div className='w-16 h-1 bg-gradient-to-r from-green-500 to-teal-600 mx-auto'></div>
              </div>
              <div className='space-y-4'>
                <div className='bg-white rounded-xl p-4 shadow-lg border border-green-100'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <i className='ri-line-chart-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 text-sm'>
                        STK&apos;lar ve Bölgesel Kalkınma Ajansları
                      </h4>
                      <p className='text-gray-600 text-xs'>
                        Üye firmalarının ihracat kapasitesini artırmak isteyen
                        kurumlar
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white rounded-xl p-4 shadow-lg border border-teal-100'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <i className='ri-shield-star-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 text-sm'>
                        KOBİ Dijitalleşmesiyle İlgilenen Kurumlar
                      </h4>
                      <p className='text-gray-600 text-xs'>
                        Dijital dönüşüm projelerine öncülük eden yapılar
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white rounded-xl p-4 shadow-lg border border-indigo-100'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <i className='ri-robot-2-line text-white text-lg w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 text-sm'>
                        Teknoloji Destekli Sürdürülebilir Modeller
                      </h4>
                      <p className='text-gray-600 text-xs'>
                        AI ve dijital çözümlerle geleceği şekillendiren kurumlar
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='mt-6 bg-gradient-to-r from-green-100 to-teal-100 rounded-xl p-4 text-center'>
                <div className='text-lg font-bold text-green-700 mb-1'>
                  150+ Ortak
                </div>
                <div className='text-green-600 text-sm'>Kurum & STK</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Neden Katılmalısınız Bölümü */}
      <section className='py-24 bg-gradient-to-br from-orange-50 to-red-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-8 py-3 mb-8'>
              <i className='ri-rocket-line text-orange-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
              <span className='text-orange-800 font-bold text-lg tracking-wide'>
                NEDEN KATILMALISINIZ
              </span>
            </div>
            <h2 className='text-4xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight'>
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600'>
                Sadece Rehberlik Değil,
              </span>
              <br />
              Sürdürülebilir Büyüme Altyapısı
            </h2>
            <p className='text-2xl text-gray-600 max-w-5xl mx-auto leading-relaxed'>
              Çünkü bu program, sadece rehberlik değil;{' '}
              <strong className='text-orange-700'>
                görev tanımlı, dijital tabanlı ve sürdürülebilir bir büyüme
                altyapısı
              </strong>{' '}
              sunar. Her adım planlanmış, her süreç ölçümlenmiş, her sonuç
              garantilenmiş bir dönüşüm deneyimi yaşayacaksınız.
            </p>
          </div>
          {/* Özellikler Grid */}
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
            {/* Özellik 1 */}
            <div className='group bg-white rounded-3xl p-8 shadow-xl border border-orange-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-checkbox-multiple-line text-white text-3xl w-10 h-10 flex items-center justify-center'></i>
                </div>
                <h4 className='text-xl font-bold text-gray-900 mb-4'>
                  Görev Tanımlı Süreç
                </h4>
                <p className='text-gray-600 leading-relaxed'>
                  Her adım net olarak tanımlanmış, ölçümlenebilir görevlere
                  bölünmüş. Ne yapacağınızı her zaman bilirsiniz, hiç
                  kaybolmazsınız.
                </p>
              </div>
            </div>
            {/* Özellik 2 */}
            <div className='group bg-white rounded-3xl p-8 shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-computer-line text-white text-3xl w-10 h-10 flex items-center justify-center'></i>
                </div>
                <h4 className='text-xl font-bold text-gray-900 mb-4'>
                  Dijital Tabanlı Platform
                </h4>
                <p className='text-gray-600 leading-relaxed'>
                  Tüm süreçler dijital platformda yönetiliyor. Kağıt karmaşası
                  yok, her şey düzenli, erişilebilir ve otomatik olarak
                  yedekleniyor.
                </p>
              </div>
            </div>
            {/* Özellik 3 */}
            <div className='group bg-white rounded-3xl p-8 shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-recycle-line text-white text-3xl w-10 h-10 flex items-center justify-center'></i>
                </div>
                <h4 className='text-xl font-bold text-gray-900 mb-4'>
                  Sürdürülebilir Model
                </h4>
                <p className='text-gray-600 leading-relaxed'>
                  Program bittikten sonra da devam edebileceğiniz sistemler
                  kuruluyor. Bir kez öğreniyorsunuz, ömür boyu kullanıyorsunuz.
                </p>
              </div>
            </div>
            {/* Özellik 4 */}
            <div className='group bg-white rounded-3xl p-8 shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-shield-check-line text-white text-3xl w-10 h-10 flex items-center justify-center'></i>
                </div>
                <h4 className='text-xl font-bold text-gray-900 mb-4'>
                  Garantili Sonuç
                </h4>
                <p className='text-gray-600 leading-relaxed'>
                  Sadece teori değil, pratik sonuçlar. Pazaryeri hesapları
                  açılıyor, siparişler alınmaya başlanıyor, ölçümlenebilir
                  büyüme sağlanıyor.
                </p>
              </div>
            </div>
            {/* Özellik 5 */}
            <div className='group bg-white rounded-3xl p-8 shadow-xl border border-indigo-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-team-line text-white text-3xl w-10 h-10 flex items-center justify-center'></i>
                </div>
                <h4 className='text-xl font-bold text-gray-900 mb-4'>
                  Uzman Ekip Desteği
                </h4>
                <p className='text-gray-600 leading-relaxed'>
                  Sadece teorik bilgi değil, deneyimli uzmanların bire bir
                  mentorluk desteği. Her konuda yanınızda olan profesyonel ekip.
                </p>
              </div>
            </div>
            {/* Özellik 6 */}
            <div className='group bg-white rounded-3xl p-8 shadow-xl border border-pink-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                  <i className='ri-global-line text-white text-3xl w-10 h-10 flex items-center justify-center'></i>
                </div>
                <h4 className='text-xl font-bold text-gray-900 mb-4'>
                  Küresel Ağ Erişimi
                </h4>
                <p className='text-gray-600 leading-relaxed'>
                  Dünya çapında pazarlara erişim, uluslararası iş ortaklıkları
                  ve global ticaret ağının bir parçası olmak için gereken tüm
                  altyapı.
                </p>
              </div>
            </div>
          </div>
          {/* CTA Alanı */}
          <div className='bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-3xl p-12 text-white text-center shadow-2xl'>
            <div className='max-w-4xl mx-auto'>
              <h3 className='text-3xl lg:text-4xl font-bold mb-6'>
                Geleneksel Danışmanlığın Ötesinde Bir Deneyim
              </h3>
              <p className='text-xl text-orange-100 mb-8 leading-relaxed'>
                Bu sadece bir eğitim programı değil, işinizi köklü olarak
                dönüştürecek, küresel pazarlarda kalıcı başarı sağlayacak bir
                sistemdir. Dönüşümünüz bugün başlasın!
              </p>
              <div className='flex flex-col sm:flex-row gap-6 justify-center'>
                <Link
                  href='/hemen-baslat'
                  className='inline-flex items-center bg-white text-orange-600 px-10 py-5 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-xl text-xl'
                >
                  <i className='ri-rocket-2-line mr-3 w-6 h-6 flex items-center justify-center'></i>
                  Hemen Başlat
                </Link>
                <Link
                  href='/detayli-bilgi'
                  className='inline-flex items-center bg-transparent border-2 border-white text-white px-10 py-5 rounded-2xl font-bold hover:bg-white hover:text-orange-600 transition-all duration-300 cursor-pointer whitespace-nowrap text-xl'
                >
                  <i className='ri-information-line mr-3 w-6 h-6 flex items-center justify-center'></i>
                  Detaylı Bilgi Al
                </Link>
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
