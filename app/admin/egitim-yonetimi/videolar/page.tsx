'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import StatusBadge from '@/components/ui/StatusBadge';
import Textarea from '@/components/ui/Textarea';
interface Video {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  duration: number; // seconds
  order_index: number;
  status: 'Aktif' | 'Pasif';
  set_id: string;
  set_name: string;
  created_at: string;
}
interface EducationSet {
  id: string;
  name: string;
  category: string;
}
export default function VideoManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [educationSets, setEducationSets] = useState<EducationSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  // Filter states
  const [selectedSet, setSelectedSet] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    duration: 0,
    order_index: 0,
    status: 'Aktif' as 'Aktif' | 'Pasif',
    set_id: '',
  });
  
  // Form validation states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Form validation functions
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Video başlığı gereklidir';
    }
    
    if (!formData.youtube_url.trim()) {
      errors.youtube_url = 'YouTube linki gereklidir';
    } else if (!formData.youtube_url.includes('youtube.com') && !formData.youtube_url.includes('youtu.be')) {
      errors.youtube_url = 'Geçerli bir YouTube linki giriniz';
    }
    
    if (!formData.set_id) {
      errors.set_id = 'Eğitim seti seçimi gereklidir';
    }
    
    if (formData.duration <= 0) {
      errors.duration = 'Süre 0\'dan büyük olmalıdır';
    }
    
    if (formData.order_index < 0) {
      errors.order_index = 'Sıra numarası 0\'dan küçük olamaz';
    }
    
    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
    return Object.keys(errors).length === 0;
  };

  // Update form data with validation
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Fetch videos from API
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (!response.ok) {
        throw new Error('Videolar getirilemedi');
      }
      const result = await response.json();
      if (result.success) {
        setVideos(result.data || []);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  // Fetch education sets for dropdown
  const fetchEducationSets = async () => {
    try {
      const response = await fetch('/api/education-sets', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEducationSets(result.data || []);
        }
      }
    } catch (error) {}
  };
  // Load data on component mount
  useEffect(() => {
    fetchVideos();
    fetchEducationSets();
    // Check URL parameters for filtering
    const urlParams = new URLSearchParams(window.location.search);
    const setIdFromUrl = urlParams.get('set_id');
    if (setIdFromUrl) {
      setSelectedSet(setIdFromUrl);
    }
  }, []);
  // Handle create/update video
  const handleCreateVideo = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.youtube_url || !formData.set_id) {
        alert(
          'Lütfen gerekli alanları doldurun (Başlık, YouTube URL, Eğitim Seti)'
        );
        return;
      }
      const response = await fetch('/api/videos', {
        method: editingVideo ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          id: editingVideo?.id,
          ...formData,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Video kaydedilemedi');
      }
      const result = await response.json();
      if (result.success) {
        fetchVideos();
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          youtube_url: '',
          duration: 0,
          order_index: 0,
          status: 'Aktif',
          set_id: '',
        });
        setEditingVideo(null);
        alert(
          editingVideo
            ? 'Video başarıyla güncellendi!'
            : 'Video başarıyla oluşturuldu!'
        );
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      alert('Video kaydedilirken hata oluştu: ' + (error as any).message);
    }
  };
  // Handle delete video
  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        fetchVideos();
      } else {
        alert('Video silinemedi');
      }
    } catch (error) {
      alert('Video silinirken hata oluştu');
    }
  };
  // Handle edit video
  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      youtube_url: video.youtube_url,
      duration: video.duration,
      order_index: video.order_index,
      status: video.status,
      set_id: video.set_id,
    });
    setShowCreateForm(true);
  };
  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSet = !selectedSet || video.set_id === selectedSet;
    const matchesStatus = !selectedStatus || video.status === selectedStatus;
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSet && matchesStatus && matchesSearch;
  });
  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <Link href='/' className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-global-line text-white text-lg w-5 h-5 flex items-center justify-center'></i>
                </div>
                <div className='flex flex-col'>
                  <span className="font-['Pacifico'] text-xl text-blue-900 leading-tight">
                    İhracat Akademi
                  </span>
                  <span className='text-xs text-gray-500 font-medium'>
                    Admin Panel
                  </span>
                </div>
              </Link>
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Ana Panel
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>
                  Video Yönetimi
                </span>
              </nav>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setFormData({
                    title: '',
                    description: '',
                    youtube_url: '',
                    duration: 0,
                    order_index: 0,
                    status: 'Aktif',
                    set_id: '',
                  });
                  setShowCreateForm(true);
                }}
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer'
              >
                <i className='ri-add-line'></i>
                Yeni Video Ekle
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className='pt-20 px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Page Header */}
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Video Yönetimi
            </h1>
            <p className='text-gray-600'>
              Eğitim videolarını yönetin ve organize edin
            </p>
          </div>
          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Filtreler</h3>
              <button
                onClick={() => {
                  setSelectedSet('');
                  setSelectedStatus('');
                  setSearchQuery('');
                }}
                className='text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer'
              >
                Filtreleri Temizle
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Eğitim Seti
                </label>
                <Select
                  value={selectedSet}
                  onChange={e => setSelectedSet(e.target.value)}
                  className='w-full'
                >
                  <option value=''>Tüm Setler</option>
                  {educationSets.map(set => (
                    <option key={set.id} value={set.id}>
                      {set.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Durum
                </label>
                <Select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className='w-full'
                >
                  <option value=''>Tüm Durumlar</option>
                  <option value='Aktif'>Aktif</option>
                  <option value='Pasif'>Pasif</option>
                </Select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Video Ara
                </label>
                <Input
                  type='text'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Video adı ara...'
                  className='w-full'
                  icon='ri-search-line'
                />
              </div>
              <div className='flex items-end'>
                <button
                  onClick={fetchVideos}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer'
                >
                  <i className='ri-refresh-line mr-2'></i>
                  Yenile
                </button>
              </div>
            </div>
            <div className='text-sm text-gray-600 mt-4'>
              <span className='font-medium'>{filteredVideos.length}</span> video
              bulundu
            </div>
          </div>
          {/* Videos Grid */}
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Videolar yükleniyor...</p>
              </div>
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredVideos.map(video => (
                <div
                  key={video.id}
                  className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200'
                >
                  {/* Video Thumbnail */}
                  <div className='mb-4'>
                    {video.youtube_url &&
                      getYouTubeVideoId(video.youtube_url) && (
                        <Image
                          src={`https://img.youtube.com/vi/${getYouTubeVideoId(video.youtube_url)}/mqdefault.jpg`}
                          alt={video.title}
                          width={320}
                          height={128}
                          className='w-full h-32 object-cover rounded-lg'
                        />
                      )}
                  </div>
                  {/* Video Info */}
                  <div className='mb-4'>
                    <div className='flex items-start justify-between mb-2'>
                      <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>
                        {video.title}
                      </h3>
                      <div className='flex items-center gap-2'>
                        <StatusBadge
                          status={video.status === 'Aktif' ? 'active' : 'inactive'}
                        />
                        <button
                          onClick={() => handleEditVideo(video)}
                          className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer'
                        >
                          <i className='ri-edit-line text-gray-600'></i>
                        </button>
                      </div>
                    </div>
                    <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
                      {video.description}
                    </p>
                    <div className='flex items-center justify-between text-sm text-gray-500'>
                      <span>
                        <i className='ri-time-line mr-1'></i>
                        {formatDuration(video.duration)}
                      </span>
                      <span>
                        <i className='ri-sort-asc mr-1'></i>Sıra:{' '}
                        {video.order_index}
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className='flex gap-2'>
                    <button
                      onClick={() => window.open(video.youtube_url, '_blank')}
                      className='flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                    >
                      <i className='ri-youtube-line mr-2'></i>
                      YouTube&apos;da Aç
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className='px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                    >
                      <i className='ri-delete-bin-line'></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center'>
              <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-video-line text-gray-400 text-3xl'></i>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Henüz video bulunmuyor
              </h3>
              <p className='text-gray-500 mb-6'>
                İlk videonuzu ekleyerek başlayın
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer'
              >
                <i className='ri-add-line mr-2'></i>
                Video Ekle
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Create/Edit Video Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title={editingVideo ? 'Video Düzenle' : 'Yeni Video Ekle'}
        size='lg'
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            if (validateForm()) {
              handleCreateVideo();
            }
          }}
          className='space-y-6 max-w-4xl mx-auto'
        >
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Video Başlığı <span className='text-red-500'>*</span>
            </label>
            <Input
              type='text'
              value={formData.title}
              onChange={e => updateFormData('title', e.target.value)}
              className='w-full'
              error={formErrors.title}
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Açıklama
            </label>
            <Textarea
              value={formData.description}
              onChange={e => updateFormData('description', e.target.value)}
              rows={3}
              className='w-full'
              placeholder='Video hakkında kısa açıklama...'
              error={formErrors.description}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              YouTube Linki <span className='text-red-500'>*</span>
            </label>
            <Input
              type='url'
              value={formData.youtube_url}
              onChange={e => updateFormData('youtube_url', e.target.value)}
              className='w-full'
              placeholder='https://www.youtube.com/watch?v=...'
              error={formErrors.youtube_url}
              required
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Süre (saniye)
              </label>
              <Input
                type='number'
                value={formData.duration}
                onChange={e => updateFormData('duration', parseInt(e.target.value) || 0)}
                className='w-full'
                min='0'
                error={formErrors.duration}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Sıra
              </label>
              <Input
                type='number'
                value={formData.order_index}
                onChange={e => updateFormData('order_index', parseInt(e.target.value) || 0)}
                className='w-full'
                min='0'
                error={formErrors.order_index}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Durum
              </label>
              <Select
                value={formData.status}
                onChange={e => updateFormData('status', e.target.value as 'Aktif' | 'Pasif')}
                className='w-full'
                error={formErrors.status}
              >
                <option value='Aktif'>Aktif</option>
                <option value='Pasif'>Pasif</option>
              </Select>
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Eğitim Seti <span className='text-red-500'>*</span>
            </label>
            <Select
              value={formData.set_id}
              onChange={e => updateFormData('set_id', e.target.value)}
              className='w-full'
              error={formErrors.set_id}
              required
            >
              <option value=''>Eğitim Seti Seçin</option>
              {educationSets.map(set => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </Select>
          </div>
        </form>

        <ModalFooter>
          <Button variant='secondary' onClick={() => setShowCreateForm(false)}>
            İptal
          </Button>
          <Button variant='success' onClick={handleCreateVideo}>
            {editingVideo ? 'Güncelle' : 'Ekle'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
