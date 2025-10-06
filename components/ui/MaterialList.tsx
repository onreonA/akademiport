'use client';
import { useState, useEffect } from 'react';
interface Material {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  category: string;
  download_count: number;
  uploaded_by: string;
  created_at: string;
}
interface MaterialListProps {
  eventId: string;
  userEmail: string;
}
const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return 'ri-file-pdf-line text-red-500';
    case 'doc':
    case 'docx':
      return 'ri-file-word-line text-blue-500';
    case 'ppt':
    case 'pptx':
      return 'ri-file-ppt-line text-orange-500';
    case 'xls':
    case 'xlsx':
      return 'ri-file-excel-line text-green-500';
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'ri-video-line text-purple-500';
    case 'mp3':
    case 'wav':
      return 'ri-volume-up-line text-blue-400';
    default:
      return 'ri-file-line text-gray-500';
  }
};
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'presentation':
      return 'ri-presentation-line text-orange-500';
    case 'document':
      return 'ri-file-text-line text-blue-500';
    case 'video':
      return 'ri-video-line text-purple-500';
    case 'audio':
      return 'ri-volume-up-line text-blue-400';
    default:
      return 'ri-file-line text-gray-500';
  }
};
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
export default function MaterialList({
  eventId,
  userEmail,
}: MaterialListProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  useEffect(() => {
    fetchMaterials();
  }, [eventId]);
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/materials`, {
        headers: {
          'X-User-Email': userEmail,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success) {
        setMaterials(result.data.materials);
      } else {
        setError(result.error || 'Materyaller yüklenemedi');
      }
    } catch (error) {
      setError('Materyaller yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async (materialId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/materials/${materialId}/download`, {
        method: 'POST',
        headers: {
          'X-User-Email': userEmail,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success) {
        // Dosyayı indir
        const link = document.createElement('a');
        link.href = result.data.download_url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Dosya indirilemedi: ' + result.error);
      }
    } catch (error) {
      alert('Dosya indirilirken hata oluştu');
    }
  };
  const filteredMaterials =
    selectedCategory === 'all'
      ? materials
      : materials.filter(material => material.category === selectedCategory);
  const categories = [
    'all',
    'presentation',
    'document',
    'video',
    'audio',
    'other',
  ];
  if (loading) {
    return (
      <div className='text-center py-8'>
        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <i className='ri-loader-4-line text-xl text-blue-600 animate-spin'></i>
        </div>
        <p className='text-gray-600'>Materyaller yükleniyor...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className='text-center py-8'>
        <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <i className='ri-error-warning-line text-xl text-red-600'></i>
        </div>
        <p className='text-red-600'>{error}</p>
      </div>
    );
  }
  return (
    <div className='space-y-6'>
      {/* Kategori Filtresi */}
      <div className='flex flex-wrap gap-2'>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all'
              ? 'Tümü'
              : category === 'presentation'
                ? 'Sunumlar'
                : category === 'document'
                  ? 'Dokümanlar'
                  : category === 'video'
                    ? 'Videolar'
                    : category === 'audio'
                      ? 'Ses Dosyaları'
                      : 'Diğer'}
          </button>
        ))}
      </div>
      {/* Materyal Listesi */}
      {filteredMaterials.length === 0 ? (
        <div className='text-center py-8'>
          <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-folder-line text-xl text-gray-400'></i>
          </div>
          <p className='text-gray-500'>Bu kategoride materyal bulunamadı</p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {filteredMaterials.map(material => (
            <div
              key={material.id}
              className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-3 flex-1'>
                  <div className='flex-shrink-0'>
                    <i
                      className={`${getFileIcon(material.file_type)} text-2xl`}
                    ></i>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-medium text-gray-900 truncate'>
                      {material.title}
                    </h3>
                    {material.description && (
                      <p className='text-sm text-gray-600 mt-1'>
                        {material.description}
                      </p>
                    )}
                    <div className='flex items-center space-x-4 mt-2 text-sm text-gray-500'>
                      <span className='flex items-center'>
                        <i
                          className={`${getCategoryIcon(material.category)} mr-1`}
                        ></i>
                        {material.category === 'presentation'
                          ? 'Sunum'
                          : material.category === 'document'
                            ? 'Doküman'
                            : material.category === 'video'
                              ? 'Video'
                              : material.category === 'audio'
                                ? 'Ses'
                                : 'Diğer'}
                      </span>
                      <span>{formatFileSize(material.file_size)}</span>
                      <span>{material.download_count} indirme</span>
                      <span>
                        {new Date(material.created_at).toLocaleDateString(
                          'tr-TR'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex-shrink-0 ml-4'>
                  <button
                    onClick={() =>
                      handleDownload(material.id, material.file_name)
                    }
                    className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    <i className='ri-download-line mr-2'></i>
                    İndir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
