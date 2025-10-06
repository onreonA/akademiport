'use client';
import Link from 'next/link';
interface EducationSet {
  id: string;
  name: string;
  description: string;
  category: string;
  video_count: number;
  total_duration: number;
  status: string;
  created_at: string;
  progress_percentage: number;
  isLocked?: boolean;
  points?: number;
  level?: number;
  badges?: string[];
}
interface EducationCardProps {
  educationSet: EducationSet;
  onViewDetails?: (setId: string) => void;
  showGamification?: boolean;
}
export default function EducationCard({
  educationSet,
  onViewDetails,
  showGamification = false,
}: EducationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      case 'Devam Ediyor':
        return 'bg-blue-100 text-blue-800';
      case 'Kilitli':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'B2B':
        return 'bg-purple-100 text-purple-800';
      case 'B2C':
        return 'bg-orange-100 text-orange-800';
      case 'Destek':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}sa ${mins}dk`;
    }
    return `${mins}dk`;
  };
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (percentage >= 60) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    if (percentage >= 40)
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 ${
        educationSet.isLocked ? 'opacity-60' : ''
      }`}
    >
      {/* Gamification Header */}
      {showGamification && (
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            {educationSet.level && (
              <div className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold'>
                Seviye {educationSet.level}
              </div>
            )}
            {educationSet.points && (
              <div className='bg-gradient-to-r from-purple-400 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold'>
                {educationSet.points} Puan
              </div>
            )}
          </div>
          <div className='flex gap-1'>
            {educationSet.badges?.map((badge, index) => (
              <div
                key={index}
                className='w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center'
              >
                <i className='ri-medal-line text-white text-xs'></i>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-3'>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(educationSet.category)}`}
            >
              {educationSet.category}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(educationSet.status)}`}
            >
              {educationSet.status}
            </span>
            {educationSet.isLocked && (
              <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                <i className='ri-lock-line mr-1'></i>
                Kilitli
              </span>
            )}
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            {educationSet.name}
          </h3>
          <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
            {educationSet.description}
          </p>
        </div>
      </div>
      {/* İlerleme Çubuğu */}
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-gray-700'>İlerleme</span>
          <span className='text-sm text-gray-600'>
            {educationSet.progress_percentage}%
          </span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-3'>
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(educationSet.progress_percentage)}`}
            style={{ width: `${educationSet.progress_percentage}%` }}
          ></div>
        </div>
      </div>
      {/* İstatistikler */}
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='text-center bg-blue-50 rounded-lg p-3'>
          <div className='text-xl font-bold text-blue-900'>
            {Math.floor(
              (educationSet.progress_percentage / 100) *
                educationSet.video_count
            )}
            /{educationSet.video_count}
          </div>
          <div className='text-xs text-blue-600 font-medium'>Video</div>
        </div>
        <div className='text-center bg-purple-50 rounded-lg p-3'>
          <div className='text-xl font-bold text-purple-900'>
            {formatDuration(educationSet.total_duration)}
          </div>
          <div className='text-xs text-purple-600 font-medium'>Süre</div>
        </div>
      </div>
      {/* Tarih Bilgileri */}
      <div className='grid grid-cols-2 gap-4 text-xs text-gray-500 mb-4'>
        <div>
          <div className='font-medium'>Atanma Tarihi</div>
          <div>
            {new Date(educationSet.created_at).toLocaleDateString('tr-TR')}
          </div>
        </div>
      </div>
      {/* Aksiyon Butonu */}
      {educationSet.isLocked ? (
        <button
          disabled
          className='w-full px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50'
        >
          <i className='ri-lock-line mr-2'></i>
          Kilitli
        </button>
      ) : (
        <div className='flex gap-2'>
          <Link
            href={`/firma/egitimlerim/videolar/${educationSet.id}`}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center block text-sm'
          >
            <i className='ri-eye-line mr-2'></i>
            Detaylar
          </Link>
          <Link
            href={`/firma/egitimlerim/videolar/${educationSet.id}/video/${educationSet.id}`}
            className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center block text-sm'
          >
            <i className='ri-play-line mr-2'></i>
            İzle
          </Link>
        </div>
      )}
    </div>
  );
}
