import React, { useState, useEffect } from 'react';
interface Appointment {
  id: string;
  title?: string;
  description?: string;
  date: string;
  time: string;
  meetingType: string;
  status: string;
  priority?: string;
  attendance_notes?: string;
}
interface ReviseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  appointment: Appointment | null;
  isSubmitting: boolean;
}
const ReviseRequestModal: React.FC<ReviseRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    newDate: '',
    newTime: '',
    reason: '',
    additionalNotes: '',
  });
  useEffect(() => {
    if (appointment && isOpen) {
      setFormData({
        newDate: '',
        newTime: '',
        reason: '',
        additionalNotes: '',
      });
    }
  }, [appointment, isOpen]);
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
  // NOTE: event optional to support button outside the form
  const handleSubmit = (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!formData.newDate || !formData.newTime || !formData.reason) {
      alert('Lütfen yeni tarih, saat ve revize sebebini doldurun.');
      return;
    }
    onSubmit({
      appointmentId: appointment?.id,
      newDate: formData.newDate,
      newTime: formData.newTime,
      reason: formData.reason,
      additionalNotes: formData.additionalNotes,
    });
  };
  if (!isOpen || !appointment) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
              <i className='ri-time-line text-orange-600 mr-3'></i>
              Revize Talebi
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <i className='ri-close-line text-2xl'></i>
            </button>
          </div>
          <p className='text-gray-600 mt-2'>
            Mevcut randevu:{' '}
            <span className='font-semibold'>
              {appointment.title || appointment.description}
            </span>
          </p>
        </div>
        {/* Current Appointment Info */}
        <div className='p-6 bg-blue-50 border-b border-blue-200'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>
            Mevcut Randevu Bilgileri
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Mevcut Tarih
              </label>
              <p className='text-gray-900 font-medium'>{appointment.date}</p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Mevcut Saat
              </label>
              <p className='text-gray-900 font-medium'>{appointment.time}</p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Görüşme Türü
              </label>
              <p className='text-gray-900 font-medium'>
                {appointment.meetingType === 'zoom'
                  ? 'Online'
                  : appointment.meetingType === 'phone'
                    ? 'Telefon'
                    : 'Yüz Yüze'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Durum
              </label>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                Onaylandı
              </span>
            </div>
          </div>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Yeni Tarih <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='newDate'
                value={formData.newDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Yeni Saat <span className='text-red-500'>*</span>
              </label>
              <input
                type='time'
                name='newTime'
                value={formData.newTime}
                onChange={handleInputChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors'
                required
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Revize Sebebi <span className='text-red-500'>*</span>
            </label>
            <select
              name='reason'
              value={formData.reason}
              onChange={handleInputChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors'
              required
            >
              <option value=''>Sebep seçin</option>
              <option value='acil_iş_çıkması'>Acil iş çıkması</option>
              <option value='sağlık_sorunu'>Sağlık sorunu</option>
              <option value='seyahat_planı'>Seyahat planı</option>
              <option value='toplantı_çakışması'>Toplantı çakışması</option>
              <option value='kişisel_engel'>Kişisel engel</option>
              <option value='diğer'>Diğer</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Ek Notlar
            </label>
            <textarea
              name='additionalNotes'
              value={formData.additionalNotes}
              onChange={handleInputChange}
              rows={4}
              placeholder='Revize talebinizle ilgili ek bilgiler, açıklamalar...'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none'
            />
          </div>
          {/* Info Box */}
          <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <i className='ri-information-line text-orange-600 text-lg mt-0.5'></i>
              <div>
                <h4 className='font-medium text-orange-800 mb-1'>
                  Revize Talebi Hakkında
                </h4>
                <p className='text-sm text-orange-700'>
                  Revize talebiniz danışmanınıza iletilecek ve onaylandıktan
                  sonra randevunuz güncellenecektir. Mevcut randevu, revize
                  onaylanana kadar geçerli kalacaktır.
                </p>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className='pt-2 border-t border-gray-200 flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors'
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
            >
              {isSubmitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <i className='ri-send-plane-line mr-2'></i>
                  Revize Talebi Gönder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ReviseRequestModal;
