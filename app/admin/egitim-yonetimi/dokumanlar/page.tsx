'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';

interface Document {
  id: string;
  title: string;
  description?: string;
  set_id: string;
  file_type: string;
  file_size: number;
  file_url: string;
  order_index: number;
  status: string;
  created_at: string;
  total_downloads: number;
  education_sets?: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
}

interface EducationSet {
  id: string;
  name: string;
  description: string;
  video_count: number;
}

export default function DocumentManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [educationSets, setEducationSets] = useState<EducationSet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEducationSet, setSelectedEducationSet] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
    fetchEducationSets();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDocuments(result.data || []);
        }
      }
    } catch (err) {
      setError('Dökümanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchEducationSets = async () => {
    try {
      const response = await fetch('/api/education-sets', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEducationSets(result.data || []);
        }
      }
    } catch (err) {
      console.error('Education sets fetch error:', err);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesEducationSet =
      !selectedEducationSet || doc.set_id === selectedEducationSet;
    const matchesFileType =
      !selectedFileType || doc.file_type.toUpperCase() === selectedFileType;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesEducationSet && matchesFileType && matchesStatus && matchesSearch
    );
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return 'ri-file-pdf-line text-red-500';
      case 'DOCX':
      case 'DOC':
        return 'ri-file-word-line text-blue-500';
      case 'PPTX':
      case 'PPT':
        return 'ri-file-ppt-line text-orange-500';
      case 'XLSX':
      case 'XLS':
        return 'ri-file-excel-line text-green-500';
      default:
        return 'ri-file-line text-gray-500';
    }
  };

  const clearFilters = () => {
    setSelectedEducationSet('');
    setSelectedFileType('');
    setSelectedStatus('');
    setSearchQuery('');
  };

  return (
    <AdminLayout
      title='Eğitim Dökümanları'
      description='Eğitim materyallerini ve belgelerini yönetin'
    >
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/10'>
        <div className='px-3 sm:px-4 lg:px-6 py-6 space-y-6'>
          {/* Modern Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg'>
                  <i className='ri-file-text-line text-white text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {documents.length}
                  </p>
                  <p className='text-xs text-gray-600'>Toplam Döküman</p>
                </div>
              </div>
            </div>

            <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg'>
                  <i className='ri-folder-line text-white text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {educationSets.length}
                  </p>
                  <p className='text-xs text-gray-600'>Eğitim Seti</p>
                </div>
              </div>
            </div>

            <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg'>
                  <i className='ri-download-line text-white text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {documents.reduce(
                      (sum, doc) => sum + doc.total_downloads,
                      0
                    )}
                  </p>
                  <p className='text-xs text-gray-600'>Toplam İndirme</p>
                </div>
              </div>
            </div>

            <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg'>
                  <i className='ri-check-line text-white text-xl'></i>
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {documents.filter(doc => doc.status === 'Aktif').length}
                  </p>
                  <p className='text-xs text-gray-600'>Aktif Döküman</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <Link
                href='/admin/egitim-yonetimi/dokumanlar/kategoriler'
                className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              >
                <i className='ri-folder-line text-sm'></i>
                Kategoriler
              </Link>
              <Link
                href='/admin/egitim-yonetimi/dokumanlar/atama'
                className='bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              >
                <i className='ri-user-add-line text-sm'></i>
                Firma Atama
              </Link>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            >
              <i className='ri-add-line text-lg'></i>
              Yeni Döküman Ekle
            </button>
          </div>

          {/* Modern Filter Bar */}
          <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>
                  Eğitim Seti
                </label>
                <select
                  value={selectedEducationSet}
                  onChange={e => setSelectedEducationSet(e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50'
                >
                  <option value=''>Tüm Setler</option>
                  {educationSets.map(set => (
                    <option key={set.id} value={set.id}>
                      {set.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>
                  Dosya Türü
                </label>
                <select
                  value={selectedFileType}
                  onChange={e => setSelectedFileType(e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50'
                >
                  <option value=''>Tüm Türler</option>
                  <option value='PDF'>PDF</option>
                  <option value='DOCX'>DOCX</option>
                  <option value='PPTX'>PPTX</option>
                  <option value='XLSX'>XLSX</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>
                  Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50'
                >
                  <option value=''>Tüm Durumlar</option>
                  <option value='Aktif'>Aktif</option>
                  <option value='Pasif'>Pasif</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>
                  Arama
                </label>
                <div className='relative'>
                  <i className='ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm'></i>
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder='Döküman ara...'
                    className='w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50'
                  />
                </div>
              </div>

              <div className='flex items-end'>
                <button
                  onClick={clearFilters}
                  className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm rounded-lg font-medium transition-colors'
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>

            {filteredDocuments.length !== documents.length && (
              <div className='mt-3 text-xs text-gray-600'>
                {filteredDocuments.length} / {documents.length} döküman
                gösteriliyor
              </div>
            )}
          </div>

          {/* Documents Grid */}
          <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6'>
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
                  className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                >
                  Tekrar Dene
                </button>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-file-text-line text-gray-400 text-2xl'></i>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Döküman bulunamadı
                </h3>
                <p className='text-gray-500 mb-6'>
                  Filtrelerinizi değiştirin veya yeni döküman ekleyin.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                >
                  İlk Dökümanı Ekle
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {filteredDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className='bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/30 p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-200 transform hover:-translate-y-1'
                  >
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center'>
                          <i
                            className={`${getFileTypeIcon(doc.file_type)} text-lg`}
                          ></i>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-sm font-semibold text-gray-900 truncate'>
                            {doc.title}
                          </h3>
                          <div className='flex items-center gap-2 mt-1'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                doc.status === 'Aktif'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {doc.description && (
                      <p className='text-xs text-gray-600 mb-4 line-clamp-2'>
                        {doc.description}
                      </p>
                    )}

                    <div className='grid grid-cols-2 gap-3 mb-4 text-xs text-gray-600'>
                      <div>
                        <div className='font-medium text-gray-900'>
                          {formatFileSize(doc.file_size)}
                        </div>
                        <div className='text-xs text-gray-500'>
                          Dosya Boyutu
                        </div>
                      </div>
                      <div>
                        <div className='font-medium text-gray-900'>
                          {doc.total_downloads}
                        </div>
                        <div className='text-xs text-gray-500'>İndirme</div>
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Link
                        href={`/admin/egitim-yonetimi/dokumanlar/${doc.id}`}
                        className='flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 text-xs flex items-center justify-center shadow-sm hover:shadow-md'
                      >
                        Detay
                      </Link>
                      <button className='flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 text-xs shadow-sm hover:shadow-md'>
                        Düzenle
                      </button>
                      <button className='flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 text-xs shadow-sm hover:shadow-md'>
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Document Modal */}
      {showCreateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Yeni Döküman Ekle
              </h3>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                // Handle form submission
                setShowCreateForm(false);
              }}
              className='p-6 space-y-6'
            >
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Döküman Başlığı <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Döküman hakkında kısa açıklama...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Eğitim Seti <span className='text-red-500'>*</span>
                </label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                >
                  <option value=''>Eğitim Seti Seçin</option>
                  {educationSets.map(set => (
                    <option key={set.id} value={set.id}>
                      {set.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dosya <span className='text-red-500'>*</span>
                </label>
                <input
                  type='file'
                  accept='.pdf,.docx,.pptx,.xlsx'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Desteklenen formatlar: PDF, DOCX, PPTX, XLSX (Maksimum 50MB)
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Durum
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value='Aktif'>Aktif</option>
                  <option value='Pasif'>Pasif</option>
                </select>
              </div>
              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowCreateForm(false)}
                  className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  İptal
                </button>
                <button
                  type='submit'
                  className='px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl'
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
