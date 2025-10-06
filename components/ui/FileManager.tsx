'use client';
import { useEffect, useState } from 'react';

import FileUpload from '@/components/forms/FileUpload';
import { useAuthStore } from '@/lib/stores/auth-store';
interface FileManagerProps {
  type?: 'document' | 'image' | 'profile';
  companyId?: string;
  showUpload?: boolean;
  showDelete?: boolean;
  className?: string;
}
interface FileItem {
  id: string;
  name: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  upload_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  uploaded_by: string;
}
export default function FileManager({
  type,
  companyId,
  showUpload = true,
  showDelete = true,
  className = '',
}: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const { user } = useAuthStore();
  // Fetch files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (companyId) params.append('company_id', companyId);
      const response = await fetch(`/api/files?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFiles(result.data || []);
        } else {
          setError(result.error || 'Dosyalar yüklenirken hata oluştu');
        }
      } else {
        setError('Dosyalar yüklenirken hata oluştu');
      }
    } catch (error: any) {
      setError('Dosyalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  // Delete file
  const deleteFile = async (fileId: string) => {
    if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      setDeletingFileId(fileId);
      setError('');
      const response = await fetch(`/api/upload?id=${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remove file from list
          setFiles(prev => prev.filter(file => file.id !== fileId));
        } else {
          setError(result.error || 'Dosya silinirken hata oluştu');
        }
      } else {
        setError('Dosya silinirken hata oluştu');
      }
    } catch (error: any) {
      setError('Dosya silinirken hata oluştu');
    } finally {
      setDeletingFileId(null);
    }
  };
  // Handle upload success
  const handleUploadSuccess = (newFile: any) => {
    setFiles(prev => [newFile, ...prev]);
  };
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return 'ri-image-line text-blue-500';
    } else if (fileType.includes('pdf')) {
      return 'ri-file-pdf-line text-red-500';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return 'ri-file-word-line text-blue-600';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return 'ri-file-excel-line text-green-600';
    } else {
      return 'ri-file-line text-gray-500';
    }
  };
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  useEffect(() => {
    fetchFiles();
  }, [type, companyId]);
  if (loading) {
    return (
      <div className={`file-manager ${className}`}>
        <div className='flex items-center justify-center h-32'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='ml-2 text-gray-600'>Dosyalar yükleniyor...</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`file-manager ${className}`}>
      {/* Upload Section */}
      {showUpload && (
        <div className='mb-6'>
          <FileUpload
            type={type || 'document'}
            companyId={companyId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={setError}
            className='mb-4'
          />
        </div>
      )}
      {/* Error Message */}
      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <i className='ri-error-warning-line text-red-400'></i>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-red-800'>{error}</p>
            </div>
          </div>
        </div>
      )}
      {/* Files List */}
      {files.length === 0 ? (
        <div className='text-center py-8'>
          <div className='w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <i className='ri-folder-open-line text-2xl text-gray-400'></i>
          </div>
          <p className='text-gray-500'>Henüz dosya yüklenmemiş</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {files.map(file => (
            <div
              key={file.id}
              className='flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow'
            >
              <div className='flex items-center space-x-3 flex-1 min-w-0'>
                <div className='flex-shrink-0'>
                  <i className={`${getFileIcon(file.file_type)} text-xl`}></i>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {file.name}
                  </p>
                  <div className='flex items-center space-x-4 text-xs text-gray-500'>
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        file.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {file.status === 'active' ? 'Aktif' : 'Beklemede'}
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                {/* Download Button */}
                <a
                  href={file.file_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                  title='İndir'
                >
                  <i className='ri-download-line text-lg'></i>
                </a>
                {/* View Button */}
                <a
                  href={file.file_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='p-2 text-gray-400 hover:text-green-600 transition-colors'
                  title='Görüntüle'
                >
                  <i className='ri-eye-line text-lg'></i>
                </a>
                {/* Delete Button */}
                {showDelete && (
                  <button
                    onClick={() => deleteFile(file.id)}
                    disabled={deletingFileId === file.id}
                    className='p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50'
                    title='Sil'
                  >
                    {deletingFileId === file.id ? (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
                    ) : (
                      <i className='ri-delete-bin-line text-lg'></i>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
