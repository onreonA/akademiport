'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import StatsCard from '@/components/ui/StatsCard';
import StatusBadge from '@/components/ui/StatusBadge';
interface JobPosting {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: 'Tam Zamanlı' | 'Yarı Zamanlı' | 'Proje Bazlı' | 'Staj';
  level: 'Giriş' | 'Orta' | 'Kıdemli' | 'Yönetici';
  salary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: 'Aktif' | 'Pasif' | 'Dolu';
  postedDate: string;
  applicationDeadline: string;
  applicationsCount: number;
  viewsCount: number;
}
interface JobApplication {
  id: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  appliedDate: string;
  status: 'Yeni' | 'İnceleniyor' | 'Mülakat' | 'Kabul' | 'Red';
  resumeUrl?: string;
  coverLetter?: string;
  notes?: string;
}
interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  education: string;
  type: 'Danışman' | 'Stajyer' | 'Firma Personel';
  appliedDate: string;
  experience?: string;
  interests?: string;
  position?: string;
  expertise?: string[];
  cvFileName: string;
  status:
    | 'Bekliyor'
    | 'Admin Onayladı'
    | 'Danışman Onayladı'
    | 'Firma Görüyor'
    | 'İşe Alındı'
    | 'Reddedildi';
  statusHistory: StatusUpdate[];
  notes?: string;
}
interface StatusUpdate {
  id: string;
  status: string;
  updatedBy: string;
  updatedAt: string;
  notes?: string;
}
const MenuItem = ({
  icon,
  title,
  isActive,
  onClick,
  hasSubMenu,
  isExpanded,
  href,
  sidebarCollapsed,
}: {
  icon: string;
  title: string;
  isActive?: boolean;
  onClick: () => void;
  hasSubMenu?: boolean;
  isExpanded?: boolean;
  href?: string;
  sidebarCollapsed?: boolean;
}) => {
  const content = (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-blue-100 text-blue-900 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
        <i className={`${icon} text-lg`}></i>
      </div>
      {!sidebarCollapsed && <span className='ml-3 truncate'>{title}</span>}
      {hasSubMenu && !sidebarCollapsed && (
        <div className='ml-auto w-4 h-4 flex items-center justify-center'>
          <i
            className={`ri-arrow-right-s-line text-sm transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          ></i>
        </div>
      )}
    </button>
  );
  if (href && !hasSubMenu) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};
const SubMenuItem = ({
  title,
  isActive,
  onClick,
  href,
}: {
  title: string;
  isActive?: boolean;
  onClick: () => void;
  href?: string;
}) => {
  const content = (
    <button
      onClick={onClick}
      className={`w-full flex items-center pl-9 pr-3 py-2 text-sm rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
    >
      <div className='w-2 h-2 bg-current rounded-full mr-3 opacity-60'></div>
      {title}
    </button>
  );
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};
const JobPostingCard = ({
  job,
  onEdit,
  onDelete,
  onViewApplications,
  onChangeStatus,
}: {
  job: JobPosting;
  onEdit: (job: JobPosting) => void;
  onDelete: (id: string) => void;
  onViewApplications: (job: JobPosting) => void;
  onChangeStatus: (id: string, status: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800';
      case 'Pasif':
        return 'bg-gray-100 text-gray-800';
      case 'Dolu':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Tam Zamanlı':
        return 'bg-purple-100 text-purple-800';
      case 'Yarı Zamanlı':
        return 'bg-orange-100 text-orange-800';
      case 'Proje Bazlı':
        return 'bg-blue-100 text-blue-800';
      case 'Staj':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
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
          <div className='absolute right-0 top-10 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-10 min-w-44'>
            <button
              onClick={() => {
                onViewApplications(job);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-user-line text-blue-600'></i>
              Başvuruları Gör ({job.applicationsCount})
            </button>
            <button
              onClick={() => {
                onEdit(job);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-edit-line text-green-600'></i>
              Düzenle
            </button>
            <button
              onClick={() => {
                onChangeStatus(
                  job.id,
                  job.status === 'Aktif' ? 'Pasif' : 'Aktif'
                );
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i
                className={`ri-${job.status === 'Aktif' ? 'pause' : 'play'}-line text-orange-600`}
              ></i>
              {job.status === 'Aktif' ? 'Pasif Yap' : 'Aktif Yap'}
            </button>
            <button
              onClick={() => {
                onDelete(job.id);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-delete-bin-line text-red-600'></i>
              Sil
            </button>
          </div>
        )}
      </div>
      {/* Job Info */}
      <div className='pr-8'>
        <div className='mb-4'>
          <div className='flex items-start justify-between mb-2'>
            <h3 className='text-lg font-semibold text-gray-900'>{job.title}</h3>
            <div className='flex flex-col gap-1'>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}
              >
                {job.status}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}
              >
                {job.type}
              </span>
            </div>
          </div>
          <p className='text-sm text-gray-600 mb-1'>
            {job.company} • {job.department}
          </p>
          <p className='text-sm text-gray-500'>{job.location}</p>
        </div>
        <div className='space-y-2 mb-4'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-briefcase-line text-blue-500'></i>
            <span>{job.level} seviye</span>
          </div>
          {job.salary && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <i className='ri-money-dollar-circle-line text-green-500'></i>
              <span>{job.salary}</span>
            </div>
          )}
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-calendar-line text-orange-500'></i>
            <span suppressHydrationWarning={true}>
              Son başvuru:{' '}
              {new Date(job.applicationDeadline).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>
        <div className='mb-4'>
          <p className='text-sm text-gray-700 line-clamp-2'>
            {job.description}
          </p>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-4 text-gray-500'>
            <div className='flex items-center gap-1'>
              <i className='ri-user-line'></i>
              <span>{job.applicationsCount} başvuru</span>
            </div>
            <div className='flex items-center gap-1'>
              <i className='ri-eye-line'></i>
              <span>{job.viewsCount} görüntüleme</span>
            </div>
          </div>
          <div
            className='text-xs text-gray-500'
            suppressHydrationWarning={true}
          >
            {new Date(job.postedDate).toLocaleDateString('tr-TR')}
          </div>
        </div>
      </div>
    </div>
  );
};
const ApplicationCard = ({
  application,
  onViewDetails,
  onUpdateStatus,
  onDelete,
  onDownloadCV,
}: {
  application: Application;
  onViewDetails: (application: Application) => void;
  onUpdateStatus: (applicationId: string) => void;
  onDelete: (id: string) => void;
  onDownloadCV: (fileName: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Bekliyor':
        return 'bg-yellow-100 text-yellow-800';
      case 'Admin Onayladı':
        return 'bg-blue-100 text-blue-800';
      case 'Danışman Onayladı':
        return 'bg-purple-100 text-purple-800';
      case 'Firma Görüyor':
        return 'bg-orange-100 text-orange-800';
      case 'İşe Alındı':
        return 'bg-green-100 text-green-800';
      case 'Reddedildi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Danışman':
        return 'bg-blue-100 text-blue-800';
      case 'Stajyer':
        return 'bg-orange-100 text-orange-800';
      case 'Firma Personel':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
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
          <div className='absolute right-0 top-10 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-10 min-w-44'>
            <button
              onClick={() => {
                onViewDetails(application);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-eye-line text-blue-600'></i>
              Detayları Gör
            </button>
            <button
              onClick={() => {
                onUpdateStatus(application.id);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-edit-line text-green-600'></i>
              Durumu Güncelle
            </button>
            <button
              onClick={() => {
                onDownloadCV(application.cvFileName);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-download-line text-purple-600'></i>
              CV İndir
            </button>
            <button
              onClick={() => {
                onDelete(application.id);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-delete-bin-line text-red-600'></i>
              Başvuruyu Sil
            </button>
          </div>
        )}
      </div>
      {/* Application Info */}
      <div className='pr-8'>
        <div className='mb-4'>
          <div className='flex items-start justify-between mb-2'>
            <h3 className='text-lg font-semibold text-gray-900'>
              {application.name}
            </h3>
            <div className='flex flex-col gap-1'>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
              >
                {application.status}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(application.type)}`}
              >
                {application.type}
              </span>
            </div>
          </div>
        </div>
        <div className='space-y-2 mb-4'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-mail-line text-blue-500'></i>
            <span>{application.email}</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-phone-line text-green-500'></i>
            <span>{application.phone}</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-map-pin-line text-orange-500'></i>
            <span>{application.city}</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-graduation-cap-line text-purple-500'></i>
            <span>{application.education}</span>
          </div>
        </div>
        {/* Experience/Interest/Position based on type */}
        {application.experience && (
          <div className='mb-4'>
            <p className='text-sm font-medium text-gray-700 mb-1'>Deneyim:</p>
            <p className='text-sm text-gray-600 line-clamp-2'>
              {application.experience}
            </p>
          </div>
        )}
        {application.interests && (
          <div className='mb-4'>
            <p className='text-sm font-medium text-gray-700 mb-1'>
              İlgi Alanı:
            </p>
            <p className='text-sm text-gray-600'>{application.interests}</p>
          </div>
        )}
        {application.position && (
          <div className='mb-4'>
            <p className='text-sm font-medium text-gray-700 mb-1'>Pozisyon:</p>
            <p className='text-sm text-gray-600'>{application.position}</p>
          </div>
        )}
        {/* Expertise for consultants */}
        {application.expertise && application.expertise.length > 0 && (
          <div className='mb-4'>
            <p className='text-sm font-medium text-gray-700 mb-2'>
              Uzmanlık Alanları:
            </p>
            <div className='flex flex-wrap gap-1'>
              {application.expertise.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className='px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs'
                >
                  {skill}
                </span>
              ))}
              {application.expertise.length > 3 && (
                <span className='text-xs text-gray-500'>
                  +{application.expertise.length - 3} diğer
                </span>
              )}
            </div>
          </div>
        )}
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2 text-gray-500'>
            <i className='ri-calendar-line'></i>
            <span suppressHydrationWarning={true}>
              {new Date(application.appliedDate).toLocaleDateString('tr-TR')}
            </span>
          </div>
          <button
            onClick={() => onDownloadCV(application.cvFileName)}
            className='text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer'
          >
            CV İndir
          </button>
        </div>
      </div>
    </div>
  );
};
const JobApplicationModal = ({
  job,
  applications,
  onClose,
  onUpdateApplicationStatus,
}: {
  job: JobPosting;
  applications: JobApplication[];
  onClose: () => void;
  onUpdateApplicationStatus: (applicationId: string, status: string) => void;
}) => {
  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'Yeni':
        return 'bg-blue-100 text-blue-800';
      case 'İnceleniyor':
        return 'bg-yellow-100 text-yellow-800';
      case 'Mülakat':
        return 'bg-purple-100 text-purple-800';
      case 'Kabul':
        return 'bg-green-100 text-green-800';
      case 'Red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${job.title} - Başvurular`}
      subtitle={`${applications.length} başvuru`}
      size="xl"
    >
      {applications.length > 0 ? (
        <div className='space-y-4'>
          {applications.map(application => (
            <div
              key={application.id}
              className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h4 className='font-medium text-gray-900'>
                      {application.applicantName}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}
                    >
                      {application.status}
                    </span>
                  </div>
                  <div className='space-y-1 text-sm text-gray-600 mb-3'>
                    <div className='flex items-center gap-2'>
                      <i className='ri-mail-line'></i>
                      <span>{application.applicantEmail}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <i className='ri-phone-line'></i>
                      <span>{application.applicantPhone}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <i className='ri-calendar-line'></i>
                      <span suppressHydrationWarning={true}>
                        Başvuru:{' '}
                        {new Date(
                          application.appliedDate
                        ).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  {application.coverLetter && (
                    <div className='mb-3'>
                      <p className='text-sm font-medium text-gray-700 mb-1'>
                        Ön Yazı:
                      </p>
                      <p className='text-sm text-gray-600 line-clamp-2'>
                        {application.coverLetter}
                      </p>
                    </div>
                  )}
                </div>
                <div className='flex flex-col gap-2 ml-4'>
                  <select
                    value={application.status}
                    onChange={e =>
                      onUpdateApplicationStatus(
                        application.id,
                        e.target.value
                      )
                    }
                    className='px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='Yeni'>Yeni</option>
                    <option value='İnceleniyor'>İnceleniyor</option>
                    <option value='Mülakat'>Mülakat</option>
                    <option value='Kabul'>Kabul</option>
                    <option value='Red'>Red</option>
                  </select>
                  {application.resumeUrl && (
                    <button className='text-xs text-blue-600 hover:text-blue-800 cursor-pointer'>
                      CV İndir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          type='no-applications'
          size='md'
          description='Bu pozisyon için henüz başvuru bulunmuyor'
        />
      )}
    </Modal>
  );
};
const ApplicationDetailModal = ({
  application,
  onClose,
  onUpdateStatus,
}: {
  application: Application;
  onClose: () => void;
  onUpdateStatus: (
    applicationId: string,
    status: string,
    notes?: string
  ) => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState(application.status);
  const [statusNotes, setStatusNotes] = useState('');
  const statuses = [
    'Bekliyor',
    'Admin Onayladı',
    'Danışman Onayladı',
    'Firma Görüyor',
    'İşe Alındı',
    'Reddedildi',
  ];
  const handleStatusUpdate = () => {
    onUpdateStatus(application.id, selectedStatus, statusNotes);
    onClose();
  };
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${application.name} - Başvuru Detayları`}
      subtitle={`${application.type} Başvurusu`}
      size="xl"
    >
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Sol Sütun - Kişisel Bilgiler */}
          <div className='lg:col-span-2 space-y-6'>
            <div>
              <h4 className='text-lg font-medium text-gray-900 mb-4'>
                Kişisel Bilgiler
              </h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Ad Soyad
                  </label>
                  <p className='text-sm text-gray-900'>{application.name}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    E-posta
                  </label>
                  <p className='text-sm text-gray-900'>{application.email}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Telefon
                  </label>
                  <p className='text-sm text-gray-900'>{application.phone}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Şehir
                  </label>
                  <p className='text-sm text-gray-900'>{application.city}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Eğitim Durumu
                  </label>
                  <p className='text-sm text-gray-900'>
                    {application.education}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Başvuru Tarihi
                  </label>
                  <p
                    className='text-sm text-gray-900'
                    suppressHydrationWarning={true}
                  >
                    {new Date(application.appliedDate).toLocaleDateString(
                      'tr-TR'
                    )}
                  </p>
                </div>
              </div>
            </div>
            {/* Pozisyon/Deneyim/İlgi Alanı */}
            {application.experience && (
              <div>
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  Deneyim Açıklaması
                </h4>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='text-sm text-gray-700'>
                    {application.experience}
                  </p>
                </div>
              </div>
            )}
            {application.interests && (
              <div>
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  İlgi Alanı
                </h4>
                <p className='text-sm text-gray-700'>{application.interests}</p>
              </div>
            )}
            {application.position && (
              <div>
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  Hedeflenen Pozisyon
                </h4>
                <p className='text-sm text-gray-700'>{application.position}</p>
              </div>
            )}
            {/* Uzmanlık Alanları */}
            {application.expertise && application.expertise.length > 0 && (
              <div>
                <h4 className='text-lg font-medium text-gray-900 mb-2'>
                  Uzmanlık Alanları
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {application.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Durum Geçmişi */}
            <div>
              <h4 className='text-lg font-medium text-gray-900 mb-4'>
                Durum Geçmişi
              </h4>
              <div className='space-y-3'>
                {application.statusHistory.map(update => (
                  <div
                    key={update.id}
                    className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-medium text-sm text-gray-900'>
                          {update.status}
                        </span>
                        <span className='text-xs text-gray-500'>•</span>
                        <span className='text-xs text-gray-500'>
                          {update.updatedBy}
                        </span>
                        <span className='text-xs text-gray-500'>•</span>
                        <span
                          className='text-xs text-gray-500'
                          suppressHydrationWarning={true}
                        >
                          {new Date(update.updatedAt).toLocaleDateString(
                            'tr-TR'
                          )}
                        </span>
                      </div>
                      {update.notes && (
                        <p className='text-sm text-gray-600'>{update.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Sağ Sütun - Durum Yönetimi */}
          <div className='space-y-6'>
            <div>
              <h4 className='text-lg font-medium text-gray-900 mb-4'>
                Durum Yönetimi
              </h4>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Mevcut Durum
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${application.status === 'Bekliyor' ? 'bg-yellow-100 text-yellow-800' : application.status === 'Admin Onayladı' ? 'bg-blue-100 text-blue-800' : application.status === 'Danışman Onayladı' ? 'bg-purple-100 text-purple-800' : application.status === 'Firma Görüyor' ? 'bg-orange-100 text-orange-800' : application.status === 'İşe Alındı' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {application.status}
                  </span>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Yeni Durum
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Durum Notu (İsteğe Bağlı)
                  </label>
                  <textarea
                    rows={3}
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                    placeholder='Durum değişikliği hakkında not...'
                  />
                </div>
                <Button
                  onClick={handleStatusUpdate}
                  variant="primary"
                  className="w-full"
                >
                  Durumu Güncelle
                </Button>
              </div>
            </div>
            <div>
              <h4 className='text-lg font-medium text-gray-900 mb-4'>
                CV Dosyası
              </h4>
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-3'>
                  <i className='ri-file-pdf-line text-red-500 text-xl'></i>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      {application.cvFileName}
                    </p>
                    <p className='text-xs text-gray-500'>PDF Dosyası</p>
                  </div>
                  <Button variant="primary" size="sm">
                    İndir
                  </Button>
                </div>
              </div>
            </div>
            {/* Admin Notları */}
            <div>
              <h4 className='text-lg font-medium text-gray-900 mb-4'>
                Admin Notları
              </h4>
              <textarea
                rows={4}
                defaultValue={application.notes}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                placeholder='Bu başvuru hakkında notlarınız...'
              />
              <Button variant="secondary" size="sm" className="mt-2">
                Notu Kaydet
              </Button>
            </div>
          </div>
        </div>
    </Modal>
  );
};
export default function CareerPortal() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('career');
  const [educationExpanded, setEducationExpanded] = useState(false);
  const [projeExpanded, setProjeExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showApplicationDetailModal, setShowApplicationDetailModal] =
    useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  // Filter states for jobs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  // Filter states for applications
  const [applicationSearchQuery, setApplicationSearchQuery] = useState('');
  const [applicationSelectedStatus, setApplicationSelectedStatus] =
    useState('');
  const [applicationSelectedType, setApplicationSelectedType] = useState('');
  const [applicationSelectedEducation, setApplicationSelectedEducation] =
    useState('');
  const [applicationSelectedCity, setApplicationSelectedCity] = useState('');
  const [applicationDateRange, setApplicationDateRange] = useState({
    start: '',
    end: '',
  });
  const [applicationActiveTab, setApplicationActiveTab] = useState('all');
  const notifications = [
    {
      id: 1,
      type: 'info',
      message: '4 yeni iş başvurusu alındı',
      time: '2 dk önce',
      unread: true,
    },
    {
      id: 2,
      type: 'warning',
      message: 'Sistem bakımı planlandı',
      time: '15 dk önce',
      unread: true,
    },
    {
      id: 3,
      type: 'success',
      message: 'Aylık rapor hazırlandı',
      time: '1 saat önce',
      unread: false,
    },
    {
      id: 4,
      type: 'error',
      message: 'API bağlantı hatası düzeltildi',
      time: '3 saat önce',
      unread: false,
    },
  ];
  const unreadNotifications = notifications.filter(n => n.unread).length;
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([
    {
      id: '1',
      jobId: '1',
      applicantName: 'Ahmet Yılmaz',
      applicantEmail: 'ahmet@example.com',
      applicantPhone: '+90 532 123 4567',
      appliedDate: '2024-02-20T10:30:00Z',
      status: 'Yeni',
      coverLetter:
        'İhracat alanındaki deneyimim ve uluslararası ticaret bilgimle bu pozisyona uygun olduğumu düşünüyorum.',
      resumeUrl: '/resumes/ahmet-yilmaz-cv.pdf',
    },
    {
      id: '2',
      jobId: '1',
      applicantName: 'Ayşe Demir',
      applicantEmail: 'ayse@example.com',
      applicantPhone: '+90 533 234 5678',
      appliedDate: '2024-02-19T14:15:00Z',
      status: 'İnceleniyor',
      coverLetter:
        '5 yıllık ihracat deneyimim ve İngilizce yeterliliğim ile takıma değer katmaya hazırım.',
      resumeUrl: '/resumes/ayse-demir-cv.pdf',
    },
    {
      id: '3',
      jobId: '2',
      applicantName: 'Mehmet Özkan',
      applicantEmail: 'mehmet@example.com',
      applicantPhone: '+90 534 345 6789',
      appliedDate: '2024-02-18T16:20:00Z',
      status: 'Mülakat',
      coverLetter:
        'Dijital pazarlama alanındaki sertifikalarım ve proje deneyimim ile bu pozisyon için ideal adayım.',
      resumeUrl: '/resumes/mehmet-ozkan-cv.pdf',
    },
  ]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // Gerçek veri yükleme
  useEffect(() => {
    fetchApplications();
    fetchJobPostings();
  }, []);
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/career/applications');
      const result = await response.json();
      if (result.success) {
        // API verilerini frontend formatına dönüştür
        const formattedApplications = result.data.map((app: any) => ({
          id: app.id,
          name: app.name,
          email: app.email,
          phone: app.phone,
          city: app.city || '',
          education: app.education || '',
          type:
            app.application_type === 'consultant'
              ? 'Danışman'
              : app.application_type === 'intern'
                ? 'Stajyer'
                : 'Firma Personel',
          appliedDate: app.created_at,
          experience: app.experience || '',
          interests: app.interests || '',
          position: app.position || '',
          expertise: app.expertise || [],
          cvFileName: app.cv_file_name || '',
          status:
            app.status === 'pending'
              ? 'Bekliyor'
              : app.status === 'admin_approved'
                ? 'Admin Onayladı'
                : app.status === 'consultant_approved'
                  ? 'Danışman Onayladı'
                  : app.status === 'in_pool'
                    ? 'Firma Görüyor'
                    : app.status === 'hired'
                      ? 'İşe Alındı'
                      : 'Reddedildi',
          statusHistory:
            app.application_status_history?.map((history: any) => ({
              id: history.id,
              status: history.new_status,
              updatedBy: history.updated_by || 'Sistem',
              updatedAt: history.created_at,
              notes: history.notes,
            })) || [],
        }));
        setApplications(formattedApplications);
      } else {
        setError('Başvurular yüklenemedi');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobPostings = async () => {
    try {
      const response = await fetch('/api/career/jobs');
      const result = await response.json();
      if (result.success && result.data) {
        // API verilerini frontend formatına dönüştür
        const formattedJobs = result.data.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          department: job.department,
          location: job.location,
          type: job.type,
          level: job.level,
          salary: job.salary,
          description: job.description,
          requirements: job.requirements || [],
          benefits: job.benefits || [],
          status: job.status,
          postedDate: job.created_at,
          applicationDeadline: job.application_deadline,
          applicationsCount: job.applications_count || 0,
          viewsCount: job.views_count || 0,
        }));
        setJobPostings(formattedJobs);
      } else {
        // API'den veri gelmezse boş array kullan
        setJobPostings([]);
      }
    } catch (error) {
      console.error('İş ilanları yüklenirken hata:', error);
      setJobPostings([]);
    }
  };
  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string,
    notes?: string
  ) => {
    try {
      // Frontend durum değerlerini API formatına dönüştür
      const apiStatus =
        newStatus === 'Bekliyor'
          ? 'pending'
          : newStatus === 'Admin Onayladı'
            ? 'admin_approved'
            : newStatus === 'Danışman Onayladı'
              ? 'consultant_approved'
              : newStatus === 'Firma Görüyor'
                ? 'in_pool'
                : newStatus === 'İşe Alındı'
                  ? 'hired'
                  : newStatus === 'Reddedildi'
                    ? 'rejected'
                    : newStatus;
      const response = await fetch(
        `/api/career/applications/${applicationId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_status: apiStatus,
            notes: notes,
            updated_by: 'Admin User', // Gerçek uygulamada kullanıcı ID'si kullanılacak
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        // Başvuru listesini yenile
        fetchApplications();
        return true;
      } else {
        setError('Durum güncellenemedi');
        return false;
      }
    } catch (error) {
      setError('Sunucu hatası');
      return false;
    }
  };
  // Filter jobs
  const filteredJobs = jobPostings.filter(job => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || job.status === selectedStatus;
    const matchesType = !selectedType || job.type === selectedType;
    const matchesLevel = !selectedLevel || job.level === selectedLevel;
    return matchesSearch && matchesStatus && matchesType && matchesLevel;
  });
  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      !applicationSearchQuery ||
      app.name.toLowerCase().includes(applicationSearchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(applicationSearchQuery.toLowerCase());
    const matchesStatus =
      !applicationSelectedStatus || app.status === applicationSelectedStatus;
    const matchesType =
      !applicationSelectedType || app.type === applicationSelectedType;
    const matchesEducation =
      !applicationSelectedEducation ||
      app.education === applicationSelectedEducation;
    const matchesCity =
      !applicationSelectedCity || app.city === applicationSelectedCity;
    let matchesDateRange = true;
    if (applicationDateRange.start && applicationDateRange.end) {
      const appDate = new Date(app.appliedDate);
      const startDate = new Date(applicationDateRange.start);
      const endDate = new Date(applicationDateRange.end);
      matchesDateRange = appDate >= startDate && appDate <= endDate;
    }
    const matchesTab =
      applicationActiveTab === 'all' ||
      (applicationActiveTab === 'consultant' && app.type === 'Danışman') ||
      (applicationActiveTab === 'intern' && app.type === 'Stajyer') ||
      (applicationActiveTab === 'hr' && app.type === 'Firma Personel') ||
      (applicationActiveTab === 'hired' && app.status === 'İşe Alındı');
    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesEducation &&
      matchesCity &&
      matchesDateRange &&
      matchesTab
    );
  });
  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setShowJobModal(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('Bu iş ilanını silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/career/jobs/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setJobPostings(jobPostings.filter(job => job.id !== id));
          setSuccessMessage('İş ilanı başarıyla silindi');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setError('İş ilanı silinirken hata oluştu');
        }
      } catch (error) {
        setError('Sunucu hatası');
      }
    }
  };

  const handleViewApplications = (job: JobPosting) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/career/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setJobPostings(
          jobPostings.map(job =>
            job.id === id ? { ...job, status: status as any } : job
          )
        );
        setSuccessMessage('İş ilanı durumu güncellendi');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('İş ilanı durumu güncellenirken hata oluştu');
      }
    } catch (error) {
      setError('Sunucu hatası');
    }
  };
  const handleUpdateApplicationStatus = (
    applicationId: string,
    status: string
  ) => {
    setJobApplications(
      jobApplications.map(app =>
        app.id === applicationId ? { ...app, status: status as any } : app
      )
    );
  };
  const getJobApplications = (jobId: string) => {
    return jobApplications.filter(app => app.jobId === jobId);
  };
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedType('');
    setSelectedLevel('');
  };
  const clearApplicationFilters = () => {
    setApplicationSearchQuery('');
    setApplicationSelectedStatus('');
    setApplicationSelectedType('');
    setApplicationSelectedEducation('');
    setApplicationSelectedCity('');
    setApplicationDateRange({ start: '', end: '' });
  };
  const handleViewApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationDetailModal(true);
  };
  const handleUpdateApplicationStatusDetails = async (
    applicationId: string,
    newStatus?: string,
    notes?: string
  ) => {
    if (newStatus) {
      // API ile durum güncelleme
      const success = await updateApplicationStatus(
        applicationId,
        newStatus,
        notes
      );
      if (success) {
        // Başarılı güncelleme sonrası modal'ı kapat
        setShowApplicationDetailModal(false);
        setSelectedApplication(null);
      }
    } else {
      // Just open modal for status update
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        handleViewApplicationDetails(application);
      }
    }
  };
  const handleDeleteApplication = (id: string) => {
    const application = applications.find(app => app.id === id);
    if (
      confirm(
        `"${application?.name}" başvurusunu silmek istediğinizden emin misiniz?`
      )
    ) {
      setApplications(applications.filter(app => app.id !== id));
    }
  };
  const handleDownloadCV = (fileName: string) => {};
  const exportToExcel = () => {
    if (activeTab === 'jobs') {
    } else {
    }
  };
  const getApplicationTabCounts = () => {
    return {
      all: applications.length,
      consultant: applications.filter(app => app.type === 'Danışman').length,
      intern: applications.filter(app => app.type === 'Stajyer').length,
      hr: applications.filter(app => app.type === 'Firma Personel').length,
      hired: applications.filter(app => app.status === 'İşe Alındı').length,
    };
  };
  const applicationCounts = getApplicationTabCounts();
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Modern Header - Full Width */}
      <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            {/* Left Section */}
            <div className='flex items-center gap-6'>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer'
              >
                <i
                  className={`ri-menu-line text-lg text-gray-600 transition-transform duration-200`}
                ></i>
              </button>
              <Link href='/' className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-global-line text-white text-lg w-5 h-5 flex items-center justify-center'></i>
                </div>
                <div className='flex flex-col'>
                  <span className="font-[\'Pacifico\'] text-xl text-blue-900 leading-tight">
                    İhracat Akademi
                  </span>
                  <span className='text-xs text-gray-500 font-medium'>
                    Admin Panel
                  </span>
                </div>
              </Link>
              {/* Breadcrumb Navigation */}
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Ana Panel
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>
                  Kariyer Portalı
                </span>
              </nav>
            </div>
            {/* Right Section - Modern Actions */}
            <div className='flex items-center gap-3'>
              {/* Quick Search */}
              <div className='hidden lg:flex relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                  <i className='ri-search-line text-gray-400 text-sm'></i>
                </div>
                <input
                  type='text'
                  placeholder='Hızlı arama...'
                  className='w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
              {/* Quick Actions */}
              <div className='flex items-center gap-2'>
                <Link href='/admin/firma-yonetimi'>
                  <button
                    className='w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer'
                    title='Yeni Firma Ekle'
                  >
                    <i className='ri-building-add-line text-lg'></i>
                  </button>
                </Link>
                <Link href='/admin/danisman-yonetimi'>
                  <button
                    className='w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors cursor-pointer'
                    title='Danışman Yönetimi'
                  >
                    <i className='ri-user-star-line text-lg'></i>
                  </button>
                </Link>
                <Link href='/admin/raporlama-analiz'>
                  <button
                    className='w-9 h-9 flex items-center justify-center rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors cursor-pointer'
                    title='Raporlama'
                  >
                    <i className='ri-file-chart-line text-lg'></i>
                  </button>
                </Link>
              </div>
              <div className='w-px h-6 bg-gray-300'></div>
              {/* Notifications */}
              <div className='relative'>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className='w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer relative'
                >
                  <i className='ri-notification-3-line text-gray-600 text-xl'></i>
                  {unreadNotifications > 0 && (
                    <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className='absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                    <div className='p-4 border-b border-gray-100'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-gray-900'>
                          Bildirimler
                        </h3>
                        <span className='text-xs text-gray-500'>
                          {unreadNotifications} okunmamış
                        </span>
                      </div>
                    </div>
                    <div className='max-h-64 overflow-y-auto'>
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}
                        >
                          <div className='flex items-start gap-3'>
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'info' ? 'bg-blue-500' : notification.type === 'warning' ? 'bg-yellow-500' : notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                            ></div>
                            <div className='flex-1'>
                              <p className='text-sm text-gray-900'>
                                {notification.message}
                              </p>
                              <p className='text-xs text-gray-500 mt-1'>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='p-3 text-center border-t border-gray-100'>
                      <button className='text-sm text-blue-600 hover:text-blue-800'>
                        Tüm bildirimleri gör
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* User Menu */}
              <div className='relative'>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
                >
                  <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-medium'>AD</span>
                  </div>
                  <i className='ri-arrow-down-s-line text-gray-500 text-sm'></i>
                </button>
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className='absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                    <div className='p-4 border-b border-gray-100'>
                      <p className='font-medium text-gray-900'>Admin User</p>
                      <p className='text-sm text-gray-500'>
                        admin@ihracatakademi.com
                      </p>
                    </div>
                    <div className='py-2'>
                      <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                        <i className='ri-user-line text-gray-400'></i>
                        Profil Ayarları
                      </button>
                      <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                        <i className='ri-settings-3-line text-gray-400'></i>
                        Sistem Ayarları
                      </button>
                      <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                        <i className='ri-question-line text-gray-400'></i>
                        Yardım & Destek
                      </button>
                      <hr className='my-2 border-gray-100' />
                      <button className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2'>
                        <i className='ri-logout-box-line text-red-400'></i>
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Enhanced Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out fixed left-0 top-16 h-full z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className='h-full overflow-y-auto'>
          {/* Navigation Menu */}
          <nav className='p-2 space-y-1'>
            {/* Dashboard */}
            <MenuItem
              icon='ri-dashboard-3-line'
              title='Ana Panel'
              isActive={activeMenuItem === 'dashboard'}
              onClick={() => setActiveMenuItem('dashboard')}
              href='/admin'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Firma Yönetimi */}
            <MenuItem
              icon='ri-building-line'
              title='Firma Yönetimi'
              isActive={activeMenuItem === 'company-management'}
              onClick={() => setActiveMenuItem('company-management')}
              href='/admin/firma-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Danışman Yönetimi */}
            <MenuItem
              icon='ri-user-star-line'
              title='Danışman Yönetimi'
              isActive={activeMenuItem === 'consultant-management'}
              onClick={() => setActiveMenuItem('consultant-management')}
              href='/admin/danisman-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Proje Yönetimi */}
            <MenuItem
              icon='ri-folder-line'
              title='Proje Yönetimi'
              isActive={activeMenuItem === 'projects'}
              onClick={() => {
                setActiveMenuItem('projects');
                setProjeExpanded(!projeExpanded);
              }}
              hasSubMenu={true}
              isExpanded={projeExpanded}
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Proje Alt Menüleri */}
            {projeExpanded && !sidebarCollapsed && (
              <div className='ml-2 space-y-1'>
                <SubMenuItem
                  title='Tüm Projeler'
                  isActive={activeMenuItem === 'all-projects'}
                  onClick={() => setActiveMenuItem('all-projects')}
                  href='/admin/proje-yonetimi'
                />
              </div>
            )}
            {/* Eğitim Yönetimi */}
            <MenuItem
              icon='ri-graduation-cap-line'
              title='Eğitim Yönetimi'
              isActive={activeMenuItem === 'education'}
              onClick={() => {
                setActiveMenuItem('education');
                setEducationExpanded(!educationExpanded);
              }}
              hasSubMenu={true}
              isExpanded={educationExpanded}
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Eğitim Alt Menüleri */}
            {educationExpanded && !sidebarCollapsed && (
              <div className='ml-2 space-y-1'>
                <SubMenuItem
                  title='Videolar'
                  isActive={activeMenuItem === 'education-videos'}
                  onClick={() => setActiveMenuItem('education-videos')}
                  href='/admin/egitim-yonetimi/videolar'
                />
                <SubMenuItem
                  title='Eğitim Setleri'
                  isActive={activeMenuItem === 'education-sets'}
                  onClick={() => setActiveMenuItem('education-sets')}
                  href='/admin/egitim-yonetimi/setler'
                />
                <SubMenuItem
                  title='Firma Takip'
                  isActive={activeMenuItem === 'company-tracking'}
                  onClick={() => setActiveMenuItem('company-tracking')}
                  href='/admin/egitim-yonetimi/firma-takip'
                />
                <SubMenuItem
                  title='Dökümanlar'
                  isActive={activeMenuItem === 'education-docs'}
                  onClick={() => setActiveMenuItem('education-docs')}
                  href='/admin/egitim-yonetimi/dokumanlar'
                />
              </div>
            )}
            {/* Etkinlik Yönetimi */}
            <MenuItem
              icon='ri-calendar-event-line'
              title='Etkinlik Yönetimi'
              isActive={activeMenuItem === 'events'}
              onClick={() => setActiveMenuItem('events')}
              href='/admin/etkinlik-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Forum Yönetimi */}
            <MenuItem
              icon='ri-chat-3-line'
              title='Forum Yönetimi'
              isActive={activeMenuItem === 'forum'}
              onClick={() => setActiveMenuItem('forum')}
              href='/admin/forum-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Haber Yönetimi */}
            <MenuItem
              icon='ri-newspaper-line'
              title='Haber Yönetimi'
              isActive={activeMenuItem === 'news'}
              onClick={() => setActiveMenuItem('news')}
              href='/admin/haberler-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Kariyer Portalı */}
            <MenuItem
              icon='ri-briefcase-line'
              title='Kariyer Portalı'
              isActive={activeMenuItem === 'career'}
              onClick={() => setActiveMenuItem('career')}
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Randevu Talepleri */}
            <MenuItem
              icon='ri-calendar-check-line'
              title='Randevu Talepleri'
              isActive={activeMenuItem === 'appointments'}
              onClick={() => setActiveMenuItem('appointments')}
              href='/admin/randevu-talepleri'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Raporlama ve Analiz */}
            <MenuItem
              icon='ri-bar-chart-box-line'
              title='Raporlama ve Analiz'
              isActive={activeMenuItem === 'reporting'}
              onClick={() => setActiveMenuItem('reporting')}
              href='/admin/raporlama-analiz'
              sidebarCollapsed={sidebarCollapsed}
            />
            {!sidebarCollapsed && (
              <>
                <div className='my-4 border-t border-gray-200'></div>
                {/* Sistem Bölümü */}
                <div className='px-3 py-2'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Sistem
                  </p>
                </div>
                <MenuItem
                  icon='ri-settings-3-line'
                  title='Sistem Ayarları'
                  isActive={activeMenuItem === 'settings'}
                  onClick={() => setActiveMenuItem('settings')}
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-shield-check-line'
                  title='Güvenlik'
                  isActive={activeMenuItem === 'security'}
                  onClick={() => setActiveMenuItem('security')}
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-history-line'
                  title='İşlem Geçmişi'
                  isActive={activeMenuItem === 'logs'}
                  onClick={() => setActiveMenuItem('logs')}
                  sidebarCollapsed={sidebarCollapsed}
                />
              </>
            )}
          </nav>
        </div>
      </div>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden'
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}
      {/* Click Outside Handlers */}
      {showNotifications && (
        <div
          className='fixed inset-0 z-30'
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
      {showUserMenu && (
        <div
          className='fixed inset-0 z-30'
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-20 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        <div className='px-4 sm:px-6 lg:px-8 py-8'>
          {/* Success Message */}
          {successMessage && (
            <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6'>
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6'>
              {error}
            </div>
          )}

          {/* Page Header */}
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Kariyer Portalı
              </h2>
              <p className='text-gray-600'>
                İş ilanları ve kariyer başvurularını yönetin
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => {
                  setEditingJob(null);
                  setShowJobModal(true);
                }}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap'
              >
                <i className='ri-add-line'></i>
                {activeTab === 'jobs' ? 'Yeni İş İlanı Ekle' : "Excel'e Aktar"}
              </button>
              {activeTab === 'applications' && (
                <button
                  onClick={exportToExcel}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap'
                >
                  <i className='ri-file-excel-line'></i>
                  Excel&apos;e Aktar
                </button>
              )}
            </div>
          </div>
          {/* Main Tab Navigation */}
          <div className='mb-8'>
            <div className='flex gap-2 overflow-x-auto pb-2'>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <i className='ri-briefcase-line'></i>
                İş İlanları ({jobPostings.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'applications' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <i className='ri-user-search-line'></i>
                Kariyer Başvuruları ({applications.length})
              </button>
            </div>
          </div>
          {activeTab === 'jobs' && (
            <>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                <StatsCard
                  icon='ri-briefcase-line'
                  label='Toplam İlan'
                  value={jobPostings.length.toString()}
                  variant='primary'
                />
                <StatsCard
                  icon='ri-check-line'
                  label='Aktif İlanlar'
                  value={jobPostings.filter(job => job.status === 'Aktif').length.toString()}
                  variant='success'
                />
                <StatsCard
                  icon='ri-user-line'
                  label='Toplam Başvuru'
                  value={jobPostings.reduce((total, job) => total + job.applicationsCount, 0).toString()}
                  variant='accent'
                />
                <StatsCard
                  icon='ri-eye-line'
                  label='Bu Ay Görüntüleme'
                  value={jobPostings.reduce((total, job) => total + job.viewsCount, 0).toString()}
                  variant='warning'
                />
              </div>
              {/* Filters */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Filtreler
                  </h3>
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
                        placeholder='İş ilanı, şirket veya departman ara...'
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
                      <option value='Aktif'>Aktif</option>
                      <option value='Pasif'>Pasif</option>
                      <option value='Dolu'>Dolu</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Çalışma Türü
                    </label>
                    <select
                      value={selectedType}
                      onChange={e => setSelectedType(e.target.value)}
                      className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                    >
                      <option value=''>Tüm Türler</option>
                      <option value='Tam Zamanlı'>Tam Zamanlı</option>
                      <option value='Yarı Zamanlı'>Yarı Zamanlı</option>
                      <option value='Proje Bazlı'>Proje Bazlı</option>
                      <option value='Staj'>Staj</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Seviye
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={e => setSelectedLevel(e.target.value)}
                      className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                    >
                      <option value=''>Tüm Seviyeler</option>
                      <option value='Giriş'>Giriş</option>
                      <option value='Orta'>Orta</option>
                      <option value='Kıdemli'>Kıdemli</option>
                      <option value='Yönetici'>Yönetici</option>
                    </select>
                  </div>
                </div>
                <div className='text-sm text-gray-600'>
                  <span className='font-medium'>{filteredJobs.length}</span> iş
                  ilanı bulundu
                </div>
              </div>
              {/* Job Postings List */}
              {filteredJobs.length > 0 ? (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {filteredJobs.map(job => (
                    <JobPostingCard
                      key={job.id}
                      job={job}
                      onEdit={handleEditJob}
                      onDelete={handleDeleteJob}
                      onViewApplications={handleViewApplications}
                      onChangeStatus={handleChangeStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-briefcase-line text-2xl text-gray-400'></i>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    İş ilanı bulunamadı
                  </h3>
                  <p className='text-gray-500 mb-4'>
                    Filtrelere uygun iş ilanı bulunmuyor
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
          )}
          {activeTab === 'applications' && (
            <>
              {/* Loading ve Error Durumları */}
              {loading && (
                <div className='text-center py-12'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-loader-4-line text-2xl text-blue-600 animate-spin'></i>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Başvurular yükleniyor...
                  </h3>
                  <p className='text-gray-500'>Lütfen bekleyin</p>
                </div>
              )}
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
                    onClick={fetchApplications}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                  >
                    Tekrar Dene
                  </button>
                </div>
              )}
              {!loading && !error && (
                <>
                  {/* Application Tab Navigation */}
                  <div className='mb-8'>
                    <div className='flex gap-2 overflow-x-auto pb-2'>
                      <button
                        onClick={() => setApplicationActiveTab('all')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${applicationActiveTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                      >
                        <i className='ri-user-line'></i>
                        Tüm Başvurular ({applicationCounts.all})
                      </button>
                      <button
                        onClick={() => setApplicationActiveTab('consultant')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${applicationActiveTab === 'consultant' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                      >
                        <i className='ri-user-star-line'></i>
                        Danışman ({applicationCounts.consultant})
                      </button>
                      <button
                        onClick={() => setApplicationActiveTab('intern')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${applicationActiveTab === 'intern' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                      >
                        <i className='ri-graduation-cap-line'></i>
                        Stajyer ({applicationCounts.intern})
                      </button>
                      <button
                        onClick={() => setApplicationActiveTab('hr')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${applicationActiveTab === 'hr' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                      >
                        <i className='ri-team-line'></i>
                        Firma Personel ({applicationCounts.hr})
                      </button>
                      <button
                        onClick={() => setApplicationActiveTab('hired')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${applicationActiveTab === 'hired' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                      >
                        <i className='ri-check-line'></i>
                        İşe Alınanlar ({applicationCounts.hired})
                      </button>
                    </div>
                  </div>
                  {/* Application Filters */}
                  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
                    <div className='flex justify-between items-center mb-4'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Filtreler
                      </h3>
                      <button
                        onClick={clearApplicationFilters}
                        className='text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer'
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4'>
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
                            value={applicationSearchQuery}
                            onChange={e =>
                              setApplicationSearchQuery(e.target.value)
                            }
                            placeholder='Ad, soyad veya email...'
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                          />
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Durum
                        </label>
                        <select
                          value={applicationSelectedStatus}
                          onChange={e =>
                            setApplicationSelectedStatus(e.target.value)
                          }
                          className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                        >
                          <option value=''>Tüm Durumlar</option>
                          <option value='Bekliyor'>Bekliyor</option>
                          <option value='Admin Onayladı'>Admin Onayladı</option>
                          <option value='Danışman Onayladı'>
                            Danışman Onayladı
                          </option>
                          <option value='Firma Görüyor'>Firma Görüyor</option>
                          <option value='İşe Alındı'>İşe Alındı</option>
                          <option value='Reddedildi'>Reddedildi</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Başvuru Tipi
                        </label>
                        <select
                          value={applicationSelectedType}
                          onChange={e =>
                            setApplicationSelectedType(e.target.value)
                          }
                          className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                        >
                          <option value=''>Tüm Tipler</option>
                          <option value='Danışman'>Danışman</option>
                          <option value='Stajyer'>Stajyer</option>
                          <option value='Firma Personel'>Firma Personel</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Eğitim
                        </label>
                        <select
                          value={applicationSelectedEducation}
                          onChange={e =>
                            setApplicationSelectedEducation(e.target.value)
                          }
                          className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                        >
                          <option value=''>Tüm Seviyeler</option>
                          <option value='Lisans'>Lisans</option>
                          <option value='Yüksek Lisans'>Yüksek Lisans</option>
                          <option value='Doktora'>Doktora</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Şehir
                        </label>
                        <select
                          value={applicationSelectedCity}
                          onChange={e =>
                            setApplicationSelectedCity(e.target.value)
                          }
                          className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                        >
                          <option value=''>Tüm Şehirler</option>
                          <option value='İstanbul'>İstanbul</option>
                          <option value='Ankara'>Ankara</option>
                          <option value='İzmir'>İzmir</option>
                          <option value='Bursa'>Bursa</option>
                          <option value='Antalya'>Antalya</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Tarih Aralığı
                        </label>
                        <div className='flex gap-1'>
                          <input
                            type='date'
                            value={applicationDateRange.start}
                            onChange={e =>
                              setApplicationDateRange({
                                ...applicationDateRange,
                                start: e.target.value,
                              })
                            }
                            className='w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                          />
                          <input
                            type='date'
                            value={applicationDateRange.end}
                            onChange={e =>
                              setApplicationDateRange({
                                ...applicationDateRange,
                                end: e.target.value,
                              })
                            }
                            className='w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs'
                          />
                        </div>
                      </div>
                    </div>
                    <div className='text-sm text-gray-600'>
                      <span className='font-medium'>
                        {filteredApplications.length}
                      </span>{' '}
                      başvuru bulundu
                    </div>
                  </div>
                  {/* Applications Grid */}
                  {filteredApplications.length > 0 ? (
                    <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                      {filteredApplications.map(application => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          onViewDetails={handleViewApplicationDetails}
                          onUpdateStatus={handleUpdateApplicationStatusDetails}
                          onDelete={handleDeleteApplication}
                          onDownloadCV={handleDownloadCV}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <i className='ri-user-search-line text-2xl text-gray-400'></i>
                      </div>
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        Başvuru bulunamadı
                      </h3>
                      <p className='text-gray-500 mb-4'>
                        Filtrelere uygun başvuru bulunmuyor
                      </p>
                      <button
                        onClick={clearApplicationFilters}
                        className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap'
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      {/* Job Application Modal */}
      {showApplicationModal && selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          applications={getJobApplications(selectedJob.id)}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          onUpdateApplicationStatus={handleUpdateApplicationStatus}
        />
      )}
      {/* Application Detail Modal */}
      {showApplicationDetailModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => {
            setShowApplicationDetailModal(false);
            setSelectedApplication(null);
          }}
          onUpdateStatus={handleUpdateApplicationStatusDetails}
        />
      )}
    </div>
  );
}
