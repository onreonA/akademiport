'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

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
}

interface AdminDocumentDetailClientProps {
  documentId: string;
}

export default function AdminDocumentDetailClient({
  documentId,
}: AdminDocumentDetailClientProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Aktif',
  });

  // fetchDocument fonksiyonunu useCallback ile tanımla
  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/documents?id=${documentId}`, {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const doc = result.data[0];
        setDocument(doc);
        setFormData({
          title: doc.title || '',
          description: doc.description || '',
          status: doc.status || 'Aktif',
        });
      } else {
        setError('Döküman bulunamadı');
      }
    } catch (err) {
      console.error('fetchDocument error:', err);
      setError(
        err instanceof Error ? err.message : 'Döküman yüklenirken hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // useEffect'i fetchDocument'tan sonra çağır
  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleUpdate = async () => {
    if (!document) return;
    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'PATCH',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Döküman güncellenemedi');
      }
      const result = await response.json();
      if (result.success) {
        setDocument({
          ...document,
          ...formData,
        });
        setEditing(false);
        alert('Döküman başarıyla güncellendi');
      } else {
        alert(result.error || 'Güncelleme sırasında hata oluştu');
      }
    } catch (error) {
      alert('Güncelleme sırasında hata oluştu');
    }
  };
  const handleDelete = async () => {
    if (!document) return;
    if (!confirm('Bu dökümanı silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (!response.ok) {
        throw new Error('Döküman silinemedi');
      }
      const result = await response.json();
      if (result.success) {
        alert('Döküman başarıyla silindi');
        window.location.href = '/admin/egitim-yonetimi/dokumanlar';
      } else {
        alert(result.error || 'Silme sırasında hata oluştu');
      }
    } catch (error) {
      alert('Silme sırasında hata oluştu');
    }
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const getFileIcon = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return { icon: 'ri-file-pdf-line', color: 'text-red-500 bg-red-50' };
      case 'DOCX':
        return { icon: 'ri-file-word-line', color: 'text-blue-600 bg-blue-50' };
      case 'PPTX':
        return {
          icon: 'ri-file-ppt-line',
          color: 'text-orange-500 bg-orange-50',
        };
      case 'XLSX':
        return {
          icon: 'ri-file-excel-line',
          color: 'text-green-600 bg-green-50',
        };
      default:
        return { icon: 'ri-file-text-line', color: 'text-gray-500 bg-gray-50' };
    }
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-slate-600 font-medium'>Döküman yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center'>
        <div className='text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20'>
          <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-red-600 text-xl'></i>
          </div>
          <h3 className='text-lg font-semibold text-red-900 mb-2'>
            Hata Oluştu
          </h3>
          <p className='text-red-700 mb-6'>{error || 'Döküman bulunamadı'}</p>
          <Link
            href='/admin/egitim-yonetimi/dokumanlar'
            className='bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg cursor-pointer'
          >
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }
  const fileIcon = getFileIcon(document.file_type);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      <div className='px-3 sm:px-4 lg:px-6 py-4'>
        <div className='max-w-6xl mx-auto space-y-4'>
          {/* Modern Breadcrumb */}
          <div className='flex items-center gap-2 text-sm text-slate-600 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20'>
            <Link
              href='/admin'
              className='hover:text-blue-600 cursor-pointer transition-colors duration-200'
            >
              Ana Panel
            </Link>
            <i className='ri-arrow-right-s-line text-slate-400'></i>
            <Link
              href='/admin/egitim-yonetimi/dokumanlar'
              className='hover:text-blue-600 cursor-pointer transition-colors duration-200'
            >
              Eğitim Dökümanları
            </Link>
            <i className='ri-arrow-right-s-line text-slate-400'></i>
            <span className='text-slate-900 font-semibold'>
              {document.title}
            </span>
          </div>
          {/* Modern Document Header */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-4'>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${fileIcon.color} shadow-lg`}
                >
                  <i className={`${fileIcon.icon} text-xl`}></i>
                </div>
                <div>
                  <h1 className='text-xl font-bold text-slate-900 mb-2'>
                    {document.title}
                  </h1>
                  <div className='flex flex-wrap items-center gap-2 text-xs'>
                    <span className='px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full font-medium'>
                      {document.education_sets?.category || 'B2B'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full font-medium ${
                        document.status === 'Aktif'
                          ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                      }`}
                    >
                      {document.status}
                    </span>
                    <span className='px-2 py-1 bg-slate-100 text-slate-700 rounded-full'>
                      {formatFileSize(document.file_size)}
                    </span>
                    <span className='px-2 py-1 bg-slate-100 text-slate-700 rounded-full'>
                      {new Date(document.created_at).toLocaleDateString(
                        'tr-TR'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {document.description && (
              <p className='text-slate-600 mb-4 text-sm leading-relaxed'>
                {document.description}
              </p>
            )}

            {/* Modern Action Buttons */}
            <div className='flex flex-wrap gap-2'>
              {document.file_type.toUpperCase() === 'PDF' && (
                <button
                  onClick={() => setShowPdfViewer(true)}
                  className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-105'
                >
                  <i className='ri-eye-line text-sm'></i>
                  PDF Görüntüle
                </button>
              )}
              <button
                onClick={() => setEditing(!editing)}
                className='bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-105'
              >
                <i className='ri-edit-line text-sm'></i>
                {editing ? 'İptal' : 'Düzenle'}
              </button>
              <button
                onClick={handleDelete}
                className='bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-105'
              >
                <i className='ri-delete-bin-line text-sm'></i>
                Sil
              </button>
            </div>
          </div>
          {/* Modern Edit Form */}
          {editing && (
            <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300'>
              <h3 className='text-lg font-bold text-slate-900 mb-4 flex items-center gap-2'>
                <i className='ri-edit-line text-blue-600'></i>
                Döküman Düzenle
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Döküman Başlığı
                  </label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className='w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className='w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-slate-700 mb-2'>
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className='w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200'
                  >
                    <option value='Aktif'>Aktif</option>
                    <option value='Pasif'>Pasif</option>
                  </select>
                </div>
                <div className='flex flex-wrap gap-2 pt-2'>
                  <button
                    onClick={handleUpdate}
                    className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2'
                  >
                    <i className='ri-save-line text-sm'></i>
                    Güncelle
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className='bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2'
                  >
                    <i className='ri-close-line text-sm'></i>
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Modern PDF Viewer Modal */}
          {showPdfViewer && document.file_type.toUpperCase() === 'PDF' && (
            <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
              <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-7xl h-5/6 flex flex-col border border-white/20'>
                <div className='p-6 border-b border-slate-200/50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-3xl'>
                  <h3 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
                    <i className='ri-file-pdf-line text-red-600'></i>
                    {document.title}
                  </h3>
                  <button
                    onClick={() => setShowPdfViewer(false)}
                    className='text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200'
                  >
                    <i className='ri-close-line text-xl'></i>
                  </button>
                </div>
                <div className='flex-1 p-6'>
                  <iframe
                    src={`${document.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
                    className='w-full h-full border-0 rounded-2xl shadow-inner'
                    title={document.title}
                  />
                </div>
              </div>
            </div>
          )}
          {/* Modern Document Info */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300'>
            <h3 className='text-lg font-bold text-slate-900 mb-6 flex items-center gap-2'>
              <i className='ri-information-line text-blue-600'></i>
              Döküman Bilgileri
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50'>
                <h4 className='font-semibold text-blue-900 mb-2 flex items-center gap-2'>
                  <i className='ri-book-line text-blue-600'></i>
                  Eğitim Seti
                </h4>
                <p className='text-blue-800 font-medium'>
                  {document.education_sets?.name || 'Bilinmiyor'}
                </p>
              </div>

              <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200/50'>
                <h4 className='font-semibold text-green-900 mb-2 flex items-center gap-2'>
                  <i className='ri-file-line text-green-600'></i>
                  Dosya Türü
                </h4>
                <p className='text-green-800 font-medium'>
                  {document.file_type.toUpperCase()}
                </p>
              </div>

              <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50'>
                <h4 className='font-semibold text-purple-900 mb-2 flex items-center gap-2'>
                  <i className='ri-file-size-line text-purple-600'></i>
                  Dosya Boyutu
                </h4>
                <p className='text-purple-800 font-medium'>
                  {formatFileSize(document.file_size)}
                </p>
              </div>

              <div className='bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200/50'>
                <h4 className='font-semibold text-orange-900 mb-2 flex items-center gap-2'>
                  <i className='ri-calendar-line text-orange-600'></i>
                  Yayın Tarihi
                </h4>
                <p className='text-orange-800 font-medium'>
                  {new Date(document.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>

              <div className='bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200/50'>
                <h4 className='font-semibold text-indigo-900 mb-2 flex items-center gap-2'>
                  <i className='ri-download-line text-indigo-600'></i>
                  Toplam İndirme
                </h4>
                <p className='text-indigo-800 font-medium'>
                  {document.total_downloads || 0} kez
                </p>
              </div>

              <div className='bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200/50'>
                <h4 className='font-semibold text-teal-900 mb-2 flex items-center gap-2'>
                  <i className='ri-time-line text-teal-600'></i>
                  Son İndirme
                </h4>
                <p className='text-teal-800 font-medium'>
                  {document.last_downloaded_at
                    ? new Date(document.last_downloaded_at).toLocaleDateString(
                        'tr-TR'
                      )
                    : 'Henüz indirilmemiş'}
                </p>
              </div>
            </div>

            {/* Technical Details */}
            <div className='mt-6 pt-6 border-t border-slate-200/50'>
              <h4 className='font-semibold text-slate-900 mb-4 flex items-center gap-2'>
                <i className='ri-code-line text-slate-600'></i>
                Teknik Detaylar
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-slate-50 rounded-xl p-4 border border-slate-200/50'>
                  <h5 className='font-medium text-slate-700 mb-2'>Dosya URL</h5>
                  <p className='text-slate-600 text-sm break-all font-mono bg-white/50 p-2 rounded-lg'>
                    {document.file_url}
                  </p>
                </div>
                <div className='bg-slate-50 rounded-xl p-4 border border-slate-200/50'>
                  <h5 className='font-medium text-slate-700 mb-2'>
                    Storage Path
                  </h5>
                  <p className='text-slate-600 text-sm break-all font-mono bg-white/50 p-2 rounded-lg'>
                    {document.storage_path || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
