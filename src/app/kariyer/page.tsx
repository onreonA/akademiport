/**
 * Kariyer Sayfası
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
  Briefcase,
  User,
  GraduationCap,
  Users,
  ArrowRight,
  CheckCircle2,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Rocket,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/1-presentation/lib/utils';
import { toast } from 'sonner';

const tabs = [
  {
    id: 'consultant',
    label: 'Danışman',
    icon: User,
    color: 'blue',
    description: 'E-ihracat ve dijital dönüşüm alanında uzman danışmanlar arıyoruz',
  },
  {
    id: 'intern',
    label: 'Stajyer',
    icon: GraduationCap,
    color: 'orange',
    description: 'Geleceğin uzmanlarını yetiştirmek için stajyer programımıza katılın',
  },
  {
    id: 'hr',
    label: 'Firma İK',
    icon: Users,
    color: 'purple',
    description: 'Firmalar için insan kaynakları ve işe alım uzmanları',
  },
];

const expertiseAreas = [
  'E-İhracat Danışmanlığı',
  'Dijital Pazarlama',
  'Uluslararası Ticaret',
  'Gümrük ve Lojistik',
  'Finansal Danışmanlık',
  'Hukuki Danışmanlık',
  'Teknoloji Entegrasyonu',
  'Proje Yönetimi',
];

export default function KariyerPage() {
  const [activeTab, setActiveTab] = useState('consultant');
  const [consultantForm, setConsultantForm] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: [] as string[],
    education: '',
    experience: '',
    cv: null as File | null,
    kvkk: false,
  });
  const [internForm, setInternForm] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    graduationYear: '',
    interests: '',
    cv: null as File | null,
    kvkk: false,
  });
  const [hrForm, setHrForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    cv: null as File | null,
    kvkk: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExpertiseChange = (area: string) => {
    setConsultantForm((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(area)
        ? prev.expertise.filter((item) => item !== area)
        : [...prev.expertise, area],
    }));
  };

  const handleSubmit = async (e: React.FormEvent, formType: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // TODO: API call to submit application
      toast.success('Başvurunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
      // Reset form based on type
      if (formType === 'consultant') {
        setConsultantForm({
          name: '',
          email: '',
          phone: '',
          expertise: [],
          education: '',
          experience: '',
          cv: null,
          kvkk: false,
        });
      } else if (formType === 'intern') {
        setInternForm({
          name: '',
          email: '',
          phone: '',
          school: '',
          graduationYear: '',
          interests: '',
          cv: null,
          kvkk: false,
        });
      } else {
        setHrForm({
          name: '',
          email: '',
          phone: '',
          position: '',
          experience: '',
          cv: null,
          kvkk: false,
        });
      }
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab)!;
  const TabIcon = activeTabData.icon;

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <ModernNavigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Briefcase className="text-blue-400 mr-2 w-5 h-5" />
            <span className="text-white font-medium">KARİYER FIRSATLARI</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Geleceği Birlikte
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {' '}
              Şekillendirelim
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Türkiye&apos;nin e-ihracat dönüşümüne öncülük eden ekibimize katılın. Yenilikçi
            projelerde çalışın, kariyerinizi bir üst seviyeye taşıyın.
          </p>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex flex-col lg:flex-row gap-4 mb-12 max-w-4xl mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-300',
                    isActive
                      ? `bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-700 text-white shadow-lg`
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                  )}
                >
                  <Icon className={cn('mr-3 w-5 h-5', isActive && 'text-white')} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div
                  className={cn(
                    'w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4'
                  )}
                >
                  <TabIcon className="text-white w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    {activeTabData.label} Başvurusu
                  </h2>
                  <p className="text-gray-600">{activeTabData.description}</p>
                </div>
              </div>
            </div>

            {/* Consultant Form */}
            {activeTab === 'consultant' && (
              <form onSubmit={(e) => handleSubmit(e, 'consultant')} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="consultant-name">
                      Ad Soyad <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="consultant-name"
                      value={consultantForm.name}
                      onChange={(e) =>
                        setConsultantForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultant-email">
                      E-posta <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="consultant-email"
                      type="email"
                      value={consultantForm.email}
                      onChange={(e) =>
                        setConsultantForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultant-phone">
                      Telefon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="consultant-phone"
                      type="tel"
                      value={consultantForm.phone}
                      onChange={(e) =>
                        setConsultantForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultant-education">Eğitim</Label>
                    <Input
                      id="consultant-education"
                      value={consultantForm.education}
                      onChange={(e) =>
                        setConsultantForm((prev) => ({ ...prev, education: e.target.value }))
                      }
                      placeholder="Üniversite, bölüm..."
                    />
                  </div>
                </div>
                <div>
                  <Label>Uzmanlık Alanları</Label>
                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    {expertiseAreas.map((area) => (
                      <label key={area} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={consultantForm.expertise.includes(area)}
                          onCheckedChange={() => handleExpertiseChange(area)}
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="consultant-experience">Deneyim</Label>
                  <Textarea
                    id="consultant-experience"
                    value={consultantForm.experience}
                    onChange={(e) =>
                      setConsultantForm((prev) => ({ ...prev, experience: e.target.value }))
                    }
                    rows={4}
                    placeholder="İş deneyiminizi ve başarılarınızı yazın..."
                  />
                </div>
                <div>
                  <Label htmlFor="consultant-cv">CV Yükle</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <Input
                      id="consultant-cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setConsultantForm((prev) => ({
                          ...prev,
                          cv: e.target.files?.[0] || null,
                        }))
                      }
                      className="cursor-pointer"
                    />
                    {consultantForm.cv && (
                      <span className="text-sm text-gray-600">{consultantForm.cv.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consultant-kvkk"
                    checked={consultantForm.kvkk}
                    onCheckedChange={(checked) =>
                      setConsultantForm((prev) => ({ ...prev, kvkk: checked as boolean }))
                    }
                  />
                  <Label htmlFor="consultant-kvkk" className="text-sm">
                    <span className="text-red-500">*</span> KVKK metnini okudum ve kabul ediyorum.
                  </Label>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                </Button>
              </form>
            )}

            {/* Intern Form */}
            {activeTab === 'intern' && (
              <form onSubmit={(e) => handleSubmit(e, 'intern')} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="intern-name">
                      Ad Soyad <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="intern-name"
                      value={internForm.name}
                      onChange={(e) => setInternForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="intern-email">
                      E-posta <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="intern-email"
                      type="email"
                      value={internForm.email}
                      onChange={(e) =>
                        setInternForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="intern-phone">
                      Telefon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="intern-phone"
                      type="tel"
                      value={internForm.phone}
                      onChange={(e) =>
                        setInternForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="intern-school">Okul / Üniversite</Label>
                    <Input
                      id="intern-school"
                      value={internForm.school}
                      onChange={(e) =>
                        setInternForm((prev) => ({ ...prev, school: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="intern-graduation">Mezuniyet Yılı</Label>
                    <Input
                      id="intern-graduation"
                      value={internForm.graduationYear}
                      onChange={(e) =>
                        setInternForm((prev) => ({ ...prev, graduationYear: e.target.value }))
                      }
                      placeholder="2025"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="intern-interests">İlgi Alanları</Label>
                  <Textarea
                    id="intern-interests"
                    value={internForm.interests}
                    onChange={(e) =>
                      setInternForm((prev) => ({ ...prev, interests: e.target.value }))
                    }
                    rows={4}
                    placeholder="Hangi alanlarda staj yapmak istiyorsunuz?"
                  />
                </div>
                <div>
                  <Label htmlFor="intern-cv">CV Yükle</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <Input
                      id="intern-cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setInternForm((prev) => ({
                          ...prev,
                          cv: e.target.files?.[0] || null,
                        }))
                      }
                      className="cursor-pointer"
                    />
                    {internForm.cv && (
                      <span className="text-sm text-gray-600">{internForm.cv.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="intern-kvkk"
                    checked={internForm.kvkk}
                    onCheckedChange={(checked) =>
                      setInternForm((prev) => ({ ...prev, kvkk: checked as boolean }))
                    }
                  />
                  <Label htmlFor="intern-kvkk" className="text-sm">
                    <span className="text-red-500">*</span> KVKK metnini okudum ve kabul ediyorum.
                  </Label>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                </Button>
              </form>
            )}

            {/* HR Form */}
            {activeTab === 'hr' && (
              <form onSubmit={(e) => handleSubmit(e, 'hr')} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="hr-name">
                      Ad Soyad <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hr-name"
                      value={hrForm.name}
                      onChange={(e) => setHrForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hr-email">
                      E-posta <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hr-email"
                      type="email"
                      value={hrForm.email}
                      onChange={(e) => setHrForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hr-phone">
                      Telefon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hr-phone"
                      type="tel"
                      value={hrForm.phone}
                      onChange={(e) => setHrForm((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hr-position">Pozisyon</Label>
                    <Input
                      id="hr-position"
                      value={hrForm.position}
                      onChange={(e) => setHrForm((prev) => ({ ...prev, position: e.target.value }))}
                      placeholder="İK Uzmanı, İK Müdürü..."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hr-experience">Deneyim</Label>
                  <Textarea
                    id="hr-experience"
                    value={hrForm.experience}
                    onChange={(e) => setHrForm((prev) => ({ ...prev, experience: e.target.value }))}
                    rows={4}
                    placeholder="İnsan kaynakları deneyiminizi yazın..."
                  />
                </div>
                <div>
                  <Label htmlFor="hr-cv">CV Yükle</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <Input
                      id="hr-cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setHrForm((prev) => ({
                          ...prev,
                          cv: e.target.files?.[0] || null,
                        }))
                      }
                      className="cursor-pointer"
                    />
                    {hrForm.cv && <span className="text-sm text-gray-600">{hrForm.cv.name}</span>}
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="hr-kvkk"
                    checked={hrForm.kvkk}
                    onCheckedChange={(checked) =>
                      setHrForm((prev) => ({ ...prev, kvkk: checked as boolean }))
                    }
                  />
                  <Label htmlFor="hr-kvkk" className="text-sm">
                    <span className="text-red-500">*</span> KVKK metnini okudum ve kabul ediyorum.
                  </Label>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-6">Neden Akademi Port?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Türkiye&apos;nin e-ihracat dönüşümüne öncülük eden ekibimizde yer almak için birçok
              neden var.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6">
                <Rocket className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Hızlı Kariyer Gelişimi</h3>
              <p className="text-gray-700 leading-relaxed">
                Yenilikçi projelerde çalışarak kariyerinizi hızla ilerletin. Sürekli öğrenme ve
                gelişim fırsatları.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6">
                <Target className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Anlamlı İş</h3>
              <p className="text-gray-700 leading-relaxed">
                Türk firmalarının küresel pazarlarda başarılı olmasına katkı sağlayın. İşinizle fark
                yaratın.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-6">
                <Zap className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Modern Çalışma Ortamı</h3>
              <p className="text-gray-700 leading-relaxed">
                Esnek çalışma saatleri, remote imkanları ve modern ofis ortamı. İş-yaşam dengesi
                önceliğimiz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-6">Çalışan Avantajları</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <Award className="text-blue-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Rekabetçi Maaş</h3>
              <p className="text-gray-600 text-sm">Sektörün en iyi maaş paketleri</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <Calendar className="text-purple-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Esnek Çalışma</h3>
              <p className="text-gray-600 text-sm">Remote ve hibrit çalışma imkanları</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <GraduationCap className="text-green-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Eğitim Desteği</h3>
              <p className="text-gray-600 text-sm">Sürekli öğrenme ve sertifikasyon</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <Users className="text-orange-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Takım Ruhu</h3>
              <p className="text-gray-600 text-sm">Güçlü ekip kültürü ve destek</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Hemen Başvurun</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Kariyer yolculuğunuza bugün başlayın. Türkiye&apos;nin e-ihracat dönüşümüne katkı
            sağlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
              <Link href="#">
                <Mail className="mr-3 w-6 h-6" />
                Başvuru Yap
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/iletisim-basvuru">
                <Phone className="mr-3 w-6 h-6" />
                İletişime Geç
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
