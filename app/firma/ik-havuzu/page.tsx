'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCandidates(mockCandidates);
        setFilteredCandidates(mockCandidates);
      } catch (err) {
        setError('Adaylar yüklenirken hata oluştu');
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
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-red-600 text-2xl'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Hata Oluştu
          </h3>
          <p className='text-gray-500 mb-6'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
          >
            Tekrar Dene
          </button>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='İK Havuzu'
      description='İnsan kaynakları adaylarını yönetin ve değerlendirin'
    >
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              👥 İK Havuzu
            </h1>
            <p className='text-gray-600'>
              İnsan kaynakları adaylarını yönetin ve değerlendirin
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-sm text-gray-600'>
              Toplam: <span className='font-medium'>{candidates.length}</span>{' '}
              aday
            </div>
            <div className='text-sm text-gray-600'>
              Filtrelenmiş:{' '}
              <span className='font-medium'>{filteredCandidates.length}</span>{' '}
              aday
            </div>
          </div>
        </div>
        {/* Success Message */}
        {successMessage && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg'>
            {successMessage}
          </div>
        )}
        {/* Filters */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Search */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Arama
              </label>
              <input
                type='text'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder='İsim, email veya pozisyon ara...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            {/* Type Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Tip
              </label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>Tümü</option>
                <option value='hr_staff'>Personel</option>
                <option value='intern'>Stajyer</option>
              </select>
            </div>
            {/* Status Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Durum
              </label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>Tümü</option>
                <option value='pending'>Beklemede</option>
                <option value='reviewed'>İncelendi</option>
                <option value='interviewed'>Mülakat Yapıldı</option>
                <option value='hired'>İşe Alındı</option>
                <option value='rejected'>Reddedildi</option>
              </select>
            </div>
          </div>
        </div>
        {/* Candidates Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredCandidates.map(candidate => (
            <div
              key={candidate.id}
              className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow'
            >
              {/* Header */}
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                    {candidate.name}
                  </h3>
                  <p className='text-sm text-gray-600'>{candidate.position}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}
                >
                  {getStatusText(candidate.status)}
                </span>
              </div>
              {/* Info */}
              <div className='space-y-2 mb-4'>
                <div className='flex items-center text-sm text-gray-600'>
                  <i className='ri-mail-line mr-2'></i>
                  {candidate.email}
                </div>
                <div className='flex items-center text-sm text-gray-600'>
                  <i className='ri-phone-line mr-2'></i>
                  {candidate.phone}
                </div>
                <div className='flex items-center text-sm text-gray-600'>
                  <i className='ri-map-pin-line mr-2'></i>
                  {candidate.city || 'Belirtilmemiş'}
                </div>
                <div className='flex items-center text-sm text-gray-600'>
                  <i className='ri-user-line mr-2'></i>
                  {getTypeText(candidate.application_type)}
                </div>
              </div>
              {/* Rating */}
              {candidate.rating && (
                <div className='flex items-center mb-4'>
                  <span className='text-sm text-gray-600 mr-2'>
                    Değerlendirme:
                  </span>
                  <div className='flex'>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => handleRatingUpdate(candidate.id, star)}
                        className={`text-lg ${
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
              {/* Actions */}
              <div className='flex gap-2'>
                <button
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowDetailModal(true);
                  }}
                  className='flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors'
                >
                  Detay
                </button>
                <select
                  value={candidate.status}
                  onChange={e =>
                    handleStatusUpdate(candidate.id, e.target.value)
                  }
                  className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
        {/* No Results */}
        {filteredCandidates.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-user-search-line text-gray-400 text-2xl'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Aday Bulunamadı
            </h3>
            <p className='text-gray-500'>
              Arama kriterlerinize uygun aday bulunamadı.
            </p>
          </div>
        )}
      </div>
      {/* Detail Modal */}
      {showDetailModal && selectedCandidate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-gray-900'>
                  Aday Detayları
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <i className='ri-close-line text-xl'></i>
                </button>
              </div>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Kişisel Bilgiler
                  </h4>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-600'>İsim:</span>
                      <span className='ml-2 font-medium'>
                        {selectedCandidate.name}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Email:</span>
                      <span className='ml-2 font-medium'>
                        {selectedCandidate.email}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Telefon:</span>
                      <span className='ml-2 font-medium'>
                        {selectedCandidate.phone}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Şehir:</span>
                      <span className='ml-2 font-medium'>
                        {selectedCandidate.city || 'Belirtilmemiş'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    İş Bilgileri
                  </h4>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-600'>Pozisyon:</span>
                      <span className='ml-2 font-medium'>
                        {selectedCandidate.position}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Tip:</span>
                      <span className='ml-2 font-medium'>
                        {getTypeText(selectedCandidate.application_type)}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Eğitim:</span>
                      <span className='ml-2 font-medium'>
                        {selectedCandidate.education || 'Belirtilmemiş'}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Deneyim:</span>
                      <span className='ml-2 font-medium'>
                        {selectedCandidate.experience || 'Belirtilmemiş'}
                      </span>
                    </div>
                  </div>
                </div>
                {selectedCandidate.interests && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>
                      İlgi Alanları
                    </h4>
                    <p className='text-sm text-gray-600'>
                      {selectedCandidate.interests}
                    </p>
                  </div>
                )}
                {selectedCandidate.cv_file_name && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>CV</h4>
                    <div className='flex items-center gap-2'>
                      <i className='ri-file-pdf-line text-red-600'></i>
                      <span className='text-sm text-gray-600'>
                        {selectedCandidate.cv_file_name}
                      </span>
                      <button className='text-blue-600 hover:text-blue-800 text-sm'>
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
