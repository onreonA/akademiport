'use client';
import { useState } from 'react';

import ModernNavigation from '@/components/layout/ModernNavigation';
export default function ContactPage() {
  const [formData, setFormData] = useState({
    firmaAdi: '',
    adSoyad: '',
    email: '',
    telefon: '',
    webSitesi: '',
    sektor: '',
    kapasiteAciklama: '',
    aciklama: '',
    kvkkOnay: false,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firmaAdi.trim()) {
      newErrors.firmaAdi = 'Firma adı gereklidir';
    }
    if (!formData.adSoyad.trim()) {
      newErrors.adSoyad = 'Ad soyad gereklidir';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    if (!formData.telefon.trim()) {
      newErrors.telefon = 'Telefon numarası gereklidir';
    }
    if (!formData.sektor.trim()) {
      newErrors.sektor = 'Sektör seçimi gereklidir';
    }
    if (!formData.kvkkOnay) {
      newErrors.kvkkOnay = 'KVKK metnini onaylamanız gereklidir';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Form submission logic here
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      // Reset form
      setFormData({
        firmaAdi: '',
        adSoyad: '',
        email: '',
        telefon: '',
        webSitesi: '',
        sektor: '',
        kapasiteAciklama: '',
        aciklama: '',
        kvkkOnay: false,
      });
    }
  };
  const sektorler = [
    'Tekstil ve Konfeksiyon',
    'Gıda ve İçecek',
    'Otomotiv',
    'Makine ve Ekipman',
    'Kimya ve Petrokimya',
    'Elektronik ve Teknoloji',
    'Mobilya ve Dekorasyon',
    'İnşaat Malzemeleri',
    'Tarım ve Hayvancılık',
    'Diğer',
  ];
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      <ModernNavigation />
      {/* Hero Section */}
      <section className='bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden'>
        <div className='absolute inset-0 bg-black/20'></div>
        <div
          className='absolute inset-0 opacity-30'
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20office%20building%20with%20glass%20facade%2C%20professional%20business%20environment%2C%20corporate%20headquarters%20with%20blue%20sky%2C%20architectural%20photography%20with%20clean%20lines%20and%20contemporary%20design&width=1200&height=600&seq=contact-hero&orientation=landscape')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-5xl font-bold text-white mb-6'>
              İletişim ve Başvuru
            </h1>
            <p className='text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed'>
              Sorularınızı iletebilir, programımıza başvuruda bulunabilirsiniz.
              Size en kısa sürede dönüş sağlayacağız.
            </p>
          </div>
        </div>
      </section>
      {/* Main Contact Section */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-16'>
            {/* Left Block - Contact Information */}
            <div className='space-y-8'>
              {/* Company Info */}
              <div className='bg-white rounded-2xl shadow-lg p-8'>
                <div className='flex items-center space-x-4 mb-6'>
                  <div className='w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center'>
                    <i className='ri-global-line text-white text-3xl w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      İhracat Akademi
                    </h2>
                    <p className='text-blue-600 font-medium'>
                      E-İhracat Dönüşüm Platformu
                    </p>
                  </div>
                </div>
                <p className='text-gray-600 leading-relaxed'>
                  Türk firmalarının global pazarlarda başarılı olması için
                  gereken tüm desteği sağlayan, teknoloji ve uzmanlık
                  birlikteliğini sunan dijital dönüşüm platformunuz.
                </p>
              </div>
              {/* Contact Details */}
              <div className='bg-white rounded-2xl shadow-lg p-8'>
                <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
                  <i className='ri-contacts-line text-blue-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
                  İletişim Bilgileri
                </h3>
                <div className='space-y-6'>
                  {/* Address */}
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center'>
                      <i className='ri-map-pin-line text-blue-600 w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>Adres</h4>
                      <p className='text-gray-600'>
                        Büyükdere Caddesi No: 195
                        <br />
                        Tekfen Tower Kat: 15
                        <br />
                        34394 Şişli / İstanbul
                      </p>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center'>
                      <i className='ri-phone-line text-green-600 w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>Telefon</h4>
                      <p className='text-gray-600'>+90 212 555 0123</p>
                      <p className='text-green-600 font-medium'>
                        WhatsApp: +90 532 555 0123
                      </p>
                    </div>
                  </div>
                  {/* Email */}
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center'>
                      <i className='ri-mail-line text-purple-600 w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>E-posta</h4>
                      <p className='text-gray-600'>info@ihracatakademi.com</p>
                      <p className='text-gray-600'>destek@ihracatakademi.com</p>
                    </div>
                  </div>
                  {/* Working Hours */}
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center'>
                      <i className='ri-time-line text-orange-600 w-6 h-6 flex items-center justify-center'></i>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>
                        Çalışma Saatleri
                      </h4>
                      <p className='text-gray-600'>
                        Pazartesi - Cuma: 09:00 - 18:00
                      </p>
                      <p className='text-gray-600'>Cumartesi: 09:00 - 13:00</p>
                      <p className='text-gray-500'>Pazar: Kapalı</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Social Media */}
              <div className='bg-white rounded-2xl shadow-lg p-8'>
                <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
                  <i className='ri-share-line text-blue-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
                  Sosyal Medya
                </h3>
                <div className='flex space-x-4'>
                  <a
                    href='#'
                    className='w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer'
                  >
                    <i className='ri-linkedin-fill w-6 h-6 flex items-center justify-center'></i>
                  </a>
                  <a
                    href='#'
                    className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer'
                  >
                    <i className='ri-instagram-fill w-6 h-6 flex items-center justify-center'></i>
                  </a>
                  <a
                    href='#'
                    className='w-12 h-12 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer'
                  >
                    <i className='ri-youtube-fill w-6 h-6 flex items-center justify-center'></i>
                  </a>
                  <a
                    href='#'
                    className='w-12 h-12 bg-blue-400 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer'
                  >
                    <i className='ri-twitter-fill w-6 h-6 flex items-center justify-center'></i>
                  </a>
                </div>
              </div>
            </div>
            {/* Right Block - Application Form */}
            <div className='bg-white rounded-2xl shadow-lg p-8'>
              <div className='mb-8'>
                <h2 className='text-2xl font-bold text-gray-900 mb-2 flex items-center'>
                  <i className='ri-file-text-line text-blue-600 mr-3 w-7 h-7 flex items-center justify-center'></i>
                  Başvuru Formu
                </h2>
                <p className='text-gray-600'>
                  Program hakkında detaylı bilgi almak ve başvuru yapmak için
                  formu doldurun.
                </p>
              </div>
              {/* Success Message */}
              {showSuccess && (
                <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <div className='flex items-center'>
                    <i className='ri-checkbox-circle-line text-green-600 mr-3 w-6 h-6 flex items-center justify-center'></i>
                    <div>
                      <h4 className='font-semibold text-green-800'>
                        Başvurunuz Alındı!
                      </h4>
                      <p className='text-green-700'>
                        En kısa sürede size dönüş yapacağız.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <form
                id='basvuru-formu'
                onSubmit={handleSubmit}
                className='space-y-6'
              >
                {/* Firma Adı */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Firma Adı <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='firmaAdi'
                    value={formData.firmaAdi}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.firmaAdi ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='Şirket adınızı giriniz'
                  />
                  {errors.firmaAdi && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.firmaAdi}
                    </p>
                  )}
                </div>
                {/* Ad Soyad */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Ad Soyad <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='adSoyad'
                    value={formData.adSoyad}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.adSoyad ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='Adınızı ve soyadınızı giriniz'
                  />
                  {errors.adSoyad && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.adSoyad}
                    </p>
                  )}
                </div>
                {/* Email */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    E-posta <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='ornek@sirket.com'
                  />
                  {errors.email && (
                    <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
                  )}
                </div>
                {/* Telefon */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Telefon <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='tel'
                    name='telefon'
                    value={formData.telefon}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.telefon ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='+90 555 123 45 67'
                  />
                  {errors.telefon && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.telefon}
                    </p>
                  )}
                </div>
                {/* Web Sitesi */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Web Sitesi (İsteğe Bağlı)
                  </label>
                  <input
                    type='url'
                    name='webSitesi'
                    value={formData.webSitesi}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                    placeholder='https://www.sirketiniz.com'
                  />
                </div>
                {/* Sektör */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Sektör <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='sektor'
                    value={formData.sektor}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.sektor ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value=''>Sektör seçiniz</option>
                    {sektorler.map(sektor => (
                      <option key={sektor} value={sektor}>
                        {sektor}
                      </option>
                    ))}
                  </select>
                  {errors.sektor && (
                    <p className='mt-1 text-sm text-red-600'>{errors.sektor}</p>
                  )}
                </div>
                {/* Kapasite */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Aylık İhracat / Üretim Kapasitesi (İsteğe Bağlı)
                  </label>
                  <input
                    type='text'
                    name='kapasiteAciklama'
                    value={formData.kapasiteAciklama}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                    placeholder='Örn: Aylık 500.000$ ihracat yapıyoruz'
                  />
                </div>
                {/* Açıklama */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Açıklama ve Beklentileriniz
                  </label>
                  <textarea
                    name='aciklama'
                    value={formData.aciklama}
                    onChange={handleInputChange}
                    maxLength={500}
                    rows={4}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none'
                    placeholder='Programdan beklentilerinizi ve sorularınızı yazabilirsiniz...'
                  />
                  <div className='text-right text-sm text-gray-500 mt-1'>
                    {formData.aciklama.length}/500
                  </div>
                </div>
                {/* KVKK Checkbox */}
                <div>
                  <label className='flex items-start space-x-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      name='kvkkOnay'
                      checked={formData.kvkkOnay}
                      onChange={handleInputChange}
                      className='mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                    />
                    <span
                      className={`text-sm ${errors.kvkkOnay ? 'text-red-600' : 'text-gray-600'}`}
                    >
                      <span className='text-red-500'>*</span> Kişisel
                      verilerimin İhracat Akademi tarafından işlenmesini ve
                      <a href='#' className='text-blue-600 hover:underline'>
                        {' '}
                        Gizlilik Politikası
                      </a>{' '}
                      kapsamında kullanılmasını kabul ediyorum.
                    </span>
                  </label>
                  {errors.kvkkOnay && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.kvkkOnay}
                    </p>
                  )}
                </div>
                {/* Submit Button */}
                <button
                  type='submit'
                  className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center'
                >
                  <i className='ri-send-plane-line mr-3 w-5 h-5 flex items-center justify-center'></i>
                  Başvuruyu Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      {/* Additional Info Section */}
      <section className='bg-white py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>
                Sorularınız mı var?
              </h2>
              <p className='text-lg text-gray-600 mb-8 leading-relaxed'>
                Program hakkında merak ettiklerinizi SSS bölümümüzde bulabilir,
                detaylı bilgi için bizimle iletişime geçebilirsiniz.
              </p>
              <div className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <i className='ri-check-line text-green-600 w-6 h-6 flex items-center justify-center'></i>
                  <span className='text-gray-700'>
                    24 saat içinde geri dönüş garantisi
                  </span>
                </div>
                <div className='flex items-center space-x-3'>
                  <i className='ri-check-line text-green-600 w-6 h-6 flex items-center justify-center'></i>
                  <span className='text-gray-700'>
                    Ücretsiz ön değerlendirme
                  </span>
                </div>
                <div className='flex items-center space-x-3'>
                  <i className='ri-check-line text-green-600 w-6 h-6 flex items-center justify-center'></i>
                  <span className='text-gray-700'>Kişiye özel danışmanlık</span>
                </div>
              </div>
              <div className='mt-8 flex flex-wrap gap-4'>
                <a
                  href='/sss'
                  className='bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer whitespace-nowrap'
                >
                  SSS Bölümünü Ziyaret Et
                </a>
                <a
                  href='tel:+902125550123'
                  className='bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center'
                >
                  <i className='ri-phone-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                  Hemen Arayın
                </a>
              </div>
            </div>
            <div className='relative'>
              <div
                className='aspect-video rounded-2xl shadow-xl'
                style={{
                  backgroundImage: `url('https://readdy.ai/api/search-image?query=professional%20business%20team%20meeting%20in%20modern%20office%20conference%20room%2C%20diverse%20group%20of%20people%20collaborating%20around%20table%20with%20laptops%20and%20documents%2C%20natural%20lighting%20from%20large%20windows%2C%20corporate%20consultation%20atmosphere&width=600&height=400&seq=contact-meeting&orientation=landscape')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>
      {/* Map Section */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Ofisimizi Ziyaret Edin
            </h2>
            <p className='text-lg text-gray-600'>
              İstanbul Şişli&apos;deki ofisimizde sizleri ağırlamaktan
              memnuniyet duyarız.
            </p>
          </div>
          <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.8256950659!2d28.99453731549403!3d41.06487227929421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2zQsO8ecO8a2RlcmUgQ2QsIMWeacWfbGkvxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1699123456789!5m2!1str!2str'
              width='100%'
              height='450'
              style={{ border: 0 }}
              allowFullScreen
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
              className='w-full'
            ></iframe>
          </div>
        </div>
      </section>
      {/* Footer placeholder */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='flex items-center justify-center space-x-3 mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center'>
                <i className='ri-global-line text-white text-2xl w-7 h-7 flex items-center justify-center'></i>
              </div>
              <span className='font-bold text-2xl'>İhracat Akademi</span>
            </div>
            <p className='text-gray-400 mb-6'>
              Türk firmalarının global başarısı için teknoloji ve uzmanlık
              birlikteliği
            </p>
            <div className='flex justify-center space-x-6'>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer'
              >
                <i className='ri-linkedin-fill w-6 h-6 flex items-center justify-center'></i>
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer'
              >
                <i className='ri-instagram-fill w-6 h-6 flex items-center justify-center'></i>
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer'
              >
                <i className='ri-youtube-fill w-6 h-6 flex items-center justify-center'></i>
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors cursor-pointer'
              >
                <i className='ri-twitter-fill w-6 h-6 flex items-center justify-center'></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
