'use client';
import React, { useCallback, useRef, useState } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';
interface FileUploadProps {
  type: 'document' | 'image' | 'profile';
  companyId?: string;
  onUploadSuccess?: (file: any) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
}
interface UploadedFile {
  id: string;
  name: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  upload_type: string;
  created_at: string;
}
export default function FileUpload({
  type,
  companyId,
  onUploadSuccess,
  onUploadError,
  maxSize = 10,
  allowedTypes,
  className = '',
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  // Default allowed types based on upload type
  const getDefaultAllowedTypes = (uploadType: string) => {
    switch (uploadType) {
      case 'document':
        return ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
      case 'image':
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      case 'profile':
        return ['.jpg', '.jpeg', '.png', '.webp'];
      default:
        return [];
    }
  };
  const acceptedTypes = allowedTypes || getDefaultAllowedTypes(type);
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFileUpload(files[0]);
      }
    },
    [disabled]
  );
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };
  const handleFileUpload = async (file: File) => {
    if (disabled) return;
    setError('');
    setIsUploading(true);
    setUploadProgress(0);
    try {
      // Validate file size
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new Error(
          `Dosya boyutu çok büyük. Maksimum ${maxSize}MB olabilir.`
        );
      }
      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        throw new Error(
          `Geçersiz dosya türü. İzin verilen türler: ${acceptedTypes.join(', ')}`
        );
      }
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (companyId) {
        formData.append('company_id', companyId);
      }
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      // Upload file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Dosya yüklenirken hata oluştu');
      }
      const result = await response.json();
      if (result.success) {
        onUploadSuccess?.(result.data);
        setError('');
      } else {
        throw new Error(result.error || 'Dosya yüklenirken hata oluştu');
      }
    } catch (error: any) {
      setError(error.message || 'Dosya yüklenirken hata oluştu');
      onUploadError?.(error.message || 'Dosya yüklenirken hata oluştu');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  const triggerFileSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return (
    <div className={`file-upload-container ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className='hidden'
          disabled={disabled}
        />
        {isUploading ? (
          <div className='space-y-4'>
            <div className='w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-900'>
                Dosya yükleniyor...
              </p>
              <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className='text-xs text-gray-500 mt-1'>{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center'>
              <i className='ri-upload-cloud-2-line text-2xl text-gray-400'></i>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-900'>
                {type === 'document' &&
                  'Belge yüklemek için tıklayın veya sürükleyin'}
                {type === 'image' &&
                  'Resim yüklemek için tıklayın veya sürükleyin'}
                {type === 'profile' &&
                  'Profil resmi yüklemek için tıklayın veya sürükleyin'}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                İzin verilen türler: {acceptedTypes.join(', ')}
              </p>
              <p className='text-xs text-gray-500'>
                Maksimum dosya boyutu: {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-md'>
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
    </div>
  );
}
