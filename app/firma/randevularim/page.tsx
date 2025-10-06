'use client';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';
interface Appointment {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  consultant: string;
  type: string;
  created_at: string;
}
export default function RandevularimPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    if (user?.company_id) {
      fetchAppointments();
    }
  }, [user?.company_id]);
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Mock data - gerçek API endpoint'i buraya eklenebilir
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          title: 'E-ihracat Stratejisi Görüşmesi',
          description: 'Firma e-ihracat stratejisi hakkında detaylı görüşme',
          date: '2024-01-15',
          time: '14:00',
          status: 'scheduled',
          consultant: 'Ahmet Yılmaz',
          type: 'Danışmanlık',
          created_at: '2024-01-10T10:00:00Z',
        },
        {
          id: '2',
          title: 'Pazar Araştırması Değerlendirmesi',
          description:
            'Hedef pazarlar için araştırma sonuçlarının değerlendirilmesi',
          date: '2024-01-20',
          time: '10:30',
          status: 'completed',
          consultant: 'Mehmet Demir',
          type: 'Raporlama',
          created_at: '2024-01-12T14:30:00Z',
        },
        {
          id: '3',
          title: 'Dijital Pazarlama Eğitimi',
          description: 'E-ihracat için dijital pazarlama stratejileri eğitimi',
          date: '2024-01-25',
          time: '16:00',
          status: 'scheduled',
          consultant: 'Ayşe Kaya',
          type: 'Eğitim',
          created_at: '2024-01-14T09:15:00Z',
        },
      ];
      setAppointments(mockAppointments);
    } catch (err) {
      setError('Randevular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleAppointmentUpdate = (
    appointmentId: string,
    updates: Partial<Appointment>
  ) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === appointmentId ? { ...apt, ...updates } : apt))
    );
  };
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch =
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.consultant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || appointment.status === filter;
    return matchesSearch && matchesFilter;
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planlandı';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Randevularım'
        description='Randevularınızı görüntüleyin ve yönetin'
      >
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </FirmaLayout>
    );
  }
  if (error) {
    return (
      <FirmaLayout
        title='Randevularım'
        description='Randevularınızı görüntüleyin ve yönetin'
      >
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
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Randevularım'
      description='Randevularınızı görüntüleyin ve yönetin'
    >
      <div className='space-y-6'>
        {/* Filtreler ve Arama */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <input
                type='text'
                placeholder='Randevu başlığı, açıklama veya danışman adı ile ara...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div className='flex gap-2'>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>Tüm Durumlar</option>
                <option value='scheduled'>Planlandı</option>
                <option value='completed'>Tamamlandı</option>
                <option value='cancelled'>İptal Edildi</option>
              </select>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                <i className='ri-add-line mr-2'></i>
                Yeni Randevu
              </button>
            </div>
          </div>
        </div>
        {/* Randevu Listesi */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Randevular ({filteredAppointments.length})
            </h2>
          </div>
          <div className='divide-y divide-gray-200'>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className='p-6 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='text-lg font-medium text-gray-900'>
                          {appointment.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                        <span className='px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                          {appointment.type}
                        </span>
                      </div>
                      <p className='text-gray-600 mb-3'>
                        {appointment.description}
                      </p>
                      <div className='flex items-center gap-4 text-sm text-gray-500'>
                        <span>
                          <i className='ri-calendar-line mr-1'></i>
                          {formatDate(appointment.date)} - {appointment.time}
                        </span>
                        <span>
                          <i className='ri-user-line mr-1'></i>
                          {appointment.consultant}
                        </span>
                        <span>
                          <i className='ri-time-line mr-1'></i>
                          Oluşturulma: {formatDate(appointment.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 ml-4'>
                      <button
                        className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                        title='Düzenle'
                      >
                        <i className='ri-edit-line'></i>
                      </button>
                      <button
                        className='p-2 text-gray-400 hover:text-green-600 transition-colors'
                        title='Görüntüle'
                      >
                        <i className='ri-eye-line'></i>
                      </button>
                      {appointment.status === 'scheduled' && (
                        <button
                          className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                          title='İptal Et'
                        >
                          <i className='ri-close-line'></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='p-12 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-calendar-line text-2xl text-gray-400'></i>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Randevu Bulunamadı
                </h3>
                <p className='text-gray-500 mb-4'>
                  Arama kriterlerinize uygun randevu bulunamadı.
                </p>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  İlk Randevuyu Oluştur
                </button>
              </div>
            )}
          </div>
        </div>
        {/* İstatistikler */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-blue-100 rounded-lg'>
                <i className='ri-calendar-line text-2xl text-blue-600'></i>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Toplam Randevu
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {appointments.length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-green-100 rounded-lg'>
                <i className='ri-check-line text-2xl text-green-600'></i>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Tamamlanan</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {
                    appointments.filter(apt => apt.status === 'completed')
                      .length
                  }
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
                <p className='text-sm font-medium text-gray-600'>Planlanan</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {
                    appointments.filter(apt => apt.status === 'scheduled')
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Hızlı İşlemler */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Hızlı İşlemler
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <button className='flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors'>
              <div className='text-center'>
                <i className='ri-add-line text-2xl text-gray-400 mb-2'></i>
                <div className='text-sm font-medium text-gray-600'>
                  Yeni Randevu
                </div>
              </div>
            </button>
            <button className='flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors'>
              <div className='text-center'>
                <i className='ri-file-download-line text-2xl text-gray-400 mb-2'></i>
                <div className='text-sm font-medium text-gray-600'>
                  Rapor İndir
                </div>
              </div>
            </button>
            <button className='flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors'>
              <div className='text-center'>
                <i className='ri-calendar-check-line text-2xl text-gray-400 mb-2'></i>
                <div className='text-sm font-medium text-gray-600'>
                  Takvim Görünümü
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
