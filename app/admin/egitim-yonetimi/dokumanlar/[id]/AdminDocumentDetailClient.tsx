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
  useEffect(() => {
    fetchDocument();
  }, [documentId, fetchDocument]);
  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents?id=${documentId}`, {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (!response.ok) {
        throw new Error('Döküman getirilemedi');
      }
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        const doc = result.data[0];
        setDocument(doc);
        setFormData({
          title: doc.title,
          description: doc.description || '',
          status: doc.status,
        });
      } else {
        setError('Döküman bulunamadı');
      }
    } catch (err) {
      setError('Döküman yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [documentId]);
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
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Döküman yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (error || !document) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-red-600 text-2xl'></i>
          </div>
          <h3 className='text-lg font-medium text-red-900 mb-2'>Hata Oluştu</h3>
          <p className='text-red-700 mb-6'>{error || 'Döküman bulunamadı'}</p>
          <Link
            href='/admin/egitim-yonetimi/dokumanlar'
            className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
          >
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }
  const fileIcon = getFileIcon(document.file_type);
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <Link
                href='/admin/egitim-yonetimi/dokumanlar'
                className='flex items-center gap-2 text-gray-600 hover:text-blue-600'
              >
                <i className='ri-arrow-left-line'></i>
                <span>Geri Dön</span>
              </Link>
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Ana Panel
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <Link
                  href='/admin/egitim-yonetimi/dokumanlar'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Eğitim Dökümanları
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>
                  {document.title}
                </span>
              </nav>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Document Header */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-4'>
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center ${fileIcon.color}`}
                >
                  <i className={`${fileIcon.icon} text-2xl`}></i>
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                    {document.title}
                  </h1>
                  <div className='flex items-center gap-4 text-sm text-gray-600'>
                    <span className='px-3 py-1 bg-purple-100 text-purple-800 rounded-full'>
                      {document.education_sets?.category || 'B2B'}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full ${
                        document.status === 'Aktif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {document.status}
                    </span>
                    <span>{formatFileSize(document.file_size)}</span>
                    <span>
                      {new Date(document.created_at).toLocaleDateString(
                        'tr-TR'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {document.description && (
              <p className='text-gray-600 mb-6'>{document.description}</p>
            )}
            {/* Action Buttons */}
            <div className='flex gap-3'>
              {document.file_type.toUpperCase() === 'PDF' && (
                <button
                  onClick={() => setShowPdfViewer(true)}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors'
                >
                  <i className='ri-eye-line'></i>
                  PDF Görüntüle
                </button>
              )}
              <button
                onClick={() => setEditing(!editing)}
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors'
              >
                <i className='ri-edit-line'></i>
                {editing ? 'İptal' : 'Düzenle'}
              </button>
              <button
                onClick={handleDelete}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors'
              >
                <i className='ri-delete-bin-line'></i>
                Sil
              </button>
            </div>
          </div>
          {/* Edit Form */}
          {editing && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Döküman Düzenle
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Döküman Başlığı
                  </label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='Aktif'>Aktif</option>
                    <option value='Pasif'>Pasif</option>
                  </select>
                </div>
                <div className='flex gap-3'>
                  <button
                    onClick={handleUpdate}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                  >
                    Güncelle
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* PDF Viewer Modal */}
          {showPdfViewer && document.file_type.toUpperCase() === 'PDF' && (
            <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
              <div className='bg-white rounded-xl shadow-2xl w-full max-w-6xl h-5/6 flex flex-col'>
                <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {document.title}
                  </h3>
                  <button
                    onClick={() => setShowPdfViewer(false)}
                    className='text-gray-500 hover:text-gray-700'
                  >
                    <i className='ri-close-line text-xl'></i>
                  </button>
                </div>
                <div className='flex-1 p-4'>
                  <iframe
                    src={`${document.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
                    className='w-full h-full border-0 rounded-lg'
                    title={document.title}
                  />
                </div>
              </div>
            </div>
          )}
          {/* Document Info */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Döküman Bilgileri
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Eğitim Seti</h4>
                <p className='text-gray-600'>
                  {document.education_sets?.name || 'Bilinmiyor'}
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Dosya Türü</h4>
                <p className='text-gray-600'>
                  {document.file_type.toUpperCase()}
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Dosya Boyutu</h4>
                <p className='text-gray-600'>
                  {formatFileSize(document.file_size)}
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Yayın Tarihi</h4>
                <p className='text-gray-600'>
                  {new Date(document.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>
                  Toplam İndirme
                </h4>
                <p className='text-gray-600'>
                  {document.total_downloads || 0} kez
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Son İndirme</h4>
                <p className='text-gray-600'>
                  {document.last_downloaded_at
                    ? new Date(document.last_downloaded_at).toLocaleDateString(
                        'tr-TR'
                      )
                    : 'Henüz indirilmemiş'}
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Dosya URL</h4>
                <p className='text-gray-600 text-sm break-all'>
                  {document.file_url}
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 mb-2'>Storage Path</h4>
                <p className='text-gray-600 text-sm break-all'>
                  {document.storage_path || 'Belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
