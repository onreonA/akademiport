/**
 * İletişim ve Başvuru Sayfası
 * Sprint 22: Public Website
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { Input } from '@/1-presentation/components/ui/atoms/input';
import { Textarea } from '@/1-presentation/components/ui/atoms/textarea';
import { Label } from '@/1-presentation/components/ui/atoms/label';
import { Checkbox } from '@/1-presentation/components/ui/atoms/checkbox';
import { ModernNavigation } from '@/1-presentation/components/features/layout/ModernNavigation';
import { ModernFooter } from '@/1-presentation/components/features/layout/ModernFooter';
import {
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  Share2,
  FileText,
  Send,
  CheckCircle2,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function IletisimBasvuru() {
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: API call to submit form
      toast.success('Başvurunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ModernNavigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">İletişim ve Başvuru</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Sorularınızı iletebilir, programımıza başvuruda bulunabilirsiniz. Size en kısa sürede
              dönüş sağlayacağız.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Block - Contact Information */}
            <div className="space-y-8">
              {/* Company Info */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                    <Globe className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Akademi Port</h2>
                    <p className="text-blue-600 font-medium">E-İhracat Dönüşüm Platformu</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Türk firmalarının global pazarlarda başarılı olması için gereken tüm desteği
                  sağlayan, teknoloji ve uzmanlık birlikteliğini sunan dijital dönüşüm platformunuz.
                </p>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Phone className="text-blue-600 mr-3 w-6 h-6" />
                  İletişim Bilgileri
                </h3>
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <MapPin className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Adres</h4>
                      <p className="text-gray-600">
                        Büyükdere Caddesi No: 195
                        <br />
                        Tekfen Tower Kat: 15
                        <br />
                        34394 Şişli / İstanbul
                      </p>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <Phone className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Telefon</h4>
                      <p className="text-gray-600">+90 212 555 0123</p>
                      <p className="text-green-600 font-medium">WhatsApp: +90 532 555 0123</p>
                    </div>
                  </div>
                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Mail className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">E-posta</h4>
                      <p className="text-gray-600">info@akademiport.com</p>
                      <p className="text-gray-600">destek@akademiport.com</p>
                    </div>
                  </div>
                  {/* Working Hours */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Clock className="text-orange-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Çalışma Saatleri</h4>
                      <p className="text-gray-600">Pazartesi - Cuma: 09:00 - 18:00</p>
                      <p className="text-gray-600">Cumartesi: 09:00 - 13:00</p>
                      <p className="text-gray-500">Pazar: Kapalı</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Share2 className="text-blue-600 mr-3 w-6 h-6" />
                  Sosyal Medya
                </h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <Youtube className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-blue-400 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Block - Application Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="text-blue-600 mr-3 w-7 h-7" />
                  Başvuru Formu
                </h2>
                <p className="text-gray-600">
                  Program hakkında detaylı bilgi almak ve başvuru yapmak için formu doldurun.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Firma Adı */}
                <div>
                  <Label htmlFor="firmaAdi">
                    Firma Adı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firmaAdi"
                    name="firmaAdi"
                    value={formData.firmaAdi}
                    onChange={handleInputChange}
                    placeholder="Şirket adınızı giriniz"
                    className={errors.firmaAdi ? 'border-red-500' : ''}
                  />
                  {errors.firmaAdi && (
                    <p className="mt-1 text-sm text-red-600">{errors.firmaAdi}</p>
                  )}
                </div>

                {/* Ad Soyad */}
                <div>
                  <Label htmlFor="adSoyad">
                    Ad Soyad <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="adSoyad"
                    name="adSoyad"
                    value={formData.adSoyad}
                    onChange={handleInputChange}
                    placeholder="Adınızı ve soyadınızı giriniz"
                    className={errors.adSoyad ? 'border-red-500' : ''}
                  />
                  {errors.adSoyad && <p className="mt-1 text-sm text-red-600">{errors.adSoyad}</p>}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">
                    E-posta <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ornek@sirket.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Telefon */}
                <div>
                  <Label htmlFor="telefon">
                    Telefon <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telefon"
                    name="telefon"
                    type="tel"
                    value={formData.telefon}
                    onChange={handleInputChange}
                    placeholder="+90 555 123 45 67"
                    className={errors.telefon ? 'border-red-500' : ''}
                  />
                  {errors.telefon && <p className="mt-1 text-sm text-red-600">{errors.telefon}</p>}
                </div>

                {/* Web Sitesi */}
                <div>
                  <Label htmlFor="webSitesi">Web Sitesi (İsteğe Bağlı)</Label>
                  <Input
                    id="webSitesi"
                    name="webSitesi"
                    type="url"
                    value={formData.webSitesi}
                    onChange={handleInputChange}
                    placeholder="https://www.sirketiniz.com"
                  />
                </div>

                {/* Sektör */}
                <div>
                  <Label htmlFor="sektor">
                    Sektör <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="sektor"
                    name="sektor"
                    value={formData.sektor}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.sektor ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sektör seçiniz</option>
                    {sektorler.map((sektor) => (
                      <option key={sektor} value={sektor}>
                        {sektor}
                      </option>
                    ))}
                  </select>
                  {errors.sektor && <p className="mt-1 text-sm text-red-600">{errors.sektor}</p>}
                </div>

                {/* Kapasite */}
                <div>
                  <Label htmlFor="kapasiteAciklama">
                    Aylık İhracat / Üretim Kapasitesi (İsteğe Bağlı)
                  </Label>
                  <Input
                    id="kapasiteAciklama"
                    name="kapasiteAciklama"
                    value={formData.kapasiteAciklama}
                    onChange={handleInputChange}
                    placeholder="Örn: Aylık 500.000$ ihracat yapıyoruz"
                  />
                </div>

                {/* Açıklama */}
                <div>
                  <Label htmlFor="aciklama">Açıklama ve Beklentileriniz</Label>
                  <Textarea
                    id="aciklama"
                    name="aciklama"
                    value={formData.aciklama}
                    onChange={handleInputChange}
                    maxLength={500}
                    rows={4}
                    placeholder="Programdan beklentilerinizi ve sorularınızı yazabilirsiniz..."
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {formData.aciklama.length}/500
                  </div>
                </div>

                {/* KVKK Checkbox */}
                <div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="kvkkOnay"
                      name="kvkkOnay"
                      checked={formData.kvkkOnay}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, kvkkOnay: checked as boolean }))
                      }
                    />
                    <Label
                      htmlFor="kvkkOnay"
                      className={errors.kvkkOnay ? 'text-red-600' : 'text-gray-600'}
                    >
                      <span className="text-red-500">*</span> Kişisel verilerimin Akademi Port
                      tarafından işlenmesini ve{' '}
                      <Link href="/gizlilik-politikasi" className="text-blue-600 hover:underline">
                        Gizlilik Politikası
                      </Link>{' '}
                      kapsamında kullanılmasını kabul ediyorum.
                    </Label>
                  </div>
                  {errors.kvkkOnay && (
                    <p className="mt-1 text-sm text-red-600">{errors.kvkkOnay}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Send className="mr-3 w-5 h-5" />
                  Başvuruyu Gönder
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Sorularınız mı var?</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Program hakkında merak ettiklerinizi SSS bölümümüzde bulabilir, detaylı bilgi için
                bizimle iletişime geçebilirsiniz.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="text-green-600 w-6 h-6" />
                  <span className="text-gray-700">24 saat içinde geri dönüş garantisi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="text-green-600 w-6 h-6" />
                  <span className="text-gray-700">Ücretsiz ön değerlendirme</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="text-green-600 w-6 h-6" />
                  <span className="text-gray-700">Kişiye özel danışmanlık</span>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild variant="outline">
                  <Link href="/sss">SSS Bölümünü Ziyaret Et</Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <a href="tel:+902125550123">
                    <Phone className="mr-2 w-5 h-5" />
                    Hemen Arayın
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <Globe className="w-32 h-32 text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ofisimizi Ziyaret Edin</h2>
            <p className="text-lg text-gray-600">
              İstanbul Şişli&apos;deki ofisimizde sizleri ağırlamaktan memnuniyet duyarız.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.8256950659!2d28.99453731549403!3d41.06487227929421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2zQsO8ecO8a2RlcmUgQ2QsIMWeacWfbGkvxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1699123456789!5m2!1str!2str"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
