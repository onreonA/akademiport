'use client';
import Link from 'next/link';
import { useState } from 'react';

import ModernFooter from '@/components/layout/ModernFooter';
import ModernNavigation from '@/components/layout/ModernNavigation';
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
  const tabs = [
    {
      id: 'consultant',
      label: 'Danışman',
      icon: 'ri-user-star-line',
      color: 'blue',
    },
    {
      id: 'intern',
      label: 'Stajyer',
      icon: 'ri-graduation-cap-line',
      color: 'orange',
    },
    { id: 'hr', label: 'Firma İK', icon: 'ri-team-line', color: 'purple' },
  ];
  const handleExpertiseChange = (area: string) => {
    setConsultantForm(prev => ({
      ...prev,
      expertise: prev.expertise.includes(area)
        ? prev.expertise.filter(item => item !== area)
        : [...prev.expertise, area],
    }));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const handleConsultantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      // CV dosyası yükleme
      let cv_file_path = null;
      let cv_file_name = null;
      if (consultantForm.cv) {
        const formData = new FormData();
        formData.append('file', consultantForm.cv);
        const uploadResponse = await fetch('/api/career/upload-cv', {
          method: 'POST',
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          cv_file_path = uploadData.file_path;
          cv_file_name = uploadData.file_name;
        }
      }
      // Başvuru gönderme
      const response = await fetch('/api/career/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_type: 'consultant',
          name: consultantForm.name,
          email: consultantForm.email,
          phone: consultantForm.phone,
          city: '',
          education: consultantForm.education,
          experience: consultantForm.experience,
          interests: '',
          position: '',
          expertise: consultantForm.expertise,
          cv_file_path,
          cv_file_name,
          kvkk_accepted: consultantForm.kvkk,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitMessage('Başvurunuz başarıyla gönderildi!');
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
      } else {
        setSubmitMessage(`Hata: ${result.error}`);
      }
    } catch (error) {
      setSubmitMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInternSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      // CV dosyası yükleme
      let cv_file_path = null;
      let cv_file_name = null;
      if (internForm.cv) {
        const formData = new FormData();
        formData.append('file', internForm.cv);
        const uploadResponse = await fetch('/api/career/upload-cv', {
          method: 'POST',
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          cv_file_path = uploadData.file_path;
          cv_file_name = uploadData.file_name;
        }
      }
      // Başvuru gönderme
      const response = await fetch('/api/career/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_type: 'intern',
          name: internForm.name,
          email: internForm.email,
          phone: internForm.phone,
          city: '',
          education: internForm.school,
          experience: '',
          interests: internForm.interests,
          position: '',
          expertise: null,
          cv_file_path,
          cv_file_name,
          kvkk_accepted: internForm.kvkk,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitMessage('Başvurunuz başarıyla gönderildi!');
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
        setSubmitMessage(`Hata: ${result.error}`);
      }
    } catch (error) {
      setSubmitMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleHrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      // CV dosyası yükleme
      let cv_file_path = null;
      let cv_file_name = null;
      if (hrForm.cv) {
        const formData = new FormData();
        formData.append('file', hrForm.cv);
        const uploadResponse = await fetch('/api/career/upload-cv', {
          method: 'POST',
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          cv_file_path = uploadData.file_path;
          cv_file_name = uploadData.file_name;
        }
      }
      // Başvuru gönderme
      const response = await fetch('/api/career/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_type: 'hr_staff',
          name: hrForm.name,
          email: hrForm.email,
          phone: hrForm.phone,
          city: '',
          education: '',
          experience: hrForm.experience,
          interests: '',
          position: hrForm.position,
          expertise: null,
          cv_file_path,
          cv_file_name,
          kvkk_accepted: hrForm.kvkk,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitMessage('Başvurunuz başarıyla gönderildi!');
        setHrForm({
          name: '',
          email: '',
          phone: '',
          position: '',
          experience: '',
          cv: null,
          kvkk: false,
        });
      } else {
        setSubmitMessage(`Hata: ${result.error}`);
      }
    } catch (error) {
      setSubmitMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const getTabColors = (tabColor: string, isActive: boolean) => {
    const colors = {
      blue: isActive
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50',
      orange: isActive
        ? 'bg-orange-500 text-white border-orange-500'
        : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50',
      purple: isActive
        ? 'bg-purple-600 text-white border-purple-600'
        : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50',
    };
    return colors[tabColor as keyof typeof colors];
  };
  const getFormColors = (tabColor: string) => {
    const colors = {
      blue: 'focus:ring-blue-500 focus:border-blue-500',
      orange: 'focus:ring-orange-500 focus:border-orange-500',
      purple: 'focus:ring-purple-500 focus:border-purple-500',
    };
    return colors[tabColor as keyof typeof colors];
  };
  const getButtonColors = (tabColor: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      orange: 'bg-orange-500 hover:bg-orange-600',
      purple: 'bg-purple-600 hover:bg-purple-700',
    };
    return colors[tabColor as keyof typeof colors];
  };
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Modern Navigation */}
      <ModernNavigation />
      {/* Hero Section */}
      <section className='relative py-20 overflow-hidden'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20corporate%20office%20environment%20with%20world%20map%20on%20wall%2C%20professional%20diverse%20team%20collaborating%20around%20conference%20table%20with%20laptops%20and%20digital%20displays%20showing%20global%20trade%20data.%20Clean%20contemporary%20workspace%20with%20blue%20and%20orange%20accent%20lighting%2C%20representing%20international%20e-commerce%20business%20growth%20and%20digital%20transformation&width=1920&height=800&seq=career-hero-bg-002&orientation=landscape')`,
          }}
        >
          <div className='absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/85 to-transparent'></div>
        </div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div className='text-white'>
              <h1 className='text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
                Geleceği E-İhracatla
                <span className='text-blue-300'> Şekillendirmek</span>
                <span className='text-orange-400'> İster misin?</span>
              </h1>
              <p className='text-xl text-blue-100 mb-8 leading-relaxed'>
                Akademi Port olarak, Türkiye&apos;nin e-ihracat vizyonuna güç
                katacak danışmanlar, stajyerler ve üretken firma çalışanlarıyla
                çalışmak istiyoruz.
              </p>
              <div className='flex flex-wrap gap-4'>
                <div className='flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2'>
                  <i className='ri-team-line mr-2 w-5 h-5 flex items-center justify-center text-green-400'></i>
                  <span className='text-sm'>50+ Uzman Ekip</span>
                </div>
                <div className='flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2'>
                  <i className='ri-global-line mr-2 w-5 h-5 flex items-center justify-center text-blue-400'></i>
                  <span className='text-sm'>Uluslararası Projeler</span>
                </div>
                <div className='flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2'>
                  <i className='ri-award-line mr-2 w-5 h-5 flex items-center justify-center text-orange-400'></i>
                  <span className='text-sm'>Sertifikalı Eğitimler</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Form Section */}
      <section className='py-16 bg-white'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Hangi Rolde Yer Almak İstersin?
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Deneyim seviyene ve hedeflerine uygun pozisyonu seç ve kariyerinde
              yeni bir sayfa aç.
            </p>
          </div>
          {/* Tab Navigation */}
          <div className='flex justify-center mb-8'>
            <div className='flex bg-gray-100 rounded-xl p-1 space-x-1'>
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${getTabColors(tab.color, isActive)}`}
                  >
                    <i
                      className={`${tab.icon} mr-2 w-5 h-5 flex items-center justify-center`}
                    ></i>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Form Content */}
          <div className='bg-gray-50 rounded-2xl p-8 lg:p-12 shadow-lg'>
            {activeTab === 'consultant' && (
              <div>
                <div className='text-center mb-8'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-user-star-line text-2xl text-blue-600 w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <h3 className='text-3xl font-bold text-gray-900 mb-2'>
                    Danışman Olarak Başvur
                  </h3>
                  <p className='text-gray-600'>
                    E-ihracat alanında deneyimli danışmanlarımız arasına katılın
                  </p>
                </div>
                <form onSubmit={handleConsultantSubmit} className='space-y-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Ad Soyad *
                      </label>
                      <input
                        type='text'
                        value={consultantForm.name}
                        onChange={e =>
                          setConsultantForm(prev => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('blue')} text-sm`}
                        placeholder='Adınız ve soyadınız'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        E-posta *
                      </label>
                      <input
                        type='email'
                        value={consultantForm.email}
                        onChange={e =>
                          setConsultantForm(prev => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('blue')} text-sm`}
                        placeholder='ornek@email.com'
                        required
                      />
                    </div>
                  </div>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Telefon *
                      </label>
                      <input
                        type='tel'
                        value={consultantForm.phone}
                        onChange={e =>
                          setConsultantForm(prev => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('blue')} text-sm`}
                        placeholder='0555 123 45 67'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Eğitim Durumu *
                      </label>
                      <select
                        value={consultantForm.education}
                        onChange={e =>
                          setConsultantForm(prev => ({
                            ...prev,
                            education: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('blue')} text-sm pr-8`}
                        required
                      >
                        <option value=''>Seçiniz</option>
                        <option value='lisans'>Lisans</option>
                        <option value='yuksek-lisans'>Yüksek Lisans</option>
                        <option value='doktora'>Doktora</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Uzmanlık Alanı * (Birden fazla seçebilirsiniz)
                    </label>
                    <div className='grid md:grid-cols-2 gap-3'>
                      {expertiseAreas.map(area => (
                        <label
                          key={area}
                          className='flex items-center cursor-pointer'
                        >
                          <input
                            type='checkbox'
                            checked={consultantForm.expertise.includes(area)}
                            onChange={() => handleExpertiseChange(area)}
                            className='mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                          />
                          <span className='text-sm text-gray-700'>{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Deneyim Açıklaması *
                    </label>
                    <textarea
                      value={consultantForm.experience}
                      onChange={e =>
                        setConsultantForm(prev => ({
                          ...prev,
                          experience: e.target.value,
                        }))
                      }
                      rows={4}
                      maxLength={500}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('blue')} text-sm resize-none`}
                      placeholder='Profesyonel deneyimlerinizi, projelerinizi ve başarılarınızı kısaca açıklayın...'
                      required
                    />
                    <div className='text-right text-xs text-gray-500 mt-1'>
                      {consultantForm.experience.length}/500
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      CV Yükle (PDF) *
                    </label>
                    <input
                      type='file'
                      accept='.pdf'
                      onChange={e =>
                        setConsultantForm(prev => ({
                          ...prev,
                          cv: e.target.files?.[0] || null,
                        }))
                      }
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('blue')} text-sm`}
                      required
                    />
                  </div>
                  <div className='flex items-start space-x-3'>
                    <input
                      type='checkbox'
                      id='consultant-kvkk'
                      checked={consultantForm.kvkk}
                      onChange={e =>
                        setConsultantForm(prev => ({
                          ...prev,
                          kvkk: e.target.checked,
                        }))
                      }
                      className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      required
                    />
                    <label
                      htmlFor='consultant-kvkk'
                      className='text-sm text-gray-700 cursor-pointer'
                    >
                      <Link
                        href='/kvkk'
                        className='text-blue-600 hover:text-blue-700'
                      >
                        KVKK Aydınlatma Metni
                      </Link>
                      &apos;ni okudum ve kişisel verilerimin işlenmesini kabul
                      ediyorum. *
                    </label>
                  </div>
                  {submitMessage && (
                    <div
                      className={`p-4 rounded-lg text-sm ${submitMessage.includes('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                    >
                      {submitMessage}
                    </div>
                  )}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`w-full ${getButtonColors('blue')} text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <div className='flex items-center justify-center'>
                        <i className='ri-loader-4-line animate-spin mr-2'></i>
                        Gönderiliyor...
                      </div>
                    ) : (
                      'Danışman Başvurusu Gönder'
                    )}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'intern' && (
              <div>
                <div className='text-center mb-8'>
                  <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-graduation-cap-line text-2xl text-orange-500 w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <h3 className='text-3xl font-bold text-gray-900 mb-2'>
                    Stajyer Olarak Başvur
                  </h3>
                  <p className='text-gray-600'>
                    E-ihracat alanında kariyer yapmaya ilk adımı atın
                  </p>
                </div>
                <form onSubmit={handleInternSubmit} className='space-y-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Ad Soyad *
                      </label>
                      <input
                        type='text'
                        value={internForm.name}
                        onChange={e =>
                          setInternForm(prev => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('orange')} text-sm`}
                        placeholder='Adınız ve soyadınız'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        E-posta *
                      </label>
                      <input
                        type='email'
                        value={internForm.email}
                        onChange={e =>
                          setInternForm(prev => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('orange')} text-sm`}
                        placeholder='ornek@email.com'
                        required
                      />
                    </div>
                  </div>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Telefon *
                      </label>
                      <input
                        type='tel'
                        value={internForm.phone}
                        onChange={e =>
                          setInternForm(prev => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('orange')} text-sm`}
                        placeholder='0555 123 45 67'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Okul/Bölüm *
                      </label>
                      <input
                        type='text'
                        value={internForm.school}
                        onChange={e =>
                          setInternForm(prev => ({
                            ...prev,
                            school: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('orange')} text-sm`}
                        placeholder='Üniversite - Bölüm'
                        required
                      />
                    </div>
                  </div>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Mezuniyet Yılı/Devam Durumu *
                      </label>
                      <input
                        type='text'
                        value={internForm.graduationYear}
                        onChange={e =>
                          setInternForm(prev => ({
                            ...prev,
                            graduationYear: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('orange')} text-sm`}
                        placeholder='2025 / Devam Ediyor'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        İlgi Alanı *
                      </label>
                      <select
                        value={internForm.interests}
                        onChange={e =>
                          setInternForm(prev => ({
                            ...prev,
                            interests: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('orange')} text-sm pr-8`}
                        required
                      >
                        <option value=''>Seçiniz</option>
                        <option value='danismanlik'>Danışmanlık</option>
                        <option value='pazarlama'>Dijital Pazarlama</option>
                        <option value='analiz'>Veri Analizi</option>
                        <option value='proje-yonetimi'>Proje Yönetimi</option>
                        <option value='egitim'>Eğitim ve İçerik</option>
                        <option value='teknoloji'>Teknoloji</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      CV Yükle (PDF) *
                    </label>
                    <input
                      type='file'
                      accept='.pdf'
                      onChange={e =>
                        setInternForm(prev => ({
                          ...prev,
                          cv: e.target.files?.[0] || null,
                        }))
                      }
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('orange')} text-sm`}
                      required
                    />
                  </div>
                  <div className='flex items-start space-x-3'>
                    <input
                      type='checkbox'
                      id='intern-kvkk'
                      checked={internForm.kvkk}
                      onChange={e =>
                        setInternForm(prev => ({
                          ...prev,
                          kvkk: e.target.checked,
                        }))
                      }
                      className='mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded'
                      required
                    />
                    <label
                      htmlFor='intern-kvkk'
                      className='text-sm text-gray-700 cursor-pointer'
                    >
                      <Link
                        href='/kvkk'
                        className='text-orange-500 hover:text-orange-600'
                      >
                        KVKK Aydınlatma Metni
                      </Link>
                      &apos;ni okudum ve kişisel verilerimin işlenmesini kabul
                      ediyorum. *
                    </label>
                  </div>
                  {submitMessage && (
                    <div
                      className={`p-4 rounded-lg text-sm ${submitMessage.includes('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                    >
                      {submitMessage}
                    </div>
                  )}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`w-full ${getButtonColors('orange')} text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <div className='flex items-center justify-center'>
                        <i className='ri-loader-4-line animate-spin mr-2'></i>
                        Gönderiliyor...
                      </div>
                    ) : (
                      'Stajyer Başvurusu Gönder'
                    )}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'hr' && (
              <div>
                <div className='text-center mb-8'>
                  <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-team-line text-2xl text-purple-600 w-8 h-8 flex items-center justify-center'></i>
                  </div>
                  <h3 className='text-3xl font-bold text-gray-900 mb-2'>
                    Firma İK Havuzuna Katıl
                  </h3>
                  <p className='text-gray-600'>
                    Deneyimli profesyonellerimiz arasına katılın
                  </p>
                </div>
                <form onSubmit={handleHrSubmit} className='space-y-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Ad Soyad *
                      </label>
                      <input
                        type='text'
                        value={hrForm.name}
                        onChange={e =>
                          setHrForm(prev => ({ ...prev, name: e.target.value }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('purple')} text-sm`}
                        placeholder='Adınız ve soyadınız'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        E-posta *
                      </label>
                      <input
                        type='email'
                        value={hrForm.email}
                        onChange={e =>
                          setHrForm(prev => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('purple')} text-sm`}
                        placeholder='ornek@email.com'
                        required
                      />
                    </div>
                  </div>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Telefon *
                      </label>
                      <input
                        type='tel'
                        value={hrForm.phone}
                        onChange={e =>
                          setHrForm(prev => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('purple')} text-ser`}
                        placeholder='0555 123 45 67'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Pozisyon *
                      </label>
                      <select
                        value={hrForm.position}
                        onChange={e =>
                          setHrForm(prev => ({
                            ...prev,
                            position: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('purple')} text-sm pr-8`}
                        required
                      >
                        <option value=''>Seçiniz</option>
                        <option value='ihracat-uzmani'>İhracat Uzmanı</option>
                        <option value='pazarlama-uzmani'>
                          Pazarlama Uzmanı
                        </option>
                        <option value='satis-uzmani'>Satış Uzmanı</option>
                        <option value='operasyon-uzmani'>
                          Operasyon Uzmanı
                        </option>
                        <option value='finans-uzmani'>Finans Uzmanı</option>
                        <option value='lojistik-uzmani'>Lojistik Uzmanı</option>
                        <option value='teknik-uzman'>Teknik Uzman</option>
                        <option value='diger'>Diğer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Deneyim Açıklaması *
                    </label>
                    <textarea
                      value={hrForm.experience}
                      onChange={e =>
                        setHrForm(prev => ({
                          ...prev,
                          experience: e.target.value,
                        }))
                      }
                      rows={4}
                      maxLength={500}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('purple')} text-sm resize-none`}
                      placeholder='İş deneyimlerinizi, yetkinliklerinizi ve başarılarınızı kısaca açıklayın...'
                      required
                    />
                    <div className='text-right text-xs text-gray-500 mt-1'>
                      {hrForm.experience.length}/500
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      CV Yükle (PDF) *
                    </label>
                    <input
                      type='file'
                      accept='.pdf'
                      onChange={e =>
                        setHrForm(prev => ({
                          ...prev,
                          cv: e.target.files?.[0] || null,
                        }))
                      }
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${getFormColors('purple')} text-sm`}
                      required
                    />
                  </div>
                  <div className='flex items-start space-x-3'>
                    <input
                      type='checkbox'
                      id='hr-kvkk'
                      checked={hrForm.kvkk}
                      onChange={e =>
                        setHrForm(prev => ({ ...prev, kvkk: e.target.checked }))
                      }
                      className='mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
                      required
                    />
                    <label
                      htmlFor='hr-kvkk'
                      className='text-sm text-gray-700 cursor-pointer'
                    >
                      <Link
                        href='/kvkk'
                        className='text-purple-600 hover:text-purple-700'
                      >
                        KVKK Aydınlatma Metni
                      </Link>
                      &apos;ni okudum ve kişisel verilerimin işlenmesini kabul
                      ediyorum. *
                    </label>
                  </div>
                  {submitMessage && (
                    <div
                      className={`p-4 rounded-lg text-sm ${submitMessage.includes('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                    >
                      {submitMessage}
                    </div>
                  )}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`w-full ${getButtonColors('purple')} text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <div className='flex items-center justify-center'>
                        <i className='ri-loader-4-line animate-spin mr-2'></i>
                        Gönderiliyor...
                      </div>
                    ) : (
                      'İK Havuzu Başvurusu Gönder'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Bizi Neden Tercih Etmelisin Section */}
      <section className='py-16 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl font-bold mb-4'>
              Bizi Neden Tercih Etmelisin?
            </h2>
            <p className='text-xl text-blue-100 max-w-3xl mx-auto'>
              Akademi Port&apos;ta çalışmanın size sunacağı eşsiz fırsatları
              keşfedin ve kariyerinizi bir üst seviyeye taşıyın
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='text-center group'>
              <div className='w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                <i className='ri-global-line text-3xl text-white w-10 h-10 flex items-center justify-center'></i>
              </div>
              <h3 className='text-xl font-semibold mb-4'>
                Ulusal ve Uluslararası Projelerde Görev
              </h3>
              <p className='text-blue-100 leading-relaxed'>
                Türkiye&apos;nin e-ihracat vizyonunu destekleyen ulusal
                projelerde yer alın. Uluslararası iş birlikleri ile küresel
                deneyim kazanın ve kariyerinizi dünya çapında geliştirin.
              </p>
            </div>
            <div className='text-center group'>
              <div className='w-20 h-20 bg-gradient-to-br from-orange-400/20 to-orange-400/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                <i className='ri-lightbulb-line text-3xl text-orange-400 w-10 h-10 flex items-center justify-center'></i>
              </div>
              <h3 className='text-xl font-semibold mb-4'>
                Gerçek Deneyim, Uygulamalı Gelişim
              </h3>
              <p className='text-blue-100 leading-relaxed'>
                Teorik bilginin ötesinde, gerçek firmalarla çalışarak pratik
                deneyim kazanın. Her projede yeni beceriler geliştirin ve
                sektördeki en güncel trendleri yakından takip edin.
              </p>
            </div>
            <div className='text-center group'>
              <div className='w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
                <i className='ri-user-settings-line text-3xl text-green-400 w-10 h-10 flex items-center justify-center'></i>
              </div>
              <h3 className='text-xl font-semibold mb-4'>
                Yetkinlik Temelli Mentorluk ve Eğitim
              </h3>
              <p className='text-blue-100 leading-relaxed'>
                Alanında uzman mentorlardan kişisel gelişim desteği alın.
                Sürekli eğitim programları ile kendinizi geliştirin ve
                profesyonel hedeflerinize ulaşın.
              </p>
            </div>
          </div>
          {/* İstatistikler */}
          <div className='mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            <div>
              <div className='text-3xl font-bold text-orange-400 mb-2'>
                500+
              </div>
              <div className='text-blue-100 text-sm'>Başarılı Proje</div>
            </div>
            <div>
              <div className='text-3xl font-bold text-green-400 mb-2'>50+</div>
              <div className='text-blue-100 text-sm'>Uzman Ekip</div>
            </div>
            <div>
              <div className='text-3xl font-bold text-blue-300 mb-2'>1000+</div>
              <div className='text-blue-100 text-sm'>Eğitim Saati</div>
            </div>
            <div>
              <div className='text-3xl font-bold text-purple-400 mb-2'>25+</div>
              <div className='text-blue-100 text-sm'>Ülke Deneyimi</div>
            </div>
          </div>
        </div>
      </section>
      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}
