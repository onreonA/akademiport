'use client';
import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
interface Consultant {
  id: string;
  full_name: string;
  specialization: string;
}
interface Appointment {
  id: string;
  title: string;
  description: string;
  preferred_date: string;
  preferred_time: string;
  meeting_type: string;
  consultant_id: string;
  priority: string;
}
interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  consultants: Consultant[];
  appointment: Appointment | null;
  isConfirmed?: boolean; // Onaylanmış randevu mu?
}
export default function EditAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  consultants,
  appointment,
  isConfirmed = false,
}: EditAppointmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preferred_date: '',
    preferred_time: '',
    meeting_type: 'phone',
    consultant_id: '',
    priority: 'medium',
  });
  useEffect(() => {
    if (appointment) {
      const newFormData = {
        title: appointment.title || '',
        description: appointment.description || '',
        preferred_date: appointment.preferred_date || '',
        preferred_time: appointment.preferred_time || '',
        meeting_type: appointment.meeting_type || 'phone',
        consultant_id: appointment.consultant_id || '',
        priority: appointment.priority || 'medium',
      };
      setFormData(newFormData);
    }
  }, [appointment]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <Dialog.Panel className='mx-auto max-w-2xl w-full bg-white rounded-xl shadow-2xl'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <Dialog.Title className='text-2xl font-bold text-gray-900'>
                Randevu Düzenle
              </Dialog.Title>
              <button
                onClick={onClose}
                className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
              >
                <i className='ri-close-line text-xl'></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Title */}
              <div>
                <label
                  htmlFor='title'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Randevu Başlığı *
                </label>
                <input
                  type='text'
                  id='title'
                  name='title'
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Randevu başlığını girin'
                />
              </div>
              {/* Description */}
              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Açıklama
                </label>
                <textarea
                  id='description'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Randevu detaylarını açıklayın'
                />
              </div>
              {/* Date and Time */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='preferred_date'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Tarih *
                  </label>
                  <input
                    type='date'
                    id='preferred_date'
                    name='preferred_date'
                    value={formData.preferred_date}
                    onChange={handleInputChange}
                    required
                    disabled={isConfirmed}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isConfirmed ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {isConfirmed && (
                    <p className='text-xs text-orange-600 mt-1'>
                      <i className='ri-information-line mr-1'></i>
                      Onaylanmış randevularda tarih değişikliği yapılamaz.
                      Revize talebi için danışmanınızla iletişime geçin.
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='preferred_time'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Saat *
                  </label>
                  <input
                    type='time'
                    id='preferred_time'
                    name='preferred_time'
                    value={formData.preferred_time}
                    onChange={handleInputChange}
                    required
                    disabled={isConfirmed}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isConfirmed ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {isConfirmed && (
                    <p className='text-xs text-orange-600 mt-1'>
                      <i className='ri-information-line mr-1'></i>
                      Onaylanmış randevularda saat değişikliği yapılamaz. Revize
                      talebi için danışmanınızla iletişime geçin.
                    </p>
                  )}
                </div>
              </div>
              {/* Meeting Type and Priority */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='meeting_type'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Görüşme Türü *
                  </label>
                  <select
                    id='meeting_type'
                    name='meeting_type'
                    value={formData.meeting_type}
                    onChange={handleInputChange}
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value='phone'>Telefon</option>
                    <option value='online'>Online (Zoom/Teams)</option>
                    <option value='physical'>Yüz Yüze</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor='priority'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Öncelik
                  </label>
                  <select
                    id='priority'
                    name='priority'
                    value={formData.priority}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value='low'>Düşük</option>
                    <option value='medium'>Orta</option>
                    <option value='high'>Yüksek</option>
                  </select>
                </div>
              </div>
              {/* Consultant Selection */}
              <div>
                <label
                  htmlFor='consultant_id'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Danışman *
                </label>
                <select
                  id='consultant_id'
                  name='consultant_id'
                  value={formData.consultant_id}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Danışman seçin</option>
                  {consultants.map(consultant => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.full_name} - {consultant.specialization}
                    </option>
                  ))}
                </select>
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
                  disabled={isSubmitting}
                  className='px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      <i className='ri-save-line'></i>
                      Güncelle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
