'use client';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuthStore } from '@/lib/stores/auth-store';
interface CareerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  application_type: 'intern' | 'hr_staff';
  city?: string;
  education?: string;
  experience?: string;
  interests?: string;
  cv_file_name?: string;
  created_at: string;
}
interface Candidate {
  id: string; // HR pool ID (unique key)
  application_id?: string; // Başvuru ID'si
  name: string;
  email: string;
  phone: string;
  position: string;
  application_type: 'intern' | 'hr_staff';
  city?: string;
  education?: string;
  experience?: string;
  interests?: string;
  cv_file_name?: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  notes?: string;
  rating?: number;
}
const HRPoolPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'intern' | 'hr_staff'>(
    'all'
  );
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected'
  >('all');
  // Mock data for demonstration
  const mockCandidates: Candidate[] = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phone: '+90 555 123 4567',
      position: 'Frontend Developer',
      application_type: 'hr_staff',
      city: 'İstanbul',
      education: 'Bilgisayar Mühendisliği',
      experience: '2 yıl',
      interests: 'React, TypeScript',
      cv_file_name: 'ahmet_yilmaz_cv.pdf',
      created_at: '2024-01-15T10:00:00Z',
      status: 'pending',
      rating: 4,
    },
    {
      id: '2',
      name: 'Elif Kaya',
      email: 'elif@example.com',
      phone: '+90 555 234 5678',
      position: 'UI/UX Designer',
      application_type: 'hr_staff',
      city: 'Ankara',
      education: 'Grafik Tasarım',
      experience: '1 yıl',
      interests: 'Figma, Adobe Creative Suite',
      cv_file_name: 'elif_kaya_cv.pdf',
      created_at: '2024-01-14T14:30:00Z',
      status: 'reviewed',
      rating: 5,
    },
    {
      id: '3',
      name: 'Mehmet Demir',
      email: 'mehmet@example.com',
      phone: '+90 555 345 6789',
      position: 'Backend Developer',
      application_type: 'intern',
      city: 'İzmir',
      education: 'Yazılım Mühendisliği (3. sınıf)',
      experience: 'Stajyer',
      interests: 'Node.js, Python',
      cv_file_name: 'mehmet_demir_cv.pdf',
      created_at: '2024-01-13T09:15:00Z',
      status: 'interviewed',
      rating: 3,
    },
  ];
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);

        // Gerçek API'den veri çek
        const response = await fetch(
          '/api/hr-pool?company_id=6fcc9e92-4169-4b06-9c2f-a8c6cc284d73',
          {
            headers: {
              'X-User-Email': 'info@mundo.com',
            },
          }
        );

        if (!response.ok) {
          throw new Error('API çağrısı başarısız');
        }

        const result = await response.json();

        if (result.success && result.data) {
          // API verilerini frontend formatına dönüştür
          const formattedCandidates: Candidate[] = result.data.map(
            (item: any) => ({
              id: item.id, // HR pool ID'sini kullan (unique key için)
              application_id: item.application_id, // Başvuru ID'sini ayrı tut
              name: item.career_applications.name,
              email: item.career_applications.email,
              phone: item.career_applications.phone,
              position: item.career_applications.position || 'Belirtilmemiş',
              application_type: item.career_applications.application_type,
              city: item.career_applications.city,
              education: item.career_applications.education,
              experience: item.career_applications.experience,
              interests: item.career_applications.interests,
              cv_file_name: item.career_applications.cv_file_name,
              created_at: item.career_applications.created_at,
              status: item.status === 'available' ? 'pending' : item.status,
              notes: item.notes,
            })
          );

          setCandidates(formattedCandidates);
          setFilteredCandidates(formattedCandidates);
        } else {
          // API'den veri gelmezse mock data kullan
          setCandidates(mockCandidates);
          setFilteredCandidates(mockCandidates);
        }
      } catch (err) {
        console.error('API hatası:', err);
        setError('Adaylar yüklenirken hata oluştu');
        // Hata durumunda mock data kullan
        setCandidates(mockCandidates);
        setFilteredCandidates(mockCandidates);
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);
  // Filter candidates
  useEffect(() => {
    let filtered = candidates;
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(
        candidate => candidate.application_type === filterType
      );
    }
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        candidate => candidate.status === filterStatus
      );
    }
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        candidate =>
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCandidates(filtered);
  }, [candidates, filterType, filterStatus, searchTerm]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'interviewed':
        return 'bg-purple-100 text-purple-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'reviewed':
        return 'İncelendi';
      case 'interviewed':
        return 'Mülakat Yapıldı';
      case 'hired':
        return 'İşe Alındı';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };
  const getTypeText = (type: string) => {
    switch (type) {
      case 'intern':
        return 'Stajyer';
      case 'hr_staff':
        return 'Personel';
      default:
        return type;
    }
  };
  const handleStatusUpdate = (candidateId: string, newStatus: string) => {
    setCandidates(prev =>
      prev.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus as any }
          : candidate
      )
    );
    setSuccessMessage('Durum başarıyla güncellendi');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  const handleRatingUpdate = (candidateId: string, rating: number) => {
    setCandidates(prev =>
      prev.map(candidate =>
        candidate.id === candidateId ? { ...candidate, rating } : candidate
      )
    );
    setSuccessMessage('Değerlendirme başarıyla güncellendi');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  if (loading) {
    return (
      <FirmaLayout
        title='İK Havuzu'
        description='İnsan kaynakları adaylarını yönetin ve değerlendirin'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Adaylar yükleniyor...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  if (error) {
    return (
      <FirmaLayout
        title='İK Havuzu'
        description='İnsan kaynakları adaylarını yönetin ve değerlendirin'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <EmptyState
            type='custom'
            title='Hata Oluştu'
            description={error}
            color='error'
            size='lg'
            variant='elevated'
            action={{
              label: 'Tekrar Dene',
              onClick: () => window.location.reload(),
              variant: 'primary',
            }}
          />
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='İK Havuzu'
      description='İnsan kaynakları adaylarını yönetin ve değerlendirin'
    >
      <div className='space-y-4'>
        {/* Compact Header with Gradient */}
        <div className='bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 shadow-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                <i className='ri-team-line text-2xl text-white'></i>
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  İK Havuzu
                </h1>
                <p className='text-purple-100 text-sm'>
                  Aday yönetimi ve değerlendirme sistemi
                </p>
              </div>
            </div>
            <div className='flex items-center gap-6'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-white'>
                  {candidates.length}
                </div>
                <div className='text-xs text-purple-100'>Toplam Aday</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-white'>
                  {filteredCandidates.length}
                </div>
                <div className='text-xs text-purple-100'>Filtrelenmiş</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2'>
            <i className='ri-checkbox-circle-line text-lg'></i>
            {successMessage}
          </div>
        )}

        {/* Compact Filters */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            {/* Search */}
            <div className='relative'>
              <i className='ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'></i>
              <input
                type='text'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder='Arama...'
                className='w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
              />
            </div>
            {/* Type Filter */}
            <div className='relative'>
              <i className='ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'></i>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className='w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white'
              >
                <option value='all'>Tüm Tipler</option>
                <option value='hr_staff'>Personel</option>
                <option value='intern'>Stajyer</option>
              </select>
            </div>
            {/* Status Filter */}
            <div className='relative'>
              <i className='ri-shield-check-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'></i>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className='w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white'
              >
                <option value='all'>Tüm Durumlar</option>
                <option value='pending'>Beklemede</option>
                <option value='reviewed'>İncelendi</option>
                <option value='interviewed'>Mülakat Yapıldı</option>
                <option value='hired'>İşe Alındı</option>
                <option value='rejected'>Reddedildi</option>
              </select>
            </div>
          </div>
        </div>
        {/* Modern Candidates Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredCandidates.map(candidate => (
            <div
              key={candidate.id}
              className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-purple-200 transition-all duration-300 group'
            >
              {/* Compact Header */}
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold'>
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className='text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors'>
                      {candidate.name}
                    </h3>
                    <p className='text-xs text-gray-500'>
                      {candidate.position}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(candidate.status)}`}
                >
                  {getStatusText(candidate.status)}
                </span>
              </div>

              {/* Compact Info */}
              <div className='space-y-2 mb-3'>
                <div className='flex items-center text-xs text-gray-600'>
                  <i className='ri-mail-line mr-2 text-purple-500'></i>
                  <span className='truncate'>{candidate.email}</span>
                </div>
                <div className='flex items-center text-xs text-gray-600'>
                  <i className='ri-phone-line mr-2 text-blue-500'></i>
                  {candidate.phone}
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center text-gray-600'>
                    <i className='ri-map-pin-line mr-2 text-green-500'></i>
                    {candidate.city || 'Belirtilmemiş'}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-lg font-medium ${
                      candidate.application_type === 'intern'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {getTypeText(candidate.application_type)}
                  </span>
                </div>
              </div>

              {/* Compact Rating */}
              {candidate.rating && (
                <div className='flex items-center justify-between mb-3 pb-3 border-b border-gray-100'>
                  <span className='text-xs text-gray-600'>Değerlendirme</span>
                  <div className='flex'>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => handleRatingUpdate(candidate.id, star)}
                        className={`text-base ${
                          star <= (candidate.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact Actions */}
              <div className='flex gap-2'>
                <button
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowDetailModal(true);
                  }}
                  className='flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1'
                >
                  <i className='ri-eye-line'></i>
                  Detay
                </button>
                <select
                  value={candidate.status}
                  onChange={e =>
                    handleStatusUpdate(candidate.id, e.target.value)
                  }
                  className='px-2 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white'
                >
                  <option value='pending'>Beklemede</option>
                  <option value='reviewed'>İncelendi</option>
                  <option value='interviewed'>Mülakat</option>
                  <option value='hired'>İşe Al</option>
                  <option value='rejected'>Reddet</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        {/* Modern No Results */}
        {filteredCandidates.length === 0 && (
          <div className='bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-12 text-center'>
            <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
              <i className='ri-user-search-line text-purple-500 text-3xl'></i>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Aday Bulunamadı
            </h3>
            <p className='text-gray-600'>
              Arama kriterlerinize uygun aday bulunamadı. Filtreleri
              değiştirmeyi deneyin.
            </p>
          </div>
        )}
      </div>
      {/* Modern Detail Modal */}
      {showDetailModal && selectedCandidate && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slideUp'>
            {/* Modal Header with Gradient */}
            <div className='bg-gradient-to-r from-purple-600 to-blue-600 p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-xl font-bold'>
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className='text-2xl font-bold text-white'>
                      {selectedCandidate.name}
                    </h3>
                    <p className='text-purple-100 text-sm'>
                      {selectedCandidate.position}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className='text-white/80 hover:text-white transition-colors'
                >
                  <i className='ri-close-line text-2xl'></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
              <div className='space-y-6'>
                {/* Personal Info */}
                <div className='bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <i className='ri-user-line text-purple-600'></i>
                    Kişisel Bilgiler
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-white rounded-lg p-3'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        İsim
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        {selectedCandidate.name}
                      </span>
                    </div>
                    <div className='bg-white rounded-lg p-3'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        Email
                      </span>
                      <span className='text-sm font-medium text-gray-900 truncate block'>
                        {selectedCandidate.email}
                      </span>
                    </div>
                    <div className='bg-white rounded-lg p-3'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        Telefon
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        {selectedCandidate.phone}
                      </span>
                    </div>
                    <div className='bg-white rounded-lg p-3'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        Şehir
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        {selectedCandidate.city || 'Belirtilmemiş'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Job Info */}
                <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5'>
                  <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                    <i className='ri-briefcase-line text-blue-600'></i>
                    İş Bilgileri
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-white rounded-lg p-3'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        Pozisyon
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        {selectedCandidate.position}
                      </span>
                    </div>
                    <div className='bg-white rounded-lg p-3'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        Tip
                      </span>
                      <span
                        className={`text-sm font-medium inline-block px-2 py-1 rounded ${
                          selectedCandidate.application_type === 'intern'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {getTypeText(selectedCandidate.application_type)}
                      </span>
                    </div>
                    <div className='bg-white rounded-lg p-3'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        Eğitim
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        {selectedCandidate.education || 'Belirtilmemiş'}
                      </span>
                    </div>
                    <div className='bg-white rounded-lg p-3'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        Deneyim
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        {selectedCandidate.experience || 'Belirtilmemiş'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                {selectedCandidate.interests && (
                  <div className='bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5'>
                    <h4 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                      <i className='ri-heart-line text-green-600'></i>
                      İlgi Alanları
                    </h4>
                    <p className='text-sm text-gray-700 bg-white rounded-lg p-3'>
                      {selectedCandidate.interests}
                    </p>
                  </div>
                )}

                {/* CV */}
                {selectedCandidate.cv_file_name && (
                  <div className='bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5'>
                    <h4 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                      <i className='ri-file-pdf-line text-red-600'></i>
                      CV Dosyası
                    </h4>
                    <div className='bg-white rounded-lg p-4 flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center'>
                          <i className='ri-file-pdf-line text-red-600 text-xl'></i>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {selectedCandidate.cv_file_name}
                          </p>
                          <p className='text-xs text-gray-500'>PDF Dosyası</p>
                        </div>
                      </div>
                      <button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2'>
                        <i className='ri-download-line'></i>
                        İndir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </FirmaLayout>
  );
};
export default HRPoolPage;
