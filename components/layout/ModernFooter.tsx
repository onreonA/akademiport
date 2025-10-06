'use client';
import Link from 'next/link';
export default function ModernFooter() {
  return (
    <footer className='relative bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 text-white'>
      {/* Decorative Top Border */}
      <div className='h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500'></div>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl'></div>
        <div className='absolute bottom-20 right-20 w-40 h-40 bg-purple-400 rounded-full blur-3xl'></div>
        <div className='absolute top-1/2 left-1/3 w-24 h-24 bg-green-400 rounded-full blur-2xl'></div>
      </div>
      <div className='relative py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Main Footer Content */}
          <div className='grid lg:grid-cols-5 gap-8 mb-12'>
            {/* Brand Column */}
            <div className='lg:col-span-2'>
              <div className='mb-6'>
                <div className='flex items-center mb-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg'>
                    <i className='ri-global-line text-white text-xl w-6 h-6 flex items-center justify-center'></i>
                  </div>
                  <span className="font-['Pacifico'] text-2xl text-white">
                    İhracat Akademi
                  </span>
                </div>
                <p className='text-gray-300 text-lg leading-relaxed mb-6'>
                  Türkiye&apos;nin e-ihracat dönüşüm platformu. Küresel
                  büyümenin kapılarını açıyor, firmaları uluslararası pazarlarda
                  başarıya ulaştırıyoruz.
                </p>
                {/* Stats */}
                <div className='grid grid-cols-3 gap-4 mb-6'>
                  <div className='text-center bg-white/5 rounded-lg p-3 backdrop-blur-sm'>
                    <div className='text-xl font-bold text-blue-400'>1000+</div>
                    <div className='text-gray-400 text-xs'>Başarılı Firma</div>
                  </div>
                  <div className='text-center bg-white/5 rounded-lg p-3 backdrop-blur-sm'>
                    <div className='text-xl font-bold text-purple-400'>50+</div>
                    <div className='text-gray-400 text-xs'>Hedef Ülke</div>
                  </div>
                  <div className='text-center bg-white/5 rounded-lg p-3 backdrop-blur-sm'>
                    <div className='text-xl font-bold text-green-400'>%300</div>
                    <div className='text-gray-400 text-xs'>Ciro Artışı</div>
                  </div>
                </div>
              </div>
              {/* Social Media */}
              <div>
                <h4 className='text-white font-semibold mb-4 flex items-center'>
                  <i className='ri-share-line mr-2 w-5 h-5 flex items-center justify-center'></i>
                  Sosyal Medya
                </h4>
                <div className='flex space-x-3'>
                  <a
                    href='#'
                    className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer'
                  >
                    <i className='ri-linkedin-fill text-white w-5 h-5 flex items-center justify-center'></i>
                  </a>
                  <a
                    href='#'
                    className='w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer'
                  >
                    <i className='ri-instagram-line text-white w-5 h-5 flex items-center justify-center'></i>
                  </a>
                  <a
                    href='#'
                    className='w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer'
                  >
                    <i className='ri-youtube-line text-white w-5 h-5 flex items-center justify-center'></i>
                  </a>
                  <a
                    href='#'
                    className='w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer'
                  >
                    <i className='ri-twitter-line text-white w-5 h-5 flex items-center justify-center'></i>
                  </a>
                </div>
              </div>
            </div>
            {/* Platform Services */}
            <div>
              <h3 className='text-white text-lg font-bold mb-6 flex items-center'>
                <i className='ri-rocket-line mr-2 w-5 h-5 flex items-center justify-center text-blue-400'></i>
                Platform Hizmetleri
              </h3>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href='/program-hakkinda'
                    className='text-gray-300 hover:text-blue-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Program Hakkında
                  </Link>
                </li>
                <li>
                  <Link
                    href='/platform-ozellikleri'
                    className='text-gray-300 hover:text-purple-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Platform Özellikleri
                  </Link>
                </li>
                <li>
                  <Link
                    href='/destekler'
                    className='text-gray-300 hover:text-green-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Destekler
                  </Link>
                </li>
                <li>
                  <Link
                    href='/basari-hikayeleri'
                    className='text-gray-300 hover:text-orange-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Başarı Hikayeleri
                  </Link>
                </li>
              </ul>
            </div>
            {/* Support & Help */}
            <div>
              <h3 className='text-white text-lg font-bold mb-6 flex items-center'>
                <i className='ri-customer-service-2-line mr-2 w-5 h-5 flex items-center justify-center text-purple-400'></i>
                Destek & Yardım
              </h3>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href='/sss'
                    className='text-gray-300 hover:text-blue-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Sık Sorulan Sorular
                  </Link>
                </li>
                <li>
                  <Link
                    href='/iletisim-basvuru'
                    className='text-gray-300 hover:text-green-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    İletişim & Başvuru
                  </Link>
                </li>
                <li>
                  <Link
                    href='/yardim-merkezi'
                    className='text-gray-300 hover:text-purple-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Yardım Merkezi
                  </Link>
                </li>
                <li>
                  <Link
                    href='/kariyer'
                    className='text-gray-300 hover:text-orange-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Kariyer
                  </Link>
                </li>
              </ul>
            </div>
            {/* Legal & Policies */}
            <div>
              <h3 className='text-white text-lg font-bold mb-6 flex items-center'>
                <i className='ri-shield-check-line mr-2 w-5 h-5 flex items-center justify-center text-green-400'></i>
                Yasal & Politikalar
              </h3>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href='/gizlilik-politikasi'
                    className='text-gray-300 hover:text-blue-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link
                    href='/kullanim-kosullari'
                    className='text-gray-300 hover:text-purple-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Kullanım Koşulları
                  </Link>
                </li>
                <li>
                  <Link
                    href='/cerez-politikasi'
                    className='text-gray-300 hover:text-green-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    Çerez Politikası
                  </Link>
                </li>
                <li>
                  <Link
                    href='/kvkk-aydinlatma'
                    className='text-gray-300 hover:text-orange-400 transition-colors duration-300 cursor-pointer flex items-center group'
                  >
                    <i className='ri-arrow-right-s-line mr-2 w-4 h-4 flex items-center justify-center group-hover:translate-x-1 transition-transform'></i>
                    KVKK Aydınlatma
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {/* Newsletter Subscription */}
          <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/10'>
            <div className='grid md:grid-cols-2 gap-8 items-center'>
              <div>
                <h3 className='text-2xl font-bold text-white mb-2 flex items-center'>
                  <i className='ri-mail-line mr-3 w-6 h-6 flex items-center justify-center text-blue-400'></i>
                  E-İhracat Güncellemeleri
                </h3>
                <p className='text-gray-300'>
                  Yeni eğitimler, başarı hikayeleri ve özel fırsatlardan
                  haberdar olun.
                </p>
              </div>
              <div>
                <div className='flex'>
                  <input
                    type='email'
                    placeholder='E-posta adresinizi girin...'
                    className='flex-1 px-4 py-3 rounded-l-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <button className='px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-r-xl font-semibold text-white transition-all duration-300 cursor-pointer whitespace-nowrap'>
                    <i className='ri-send-plane-line w-5 h-5 flex items-center justify-center'></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Bar */}
          <div className='border-t border-white/10 pt-8'>
            <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
              {/* Copyright */}
              <div className='flex items-center space-x-4'>
                <p className='text-gray-400'>
                  © 2024 İhracat Akademi. Tüm hakları saklıdır.
                </p>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                  <span className='text-green-400 text-sm font-medium'>
                    Güvenli Platform
                  </span>
                </div>
              </div>
              {/* Additional Links */}
              <div className='flex items-center space-x-6 text-sm'>
                <Link
                  href='/sitemap'
                  className='text-gray-400 hover:text-white transition-colors cursor-pointer'
                >
                  Site Haritası
                </Link>
                <Link
                  href='/rss'
                  className='text-gray-400 hover:text-white transition-colors cursor-pointer'
                >
                  RSS
                </Link>
                <div className='flex items-center space-x-2'>
                  <i className='ri-shield-check-fill text-green-400 w-4 h-4 flex items-center justify-center'></i>
                  <span className='text-gray-400'>SSL Sertifikalı</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Floating Action Button */}
      <div className='fixed bottom-6 right-6 z-50'>
        <button className='w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl text-white transition-all duration-300 cursor-pointer flex items-center justify-center group animate-pulse hover:animate-none'>
          <i className='ri-customer-service-2-line text-xl w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform'></i>
        </button>
      </div>
    </footer>
  );
}
