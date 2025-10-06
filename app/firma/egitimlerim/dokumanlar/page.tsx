'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';
interface Document {
  id: string;
  title: string;
  description?: string;
  file_type: string;
  file_size: number;
  file_url: string;
  storage_path?: string;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  total_downloads: number;
  last_downloaded_at?: string;
  uploaded_by?: string;
  set_id: string;
  education_sets?: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  is_completed?: boolean;
  progress_percentage?: number;
}
export default function EducationDocumentsPage() {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedEducationSet, setSelectedEducationSet] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [educationSets, setEducationSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchEducationSets();
    }
  }, [user, fetchDocuments, fetchEducationSets]);
  const fetchEducationSets = useCallback(async () => {
    try {
      const userEmail = user?.email || '';
      if (!userEmail) {
        return;
      }
      const response = await fetch('/api/education-sets', {
        headers: {
          'X-User-Email': userEmail,
        },
      });
      if (!response.ok) {
        throw new Error('Eğitim setleri getirilemedi');
      }
      const result = await response.json();
      if (result.success) {
        setEducationSets(result.data);
      }
    } catch (err) {}
  }, [user]);
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const userEmail = user?.email || '';
      if (!userEmail) {
        setError('Kullanıcı bilgisi bulunamadı');
        return;
      }
      const response = await fetch('/api/documents', {
        headers: {
          'X-User-Email': userEmail,
        },
      });
      if (!response.ok) {
        throw new Error('Dökümanlar getirilemedi');
      }
      const result = await response.json();
      if (result.success) {
        setDocuments(result.data);
      } else {
        setError(result.error || 'Bilinmeyen hata');
      }
    } catch (err) {
      setError('Dökümanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user]);
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory =
      !selectedCategory || doc.education_sets?.category === selectedCategory;
    const matchesEducationSet =
      !selectedEducationSet || doc.set_id === selectedEducationSet;
    const matchesFileType =
      !selectedFileType || doc.file_type.toUpperCase() === selectedFileType;
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return (
      matchesCategory && matchesEducationSet && matchesFileType && matchesSearch
    );
  });
  const handleDocumentView = (document: Document) => {
    window.open(document.file_url, '_blank');
  };
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedEducationSet('');
    setSelectedFileType('');
    setSearchQuery('');
  };
  const unreadDocuments = documents.filter(doc => !doc.is_completed).length;
  const averageProgress =
    documents.length > 0
      ? documents.reduce(
          (sum, doc) => sum + (doc.progress_percentage || 0),
          0
        ) / documents.length
      : 0;
  return (
    <FirmaLayout
      title='Eğitim Dökümanları'
      description='Eğitim materyallerini ve belgelerini görüntüleyin'
    >
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Statistics Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-file-text-line text-blue-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {documents.length}
                  </p>
                  <p className='text-sm text-gray-600'>Toplam Döküman</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-time-line text-orange-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {unreadDocuments}
                  </p>
                  <p className='text-sm text-gray-600'>Okunmamış</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-pie-chart-line text-purple-600 text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {Math.round(averageProgress)}%
                  </p>
                  <p className='text-sm text-gray-600'>Ortalama İlerleme</p>
                </div>
              </div>
            </div>
          </div>
          {/* Dökümanlar Grid */}
          {loading ? (
            <div className='text-center py-12'>
              <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
              <p className='text-gray-600'>Dökümanlar yükleniyor...</p>
            </div>
          ) : error ? (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-error-warning-line text-red-600 text-2xl'></i>
              </div>
              <h3 className='text-lg font-medium text-red-900 mb-2'>
                Hata Oluştu
              </h3>
              <p className='text-red-700 mb-6'>{error}</p>
              <button
                onClick={fetchDocuments}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
              >
                Tekrar Dene
              </button>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-red-50'>
                        <i className='ri-file-pdf-line text-red-500 text-lg'></i>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-sm font-semibold text-gray-900 truncate'>
                          {doc.title}
                        </h3>
                        <span className='px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                          {doc.education_sets?.category || 'B2B'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {doc.description && (
                    <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
                      {doc.description}
                    </p>
                  )}
                  <div className='grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600'>
                    <div>
                      <div className='font-medium'>
                        {Math.round((doc.file_size / 1024 / 1024) * 100) / 100}{' '}
                        MB
                      </div>
                      <div className='text-xs'>Dosya Boyutu</div>
                    </div>
                    <div>
                      <div className='font-medium'>
                        {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                      </div>
                      <div className='text-xs'>Yayın Tarihi</div>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Link
                      href={`/firma/egitimlerim/dokumanlar/${doc.id}`}
                      className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2'
                    >
                      <i className='ri-eye-line'></i>
                      Detay
                    </Link>
                    <button
                      onClick={() => handleDocumentView(doc)}
                      className='flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2'
                    >
                      <i className='ri-download-line'></i>
                      İndir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-file-list-3-line text-2xl text-gray-400'></i>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Henüz eğitim dökümanı eklenmedi
              </h3>
              <p className='text-gray-500 mb-4'>
                Daha sonra tekrar kontrol edin
              </p>
            </div>
          )}
        </div>
      </div>
    </FirmaLayout>
  );
}
