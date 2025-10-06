'use client';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import {
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiFileLine,
  RiFileTextLine,
  RiImageLine,
  RiUploadLine,
} from 'react-icons/ri';
interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onUploadSuccess?: (files: UploadedFile[]) => void;
}
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'document' | 'image' | 'other';
  url: string;
  uploadedAt: string;
}
interface FileWithPreview extends File {
  id: string;
  preview?: string;
  category: 'document' | 'image' | 'other';
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  other: ['text/plain', 'application/zip', 'application/x-rar-compressed'],
};
export default function FileUploadModal({
  isOpen,
  onClose,
  projectId,
  onUploadSuccess,
}: FileUploadModalProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getFileCategory = useCallback(
    (type: string): 'document' | 'image' | 'other' => {
      if (ALLOWED_TYPES.document.includes(type)) return 'document';
      if (ALLOWED_TYPES.image.includes(type)) return 'image';
      return 'other';
    },
    []
  );
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const validateFile = (file: File): string | null => {
    const allAllowedTypes = [
      ...ALLOWED_TYPES.document,
      ...ALLOWED_TYPES.image,
      ...ALLOWED_TYPES.other,
    ];
    if (!allAllowedTypes.includes(file.type)) {
      return 'Desteklenmeyen dosya türü';
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Dosya boyutu 10MB'dan büyük olamaz";
    }
    return null;
  };
  const createFilePreview = useCallback(
    (file: File): FileWithPreview => {
      const fileWithPreview = Object.assign(file, {
        id: Math.random().toString(36).substr(2, 9),
        category: getFileCategory(file.type),
        status: 'pending' as const,
        progress: 0,
      });
      if (file.type.startsWith('image/')) {
        (fileWithPreview as any).preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    },
    [getFileCategory]
  );
  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;
      const newFiles: FileWithPreview[] = [];
      Array.from(selectedFiles).forEach(file => {
        const error = validateFile(file);
        if (error) {
          alert(`${file.name}: ${error}`);
          return;
        }
        newFiles.push(createFilePreview(file));
      });
      setFiles(prev => [...prev, ...newFiles]);
    },
    [createFilePreview]
  );
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };
  const uploadFiles = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    const uploadedFiles: UploadedFile[] = [];
    for (const file of files) {
      try {
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
          )
        );
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev =>
            prev.map(f => (f.id === file.id ? { ...f, progress } : f))
          );
        }
        // Mock successful upload
        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          category: file.category,
          url: `/uploads/${file.name}`,
          uploadedAt: new Date().toISOString(),
        };
        uploadedFiles.push(uploadedFile);
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
          )
        );
      } catch (error) {
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'error', error: 'Yükleme hatası' }
              : f
          )
        );
      }
    }
    setIsUploading(false);
    if (uploadedFiles.length > 0) {
      onUploadSuccess?.(uploadedFiles);
      setTimeout(() => {
        onClose();
        setFiles([]);
      }, 1500);
    }
  };
  const getFileIcon = (category: string, type: string) => {
    switch (category) {
      case 'image':
        return <RiImageLine className='w-5 h-5 text-green-600' />;
      case 'document':
        return <RiFileTextLine className='w-5 h-5 text-blue-600' />;
      default:
        return <RiFileLine className='w-5 h-5 text-gray-600' />;
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <RiCheckLine className='w-4 h-4 text-green-600' />;
      case 'error':
        return <RiErrorWarningLine className='w-4 h-4 text-red-600' />;
      case 'uploading':
        return (
          <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
        );
      default:
        return null;
    }
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>Dosya Yükle</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <RiCloseLine className='w-5 h-5 text-gray-500' />
          </button>
        </div>
        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <RiUploadLine className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Dosyaları buraya sürükleyin
            </h3>
            <p className='text-gray-500 mb-4'>
              veya dosya seçmek için tıklayın
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
            >
              Dosya Seç
            </button>
            <input
              ref={fileInputRef}
              type='file'
              multiple
              onChange={e => handleFileSelect(e.target.files)}
              className='hidden'
              accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip,.rar'
            />
            <p className='text-sm text-gray-400 mt-4'>
              Desteklenen formatlar: PDF, Word, Excel, resimler, metin dosyaları
              <br />
              Maksimum dosya boyutu: 10MB
            </p>
          </div>
          {/* File List */}
          {files.length > 0 && (
            <div className='space-y-3'>
              <h4 className='font-medium text-gray-900'>
                Seçilen Dosyalar ({files.length})
              </h4>
              <div className='max-h-60 overflow-y-auto space-y-2'>
                {files.map(file => (
                  <div
                    key={file.id}
                    className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                  >
                    {file.preview ? (
                      <Image
                        src={file.preview}
                        alt={file.name}
                        width={40}
                        height={40}
                        className='w-10 h-10 object-cover rounded'
                      />
                    ) : (
                      <div className='w-10 h-10 bg-white rounded flex items-center justify-center'>
                        {getFileIcon(file.category, file.type)}
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {file.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatFileSize(file.size)} • {file.category}
                      </p>
                      {file.status === 'uploading' && (
                        <div className='w-full bg-gray-200 rounded-full h-1.5 mt-1'>
                          <div
                            className='bg-blue-600 h-1.5 rounded-full transition-all duration-300'
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                      {file.error && (
                        <p className='text-xs text-red-600 mt-1'>
                          {file.error}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center space-x-2'>
                      {getStatusIcon(file.status)}
                      {file.status === 'pending' && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className='p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-600'
                        >
                          <RiDeleteBinLine className='w-4 h-4' />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className='flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            İptal
          </button>
          <button
            onClick={uploadFiles}
            disabled={files.length === 0 || isUploading}
            className='px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2'
          >
            {isUploading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                <span>Yükleniyor...</span>
              </>
            ) : (
              <>
                <RiUploadLine className='w-4 h-4' />
                <span>Yükle ({files.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
