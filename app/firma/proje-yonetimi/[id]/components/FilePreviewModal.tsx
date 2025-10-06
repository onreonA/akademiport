'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  RiCloseLine,
  RiDownloadLine,
  RiFileLine,
  RiFilePdfLine,
  RiFileTextLine,
  RiImageLine,
  RiRefreshLine,
  RiZoomInLine,
  RiZoomOutLine,
} from 'react-icons/ri';
interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}
interface FilePreviewModalProps {
  file: ProjectFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: ProjectFile) => void;
}
export default function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onDownload,
}: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen && file) {
      setZoom(1);
      setRotation(0);
      setError(null);
    }
  }, [isOpen, file]);
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <RiImageLine className='h-16 w-16 text-blue-500' />;
    } else if (type.includes('pdf')) {
      return <RiFilePdfLine className='h-16 w-16 text-red-500' />;
    } else if (type.includes('document') || type.includes('text')) {
      return <RiFileTextLine className='h-16 w-16 text-green-500' />;
    } else {
      return <RiFileLine className='h-16 w-16 text-gray-500' />;
    }
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };
  const renderPreview = () => {
    if (!file) return null;
    if (file.type.startsWith('image/')) {
      return (
        <div className='flex items-center justify-center h-full'>
          <Image
            src={file.url}
            alt={file.name}
            width={800}
            height={600}
            className='max-w-full max-h-full object-contain transition-transform duration-200'
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Resim yüklenirken hata oluştu');
            }}
          />
        </div>
      );
    } else if (file.type.includes('pdf')) {
      return (
        <div className='h-full'>
          <iframe
            src={file.url}
            className='w-full h-full border-0'
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('PDF yüklenirken hata oluştu');
            }}
          />
        </div>
      );
    } else if (file.type.includes('text')) {
      return (
        <div className='h-full p-4'>
          <pre className='whitespace-pre-wrap text-sm text-gray-900 font-mono overflow-auto h-full'>
            {/* Text content would be loaded here */}
            <div className='flex items-center justify-center h-full text-gray-500'>
              <div className='text-center'>
                <RiFileTextLine className='h-16 w-16 mx-auto mb-4' />
                <p>Metin dosyası önizlemesi</p>
                <p className='text-sm mt-2'>
                  İndir butonunu kullanarak dosyayı görüntüleyebilirsiniz
                </p>
              </div>
            </div>
          </pre>
        </div>
      );
    } else {
      return (
        <div className='flex items-center justify-center h-full'>
          <div className='text-center'>
            {getFileIcon(file.type)}
            <p className='mt-4 text-lg font-medium text-gray-900'>
              {file.name}
            </p>
            <p className='text-gray-500'>Bu dosya türü önizlenemiyor</p>
            <p className='text-sm text-gray-400 mt-2'>
              İndir butonunu kullanarak dosyayı görüntüleyebilirsiniz
            </p>
          </div>
        </div>
      );
    }
  };
  if (!isOpen || !file) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            {getFileIcon(file.type)}
            <div>
              <h2 className='text-lg font-semibold text-gray-900 truncate max-w-md'>
                {file.name}
              </h2>
              <p className='text-sm text-gray-500'>
                {formatFileSize(file.size)} • {formatDate(file.uploadedAt)} •{' '}
                {file.uploadedBy}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            {file.type.startsWith('image/') && (
              <>
                <button
                  onClick={handleZoomOut}
                  className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                  title='Uzaklaştır'
                >
                  <RiZoomOutLine className='h-5 w-5' />
                </button>
                <span className='text-sm text-gray-600 min-w-[3rem] text-center'>
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                  title='Yakınlaştır'
                >
                  <RiZoomInLine className='h-5 w-5' />
                </button>
                <button
                  onClick={handleRotate}
                  className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                  title='Döndür'
                >
                  <RiRefreshLine className='h-5 w-5' />
                </button>
                <button
                  onClick={resetView}
                  className='px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  Sıfırla
                </button>
              </>
            )}
            <button
              onClick={() => onDownload(file)}
              className='p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors'
              title='İndir'
            >
              <RiDownloadLine className='h-5 w-5' />
            </button>
            <button
              onClick={onClose}
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              title='Kapat'
            >
              <RiCloseLine className='h-5 w-5' />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className='flex-1 relative overflow-hidden'>
          {loading && (
            <div className='absolute inset-0 flex items-center justify-center bg-white'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4'></div>
                <p className='text-gray-600'>Yükleniyor...</p>
              </div>
            </div>
          )}
          {error ? (
            <div className='absolute inset-0 flex items-center justify-center bg-white'>
              <div className='text-center'>
                <div className='text-red-500 text-5xl mb-4'>⚠️</div>
                <p className='text-lg font-medium text-gray-900 mb-2'>
                  Hata Oluştu
                </p>
                <p className='text-gray-600'>{error}</p>
                <button
                  onClick={() => onDownload(file)}
                  className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Dosyayı İndir
                </button>
              </div>
            </div>
          ) : (
            renderPreview()
          )}
        </div>
        {/* Footer */}
        {file.description && (
          <div className='p-4 border-t border-gray-200 bg-gray-50'>
            <p className='text-sm text-gray-700'>
              <span className='font-medium'>Açıklama:</span> {file.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
