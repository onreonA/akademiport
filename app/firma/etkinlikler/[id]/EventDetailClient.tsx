'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
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
interface EventDetailClientProps {
  eventId: string;
}
export default function EventDetailClient({ eventId }: EventDetailClientProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participationStatus, setParticipationStatus] = useState<
    'not_registered' | 'registered' | 'attended' | 'loading'
  >('not_registered');
  const [participationLoading, setParticipationLoading] = useState(false);
  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`, {
          headers: {
            'X-User-Email': 'info@mundo.com',
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Etkinlik getirilemedi');
        }
        const result = await response.json();
        if (result.success) {
          setEvent(result.data.event);
        } else {
          setError(result.error || 'Etkinlik bulunamadı');
        }
      } catch (err) {
        setError('Etkinlik yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);
  // Katılım durumunu kontrol et
  useEffect(() => {
    const checkParticipation = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/participants`, {
          headers: {
            'X-User-Email': 'info@mundo.com',
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const userParticipant = result.data.participants.find(
              (p: any) => p.user_email === 'info@mundo.com'
            );
            if (userParticipant) {
              if (userParticipant.status === 'Katıldı') {
                setParticipationStatus('attended');
              } else {
                setParticipationStatus('registered');
              }
            } else {
              setParticipationStatus('not_registered');
            }
          }
        }
      } catch (error) {}
    };
    if (event) {
      checkParticipation();
    }
  }, [eventId, event]);
  // Katılım kaydı oluştur
  const handleRegister = async () => {
    try {
      setParticipationLoading(true);
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'X-User-Email': 'info@mundo.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setParticipationStatus('registered');
          // Etkinlik bilgilerini güncelle
          if (event) {
            setEvent({
              ...event,
              registered_count: event.registered_count + 1,
            });
          }
        } else {
          alert(result.error || 'Kayıt işlemi başarısız');
        }
      } else {
        alert('Kayıt işlemi başarısız');
      }
    } catch (error) {
      alert('Kayıt işlemi sırasında hata oluştu');
    } finally {
      setParticipationLoading(false);
    }
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Etkinlik Detayı'
        description='Etkinlik detaylarını görüntüleyin'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Etkinlik Yükleniyor
            </h3>
            <p className='text-gray-600'>Etkinlik detayları hazırlanıyor...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  if (error || !event) {
    return (
      <FirmaLayout
        title='Etkinlik Detayı'
        description='Etkinlik detaylarını görüntüleyin'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-error-warning-line text-2xl text-red-600'></i>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Hata oluştu
            </h3>
            <p className='text-gray-600 mb-4'>
              {error || 'Etkinlik bulunamadı'}
            </p>
            <Link href='/firma/etkinlikler'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
                Etkinliklere Dön
              </button>
            </Link>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}sa ${mins}dk`;
    }
    return `${mins}dk`;
  };
  return (
    <FirmaLayout
      title='Etkinlik Detayı'
      description='Etkinlik detaylarını görüntüleyin'
    >
      <div className='p-6'>
        <div className='mb-6'>
          <Link href='/firma/etkinlikler'>
            <button className='flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer'>
              <i className='ri-arrow-left-line'></i>
              <span>Etkinliklere Dön</span>
            </button>
          </Link>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-8'>
            <div className='mb-6'>
              <div className='flex items-center gap-3 mb-4'>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.status === 'Planlandı'
                      ? 'bg-blue-100 text-blue-800'
                      : event.status === 'Tamamlandı'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {event.status}
                </span>
                <span className='px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800'>
                  {event.category}
                </span>
              </div>
              <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                {event.title}
              </h1>
              <p className='text-lg text-gray-600 leading-relaxed'>
                {event.description}
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <i className='ri-calendar-line text-blue-600'></i>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900'>Tarih</h4>
                  <p className='text-gray-600'>
                    {formatDate(event.start_date)}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <i className='ri-time-line text-green-600'></i>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900'>Saat</h4>
                  <p className='text-gray-600'>
                    {event.time} ({formatDuration(event.duration)})
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <i className='ri-map-pin-line text-purple-600'></i>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900'>Lokasyon</h4>
                  <p className='text-gray-600'>{event.location}</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <i className='ri-user-line text-orange-600'></i>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900'>Konuşmacı</h4>
                  <p className='text-gray-600'>{event.speaker}</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <i className='ri-group-line text-yellow-600'></i>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900'>Katılımcılar</h4>
                  <p className='text-gray-600'>
                    {event.registered_count} / {event.max_participants} kişi
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <i className='ri-wifi-line text-red-600'></i>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900'>Tür</h4>
                  <p className='text-gray-600'>
                    {event.is_online ? 'Online' : 'Yüz Yüze'}
                  </p>
                </div>
              </div>
            </div>
            {event.meeting_link && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                <div className='flex items-center gap-2 text-blue-800 mb-2'>
                  <i className='ri-video-line'></i>
                  <span className='font-medium'>Online Katılım</span>
                </div>
                <p className='text-sm text-blue-600 mb-3'>
                  Etkinliğe online olarak katılabilirsiniz
                </p>
                <a
                  href={event.meeting_link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer'
                >
                  <i className='ri-external-link-line'></i>
                  Toplantıya Katıl
                </a>
              </div>
            )}
            {/* Katılım Butonu */}
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Etkinliğe Katılım
                  </h3>
                  <p className='text-gray-600'>
                    {participationStatus === 'not_registered' &&
                      'Bu etkinliğe katılmak için kayıt olun'}
                    {participationStatus === 'registered' &&
                      'Bu etkinliğe kayıtlısınız'}
                    {participationStatus === 'attended' &&
                      'Bu etkinliğe katıldınız'}
                  </p>
                </div>
                <div className='flex gap-3'>
                  {participationStatus === 'not_registered' && (
                    <button
                      onClick={handleRegister}
                      disabled={
                        participationLoading ||
                        event.registered_count >= event.max_participants
                      }
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        participationLoading ||
                        event.registered_count >= event.max_participants
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {participationLoading ? (
                        <div className='flex items-center gap-2'>
                          <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                          Kaydediliyor...
                        </div>
                      ) : event.registered_count >= event.max_participants ? (
                        'Dolu'
                      ) : (
                        'Kayıt Ol'
                      )}
                    </button>
                  )}
                  {participationStatus === 'registered' && (
                    <div className='flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg'>
                      <i className='ri-check-line'></i>
                      <span className='font-medium'>Kayıtlı</span>
                    </div>
                  )}
                  {participationStatus === 'attended' && (
                    <div className='flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg'>
                      <i className='ri-check-double-line'></i>
                      <span className='font-medium'>Katıldı</span>
                    </div>
                  )}
                </div>
              </div>
              {event.registered_count >= event.max_participants &&
                participationStatus === 'not_registered' && (
                  <p className='text-sm text-red-600 mt-3'>
                    Bu etkinlik maksimum katılımcı sayısına ulaştı
                  </p>
                )}
            </div>
            {event.points_reward > 0 && (
              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 text-yellow-800'>
                  <i className='ri-star-line text-lg'></i>
                  <span className='font-medium'>
                    {event.points_reward} Puan Ödülü
                  </span>
                </div>
                <p className='text-sm text-yellow-700 mt-2'>
                  Bu etkinliğe katılarak {event.points_reward} puan
                  kazanabilirsiniz
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
