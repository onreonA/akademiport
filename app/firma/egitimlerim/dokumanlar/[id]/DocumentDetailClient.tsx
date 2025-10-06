'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
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
  is_completed?: boolean;
  education_sets?: {
    id: string;
    name: string;
  };
}
interface DocumentDetailClientProps {
  documentId: string;
}
export default function DocumentDetailClient({
  documentId,
}: DocumentDetailClientProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);
  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents?id=${documentId}`, {
        headers: {
          'X-User-Email': 'info@mundo.com',
        },
      });
      if (!response.ok) {
        throw new Error('Döküman getirilemedi');
      }
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        const doc = result.data[0];
        // Fetch progress
        const progressResponse = await fetch(
          `/api/document-progress?document_id=${documentId}`,
          {
            headers: {
              'X-User-Email': 'info@mundo.com',
            },
          }
        );
        if (progressResponse.ok) {
          const progressResult = await progressResponse.json();
          if (progressResult.success && progressResult.data.length > 0) {
            setProgress(progressResult.data[0].progress_percentage || 0);
          }
        }
        setDocument(doc);
      } else {
        setError('Döküman bulunamadı');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [documentId]);
  const updateProgress = async (newProgress: number) => {
    try {
      const response = await fetch('/api/document-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'info@mundo.com',
        },
        body: JSON.stringify({
          document_id: documentId,
          progress_percentage: newProgress,
        }),
      });
      if (response.ok) {
        setProgress(newProgress);
      }
    } catch (err) {}
  };
  const handleDownload = async () => {
    if (!document) return;
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        method: 'POST',
        headers: {
          'X-User-Email': 'info@mundo.com',
        },
      });
      if (response.ok) {
        // Trigger download
        const link = document.createElement('a');
        link.href = document.file_url;
        link.download = document.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {}
  };
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === 'pdf') {
      return {
        icon: 'ri-file-pdf-line',
        color: 'bg-red-100 text-red-600',
      };
    } else if (type === 'doc' || type === 'docx') {
      return {
        icon: 'ri-file-word-line',
        color: 'bg-blue-100 text-blue-600',
      };
    } else if (type === 'xls' || type === 'xlsx') {
      return {
        icon: 'ri-file-excel-line',
        color: 'bg-green-100 text-green-600',
      };
    } else if (type === 'ppt' || type === 'pptx') {
      return {
        icon: 'ri-file-ppt-line',
        color: 'bg-orange-100 text-orange-600',
      };
    } else {
      return {
        icon: 'ri-file-line',
        color: 'bg-gray-100 text-gray-600',
      };
    }
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Döküman Detayı'
        description='Eğitim dökümanını görüntüleyin ve indirin'
      >
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
              <p className='text-gray-600'>Döküman yükleniyor...</p>
            </div>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  if (error || !document) {
    return (
      <FirmaLayout
        title='Döküman Detayı'
        description='Eğitim dökümanını görüntüleyin ve indirin'
      >
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-error-warning-line text-red-600 text-2xl'></i>
              </div>
              <h3 className='text-lg font-medium text-red-900 mb-2'>
                Hata Oluştu
              </h3>
              <p className='text-red-700 mb-6'>
                {error || 'Döküman bulunamadı'}
              </p>
              <Link
                href='/firma/egitimlerim/dokumanlar'
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
              >
                Geri Dön
              </Link>
            </div>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  const fileIcon = getFileIcon(document.file_type);
  return (
    <FirmaLayout
      title='Döküman Detayı'
      description='Eğitim dökümanını görüntüleyin ve indirin'
    >
      <div className='max-w-7xl mx-auto'>
        {/* Breadcrumb */}
        <nav className='flex mb-6' aria-label='Breadcrumb'>
          <ol className='inline-flex items-center space-x-1 md:space-x-3'>
            <li className='inline-flex items-center'>
              <Link
                href='/firma/egitimlerim/dokumanlar'
                className='text-gray-700 hover:text-blue-600'
              >
                <i className='ri-arrow-left-line mr-2'></i>
                Eğitim Dökümanları
              </Link>
            </li>
            <li>
              <div className='flex items-center'>
                <i className='ri-arrow-right-s-line text-gray-400 mx-2'></i>
                <span className='text-gray-500'>{document.title}</span>
              </div>
            </li>
          </ol>
        </nav>
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
                  <span>
                    <i className='ri-file-text-line mr-1'></i>
                    {document.file_type.toUpperCase()}
                  </span>
                  <span>
                    <i className='ri-hard-drive-line mr-1'></i>
                    {formatFileSize(document.file_size)}
                  </span>
                  <span>
                    <i className='ri-download-line mr-1'></i>
                    {document.total_downloads || 0} indirme
                  </span>
                  {document.is_completed && (
                    <span className='text-green-600 font-medium'>
                      <i className='ri-check-line mr-1'></i>Tamamlandı
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {document.description && (
            <p className='text-gray-600 mb-4'>{document.description}</p>
          )}
          {/* Progress Bar */}
          <div className='mb-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                İlerleme
              </span>
              <span className='text-sm text-gray-600'>{progress}%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
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
              onClick={handleDownload}
              className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors'
            >
              <i className='ri-download-line'></i>
              İndir
            </button>
            <button
              onClick={() => updateProgress(Math.min(progress + 25, 100))}
              className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors'
            >
              <i className='ri-check-line'></i>
              İlerleme Kaydet
            </button>
          </div>
        </div>
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
              <h4 className='font-medium text-gray-900 mb-2'>Toplam İndirme</h4>
              <p className='text-gray-600'>
                {document.total_downloads || 0} kez
              </p>
            </div>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Durum</h4>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  document.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {document.status === 'active' ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </div>
        </div>
      </div>
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
    </FirmaLayout>
  );
}
