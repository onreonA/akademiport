'use client';
import { useEffect, useState } from 'react';

import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotesModal from '@/components/modals/NotesModal';
import RealTimeNotifications from '@/components/notifications/RealTimeNotifications';
interface Appointment {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  requestDate: string;
  preferredDate: string;
  preferredTime: string;
  consultantPreference?: string;
  meetingType: 'Online' | 'Yüz Yüze' | 'Telefon';
  subject: string;
  description: string;
  status: 'Beklemede' | 'Onaylandı' | 'Reddedildi' | 'Tamamlandı';
  priority: 'Düşük' | 'Orta' | 'Yüksek';
  consultant?: string;
  notes?: string;
}
const AppointmentCard = ({
  appointment,
  onUpdateStatus,
  onAssignConsultant,
  onViewDetails,
  onAddNote,
  onOpenNotes,
  updatingStatus,
}: {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: string) => void;
  onAssignConsultant: (id: string, consultant: string) => void;
  onViewDetails: (appointment: Appointment) => void;
  onAddNote: (id: string, note: string) => void;
  onOpenNotes: (appointment: Appointment) => void;
  updatingStatus: string | null;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Onaylandı':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Reddedildi':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Tamamlandı':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Yüksek':
        return 'bg-red-100 text-red-800';
      case 'Orta':
        return 'bg-orange-100 text-orange-800';
      case 'Düşük':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'Online':
        return 'ri-video-line';
      case 'Yüz Yüze':
        return 'ri-user-line';
      case 'Telefon':
        return 'ri-phone-line';
      default:
        return 'ri-calendar-line';
    }
  };
  return (
    <div className='bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 p-4 shadow-sm hover:shadow-md'>
      <div className='flex items-center justify-between mb-3'>
        {/* Sol taraf - Firma bilgileri */}
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-2'>
            <h3 className='font-semibold text-gray-900 text-lg'>
              {appointment.companyName}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
            >
              {appointment.status}
            </span>
            {appointment.priority && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(appointment.priority)}`}
              >
                {appointment.priority} Öncelik
              </span>
            )}
          </div>
          <div className='flex items-center gap-4 text-sm text-gray-600 mb-2'>
            <div className='flex items-center gap-1'>
              <i className='ri-mail-line text-blue-500'></i>
              <span>{appointment.email}</span>
            </div>
            <div className='flex items-center gap-1'>
              <i className='ri-phone-line text-green-500'></i>
              <span>{appointment.phone}</span>
            </div>
            <div className='flex items-center gap-1'>
              <i
                className={`${getMeetingTypeIcon(appointment.meetingType)} text-purple-500`}
              ></i>
              <span>{appointment.meetingType}</span>
            </div>
          </div>
          {/* Başlık ve açıklama - üst kısma taşındı */}
          <div className='mb-2'>
            <h4 className='font-medium text-gray-900 text-sm mb-1'>
              {appointment.subject}
            </h4>
            <p className='text-xs text-gray-600 line-clamp-1'>
              {appointment.description}
            </p>
          </div>
          {/* Danışman bilgisi - üst kısma taşındı */}
          {appointment.consultant && (
            <div className='flex items-center gap-2 text-xs text-gray-500'>
              <i className='ri-user-star-line text-blue-500'></i>
              <span>Danışman: {appointment.consultant}</span>
            </div>
          )}
        </div>
        {/* Sağ taraf - Tarih ve butonlar */}
        <div className='flex items-center gap-3'>
          <div className='text-right'>
            <div className='text-sm font-medium text-gray-900 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 rounded-lg'>
              {appointment.preferredDate}
            </div>
            <div className='text-xs text-gray-500 mt-1'>
              {appointment.preferredTime}
            </div>
            <div className='text-xs text-gray-400 mt-1'>
              Talep:{' '}
              {new Date(appointment.requestDate).toLocaleDateString('tr-TR')}
            </div>
          </div>
          {/* Action Buttons */}
          <div className='flex items-center gap-1'>
            <button
              onClick={() => onViewDetails(appointment)}
              className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
              title='Detayları Gör'
            >
              <i className='ri-eye-line text-lg'></i>
            </button>
            <button
              onClick={() => onOpenNotes(appointment)}
              className='p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors'
              title='Notlar'
            >
              <i className='ri-file-text-line text-lg'></i>
            </button>
            {appointment.status === 'Beklemede' && (
              <>
                <button
                  onClick={() => onUpdateStatus(appointment.id, 'Onaylandı')}
                  disabled={updatingStatus === appointment.id}
                  className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50'
                  title='Onayla'
                >
                  {updatingStatus === appointment.id ? (
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-green-600'></div>
                  ) : (
                    <i className='ri-check-line text-lg'></i>
                  )}
                </button>
                <button
                  onClick={() => onUpdateStatus(appointment.id, 'Reddedildi')}
                  disabled={updatingStatus === appointment.id}
                  className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50'
                  title='Reddet'
                >
                  {updatingStatus === appointment.id ? (
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
                  ) : (
                    <i className='ri-close-line text-lg'></i>
                  )}
                </button>
              </>
            )}
            {appointment.status === 'Onaylandı' && (
              <button
                onClick={() => onUpdateStatus(appointment.id, 'Tamamlandı')}
                disabled={updatingStatus === appointment.id}
                className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50'
                title='Tamamlandı Olarak İşaretle'
              >
                {updatingStatus === appointment.id ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                ) : (
                  <i className='ri-checkbox-circle-line text-lg'></i>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
const AppointmentDetailModal = ({
  appointment,
  onClose,
  onUpdateStatus,
  onAssignConsultant,
  onAddNote,
}: {
  appointment: Appointment;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onAssignConsultant: (id: string, consultant: string) => void;
  onAddNote: (id: string, note: string) => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState(appointment.status);
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [notes, setNotes] = useState(
    appointment.attendance_notes || appointment.notes || ''
  );
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loadingConsultants, setLoadingConsultants] = useState(true);
  // Danışmanları getir
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoadingConsultants(true);
        const response = await fetch('/api/consultants', {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setConsultants(data.consultants || []);
        }
      } catch (error) {
        // Hata durumunda mock data kullan
        setConsultants([
          {
            id: '76661697-907e-4e9b-84ee-5b150a3f48be',
            name: 'Zarife Erdoğan',
            specialization: 'İhracat Danışmanlığı',
          },
        ]);
      } finally {
        setLoadingConsultants(false);
      }
    };
    fetchConsultants();
  }, []);
  const handleSave = () => {
    onUpdateStatus(appointment.id, selectedStatus);
    if (selectedConsultant && selectedConsultant.trim()) {
      // UUID format kontrolü
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(selectedConsultant)) {
        onAssignConsultant(appointment.id, selectedConsultant);
      } else {
      }
    }
    if (notes.trim()) {
      onAddNote(appointment.id, notes);
    }
    onClose();
  };
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Randevu Detayları
            </h2>
            <button
              onClick={onClose}
              className='w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors'
            >
              <i className='ri-close-line text-gray-600'></i>
            </button>
          </div>
        </div>
        <div className='p-6 space-y-6'>
          {/* Company Info */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              Firma Bilgileri
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Firma Adı
                </label>
                <p className='text-gray-900'>{appointment.companyName}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  İletişim Kişisi
                </label>
                <p className='text-gray-900'>{appointment.contactPerson}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  E-posta
                </label>
                <p className='text-gray-900'>{appointment.email}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Telefon
                </label>
                <p className='text-gray-900'>{appointment.phone}</p>
              </div>
            </div>
          </div>
          {/* Appointment Details */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              Randevu Detayları
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Konu
                </label>
                <p className='text-gray-900'>{appointment.subject}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Görüşme Türü
                </label>
                <p className='text-gray-900'>{appointment.meetingType}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tercih Edilen Tarih
                </label>
                <p className='text-gray-900'>{appointment.preferredDate}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tercih Edilen Saat
                </label>
                <p className='text-gray-900'>{appointment.preferredTime}</p>
              </div>
            </div>
            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Açıklama
              </label>
              <p className='text-gray-900'>{appointment.description}</p>
            </div>
          </div>
          {/* Status and Assignment */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              Durum ve Atama
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as any)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='Beklemede'>Beklemede</option>
                  <option value='Onaylandı'>Onaylandı</option>
                  <option value='Reddedildi'>Reddedildi</option>
                  <option value='Tamamlandı'>Tamamlandı</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Danışman Atama
                </label>
                {loadingConsultants ? (
                  <div className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
                    <span className='text-sm text-gray-500'>
                      Danışmanlar yükleniyor...
                    </span>
                  </div>
                ) : (
                  <select
                    value={selectedConsultant}
                    onChange={e => setSelectedConsultant(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>Danışman Seçin</option>
                    {consultants.map(consultant => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.full_name} -{' '}
                        {consultant.consultant_profiles?.specialization ||
                          'Uzmanlık Belirtilmemiş'}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Danışman Notu
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Danışman notu ekleyin...'
            />
          </div>
        </div>
        <div className='p-6 border-t border-gray-200 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors'
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
export default function AppointmentRequests() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('appointments');
  const [activeTab, setActiveTab] = useState<
    'appointments' | 'revise-requests'
  >('appointments');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedMeetingType, setSelectedMeetingType] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviseRequests, setReviseRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [assigningConsultant, setAssigningConsultant] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedAppointmentForNotes, setSelectedAppointmentForNotes] =
    useState<Appointment | null>(null);
  // Revize taleplerini getir
  const fetchReviseRequests = async () => {
    try {
      const response = await fetch('/api/revise-requests');
      if (response.ok) {
        const data = await response.json();
        setReviseRequests(data.reviseRequests || []);
      } else {
      }
    } catch (error) {}
  };
  // Randevuları getir
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/appointments', {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Company ve consultant bilgilerini ayrı ayrı çek
          const companiesResponse = await fetch('/api/companies', {
            headers: {
              'X-User-Email': 'admin@ihracatakademi.com',
            },
          });
          const companiesData = companiesResponse.ok
            ? await companiesResponse.json()
            : { companies: [] };
          const consultantsResponse = await fetch('/api/consultants');
          const consultantsData = consultantsResponse.ok
            ? await consultantsResponse.json()
            : { consultants: [] };
          const formattedAppointments =
            data.appointments?.map((apt: any) => {
              // Company bilgilerini bul
              const company = companiesData.companies?.find(
                (c: any) => c.id === apt.company_id
              );
              // Consultant bilgilerini bul
              const consultant = consultantsData.consultants?.find(
                (c: any) => c.id === apt.consultant_id
              );
              return {
                id: apt.id,
                companyName:
                  apt.companyName ||
                  company?.name ||
                  `Firma ${apt.company_id?.slice(0, 8) || 'Bilinmeyen'}`,
                contactPerson: company?.name || 'İletişim Kişisi',
                email: company?.email || 'info@firma.com',
                phone: company?.phone || '0555 555 55 55',
                requestDate: apt.created_at,
                preferredDate: apt.preferred_date,
                preferredTime: apt.preferred_time,
                consultantPreference:
                  apt.consultantName ||
                  consultant?.full_name ||
                  `Danışman ${apt.consultant_id?.slice(0, 8) || 'Bilinmeyen'}`,
                meetingType:
                  apt.meeting_type === 'online'
                    ? 'Online'
                    : apt.meeting_type === 'phone'
                      ? 'Telefon'
                      : 'Yüz Yüze',
                subject: apt.title || apt.subject || 'Randevu Talebi',
                description: apt.description || '',
                status:
                  apt.status === 'pending'
                    ? 'Beklemede'
                    : apt.status === 'confirmed'
                      ? 'Onaylandı'
                      : apt.status === 'rejected'
                        ? 'Reddedildi'
                        : apt.status === 'completed'
                          ? 'Tamamlandı'
                          : 'Beklemede',
                priority:
                  apt.priority === 'low'
                    ? 'Düşük'
                    : apt.priority === 'medium'
                      ? 'Orta'
                      : apt.priority === 'high'
                        ? 'Yüksek'
                        : 'Orta',
                consultant:
                  apt.consultantName ||
                  consultant?.full_name ||
                  `Danışman ${apt.consultant_id?.slice(0, 8) || 'Atanmamış'}`,
                notes: apt.attendance_notes || apt.meeting_notes || '',
              };
            }) || [];
          setAppointments(formattedAppointments);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
    fetchReviseRequests();
  }, []);
  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch =
      !searchQuery ||
      appointment.companyName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appointment.contactPerson
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appointment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      !selectedStatus || appointment.status === selectedStatus;
    const matchesPriority =
      !selectedPriority || appointment.priority === selectedPriority;
    const matchesMeetingType =
      !selectedMeetingType || appointment.meetingType === selectedMeetingType;
    return (
      matchesSearch && matchesStatus && matchesPriority && matchesMeetingType
    );
  });
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setUpdatingStatus(id);
      setErrorMessage(null);
      // Frontend status'u backend status'una çevir
      const backendStatus =
        status === 'Beklemede'
          ? 'pending'
          : status === 'Onaylandı'
            ? 'confirmed'
            : status === 'Reddedildi'
              ? 'rejected'
              : status === 'Tamamlandı'
                ? 'completed'
                : 'pending';
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({ status: backendStatus }),
      });
      if (response.ok) {
        const { appointment } = await response.json();
        // Backend'den gelen status'u frontend status'una çevir
        const frontendStatus =
          appointment.status === 'pending'
            ? 'Beklemede'
            : appointment.status === 'confirmed'
              ? 'Onaylandı'
              : appointment.status === 'rejected'
                ? 'Reddedildi'
                : appointment.status === 'completed'
                  ? 'Tamamlandı'
                  : 'Beklemede';
        setAppointments(
          appointments.map(apt =>
            apt.id === id ? { ...apt, status: frontendStatus } : apt
          )
        );
        setSuccessMessage('Randevu durumu başarıyla güncellendi');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          `Durum güncellenirken hata: ${errorData.error || 'Bilinmeyen hata'}`
        );
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      setErrorMessage('Ağ bağlantısı hatası oluştu');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setUpdatingStatus(null);
    }
  };
  const handleAssignConsultant = async (id: string, consultant: string) => {
    try {
      setAssigningConsultant(id);
      setErrorMessage(null);
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({ consultant_id: consultant }),
      });
      if (response.ok) {
        const { appointment } = await response.json();
        setAppointments(
          appointments.map(apt =>
            apt.id === id
              ? { ...apt, consultant: appointment.consultant_id }
              : apt
          )
        );
        setSuccessMessage('Danışman başarıyla atandı');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          `Danışman atanırken hata: ${errorData.error || 'Bilinmeyen hata'}`
        );
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      setErrorMessage('Ağ bağlantısı hatası oluştu');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setAssigningConsultant(null);
    }
  };
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };
  const handleAddNote = async (id: string, note: string) => {
    try {
      const userEmail = 'admin@ihracatakademi.com';
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({
          attendance_notes: note,
        }),
      });
      if (response.ok) {
        // Update local state
        setAppointments(
          appointments.map(apt =>
            apt.id === id ? { ...apt, notes: note } : apt
          )
        );
        setSuccessMessage('Danışman notu başarıyla kaydedildi!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          `Hata: ${errorData.error || 'Not kaydedilirken bir hata oluştu'}`
        );
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('Not kaydedilirken bir hata oluştu');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };
  const handleOpenNotes = (appointment: Appointment) => {
    setSelectedAppointmentForNotes(appointment);
    setIsNotesModalOpen(true);
  };
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedMeetingType('');
  };
  // Revize talebi işlemleri
  const handleReviseRequestAction = async (
    reviseRequestId: string,
    action: 'approved' | 'rejected',
    reviewNotes?: string
  ) => {
    try {
      setUpdatingStatus(reviseRequestId);
      const response = await fetch(`/api/revise-requests/${reviseRequestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          status: action,
          reviewNotes: reviewNotes,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(
          result.message ||
            `Revize talebi ${action === 'approved' ? 'onaylandı' : 'reddedildi'}!`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
        // Refresh revise requests
        await fetchReviseRequests();
        // Also refresh appointments to show updated data
        const fetchAppointments = async () => {
          try {
            const response = await fetch('/api/appointments');
            if (response.ok) {
              const data = await response.json();
              setAppointments(data.appointments || []);
            } else {
            }
          } catch (error) {}
        };
        await fetchAppointments();
        // Force page refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'İşlem sırasında bir hata oluştu');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      setErrorMessage('İşlem sırasında bir hata oluştu');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setUpdatingStatus(null);
    }
  };
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <AdminHeader
        title='Admin Paneli'
        subtitle='Randevu Talepleri'
        onSearch={query => setSearchQuery(query)}
      />
      {/* Real-time Notifications */}
      <RealTimeNotifications
        isAdmin={true}
        onAppointmentUpdate={(appointmentId, updates) => {}}
      />
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeMenuItem={activeMenuItem}
        onMenuItemClick={setActiveMenuItem}
      />
      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        <div className='px-4 sm:px-6 lg:px-8 py-8'>
          {/* Success/Error Messages */}
          {successMessage && (
            <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <i className='ri-check-line text-green-600 text-lg mr-3'></i>
                <p className='text-green-800 font-medium'>{successMessage}</p>
              </div>
            </div>
          )}
          {errorMessage && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <i className='ri-error-warning-line text-red-600 text-lg mr-3'></i>
                <p className='text-red-800 font-medium'>{errorMessage}</p>
              </div>
            </div>
          )}
          {/* Page Header */}
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Randevu Talepleri
              </h2>
              <p className='text-gray-600'>
                Gelen randevu taleplerini inceleyin, onaylayın ve yönetin
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap'>
                <i className='ri-calendar-add-line'></i>
                Randevu Oluştur
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className='mb-8'>
            <div className='border-b border-gray-200'>
              <nav className='-mb-px flex space-x-8'>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'appointments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='ri-calendar-line mr-2'></i>
                  Randevu Talepleri ({appointments.length})
                </button>
                <button
                  onClick={() => setActiveTab('revise-requests')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'revise-requests'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='ri-time-line mr-2'></i>
                  Revize Talepleri ({reviseRequests.length})
                </button>
              </nav>
            </div>
          </div>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>
                    Toplam Talep
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {appointments.length}
                  </p>
                </div>
                <div className='bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-calendar-line text-white text-xl'></i>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>Beklemede</p>
                  <p className='text-2xl font-bold text-yellow-600'>
                    {appointments.filter(a => a.status === 'Beklemede').length}
                  </p>
                </div>
                <div className='bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-time-line text-white text-xl'></i>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>Onaylandı</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {appointments.filter(a => a.status === 'Onaylandı').length}
                  </p>
                </div>
                <div className='bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-check-line text-white text-xl'></i>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>
                    Tamamlandı
                  </p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {appointments.filter(a => a.status === 'Tamamlandı').length}
                  </p>
                </div>
                <div className='bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center'>
                  <i className='ri-checkbox-circle-line text-white text-xl'></i>
                </div>
              </div>
            </div>
          </div>
          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Filtreler</h3>
              <button
                onClick={clearFilters}
                className='text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer'
              >
                Filtreleri Temizle
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Arama
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                    <i className='ri-search-line text-gray-400 text-sm'></i>
                  </div>
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder='Firma, kişi veya konu ara...'
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                >
                  <option value=''>Tüm Durumlar</option>
                  <option value='Beklemede'>Beklemede</option>
                  <option value='Onaylandı'>Onaylandı</option>
                  <option value='Reddedildi'>Reddedildi</option>
                  <option value='Tamamlandı'>Tamamlandı</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Öncelik
                </label>
                <select
                  value={selectedPriority}
                  onChange={e => setSelectedPriority(e.target.value)}
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                >
                  <option value=''>Tüm Öncelikler</option>
                  <option value='Yüksek'>Yüksek</option>
                  <option value='Orta'>Orta</option>
                  <option value='Düşük'>Düşük</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Görüşme Türü
                </label>
                <select
                  value={selectedMeetingType}
                  onChange={e => setSelectedMeetingType(e.target.value)}
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                >
                  <option value=''>Tüm Türler</option>
                  <option value='Online'>Online</option>
                  <option value='Yüz Yüze'>Yüz Yüze</option>
                  <option value='Telefon'>Telefon</option>
                </select>
              </div>
            </div>
            <div className='text-sm text-gray-600'>
              <span className='font-medium'>{filteredAppointments.length}</span>{' '}
              randevu talebi bulundu
            </div>
          </div>
          {/* Content based on active tab */}
          {activeTab === 'appointments' ? (
            // Appointments Tab Content with Status Tabs
            <>
              {/* Status Tabs */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 mb-6'>
                <div className='border-b border-gray-200'>
                  <nav className='-mb-px flex space-x-8 px-6'>
                    {(() => {
                      // Durum filtresi hariç diğer filtreleri uygula
                      const appointmentsWithoutStatusFilter =
                        appointments.filter(appointment => {
                          const matchesSearch =
                            !searchQuery ||
                            appointment.companyName
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            appointment.contactPerson
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            appointment.subject
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            appointment.description
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());
                          const matchesPriority =
                            !selectedPriority ||
                            appointment.priority === selectedPriority;
                          const matchesMeetingType =
                            !selectedMeetingType ||
                            appointment.meetingType === selectedMeetingType;
                          return (
                            matchesSearch &&
                            matchesPriority &&
                            matchesMeetingType
                          );
                        });
                      return [
                        {
                          status: 'all',
                          label: 'Tümü',
                          count: appointmentsWithoutStatusFilter.length,
                          color: 'text-gray-600 border-gray-300',
                        },
                        {
                          status: 'Beklemede',
                          label: 'Beklemede',
                          count: appointmentsWithoutStatusFilter.filter(
                            a => a.status === 'Beklemede'
                          ).length,
                          color: 'text-yellow-600 border-yellow-500',
                        },
                        {
                          status: 'Onaylandı',
                          label: 'Onaylandı',
                          count: appointmentsWithoutStatusFilter.filter(
                            a => a.status === 'Onaylandı'
                          ).length,
                          color: 'text-green-600 border-green-500',
                        },
                        {
                          status: 'Reddedildi',
                          label: 'Reddedildi',
                          count: appointmentsWithoutStatusFilter.filter(
                            a => a.status === 'Reddedildi'
                          ).length,
                          color: 'text-red-600 border-red-500',
                        },
                        {
                          status: 'Tamamlandı',
                          label: 'Tamamlandı',
                          count: appointmentsWithoutStatusFilter.filter(
                            a => a.status === 'Tamamlandı'
                          ).length,
                          color: 'text-blue-600 border-blue-500',
                        },
                      ].map(tab => (
                        <button
                          key={tab.status}
                          onClick={() =>
                            setSelectedStatus(
                              tab.status === 'all' ? '' : tab.status
                            )
                          }
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            selectedStatus === tab.status ||
                            (selectedStatus === '' && tab.status === 'all')
                              ? tab.color
                                  .replace('text-', 'text-')
                                  .replace('border-', 'border-')
                              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ));
                    })()}
                  </nav>
                </div>
              </div>
              {/* Appointments List */}
              {loading ? (
                <div className='text-center py-12'>
                  <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Randevular Yükleniyor
                  </h3>
                  <p className='text-gray-500'>
                    Randevu verileri hazırlanıyor...
                  </p>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className='space-y-4'>
                  {filteredAppointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onUpdateStatus={handleUpdateStatus}
                      onAssignConsultant={handleAssignConsultant}
                      onViewDetails={handleViewDetails}
                      onAddNote={handleAddNote}
                      onOpenNotes={handleOpenNotes}
                      updatingStatus={updatingStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-calendar-check-line text-2xl text-gray-400'></i>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Randevu talebi bulunamadı
                  </h3>
                  <p className='text-gray-500 mb-4'>
                    Filtrelere uygun randevu talebi bulunmuyor
                  </p>
                  <button
                    onClick={clearFilters}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap'
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </>
          ) : (
            // Revise Requests Tab Content
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Revize Talepleri
                </h3>
                <p className='text-sm text-gray-600 mt-1'>
                  Gelen randevu revize taleplerini inceleyin ve onaylayın
                </p>
              </div>
              {loading ? (
                <div className='text-center py-12'>
                  <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4'></div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Revize Talepleri Yükleniyor
                  </h3>
                  <p className='text-gray-500'>Veriler hazırlanıyor...</p>
                </div>
              ) : reviseRequests.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Firma
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Randevu
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Mevcut
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Talep Edilen
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Sebep
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Durum
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {reviseRequests.map(request => (
                        <tr key={request.id} className='hover:bg-gray-50'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                              {request.companies?.name || 'Bilinmeyen Firma'}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm text-gray-900'>
                              {request.appointments?.title ||
                                request.appointments?.description ||
                                'Başlıksız'}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {request.users?.full_name || 'Danışman'}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm text-gray-900'>
                              {request.original_date}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {request.original_time}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm text-gray-900'>
                              {request.requested_date}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {request.requested_time}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm text-gray-900 capitalize'>
                              {request.reason?.replace('_', ' ')}
                            </div>
                            {request.additional_notes && (
                              <div
                                className='text-sm text-gray-500 truncate max-w-32'
                                title={request.additional_notes}
                              >
                                {request.additional_notes}
                              </div>
                            )}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                request.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {request.status === 'pending'
                                ? 'Beklemede'
                                : request.status === 'approved'
                                  ? 'Onaylandı'
                                  : 'Reddedildi'}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {request.status === 'pending' ? (
                              <div className='flex items-center gap-2'>
                                <button
                                  onClick={() =>
                                    handleReviseRequestAction(
                                      request.id,
                                      'approved'
                                    )
                                  }
                                  disabled={updatingStatus === request.id}
                                  className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50'
                                >
                                  {updatingStatus === request.id
                                    ? '...'
                                    : 'Onayla'}
                                </button>
                                <button
                                  onClick={() =>
                                    handleReviseRequestAction(
                                      request.id,
                                      'rejected'
                                    )
                                  }
                                  disabled={updatingStatus === request.id}
                                  className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50'
                                >
                                  {updatingStatus === request.id
                                    ? '...'
                                    : 'Reddet'}
                                </button>
                              </div>
                            ) : (
                              <span className='text-gray-400'>İşlendi</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-time-line text-2xl text-orange-600'></i>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Revize talebi bulunamadı
                  </h3>
                  <p className='text-gray-500'>
                    Henüz randevu revize talebi bulunmamaktadır
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAppointment(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          onAssignConsultant={handleAssignConsultant}
          onAddNote={handleAddNote}
        />
      )}
      {/* Notes Modal */}
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setSelectedAppointmentForNotes(null);
        }}
        appointmentId={selectedAppointmentForNotes?.id || ''}
        userEmail='admin@ihracatakademi.com'
        isAdmin={true}
      />
    </div>
  );
}
