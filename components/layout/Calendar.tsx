'use client';
import { useState, useEffect } from 'react';
interface Event {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  time: string;
  category: string;
  status: string;
  is_online: boolean;
  location: string;
}
interface CalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  view?: 'month' | 'week' | 'list';
  className?: string;
}
export default function Calendar({
  events,
  onEventClick,
  view = 'month',
  className = '',
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Ay görünümü için takvim günlerini hesapla
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const days = [];
    const current = new Date(startDate);
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };
  // Belirli bir günde olan etkinlikleri getir
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };
  // Kategori rengini getir
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Seminer':
        return 'bg-purple-500';
      case 'Eğitim':
        return 'bg-blue-500';
      case 'Webinar':
        return 'bg-green-500';
      case 'Workshop':
        return 'bg-orange-500';
      case 'Ziyaret':
        return 'bg-pink-500';
      case 'Görüşme':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };
  // Durum rengini getir
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planlandı':
        return 'border-l-4 border-yellow-500';
      case 'Aktif':
        return 'border-l-4 border-green-500';
      case 'Tamamlandı':
        return 'border-l-4 border-gray-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };
  // Ay navigasyonu
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  const days = getDaysInMonth(currentDate);
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
  if (view === 'list') {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      >
        <div className='p-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Etkinlik Listesi
          </h3>
        </div>
        <div className='divide-y divide-gray-200'>
          {events.length > 0 ? (
            events.map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${getStatusColor(event.status)}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900 mb-1'>
                      {event.title}
                    </h4>
                    <div className='flex items-center gap-4 text-sm text-gray-600'>
                      <span className='flex items-center gap-1'>
                        <i className='ri-calendar-line'></i>
                        {new Date(event.start_date).toLocaleDateString('tr-TR')}
                      </span>
                      <span className='flex items-center gap-1'>
                        <i className='ri-time-line'></i>
                        {event.time}
                      </span>
                      <span className='flex items-center gap-1'>
                        <i className='ri-map-pin-line'></i>
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(event.category)}`}
                    >
                      {event.category}
                    </span>
                    {event.is_online && (
                      <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='p-8 text-center text-gray-500'>
              <i className='ri-calendar-event-line text-3xl mb-2'></i>
              <p>Henüz etkinlik bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {/* Takvim Başlığı */}
      <div className='p-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={goToPreviousMonth}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <i className='ri-arrow-left-s-line text-xl'></i>
            </button>
            <h2 className='text-xl font-semibold text-gray-900'>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToNextMonth}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <i className='ri-arrow-right-s-line text-xl'></i>
            </button>
          </div>
          <button
            onClick={goToToday}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
          >
            Bugün
          </button>
        </div>
      </div>
      {/* Günler Başlığı */}
      <div className='grid grid-cols-7 gap-px bg-gray-200'>
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
          <div
            key={day}
            className='bg-gray-50 p-3 text-center text-sm font-medium text-gray-700'
          >
            {day}
          </div>
        ))}
      </div>
      {/* Takvim Günleri */}
      <div className='grid grid-cols-7 gap-px bg-gray-200'>
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected =
            selectedDate && day.toDateString() === selectedDate.toDateString();
          const dayEvents = getEventsForDate(day);
          return (
            <div
              key={index}
              className={`min-h-[120px] bg-white p-2 cursor-pointer transition-colors ${
                !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
              } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className='text-sm font-medium mb-1'>
                {day.getDate()}
                {isToday && (
                  <span className='ml-1 inline-block w-2 h-2 bg-blue-600 rounded-full'></span>
                )}
              </div>
              {/* Etkinlikler */}
              <div className='space-y-1'>
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    onClick={e => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={`text-xs p-1 rounded cursor-pointer text-white ${getCategoryColor(event.category)}`}
                    title={event.title}
                  >
                    <div className='truncate'>{event.title}</div>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className='text-xs text-gray-500 text-center'>
                    +{dayEvents.length - 2} daha
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Seçili Gün Etkinlikleri */}
      {selectedDate && (
        <div className='p-4 border-t border-gray-200 bg-gray-50'>
          <h4 className='font-medium text-gray-900 mb-3'>
            {selectedDate.toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h4>
          <div className='space-y-2'>
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className={`p-3 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${getStatusColor(event.status)}`}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <h5 className='font-medium text-gray-900'>
                        {event.title}
                      </h5>
                      <p className='text-sm text-gray-600'>
                        {event.time} - {event.location}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(event.category)}`}
                      >
                        {event.category}
                      </span>
                      {event.is_online && (
                        <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          Online
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-gray-500 text-center py-4'>
                Bu günde etkinlik bulunmuyor
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
