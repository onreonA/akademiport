'use client';
import React from 'react';
import {
  RiDownloadLine,
  RiEyeLine,
  RiFileLine,
  RiUploadLine,
} from 'react-icons/ri';
interface FilesTabProps {
  onShowFileUpload: () => void;
}
const FilesTab: React.FC<FilesTabProps> = React.memo(({ onShowFileUpload }) => {
  // Mock files data
  const mockFiles = [
    {
      id: '1',
      name: 'proje-dokumani.pdf',
      size: '2.4 MB',
      type: 'pdf',
      uploaded_at: '2024-01-15',
      uploaded_by: 'Ahmet Yılmaz',
    },
    {
      id: '2',
      name: 'tasarim-mockup.fig',
      size: '5.1 MB',
      type: 'fig',
      uploaded_at: '2024-01-14',
      uploaded_by: 'Mehmet Kaya',
    },
    {
      id: '3',
      name: 'rapor.docx',
      size: '1.2 MB',
      type: 'docx',
      uploaded_at: '2024-01-13',
      uploaded_by: 'Ayşe Demir',
    },
  ];
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'fig':
        return '🎨';
      case 'docx':
        return '📝';
      default:
        return '📁';
    }
  };
  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'fig':
        return 'bg-purple-100 text-purple-800';
      case 'docx':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className='space-y-6'>
      {/* Upload Button */}
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold text-gray-900'>Proje Dosyaları</h3>
        <button
          onClick={onShowFileUpload}
          className='flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200'
        >
          <RiUploadLine className='h-4 w-4' />
          <span>Dosya Yükle</span>
        </button>
      </div>
      {/* Files List */}
      <div className='space-y-3'>
        {mockFiles.map(file => (
          <div
            key={file.id}
            className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='text-2xl'>{getFileIcon(file.type)}</div>
                <div>
                  <h4 className='text-sm font-medium text-gray-900'>
                    {file.name}
                  </h4>
                  <div className='flex items-center space-x-2 mt-1'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor(file.type)}`}
                    >
                      {file.type.toUpperCase()}
                    </span>
                    <span className='text-xs text-gray-500'>{file.size}</span>
                    <span className='text-xs text-gray-500'>•</span>
                    <span className='text-xs text-gray-500'>
                      {file.uploaded_at}
                    </span>
                    <span className='text-xs text-gray-500'>•</span>
                    <span className='text-xs text-gray-500'>
                      {file.uploaded_by}
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200'>
                  <RiEyeLine className='h-4 w-4' />
                </button>
                <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200'>
                  <RiDownloadLine className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {mockFiles.length === 0 && (
        <div className='text-center py-12'>
          <RiFileLine className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Henüz dosya yüklenmemiş
          </h3>
          <p className='text-gray-500 mb-4'>
            Proje ile ilgili dosyaları buraya yükleyebilirsiniz.
          </p>
          <button
            onClick={onShowFileUpload}
            className='inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200'
          >
            <RiUploadLine className='h-4 w-4' />
            <span>İlk Dosyayı Yükle</span>
          </button>
        </div>
      )}
    </div>
  );
});
FilesTab.displayName = 'FilesTab';
export default FilesTab;
