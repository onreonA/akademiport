'use client';
import { useState, useEffect } from 'react';
interface Consultant {
  id: string;
  full_name: string;
  specialization?: string;
}
interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointmentData: any) => void;
  consultants: Consultant[];
  isLoading?: boolean;
}
export default function NewAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  consultants,
  isLoading = false,
}: NewAppointmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preferred_date: '',
    preferred_time: '',
    meeting_type: 'online',
    consultant_id: '',
    priority: 'normal',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        title: '',
        description: '',
        preferred_date: '',
        preferred_time: '',
        meeting_type: 'online',
        consultant_id: '',
        priority: 'normal',
      });
      setErrors({});
    }
  }, [isOpen]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Randevu başlığı gereklidir';
    }
    if (!formData.preferred_date) {
      newErrors.preferred_date = 'Tarih seçimi gereklidir';
    }
    if (!formData.preferred_time) {
      newErrors.preferred_time = 'Saat seçimi gereklidir';
    }
    if (!formData.consultant_id) {
      newErrors.consultant_id = 'Danışman seçimi gereklidir';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Yeni Randevu Talep Et
            </h2>
            <p className='text-gray-600 mt-1'>
              Danışmanınızla görüşme planlayın
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <i className='ri-close-line text-2xl text-gray-500'></i>
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Randevu Başlığı *
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Randevu konusu veya başlığı'
            />
            {errors.title && (
              <p className='text-red-500 text-sm mt-1'>{errors.title}</p>
            )}
          </div>
          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={3}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              placeholder='Randevu detayları ve görüşmek istediğiniz konular'
            />
          </div>
          {/* Date and Time */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Tarih *
              </label>
              <input
                type='date'
                value={formData.preferred_date}
                onChange={e =>
                  handleInputChange('preferred_date', e.target.value)
                }
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.preferred_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.preferred_date && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.preferred_date}
                </p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Saat *
              </label>
              <input
                type='time'
                value={formData.preferred_time}
                onChange={e =>
                  handleInputChange('preferred_time', e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.preferred_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.preferred_time && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.preferred_time}
                </p>
              )}
            </div>
          </div>
          {/* Consultant Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Danışman Seçimi *
            </label>
            <select
              value={formData.consultant_id}
              onChange={e => handleInputChange('consultant_id', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.consultant_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value=''>Danışman seçiniz</option>
              {consultants.map(consultant => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.full_name}{' '}
                  {consultant.specialization &&
                    `(${consultant.specialization})`}
                </option>
              ))}
            </select>
            {errors.consultant_id && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.consultant_id}
              </p>
            )}
          </div>
          {/* Meeting Type and Priority */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Görüşme Türü
              </label>
              <select
                value={formData.meeting_type}
                onChange={e =>
                  handleInputChange('meeting_type', e.target.value)
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              >
                <option value='online'>Online (Zoom/Teams)</option>
                <option value='phone'>Telefon</option>
                <option value='physical'>Yüz Yüze</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Öncelik
              </label>
              <select
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              >
                <option value='low'>Düşük</option>
                <option value='normal'>Normal</option>
                <option value='high'>Yüksek</option>
                <option value='urgent'>Acil</option>
              </select>
            </div>
          </div>
          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-4 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors'
            >
              İptal
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2'
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <i className='ri-send-plane-line'></i>
                  Randevu Talebi Gönder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
