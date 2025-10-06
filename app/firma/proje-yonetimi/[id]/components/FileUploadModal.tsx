'use client';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import {
  RiCloseLine,
  RiFileLine,
  RiFileTextLine,
  RiImageLine,
  RiUploadLine,
} from 'react-icons/ri';
interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  projectId: string;
}
interface FilePreview {
  file: File;
  preview: string | null;
  type: 'image' | 'document' | 'other';
}
export default function FileUploadModal({
  isOpen,
  onClose,
  onUpload,
  projectId,
}: FileUploadModalProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const getFileType = (file: File): 'image' | 'document' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (
      file.type.includes('pdf') ||
      file.type.includes('document') ||
      file.type.includes('text')
    )
      return 'document';
    return 'other';
  };
  const getFileIcon = (type: 'image' | 'document' | 'other') => {
    switch (type) {
      case 'image':
        return <RiImageLine className='h-8 w-8 text-blue-500' />;
      case 'document':
        return <RiFileTextLine className='h-8 w-8 text-green-500' />;
      default:
        return <RiFileLine className='h-8 w-8 text-gray-500' />;
    }
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const filePreviews: FilePreview[] = fileArray.map(file => {
      const type = getFileType(file);
      let preview: string | null = null;
      if (type === 'image') {
        preview = URL.createObjectURL(file);
      }
      return { file, preview, type };
    });
    setFiles(prev => [...prev, ...filePreviews]);
  }, []);
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
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );
  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);
  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      await onUpload(files.map(f => f.file));
      setFiles([]);
      onClose();
    } catch (error) {
    } finally {
      setUploading(false);
    }
  }, [files, onUpload, onClose]);
  const handleClose = useCallback(() => {
    // Clean up preview URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    onClose();
  }, [files, onClose]);
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>Dosya Yükle</h2>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <RiCloseLine className='h-6 w-6' />
          </button>
        </div>
        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <RiUploadLine className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-lg font-medium text-gray-900 mb-2'>
              Dosyaları buraya sürükleyin
            </p>
            <p className='text-gray-600 mb-4'>veya</p>
            <label className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors'>
              <RiUploadLine className='h-5 w-5 mr-2' />
              Dosya Seç
              <input
                type='file'
                multiple
                className='hidden'
                onChange={handleFileInput}
                accept='image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls'
              />
            </label>
            <p className='text-sm text-gray-500 mt-2'>
              PNG, JPG, PDF, DOC, DOCX, TXT, XLSX (Max 10MB)
            </p>
          </div>
          {/* File List */}
          {files.length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-lg font-medium text-gray-900'>
                Yüklenecek Dosyalar
              </h3>
              <div className='space-y-2 max-h-60 overflow-y-auto'>
                {files.map((filePreview, index) => (
                  <div
                    key={index}
                    className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                  >
                    {filePreview.type === 'image' && filePreview.preview ? (
                      <Image
                        src={filePreview.preview}
                        alt={filePreview.file.name}
                        width={48}
                        height={48}
                        className='h-12 w-12 object-cover rounded'
                      />
                    ) : (
                      <div className='h-12 w-12 flex items-center justify-center bg-gray-200 rounded'>
                        {getFileIcon(filePreview.type)}
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {filePreview.file.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatFileSize(filePreview.file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className='text-red-500 hover:text-red-700 transition-colors'
                    >
                      <RiCloseLine className='h-5 w-5' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className='flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={handleClose}
            className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            İptal
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2'
          >
            {uploading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                <span>Yükleniyor...</span>
              </>
            ) : (
              <>
                <RiUploadLine className='h-4 w-4' />
                <span>Yükle ({files.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
