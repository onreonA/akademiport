'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import FirmaHeader from '@/components/firma/FirmaHeader';
import { useAuthStore } from '@/lib/stores/auth-store';

import FirmaSidebar from '@/components/firma/FirmaSidebar';
interface Appointment {
  id: string;
  consultantName: string;
  consultantPhoto: string;
  date: string;
  time: string;
  meetingType: 'zoom' | 'phone' | 'physical';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  description?: string;
  meetingLink?: string;
  location?: string;
  attended?: boolean;
  notes?: string;
}
interface Consultant {
  id: string;
  name: string;
  expertise: string;
  photo: string;
  available: boolean;
}
const AppointmentDetailModal = ({
  appointment,
  isOpen,
  onClose,
}: {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !appointment) return null;
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getStatusText = () => {
    switch (appointment.status) {
      case 'pending':
        return 'Bekliyor';
      case 'confirmed':
        return 'Onaylandı';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };
  const getMeetingTypeText = () => {
    switch (appointment.meetingType) {
      case 'zoom':
        return 'Görüntülü Görüşme';
      case 'phone':
        return 'Telefon Görüşmesi';
      case 'physical':
        return 'Yüz Yüze Görüşme';
      default:
        return 'Belirtilmemiş';
    }
  };
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-8'>
          <div className='flex items-center justify-between mb-8'>
            <h3 className='text-2xl font-bold text-gray-900'>
              Randevu Detayları
            </h3>
            <button
              onClick={onClose}
              className='w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer'
            >
              <i className='ri-close-line text-xl text-gray-600'></i>
            </button>
          </div>
          <div className='space-y-6'>
            {/* Consultant Info */}
            <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-xl'>
              <div className='w-16 h-16 rounded-full overflow-hidden'>
                <Image
                  src={appointment.consultantPhoto}
                  alt={appointment.consultantName}
                  width={64}
                  height={64}
                  className='w-full h-full object-cover object-top'
                />
              </div>
              <div>
                <h4 className='text-lg font-semibold text-gray-900'>
                  {appointment.consultantName}
                </h4>
                <p className='text-gray-600'>Danışman</p>
              </div>
            </div>
            {/* Status */}
            <div className='flex items-center gap-3'>
              <span className='text-sm font-medium text-gray-700'>Durum:</span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor()}`}
              >
                {getStatusText()}
              </span>
            </div>
            {/* Date & Time */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex items-center gap-3 p-4 bg-blue-50 rounded-xl'>
                <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-calendar-line text-blue-600'></i>
                </div>
                <div>
                  <p className='text-sm text-blue-600 font-medium'>Tarih</p>
                  <p className='text-lg font-semibold text-blue-900'>
                    {new Date(appointment.date).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-4 bg-purple-50 rounded-xl'>
                <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <i className='ri-time-line text-purple-600'></i>
                </div>
                <div>
                  <p className='text-sm text-purple-600 font-medium'>Saat</p>
                  <p className='text-lg font-semibold text-purple-900'>
                    {appointment.time}
                  </p>
                </div>
              </div>
            </div>
            {/* Meeting Type */}
            <div className='p-4 bg-green-50 rounded-xl'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                  <i
                    className={`${
                      appointment.meetingType === 'zoom'
                        ? 'ri-vidicon-line'
                        : appointment.meetingType === 'phone'
                          ? 'ri-phone-line'
                          : 'ri-map-pin-line'
                    } text-green-600`}
                  ></i>
                </div>
                <div>
                  <p className='text-sm text-green-600 font-medium'>
                    Görüşme Türü
                  </p>
                  <p className='text-lg font-semibold text-green-900'>
                    {getMeetingTypeText()}
                  </p>
                </div>
              </div>
            </div>
            {/* Meeting Link */}
            {appointment.meetingLink && (
              <div className='p-4 bg-blue-50 rounded-xl'>
                <div className='flex items-center gap-2 mb-3'>
                  <i className='ri-vidicon-line text-blue-600'></i>
                  <span className='font-medium text-blue-800'>
                    Görüşme Linki
                  </span>
                </div>
                <a
                  href={appointment.meetingLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer'
                >
                  <i className='ri-external-link-line'></i>
                  Görüşmeye Katıl
                </a>
              </div>
            )}
            {/* Location */}
            {appointment.location && (
              <div className='p-4 bg-green-50 rounded-xl'>
                <div className='flex items-center gap-2 mb-2'>
                  <i className='ri-map-pin-line text-green-600'></i>
                  <span className='font-medium text-green-800'>
                    Görüşme Yeri
                  </span>
                </div>
                <p className='text-green-700'>{appointment.location}</p>
              </div>
            )}
            {/* Description */}
            {appointment.description && (
              <div className='p-4 bg-gray-50 rounded-xl'>
                <h5 className='font-medium text-gray-800 mb-2'>Açıklama</h5>
                <p className='text-gray-600 leading-relaxed'>
                  {appointment.description}
                </p>
              </div>
            )}
            {/* Attendance Status */}
            {appointment.status === 'completed' &&
              typeof appointment.attended !== 'undefined' && (
                <div className='p-4 bg-gray-50 rounded-xl'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${appointment.attended ? 'bg-green-100' : 'bg-red-100'}`}
                    >
                      <i
                        className={`${appointment.attended ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'}`}
                      ></i>
                    </div>
                    <div>
                      <p className='font-medium text-gray-800'>
                        Katılım Durumu
                      </p>
                      <p
                        className={`${appointment.attended ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {appointment.attended ? 'Katıldı' : 'Katılmadı'}
                      </p>
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className='mt-3 p-3 bg-yellow-50 rounded-lg'>
                      <p className='text-sm text-yellow-800'>
                        {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>
          <div className='flex justify-end mt-8'>
            <button
              onClick={onClose}
              className='px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer'
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const AppointmentCard = ({
  appointment,
  onViewDetails,
}: {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
}) => {
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = () => {
    switch (appointment.status) {
      case 'pending':
        return 'Bekliyor';
      case 'confirmed':
        return 'Onaylandı';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      case 'rejected':
        return 'Reddedildi';
      default:
        return 'Bilinmiyor';
    }
  };
  const getMeetingTypeIcon = () => {
    switch (appointment.meetingType) {
      case 'zoom':
        return 'ri-vidicon-line';
      case 'phone':
        return 'ri-phone-line';
      case 'physical':
        return 'ri-map-pin-line';
      default:
        return 'ri-calendar-line';
    }
  };
  const getMeetingTypeText = () => {
    switch (appointment.meetingType) {
      case 'zoom':
        return 'Görüntülü Görüşme';
      case 'phone':
        return 'Telefon Görüşmesi';
      case 'physical':
        return 'Yüz Yüze Görüşme';
      default:
        return 'Belirtilmemiş';
    }
  };
  const isPastAppointment =
    new Date(`${appointment.date} ${appointment.time}`) < new Date();
  const canCancel =
    !isPastAppointment &&
    appointment.status === 'confirmed' &&
    new Date(`${appointment.date} ${appointment.time}`).getTime() -
      new Date().getTime() >
      12 * 60 * 60 * 1000;
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-100'>
            <Image
              src={appointment.consultantPhoto}
              alt={appointment.consultantName}
              width={48}
              height={48}
              className='w-full h-full object-cover object-top'
            />
          </div>
          <div>
            <h4 className='font-semibold text-gray-900'>
              {appointment.consultantName}
            </h4>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <i className={getMeetingTypeIcon()}></i>
              <span>{getMeetingTypeText()}</span>
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
        >
          {getStatusText()}
        </span>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <i className='ri-calendar-line text-gray-400'></i>
          <span>{new Date(appointment.date).toLocaleDateString('tr-TR')}</span>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <i className='ri-time-line text-gray-400'></i>
          <span>{appointment.time}</span>
        </div>
      </div>
      {appointment.meetingLink && appointment.status === 'confirmed' && (
        <div className='mb-4 p-3 bg-blue-50 rounded-lg'>
          <div className='flex items-center gap-2 mb-2'>
            <i className='ri-vidicon-line text-blue-600'></i>
            <span className='text-sm font-medium text-blue-800'>
              Görüşme Linki Hazır
            </span>
          </div>
          <a
            href={appointment.meetingLink}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium'
          >
            <i className='ri-external-link-line'></i>
            Görüşmeye Katıl
          </a>
        </div>
      )}
      {appointment.location && appointment.meetingType === 'physical' && (
        <div className='mb-4 p-3 bg-green-50 rounded-lg'>
          <div className='flex items-center gap-2 mb-2'>
            <i className='ri-map-pin-line text-green-600'></i>
            <span className='text-sm font-medium text-green-800'>
              Görüşme Yeri
            </span>
          </div>
          <p className='text-sm text-green-700'>{appointment.location}</p>
        </div>
      )}
      {appointment.description && (
        <div className='mb-4'>
          <p className='text-sm text-gray-600 line-clamp-2'>
            {appointment.description}
          </p>
        </div>
      )}
      {appointment.status === 'completed' &&
        typeof appointment.attended !== 'undefined' && (
          <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-2'>
              <i
                className={`${appointment.attended ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'}`}
              ></i>
              <span className='text-sm font-medium text-gray-800'>
                Katılım: {appointment.attended ? 'Katıldı' : 'Katılmadı'}
              </span>
            </div>
          </div>
        )}
      <div className='flex items-center gap-2'>
        <button
          onClick={() => onViewDetails(appointment)}
          className='px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2'
        >
          <i className='ri-eye-line'></i>
          Detayları Gör
        </button>
        {canCancel && (
          <button className='px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2'>
            <i className='ri-close-line'></i>
            İptal Et
          </button>
        )}
      </div>
    </div>
  );
};
const CalendarView = ({
  appointments,
  onDateClick,
}: {
  appointments: Appointment[];
  onDateClick: (date: string) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };
  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const navigateMonth = (direction: number) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + direction,
        1
      )
    );
  };
  return (
    <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
      {/* Calendar Header */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-bold text-white'>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => navigateMonth(-1)}
              className='w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors cursor-pointer'
            >
              <i className='ri-arrow-left-s-line text-white text-lg'></i>
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className='w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors cursor-pointer'
            >
              <i className='ri-arrow-right-s-line text-white text-lg'></i>
            </button>
          </div>
        </div>
      </div>
      <div className='p-6'>
        {/* Day Names */}
        <div className='grid grid-cols-7 gap-2 mb-4'>
          {dayNames.map(day => (
            <div
              key={day}
              className='h-10 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg'
            >
              {day}
            </div>
          ))}
        </div>
        {/* Calendar Days */}
        <div className='grid grid-cols-7 gap-2'>
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className='h-12'></div>;
            }
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isPast = day < new Date() && !isToday;
            const hasAppointments = dayAppointments.length > 0;
            return (
              <button
                key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                onClick={() => onDateClick(day.toISOString().split('T')[0])}
                className={`h-12 flex items-center justify-center text-sm rounded-xl transition-all duration-200 cursor-pointer relative font-medium ${
                  isToday
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : isPast
                      ? 'text-gray-400 hover:bg-gray-50'
                      : hasAppointments
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day.getDate()}
                {hasAppointments && (
                  <div className='absolute top-1 right-1'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isToday ? 'bg-white' : 'bg-blue-500'
                      }`}
                    ></div>
                    {dayAppointments.length > 1 && (
                      <div
                        className={`w-1 h-1 rounded-full mt-0.5 ${
                          isToday ? 'bg-white' : 'bg-blue-400'
                        }`}
                      ></div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {/* Calendar Legend */}
        <div className='mt-6 pt-4 border-t border-gray-100'>
          <div className='flex items-center justify-center gap-6 text-xs'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-blue-600 rounded-full'></div>
              <span className='text-gray-600'>Bugün</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-blue-100 border-2 border-blue-200 rounded-full'></div>
              <span className='text-gray-600'>Randevu Var</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const NewAppointmentModal = ({
  isOpen,
  onClose,
  consultants,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  consultants: Consultant[];
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    consultantId: '',
    date: '',
    time: '',
    meetingType: 'zoom' as 'zoom' | 'phone' | 'physical',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.consultantId)
      newErrors.consultantId = 'Danışman seçimi zorunludur';
    if (!formData.date) newErrors.date = 'Tarih seçimi zorunludur';
    if (!formData.time) newErrors.time = 'Saat seçimi zorunludur';
    const selectedDateTime = new Date(`${formData.date} ${formData.time}`);
    if (selectedDateTime <= new Date()) {
      newErrors.date = 'Geçmiş bir tarih ve saat seçemezsiniz';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        consultantId: '',
        date: '',
        time: '',
        meetingType: 'zoom',
        description: '',
      });
      onClose();
    }
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Yeni Randevu Talep Et
            </h3>
            <button
              onClick={onClose}
              className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
            >
              <i className='ri-close-line text-gray-600'></i>
            </button>
          </div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Danışman Seçimi *
              </label>
              <select
                value={formData.consultantId}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    consultantId: e.target.value,
                  }))
                }
                className='w-full pr-8 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              >
                <option value=''>Danışman seçiniz</option>
                {consultants.map(consultant => (
                  <option
                    key={consultant.id}
                    value={consultant.id}
                    disabled={!consultant.available}
                  >
                    {consultant.name} - {consultant.expertise}
                    {!consultant.available ? ' (Müsait değil)' : ''}
                  </option>
                ))}
              </select>
              {errors.consultantId && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.consultantId}
                </p>
              )}
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tarih *
                </label>
                <input
                  type='date'
                  value={formData.date}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, date: e.target.value }))
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
                {errors.date && (
                  <p className='text-red-500 text-xs mt-1'>{errors.date}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Saat *
                </label>
                <input
                  type='time'
                  value={formData.time}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, time: e.target.value }))
                  }
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
                {errors.time && (
                  <p className='text-red-500 text-xs mt-1'>{errors.time}</p>
                )}
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Görüşme Türü
              </label>
              <div className='space-y-2'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    value='zoom'
                    checked={formData.meetingType === 'zoom'}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        meetingType: e.target.value as
                          | 'zoom'
                          | 'phone'
                          | 'physical',
                      }))
                    }
                    className='mr-2'
                  />
                  <i className='ri-vidicon-line mr-2 text-blue-600'></i>
                  <span className='text-sm'>Görüntülü Görüşme (Zoom)</span>
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    value='phone'
                    checked={formData.meetingType === 'phone'}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        meetingType: e.target.value as
                          | 'zoom'
                          | 'phone'
                          | 'physical',
                      }))
                    }
                    className='mr-2'
                  />
                  <i className='ri-phone-line mr-2 text-green-600'></i>
                  <span className='text-sm'>Telefon Görüşmesi</span>
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    value='physical'
                    checked={formData.meetingType === 'physical'}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        meetingType: e.target.value as
                          | 'zoom'
                          | 'phone'
                          | 'physical',
                      }))
                    }
                    className='mr-2'
                  />
                  <i className='ri-map-pin-line mr-2 text-purple-600'></i>
                  <span className='text-sm'>Yüz Yüze Görüşme</span>
                </label>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Açıklama (İsteğe bağlı)
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder='Görüşmek istediğiniz konuları kısaca açıklayabilirsiniz...'
                rows={3}
                maxLength={500}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none'
              />
              <p className='text-xs text-gray-500 mt-1'>
                {formData.description.length}/500 karakter
              </p>
            </div>
            <div className='flex items-center gap-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap'
              >
                İptal
              </button>
              <button
                type='submit'
                className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap'
              >
                Randevu Talep Et
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
const MenuItem = ({
  icon,
  title,
  isActive,
  onClick,
  href,
  sidebarCollapsed,
}: {
  icon: string;
  title: string;
  isActive?: boolean;
  onClick?: () => void;
  href?: string;
  sidebarCollapsed?: boolean;
}) => {
  const content = (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-blue-100 text-blue-900 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
        <i className={`${icon} text-lg`}></i>
      </div>
      {!sidebarCollapsed && <span className='ml-3 truncate'>{title}</span>}
    </button>
  );
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};
export default function AppointmentsPage() {
  const { user, signOut } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('appointments');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Eğer user henüz yüklenmediyse, bekle
        if (!user?.email) {
          setLoading(false);
          return;
        }
        // Gerçek randevuları getir
        const appointmentsResponse = await fetch('/api/appointments', {
          headers: {
            'X-User-Email': user.email,
          },
        });
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          // API'den gelen randevuları formatla
          const formattedAppointments =
            appointmentsData.appointments?.map((apt: any) => ({
              id: apt.id,
              consultantName: 'Zarife Erdoğan', // Danışman adı
              consultantPhoto:
                'https://readdy.ai/api/search-image?query=Professional%20business%20consultant%20portrait&width=400&height=400',
              date: apt.preferred_date,
              time: apt.preferred_time,
              meetingType:
                apt.meeting_type === 'online'
                  ? 'Online'
                  : apt.meeting_type === 'phone'
                    ? 'Telefon'
                    : 'Yüz Yüze',
              status:
                apt.status === 'pending'
                  ? 'pending'
                  : apt.status === 'confirmed'
                    ? 'confirmed'
                    : apt.status === 'rejected'
                      ? 'rejected'
                      : apt.status === 'completed'
                        ? 'completed'
                        : 'pending',
              description: apt.description || apt.title || 'Randevu Talebi',
            })) || [];
          setAppointments(formattedAppointments);
        } else {
          setAppointments([]);
        }
        // Danışmanları getir
        const consultantsResponse = await fetch('/api/consultants');
        if (consultantsResponse.ok) {
          const consultantsData = await consultantsResponse.json();
          const formattedConsultants =
            consultantsData.consultants?.map((cons: any) => ({
              id: cons.id,
              name: cons.name || cons.email,
              expertise: cons.specialization || 'Danışman',
              photo:
                'https://readdy.ai/api/search-image?query=Professional%20business%20consultant%20portrait&width=400&height=400',
              available: true, // Şimdilik hepsi müsait
            })) || [];
          setConsultants(formattedConsultants);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    if (user?.email) {
      fetchData();
    }
  }, [user]);
  const upcomingAppointments = appointments.filter(
    apt =>
      new Date(`${apt.date} ${apt.time}`) >= new Date() &&
      apt.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(
    apt =>
      new Date(`${apt.date} ${apt.time}`) < new Date() ||
      apt.status === 'cancelled'
  );
  const handleNewAppointment = async (formData: any) => {
    try {
      // Geçici olarak user kontrolünü kaldır
      const userEmail = user?.email || 'info@mundo.com'; // Fallback email
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({
          consultant_id: formData.consultantId,
          subject: formData.description || 'Randevu Talebi',
          description: formData.description,
          meeting_type: formData.meetingType,
          preferred_date: formData.date,
          preferred_time: formData.time,
          duration_minutes: 60,
          priority: 'medium',
        }),
      });
      if (response.ok) {
        const result = await response.json();
        // Yeni randevuyu listeye ekle
        const selectedConsultant = consultants.find(
          c => c.id === formData.consultantId
        );
        const newAppointment: Appointment = {
          id: result.appointment.id,
          consultantName: selectedConsultant?.name || 'Danışman',
          consultantPhoto:
            selectedConsultant?.photo ||
            'https://readdy.ai/api/search-image?query=Professional%20business%20consultant%20portrait&width=400&height=400',
          date: formData.date,
          time: formData.time,
          meetingType: formData.meetingType,
          status: 'pending',
          description: formData.description,
        };
        setAppointments(prev => [...prev, newAppointment]);
        setSuccessMessage(
          'Randevu talebiniz alınmıştır. Danışman onayladığında bilgilendirileceksiniz.'
        );
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const error = await response.json();
        setSuccessMessage(
          'Randevu oluşturulurken bir hata oluştu: ' + error.error
        );
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      setSuccessMessage('Randevu oluşturulurken bir hata oluştu.');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };
  const notifications = [
    {
      id: 1,
      type: 'info',
      message: 'Yeni randevu onaylandı',
      time: '5 dk önce',
      unread: true,
    },
    {
      id: 2,
      type: 'success',
      message: 'Danışman mesajı',
      time: '20 dk önce',
      unread: true,
    },
    {
      id: 3,
      type: 'warning',
      message: 'Randevu hatırlatması',
      time: '1 saat önce',
      unread: false,
    },
    {
      id: 4,
      type: 'info',
      message: 'Yeni eğitim modülü',
      time: '3 saat önce',
      unread: false,
    },
  ];
  const unreadNotifications = notifications.filter(n => n.unread).length;
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Randevular Yükleniyor
          </h3>
          <p className='text-gray-600'>Randevu verileriniz hazırlanıyor...</p>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      <FirmaHeader
        currentPage='Randevularım'
        currentTime={new Date()}
        onSearch={query => {
          /* Search query */
        }}
        onNotificationsClick={() => {
          /* Notifications clicked */
        }}
        onUserMenuClick={() => {
          /* User menu clicked */
        }}
        showNotifications={false}
        showUserMenu={false}
        unreadNotifications={unreadNotifications}
        onNewAppointmentClick={() => setShowNewAppointmentModal(true)}
        signOut={signOut}
      />
      <FirmaSidebar
        activeMenuItem={activeMenuItem}
        onMenuItemClick={item => setActiveMenuItem(item)}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden'
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}
      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-20 min-h-screen ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        <div className='pt-20 p-6'>
          {/* Page Header */}
          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  Randevularım
                </h1>
                <p className='text-gray-600'>
                  Danışmanınızla birebir görüşme planlayabilir, randevu
                  geçmişinizi takip edebilirsiniz.
                </p>
              </div>
              <button
                onClick={() => setShowNewAppointmentModal(true)}
                className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              >
                <i className='ri-add-line'></i>
                Yeni Randevu Talep Et
              </button>
            </div>
          </div>
          {/* Success Message */}
          {successMessage && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse'>
              <div className='flex items-center gap-2'>
                <i className='ri-check-line text-green-600'></i>
                <p className='text-green-800'>{successMessage}</p>
              </div>
            </div>
          )}
          {/* Main Layout */}
          <div className='grid grid-cols-1 xl:grid-cols-5 gap-8'>
            {/* Left Side - Calendar View (Bigger) */}
            <div className='xl:col-span-2'>
              <CalendarView
                appointments={appointments}
                onDateClick={date => {
                  /* Date clicked */
                }}
              />
            </div>
            {/* Right Side - Appointments List */}
            <div className='xl:col-span-3'>
              <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
                {/* Tabs */}
                <div className='border-b border-gray-200 bg-gray-50'>
                  <div className='flex'>
                    <button
                      onClick={() => setActiveTab('upcoming')}
                      className={`px-8 py-4 font-semibold text-sm border-b-3 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        activeTab === 'upcoming'
                          ? 'border-blue-500 text-blue-600 bg-white'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <i className='ri-calendar-check-line'></i>
                        Planlanan Randevular ({upcomingAppointments.length})
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('past')}
                      className={`px-8 py-4 font-semibold text-sm border-b-3 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        activeTab === 'past'
                          ? 'border-blue-500 text-blue-600 bg-white'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <i className='ri-history-line'></i>
                        Geçmiş Randevular ({pastAppointments.length})
                      </div>
                    </button>
                  </div>
                </div>
                {/* Appointments List */}
                <div className='p-6'>
                  <div className='space-y-6'>
                    {activeTab === 'upcoming' ? (
                      upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(appointment => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onViewDetails={handleViewDetails}
                          />
                        ))
                      ) : (
                        <div className='text-center py-16'>
                          <div className='w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                            <i className='ri-calendar-line text-blue-600 text-3xl'></i>
                          </div>
                          <h3 className='text-xl font-bold text-gray-900 mb-3'>
                            Planlanmış randevu yok
                          </h3>
                          <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                            Henüz yaklaşan randevunuz bulunmamaktadır.
                            Danışmanlarımızla görüşme planlayarak işinizi
                            büyütün.
                          </p>
                          <button
                            onClick={() => setShowNewAppointmentModal(true)}
                            className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          >
                            İlk Randevunu Planla
                          </button>
                        </div>
                      )
                    ) : pastAppointments.length > 0 ? (
                      pastAppointments.map(appointment => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onViewDetails={handleViewDetails}
                        />
                      ))
                    ) : (
                      <div className='text-center py-16'>
                        <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                          <i className='ri-history-line text-gray-400 text-3xl'></i>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-3'>
                          Geçmiş randevu yok
                        </h3>
                        <p className='text-gray-600 max-w-md mx-auto'>
                          Henüz tamamlanmış randevunuz bulunmamaktadır. İlk
                          randevunuzu planlayarak başlayın.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        consultants={consultants}
        onSubmit={handleNewAppointment}
      />
      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAppointment(null);
        }}
      />
    </div>
  );
}
