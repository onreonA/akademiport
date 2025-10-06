'use client';
import { useState } from 'react';
import {
  RiCalendarLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiEyeLine,
  RiFileLine,
  RiFilePdfLine,
  RiFileTextLine,
  RiImageLine,
  RiMoreLine,
  RiUserLine,
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
interface FileListProps {
  files: ProjectFile[];
  onDownload: (file: ProjectFile) => void;
  onDelete: (fileId: string) => void;
  onPreview: (file: ProjectFile) => void;
}
export default function FileList({
  files,
  onDownload,
  onDelete,
  onPreview,
}: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <RiImageLine className='h-8 w-8 text-blue-500' />;
    } else if (type.includes('pdf')) {
      return <RiFilePdfLine className='h-8 w-8 text-red-500' />;
    } else if (type.includes('document') || type.includes('text')) {
      return <RiFileTextLine className='h-8 w-8 text-green-500' />;
    } else {
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const canPreview = (type: string) => {
    return (
      type.startsWith('image/') || type.includes('pdf') || type.includes('text')
    );
  };
  if (files.length === 0) {
    return (
      <div className='text-center py-12'>
        <RiFileLine className='h-16 w-16 text-gray-300 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Henüz dosya yüklenmedi
        </h3>
        <p className='text-gray-600'>
          Projeye dosya yüklemek için yukarıdaki &quot;Dosya Yükle&quot;
          butonunu kullanın.
        </p>
      </div>
    );
  }
  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <h3 className='text-lg font-medium text-gray-900'>
            Dosyalar ({files.length})
          </h3>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className='grid grid-cols-2 gap-1 w-4 h-4'>
                <div className='bg-current rounded-sm'></div>
                <div className='bg-current rounded-sm'></div>
                <div className='bg-current rounded-sm'></div>
                <div className='bg-current rounded-sm'></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className='space-y-1 w-4 h-4'>
                <div className='bg-current rounded-sm h-1'></div>
                <div className='bg-current rounded-sm h-1'></div>
                <div className='bg-current rounded-sm h-1'></div>
              </div>
            </button>
          </div>
        </div>
      </div>
      {/* Files */}
      {viewMode === 'grid' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {files.map(file => (
            <div
              key={file.id}
              className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>{getFileIcon(file.type)}</div>
                <div className='flex-1 min-w-0'>
                  <h4
                    className='text-sm font-medium text-gray-900 truncate'
                    title={file.name}
                  >
                    {file.name}
                  </h4>
                  <p className='text-xs text-gray-500 mt-1'>
                    {formatFileSize(file.size)}
                  </p>
                  <div className='flex items-center space-x-2 mt-2 text-xs text-gray-500'>
                    <RiCalendarLine className='h-3 w-3' />
                    <span>{formatDate(file.uploadedAt)}</span>
                  </div>
                  <div className='flex items-center space-x-2 mt-1 text-xs text-gray-500'>
                    <RiUserLine className='h-3 w-3' />
                    <span>{file.uploadedBy}</span>
                  </div>
                </div>
                <div className='flex-shrink-0'>
                  <div className='relative'>
                    <button className='text-gray-400 hover:text-gray-600'>
                      <RiMoreLine className='h-4 w-4' />
                    </button>
                    {/* Dropdown menu would go here */}
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-2 mt-3'>
                {canPreview(file.type) && (
                  <button
                    onClick={() => onPreview(file)}
                    className='flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'
                  >
                    <RiEyeLine className='h-4 w-4' />
                    <span>Önizle</span>
                  </button>
                )}
                <button
                  onClick={() => onDownload(file)}
                  className='flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors'
                >
                  <RiDownloadLine className='h-4 w-4' />
                  <span>İndir</span>
                </button>
                <button
                  onClick={() => onDelete(file.id)}
                  className='px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors'
                >
                  <RiDeleteBinLine className='h-4 w-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Dosya
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Boyut
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Yükleyen
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Tarih
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {files.map(file => (
                  <tr key={file.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center space-x-3'>
                        {getFileIcon(file.type)}
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {file.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {file.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {formatFileSize(file.size)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {file.uploadedBy}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex items-center justify-end space-x-2'>
                        {canPreview(file.type) && (
                          <button
                            onClick={() => onPreview(file)}
                            className='text-blue-600 hover:text-blue-900'
                          >
                            <RiEyeLine className='h-4 w-4' />
                          </button>
                        )}
                        <button
                          onClick={() => onDownload(file)}
                          className='text-green-600 hover:text-green-900'
                        >
                          <RiDownloadLine className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => onDelete(file.id)}
                          className='text-red-600 hover:text-red-900'
                        >
                          <RiDeleteBinLine className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
