'use client';
import { useEffect, useState } from 'react';

import Calendar from '@/components/layout/Calendar';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

import EventForm from './EventForm';
/* ==============================
   Types
   ============================== */
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
  created_at: string;
  updated_at: string;
  consultant?: any;
  participants_count: number;
  attending_count: number;
  attended_count: number;
}
interface EventParticipant {
  id: string;
  eventId: string;
  name: string;
  email: string;
  company: string;
  registeredAt: string;
  status: 'Kayıtlı' | 'Katıldı' | 'Katılmadı';
}
/* ==============================
   Card Component
   ============================== */
const EventCard = ({
  event,
  onEdit,
  onDelete,
  onViewParticipants,
  onToggleStatus,
}: {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  onViewParticipants: (event: Event) => void;
  onToggleStatus: (id: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Webinar':
        return 'bg-blue-100 text-blue-800';
      case 'Workshop':
        return 'bg-green-100 text-green-800';
      case 'Seminer':
        return 'bg-purple-100 text-purple-800';
      case 'Eğitim':
        return 'bg-orange-100 text-orange-800';
      case 'Ziyaret':
        return 'bg-pink-100 text-pink-800';
      case 'Görüşme':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planlandı':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aktif':
        return 'bg-green-100 text-green-800';
      case 'Tamamlandı':
        return 'bg-gray-100 text-gray-800';
      case 'İptal edildi':
        return 'bg-red-100 text-red-800';
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  const fillPercentage = Math.round(
    (event.registered_count / event.max_participants) * 100
  );
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 relative'>
      {/* Actions Menu */}
      <div className='absolute top-4 right-4'>
        <button
          onClick={() => setShowActions(!showActions)}
          className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer'
        >
          <i className='ri-more-2-line text-gray-600'></i>
        </button>
        {showActions && (
          <div className='absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-10'>
            <button
              onClick={() => {
                onEdit(event);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center'
            >
              <i className='ri-edit-line mr-2'></i>
              Düzenle
            </button>
            <button
              onClick={() => {
                onViewParticipants(event);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center'
            >
              <i className='ri-group-line mr-2'></i>
              Katılımcılar
            </button>
            <button
              onClick={() => {
                onToggleStatus(event.id);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center'
            >
              <i className='ri-toggle-line mr-2'></i>
              Durumu Değiştir
            </button>
            <hr className='my-1' />
            <button
              onClick={() => {
                onDelete(event.id);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center'
            >
              <i className='ri-delete-bin-line mr-2'></i>
              Sil
            </button>
          </div>
        )}
      </div>
      {/* Category Badge */}
      <div className='flex items-center justify-between mb-4'>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
            event.category
          )}`}
        >
          {event.category}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            event.status
          )}`}
        >
          {event.status}
        </span>
      </div>
      {/* Event Title */}
      <h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
        {event.title}
      </h3>
      {/* Event Description */}
      <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
        {event.description}
      </p>
      {/* Event Details */}
      <div className='space-y-3 mb-4'>
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-calendar-line mr-2 text-gray-400'></i>
          <span>{formatDate(event.start_date)}</span>
        </div>
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-time-line mr-2 text-gray-400'></i>
          <span>
            {event.time} ({formatDuration(event.duration)})
          </span>
        </div>
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-map-pin-line mr-2 text-gray-400'></i>
          <span className='truncate'>{event.location}</span>
        </div>
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-user-line mr-2 text-gray-400'></i>
          <span>{event.speaker}</span>
        </div>
      </div>
      {/* Online/Offline Badge */}
      <div className='flex items-center mb-4'>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            event.is_online
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <i
            className={`mr-1 ${
              event.is_online ? 'ri-wifi-line' : 'ri-building-line'
            }`}
          ></i>
          {event.is_online ? 'Online' : 'Yüz Yüze'}
        </span>
        {event.is_free && (
          <span className='ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
            <i className='ri-gift-line mr-1'></i>
            Ücretsiz
          </span>
        )}
      </div>
      {/* Participants Progress */}
      <div className='mb-4'>
        <div className='flex justify-between text-sm text-gray-600 mb-1'>
          <span>Katılımcılar</span>
          <span>
            {event.registered_count}/{event.max_participants}
          </span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
            style={{ width: `${Math.min(fillPercentage, 100)}%` }}
          ></div>
        </div>
      </div>
      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className='flex flex-wrap gap-1 mb-4'>
          {event.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700'
            >
              {tag}
            </span>
          ))}
          {event.tags.length > 3 && (
            <span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700'>
              +{event.tags.length - 3}
            </span>
          )}
        </div>
      )}
      {/* Points Reward */}
      {event.points_reward > 0 && (
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-star-line mr-1 text-yellow-500'></i>
          <span>{event.points_reward} puan</span>
        </div>
      )}
    </div>
  );
};
/* ==============================
   Participants Modal
   ============================== */
const ParticipantsModal = ({
  event,
  isOpen,
  onClose,
}: {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Katılımcıları getir
  useEffect(() => {
    if (isOpen && event) {
      const fetchParticipants = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/events/${event.id}/participants`, {
            headers: {
              'X-User-Email': 'admin@ihracatakademi.com',
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setParticipants(result.data.participants);
            } else {
              setError(result.error || 'Katılımcılar getirilemedi');
            }
          } else {
            setError('Katılımcılar getirilemedi');
          }
        } catch (err) {
          setError('Katılımcılar yüklenirken hata oluştu');
        } finally {
          setLoading(false);
        }
      };
      fetchParticipants();
    }
  }, [isOpen, event]);
  // Katılım durumunu güncelle
  const handleStatusUpdate = async (
    participantId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/events/${event?.id}/participants/${participantId}`,
        {
          method: 'PUT',
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (response.ok) {
        // Katılımcı listesini güncelle
        setParticipants(prev =>
          prev.map(p =>
            p.id === participantId ? { ...p, status: newStatus } : p
          )
        );
      } else {
        alert('Durum güncellenirken hata oluştu');
      }
    } catch (error) {
      alert('Durum güncellenirken hata oluştu');
    }
  };
  if (!isOpen || !event) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>
            {event.title} - Katılımcılar
          </h2>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
          >
            <i className='ri-close-line text-gray-600'></i>
          </button>
        </div>
        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          {loading ? (
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-600'>Katılımcılar yükleniyor...</p>
            </div>
          ) : error ? (
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-error-warning-line text-2xl text-red-600'></i>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Hata oluştu
              </h3>
              <p className='text-gray-500'>{error}</p>
            </div>
          ) : participants.length > 0 ? (
            <div className='space-y-4'>
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                >
                  <div>
                    <h4 className='font-medium text-gray-900'>
                      {participant.user_name}
                    </h4>
                    <p className='text-sm text-gray-600'>
                      {participant.user_email}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Kayıt:{' '}
                      {new Date(participant.registered_at).toLocaleDateString(
                        'tr-TR'
                      )}
                    </p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <select
                      value={participant.status}
                      onChange={e =>
                        handleStatusUpdate(participant.id, e.target.value)
                      }
                      className='px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='Kayıtlı'>Kayıtlı</option>
                      <option value='Katıldı'>Katıldı</option>
                      <option value='Katılmadı'>Katılmadı</option>
                    </select>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        participant.status === 'Kayıtlı'
                          ? 'bg-blue-100 text-blue-800'
                          : participant.status === 'Katıldı'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {participant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-group-line text-2xl text-gray-400'></i>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Henüz katılımcı yok
              </h3>
              <p className='text-gray-500'>
                Bu etkinliğe henüz kimse kayıt olmamış.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
/* ==============================
   Main Page Component
   ============================== */
export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'list'>(
    'grid'
  );
  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events', {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Etkinlikler getirilemedi');
        }
        const result = await response.json();
        if (result.success) {
          setEvents(result.data.events);
        } else {
          setError(result.error || 'Etkinlikler getirilemedi');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  const [participants] = useState<EventParticipant[]>([
    {
      id: '1',
      eventId: '1',
      name: 'Ali Şahin',
      email: 'ali@firma.com',
      company: 'Şahin İhracat Ltd.',
      registeredAt: '2024-02-21T10:30:00Z',
      status: 'Kayıtlı',
    },
    {
      id: '2',
      eventId: '1',
      name: 'Ayşe Yılmaz',
      email: 'ayse@firma.com',
      company: 'Yılmaz Tekstil A.Ş.',
      registeredAt: '2024-02-22T14:15:00Z',
      status: 'Katıldı',
    },
  ]);
  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesCategory =
      selectedCategory === 'all' || event.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' || event.status === selectedStatus;
    const matchesSearch =
      searchTerm === '' ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });
  // Event handlers
  const handleCreateEvent = () => {
    setFormMode('create');
    setEditingEvent(null);
    setShowEventForm(true);
  };
  const handleEditEvent = (event: Event) => {
    setFormMode('edit');
    setEditingEvent(event);
    setShowEventForm(true);
  };
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setEvents(events.filter(event => event.id !== id));
      } else {
        alert('Etkinlik silinirken hata oluştu');
      }
    } catch (error) {
      alert('Etkinlik silinirken hata oluştu');
    }
  };
  const handleToggleStatus = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;
    const newStatus =
      event.status === 'Planlandı'
        ? 'Aktif'
        : event.status === 'Aktif'
          ? 'Tamamlandı'
          : 'Planlandı';
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setEvents(
          events.map(e => (e.id === id ? { ...e, status: newStatus } : e))
        );
      } else {
        alert('Durum güncellenirken hata oluştu');
      }
    } catch (error) {
      alert('Durum güncellenirken hata oluştu');
    }
  };
  const handleSubmitEvent = async (eventData: any) => {
    try {
      const url =
        formMode === 'create'
          ? '/api/events'
          : `/api/events/${editingEvent?.id}`;
      const method = formMode === 'create' ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Refresh events list
          const refreshResponse = await fetch('/api/events', {
            headers: {
              'X-User-Email': 'admin@ihracatakademi.com',
              'Content-Type': 'application/json',
            },
          });
          if (refreshResponse.ok) {
            const refreshResult = await refreshResponse.json();
            if (refreshResult.success) {
              setEvents(refreshResult.data.events);
            }
          }
        }
      } else {
        alert('Etkinlik kaydedilirken hata oluştu');
      }
    } catch (error) {
      alert('Etkinlik kaydedilirken hata oluştu');
    }
  };
  const handleViewParticipants = (event: Event) => {
    setSelectedEvent(event);
    setShowParticipantsModal(true);
  };
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Etkinlik Yönetimi
              </h1>
              <p className='text-sm text-gray-600'>
                Tüm etkinlikleri yönetin ve takip edin
              </p>
            </div>
            <div className='flex items-center gap-4'>
              {/* Notifications */}
              <NotificationDropdown userEmail='admin@ihracatakademi.com' />
              {/* View Mode Toggle */}
              <div className='flex bg-gray-100 rounded-lg p-1'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className='ri-grid-line mr-2'></i>
                  Kart Görünümü
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    viewMode === 'calendar'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className='ri-calendar-line mr-2'></i>
                  Takvim Görünümü
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className='ri-list-check mr-2'></i>
                  Liste Görünümü
                </button>
              </div>
              <button
                onClick={handleCreateEvent}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
              >
                <i className='ri-add-line mr-2'></i>
                Yeni Etkinlik
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Filters */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              >
                <option value='all'>Tüm Kategoriler</option>
                <option value='Seminer'>Seminer</option>
                <option value='Eğitim'>Eğitim</option>
                <option value='Ziyaret'>Ziyaret</option>
                <option value='Görüşme'>Görüşme</option>
                <option value='Webinar'>Webinar</option>
                <option value='Workshop'>Workshop</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Durum
              </label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              >
                <option value='all'>Tüm Durumlar</option>
                <option value='Planlandı'>Planlandı</option>
                <option value='Aktif'>Aktif</option>
                <option value='Tamamlandı'>Tamamlandı</option>
                <option value='İptal edildi'>İptal Edildi</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Etkinlik Ara
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                  <i className='ri-search-line text-gray-400 text-sm'></i>
                </div>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder='Etkinlik başlığı ara...'
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
            </div>
          </div>
          <div className='text-sm text-gray-600'>
            <span className='font-medium'>{filteredEvents.length}</span>{' '}
            etkinlik bulundu
          </div>
        </div>
        {/* Loading State */}
        {loading && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-loader-4-line text-2xl text-blue-600 animate-spin'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Etkinlikler yükleniyor...
            </h3>
          </div>
        )}
        {/* Error State */}
        {error && !loading && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-error-warning-line text-2xl text-red-600'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Hata oluştu
            </h3>
            <p className='text-gray-500 mb-4'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
            >
              Tekrar Dene
            </button>
          </div>
        )}
        {/* Content */}
        {!loading && !error && (
          <>
            {viewMode === 'grid' ? (
              <>
                {filteredEvents.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                        onToggleStatus={handleToggleStatus}
                        onViewParticipants={handleViewParticipants}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <i className='ri-calendar-event-line text-2xl text-gray-400'></i>
                    </div>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      Etkinlik bulunamadı
                    </h3>
                    <p className='text-gray-500 mb-4'>
                      İlk etkinliğinizi oluşturmak için başlayın
                    </p>
                    <button
                      onClick={handleCreateEvent}
                      className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                    >
                      Etkinlik Ekle
                    </button>
                  </div>
                )}
              </>
            ) : viewMode === 'calendar' ? (
              <Calendar
                events={filteredEvents}
                onEventClick={event => {
                  // Etkinlik detaylarını göster veya düzenleme modalını aç
                  handleEditEvent(event as any);
                }}
                view='month'
              />
            ) : (
              <>
                {filteredEvents.length > 0 ? (
                  <div className='space-y-6'>
                    {filteredEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                        onToggleStatus={handleToggleStatus}
                        onViewParticipants={handleViewParticipants}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <i className='ri-calendar-event-line text-2xl text-gray-400'></i>
                    </div>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      Etkinlik bulunamadı
                    </h3>
                    <p className='text-gray-500 mb-4'>
                      İlk etkinliğinizi oluşturmak için başlayın
                    </p>
                    <button
                      onClick={handleCreateEvent}
                      className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                    >
                      Etkinlik Ekle
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      {/* Participants Modal */}
      <ParticipantsModal
        event={selectedEvent}
        isOpen={showParticipantsModal}
        onClose={() => {
          setShowParticipantsModal(false);
          setSelectedEvent(null);
        }}
      />
      {/* Event Form Modal */}
      <EventForm
        event={editingEvent}
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSubmitEvent}
        mode={formMode}
      />
    </div>
  );
}
