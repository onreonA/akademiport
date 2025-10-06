'use client';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';
interface Event {
  id: string;
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
  registered_count: number;
  status: string;
  is_online: boolean;
  is_free: boolean;
  meeting_platform?: string;
  meeting_link?: string;
  meeting_id?: string;
  meeting_password?: string;
  consultant_id?: string;
  requirements: any[];
  materials: any[];
  attendance_tracking: boolean;
  gamification_enabled: boolean;
  points_reward: number;
  tags: string[];
  participationStatus?: 'registered' | 'attended' | 'cancelled' | null;
  participants_count?: number;
  attending_count?: number;
  attended_count?: number;
}
interface EventCardProps {
  event: Event;
  onViewDetails: (eventId: string) => void;
  onParticipationUpdate: (
    eventId: string,
    status: 'registered' | 'attended' | 'cancelled'
  ) => void;
}
const EventCard = ({
  event,
  onViewDetails,
  onParticipationUpdate,
}: EventCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  const formatTime = (timeString: string) => {
    return timeString;
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getParticipationButton = () => {
    if (event.participationStatus === 'registered') {
      return (
        <button
          onClick={() => onParticipationUpdate(event.id, 'cancelled')}
          className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
        >
          Kaydı İptal Et
        </button>
      );
    } else if (event.participationStatus === 'attended') {
      return (
        <span className='px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium'>
          Katıldınız
        </span>
      );
    } else if (event.participationStatus === 'cancelled') {
      return (
        <button
          onClick={() => onParticipationUpdate(event.id, 'registered')}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Tekrar Kayıt Ol
        </button>
      );
    } else {
      return (
        <button
          onClick={() => onParticipationUpdate(event.id, 'registered')}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Kayıt Ol
        </button>
      );
    }
  };
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow'>
      <div className='flex justify-between items-start mb-4'>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            {event.title}
          </h3>
          <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
            {event.description}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
        >
          {event.status === 'upcoming'
            ? 'Yaklaşan'
            : event.status === 'ongoing'
              ? 'Devam Ediyor'
              : event.status === 'completed'
                ? 'Tamamlandı'
                : event.status === 'cancelled'
                  ? 'İptal Edildi'
                  : event.status}
        </span>
      </div>
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-calendar-line mr-2 text-gray-400'></i>
          <span>{formatDate(event.start_date)}</span>
        </div>
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-time-line mr-2 text-gray-400'></i>
          <span>{formatTime(event.time)}</span>
        </div>
        <div className='flex items-center text-sm text-gray-600'>
          <i
            className={`mr-2 ${event.is_online ? 'ri-computer-line text-green-500' : 'ri-map-pin-line text-blue-500'}`}
          ></i>
          <span>{event.is_online ? 'Online' : event.location}</span>
        </div>
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-user-line mr-2 text-gray-400'></i>
          <span>{event.speaker}</span>
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <div className='text-sm text-gray-500'>
          {event.registered_count}/{event.max_participants} katılımcı
        </div>
        <div className='flex space-x-2'>
          {getParticipationButton()}
          <button
            onClick={() => onViewDetails(event.id)}
            className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Detaylar
          </button>
        </div>
      </div>
    </div>
  );
};
export default function CompanyEventsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Gerçek API'den etkinlikleri yükle
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/events');
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.error || 'Etkinlikler yüklenirken hata oluştu'
          );
        }
        if (result.data && result.data.events) {
          // API'den gelen verileri firma formatına dönüştür
          const formattedEvents = result.data.events.map((event: any) => ({
            ...event,
            // API'den gelen alanları firma formatına uyarla
            start_date: event.start_date || event.date,
            end_date: event.end_date || event.date,
            time: event.time || '09:00',
            // Katılım durumu varsayılan olarak null (kullanıcı henüz kayıt olmamış)
            participationStatus: null,
            // API'den gelen sayıları kullan
            participants_count: event.participants_count || 0,
            attending_count: event.attending_count || 0,
            attended_count: event.attended_count || 0,
            // Diğer alanları koru
            requirements: event.requirements || [],
            materials: event.materials || [],
            attendance_tracking: event.attendance_tracking || false,
            gamification_enabled: event.gamification_enabled !== false,
            points_reward: event.points_reward || 0,
            tags: event.tags || [],
          }));
          setEvents(formattedEvents);
          setFilteredEvents(formattedEvents);
        } else {
          setEvents([]);
          setFilteredEvents([]);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Etkinlikler yüklenirken hata oluştu'
        );
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchEvents();
    }
  }, [user]);
  // Filtreleme ve arama
  useEffect(() => {
    let filtered = events;
    // Kategori filtresi
    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => event.category === filterCategory);
    }
    // Durum filtresi
    if (filterStatus !== 'all') {
      filtered = filtered.filter(event => event.status === filterStatus);
    }
    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.speaker.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
  }, [events, filterCategory, filterStatus, searchTerm]);
  const handleViewDetails = (eventId: string) => {
    // Etkinlik detay sayfasına yönlendir
    window.location.href = `/firma/etkinlikler/${eventId}`;
  };
  const handleParticipationUpdate = async (
    eventId: string,
    status: 'registered' | 'attended' | 'cancelled'
  ) => {
    try {
      // API'ye katılım durumu güncelleme isteği gönder
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
        }),
      });
      if (response.ok) {
        // Başarılı güncelleme sonrası etkinlik listesini güncelle
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId
              ? { ...event, participationStatus: status }
              : event
          )
        );
        // Filtrelenmiş listeyi de güncelle
        setFilteredEvents(prevFiltered =>
          prevFiltered.map(event =>
            event.id === eventId
              ? { ...event, participationStatus: status }
              : event
          )
        );
      } else {
        const result = await response.json();
        throw new Error(
          result.error || 'Katılım durumu güncellenirken hata oluştu'
        );
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Katılım durumu güncellenirken hata oluştu'
      );
    }
  };
  // İstatistikleri hesapla
  const stats = {
    total: events.length,
    registered: events.filter(e => e.participationStatus === 'registered')
      .length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    online: events.filter(e => e.is_online).length,
  };
  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='mt-4 text-gray-600'>Etkinlikler yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <i className='ri-error-warning-line text-red-400'></i>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-red-800'>Hata</h3>
            <div className='mt-2 text-sm text-red-700'>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className='space-y-6'>
      {/* İstatistik Kartları */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center'>
            <div className='p-3 bg-blue-100 rounded-lg'>
              <i className='ri-calendar-line text-2xl text-blue-600'></i>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Toplam Etkinlik
              </p>
              <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center'>
            <div className='p-3 bg-green-100 rounded-lg'>
              <i className='ri-user-check-line text-2xl text-green-600'></i>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Katıldığım</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.registered}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center'>
            <div className='p-3 bg-yellow-100 rounded-lg'>
              <i className='ri-time-line text-2xl text-yellow-600'></i>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Yaklaşan</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.upcoming}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center'>
            <div className='p-3 bg-purple-100 rounded-lg'>
              <i className='ri-computer-line text-2xl text-purple-600'></i>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Online Etkinlik
              </p>
              <p className='text-2xl font-bold text-gray-900'>{stats.online}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Filtreler ve Arama */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex space-x-2'>
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilterCategory('webinar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === 'webinar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Webinar
              </button>
              <button
                onClick={() => setFilterCategory('egitim')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === 'egitim'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Eğitim
              </button>
              <button
                onClick={() => setFilterCategory('seminer')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === 'seminer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Seminer
              </button>
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tüm Durumlar
              </button>
              <button
                onClick={() => setFilterStatus('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'upcoming'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yaklaşan
              </button>
              <button
                onClick={() => setFilterStatus('ongoing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'ongoing'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Devam Eden
              </button>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex space-x-2'>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className='ri-grid-line'></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className='ri-list-line'></i>
              </button>
            </div>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                <i className='ri-search-line text-gray-400'></i>
              </div>
              <input
                type='text'
                placeholder='Etkinlik adı, açıklama veya konuşmacı ara...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      {viewMode === 'grid' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={handleViewDetails}
                onParticipationUpdate={handleParticipationUpdate}
              />
            ))
          ) : (
            <div className='col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-calendar-line text-gray-400 text-2xl'></i>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Etkinlik Bulunamadı
              </h3>
              <p className='text-gray-600'>
                Aradığınız kriterlere uygun etkinlik bulunmuyor.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={handleViewDetails}
                onParticipationUpdate={handleParticipationUpdate}
              />
            ))
          ) : (
            <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-calendar-line text-gray-400 text-2xl'></i>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Etkinlik Bulunamadı
              </h3>
              <p className='text-gray-600'>
                Aradığınız kriterlere uygun etkinlik bulunmuyor.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
