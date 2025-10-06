'use client';
import { useState, useEffect } from 'react';
interface Event {
  id?: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  time: string;
  duration: number;
  location: string;
  speaker: string;
  speaker_bio?: string;
  max_participants: number;
  status: string;
  is_online: boolean;
  is_free: boolean;
  meeting_platform?: string;
  meeting_link?: string;
  meeting_id?: string;
  meeting_password?: string;
  meeting_settings?: any;
  auto_join_enabled?: boolean;
  consultant_id?: string;
  requirements: string[];
  materials: any[];
  attendance_tracking: boolean;
  gamification_enabled: boolean;
  points_reward: number;
  tags: string[];
}
interface EventFormProps {
  event?: Event;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Event) => void;
  mode: 'create' | 'edit';
}
export default function EventForm({
  event,
  isOpen,
  onClose,
  onSubmit,
  mode,
}: EventFormProps) {
  const [formData, setFormData] = useState<Event>({
    title: '',
    description: '',
    category: 'Seminer',
    start_date: '',
    end_date: '',
    time: '',
    duration: 60,
    location: '',
    speaker: '',
    speaker_bio: '',
    max_participants: 50,
    status: 'Planlandı',
    is_online: false,
    is_free: true,
    meeting_platform: '',
    meeting_link: '',
    meeting_id: '',
    meeting_password: '',
    meeting_settings: {},
    auto_join_enabled: false,
    consultant_id: '',
    requirements: [],
    materials: [],
    attendance_tracking: false,
    gamification_enabled: true,
    points_reward: 0,
    tags: [],
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (event && mode === 'edit') {
      // Null değerleri boş string'e çevir
      setFormData({
        ...event,
        meeting_platform: event.meeting_platform || '',
        meeting_link: event.meeting_link || '',
        meeting_id: event.meeting_id || '',
        meeting_password: event.meeting_password || '',
        meeting_settings: event.meeting_settings || {},
        auto_join_enabled: event.auto_join_enabled || false,
        speaker_bio: event.speaker_bio || '',
        consultant_id: event.consultant_id || '',
        requirements: event.requirements || [],
        materials: event.materials || [],
        tags: event.tags || [],
      });
    }
  }, [event, mode]);
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };
  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };
  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };
  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            {mode === 'create' ? 'Yeni Etkinlik Oluştur' : 'Etkinlik Düzenle'}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
          >
            <i className='ri-close-line text-2xl'></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Temel Bilgiler */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Etkinlik Başlığı *
              </label>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Kategori *
              </label>
              <select
                name='category'
                value={formData.category}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='Seminer'>Seminer</option>
                <option value='Eğitim'>Eğitim</option>
                <option value='Webinar'>Webinar</option>
                <option value='Workshop'>Workshop</option>
                <option value='Ziyaret'>Ziyaret</option>
                <option value='Görüşme'>Görüşme</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Başlangıç Tarihi *
              </label>
              <input
                type='date'
                name='start_date'
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Bitiş Tarihi *
              </label>
              <input
                type='date'
                name='end_date'
                value={formData.end_date}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Saat *
              </label>
              <input
                type='time'
                name='time'
                value={formData.time}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Süre (Dakika) *
              </label>
              <input
                type='number'
                name='duration'
                value={formData.duration}
                onChange={handleInputChange}
                required
                min='15'
                step='15'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Lokasyon *
              </label>
              <input
                type='text'
                name='location'
                value={formData.location}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Konuşmacı *
              </label>
              <input
                type='text'
                name='speaker'
                value={formData.speaker}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Maksimum Katılımcı *
              </label>
              <input
                type='number'
                name='max_participants'
                value={formData.max_participants}
                onChange={handleInputChange}
                required
                min='1'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Durum *
              </label>
              <select
                name='status'
                value={formData.status}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='Planlandı'>Planlandı</option>
                <option value='Aktif'>Aktif</option>
                <option value='Tamamlandı'>Tamamlandı</option>
                <option value='İptal edildi'>İptal edildi</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Puan Ödülü
              </label>
              <input
                type='number'
                name='points_reward'
                value={formData.points_reward}
                onChange={handleInputChange}
                min='0'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
          {/* Açıklama */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Açıklama *
            </label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          {/* Konuşmacı Bio */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Konuşmacı Biyografisi
            </label>
            <textarea
              name='speaker_bio'
              value={formData.speaker_bio || ''}
              onChange={handleInputChange}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          {/* Online Etkinlik Ayarları */}
          <div className='border-t pt-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Online Etkinlik Ayarları
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  name='is_online'
                  checked={formData.is_online}
                  onChange={handleInputChange}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label className='ml-2 block text-sm text-gray-900'>
                  Online Etkinlik
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  name='is_free'
                  checked={formData.is_free}
                  onChange={handleInputChange}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label className='ml-2 block text-sm text-gray-900'>
                  Ücretsiz Etkinlik
                </label>
              </div>
              {formData.is_online && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Toplantı Platformu
                    </label>
                    <select
                      name='meeting_platform'
                      value={formData.meeting_platform || ''}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value=''>Platform Seçin</option>
                      <option value='zoom'>Zoom Meetings</option>
                      <option value='google_meet'>Google Meet</option>
                      <option value='teams'>Microsoft Teams</option>
                      <option value='webex'>Webex</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Toplantı Linki
                    </label>
                    <input
                      type='url'
                      name='meeting_link'
                      value={formData.meeting_link || ''}
                      onChange={handleInputChange}
                      placeholder='https://...'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Toplantı ID
                    </label>
                    <input
                      type='text'
                      name='meeting_id'
                      value={formData.meeting_id || ''}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Toplantı Şifresi
                    </label>
                    <input
                      type='text'
                      name='meeting_password'
                      value={formData.meeting_password || ''}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      name='auto_join_enabled'
                      checked={formData.auto_join_enabled || false}
                      onChange={handleInputChange}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label className='ml-2 text-sm text-gray-700'>
                      Otomatik katılım etkinleştir
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Gereksinimler */}
          <div className='border-t pt-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Gereksinimler
            </h3>
            <div className='space-y-3'>
              {formData.requirements.map((req, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <span className='flex-1 px-3 py-2 bg-gray-50 rounded-lg'>
                    {req}
                  </span>
                  <button
                    type='button'
                    onClick={() => handleRemoveRequirement(index)}
                    className='text-red-600 hover:text-red-800'
                  >
                    <i className='ri-delete-bin-line'></i>
                  </button>
                </div>
              ))}
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={newRequirement}
                  onChange={e => setNewRequirement(e.target.value)}
                  placeholder='Yeni gereksinim ekle...'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <button
                  type='button'
                  onClick={handleAddRequirement}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
          {/* Etiketler */}
          <div className='border-t pt-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Etiketler
            </h3>
            <div className='space-y-3'>
              <div className='flex flex-wrap gap-2'>
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                  >
                    {tag}
                    <button
                      type='button'
                      onClick={() => handleRemoveTag(index)}
                      className='text-blue-600 hover:text-blue-800'
                    >
                      <i className='ri-close-line'></i>
                    </button>
                  </span>
                ))}
              </div>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder='Yeni etiket ekle...'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <button
                  type='button'
                  onClick={handleAddTag}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
          {/* Diğer Ayarlar */}
          <div className='border-t pt-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Diğer Ayarlar
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  name='attendance_tracking'
                  checked={formData.attendance_tracking}
                  onChange={handleInputChange}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label className='ml-2 block text-sm text-gray-900'>
                  Katılım Takibi
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  name='gamification_enabled'
                  checked={formData.gamification_enabled}
                  onChange={handleInputChange}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label className='ml-2 block text-sm text-gray-900'>
                  Gamification Aktif
                </label>
              </div>
            </div>
          </div>
          {/* Form Buttons */}
          <div className='flex justify-end gap-3 pt-6 border-t'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
            >
              İptal
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
              {loading
                ? 'Kaydediliyor...'
                : mode === 'create'
                  ? 'Oluştur'
                  : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
