'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';

interface Consultant {
  id: string;
  full_name: string;
  email: string;
  last_login_at?: string;
  assignedCompanies: number;
  activeReports: number;
  status: 'active' | 'inactive';
  avatar?: string;
  phone?: string;
  created_at: string;
  consultant_profiles?: {
    phone?: string;
    is_active: boolean;
    last_login_at?: string;
  }[];
}
interface Permission {
  module: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
}
interface ConsultantPermissions {
  consultantId: string;
  permissions: Permission[];
  companyVisibility: 'all' | 'assigned';
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
const ConsultantCard = ({
  consultant,
  onEditPermissions,
  onToggleStatus,
  onViewDetail,
  onDeleteConsultant,
}: {
  consultant: Consultant;
  onEditPermissions: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewDetail: (id: string) => void;
  onDeleteConsultant: (id: string) => void;
}) => {
  return (
    <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg'>
            {consultant.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              {consultant.full_name}
            </h3>
            <p className='text-sm text-gray-600'>{consultant.email}</p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              consultant.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {consultant.status === 'active' ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-600'>
            {consultant.assignedCompanies}
          </div>
          <div className='text-sm text-gray-600'>Atanan Firma</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-600'>
            {consultant.activeReports}
          </div>
          <div className='text-sm text-gray-600'>Aktif Rapor</div>
        </div>
      </div>
      <div className='space-y-2 mb-4'>
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-phone-line mr-2'></i>
          <span>{consultant.phone || 'Telefon bilgisi yok'}</span>
        </div>
        <div className='flex items-center text-sm text-gray-600'>
          <i className='ri-time-line mr-2'></i>
          <span>
            Son giriş:{' '}
            {consultant.last_login_at
              ? new Date(consultant.last_login_at).toLocaleDateString('tr-TR')
              : 'Hiç giriş yapmamış'}
          </span>
        </div>
      </div>
      <div className='flex space-x-2'>
        <button
          onClick={() => onViewDetail(consultant.id)}
          className='flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors'
        >
          Detay
        </button>
        <button
          onClick={() => onEditPermissions(consultant.id)}
          className='flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors'
        >
          Yetkiler
        </button>
        <button
          onClick={() => onToggleStatus(consultant.id)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            consultant.status === 'active'
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {consultant.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
        </button>
        <button
          onClick={() => onDeleteConsultant(consultant.id)}
          className='px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors'
        >
          <i className='ri-delete-bin-line'></i>
        </button>
      </div>
    </div>
  );
};
const PermissionsModal = ({
  isOpen,
  onClose,
  consultantId,
  permissions,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  consultantId: string;
  permissions: Permission[];
  onSave: (permissions: Permission[]) => void;
}) => {
  const [localPermissions, setLocalPermissions] =
    useState<Permission[]>(permissions);
  const modules = [
    { key: 'firma_yonetimi', name: 'Firma Yönetimi' },
    { key: 'proje_yonetimi', name: 'Proje Yönetimi' },
    { key: 'egitim_yonetimi', name: 'Eğitim Yönetimi' },
    { key: 'etkinlik_yonetimi', name: 'Etkinlik Yönetimi' },
    { key: 'raporlama', name: 'Raporlama' },
    { key: 'forum_yonetimi', name: 'Forum Yönetimi' },
  ];
  const handlePermissionChange = (
    module: string,
    permission: 'view' | 'edit' | 'delete',
    value: boolean
  ) => {
    setLocalPermissions(prev =>
      prev.map(p => (p.module === module ? { ...p, [permission]: value } : p))
    );
  };
  const handleSave = () => {
    onSave(localPermissions);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-xl font-semibold text-gray-900'>
            Danışman Yetkileri
          </h3>
          <p className='text-gray-600 mt-1'>
            Danışmanın erişim yetkilerini düzenleyin
          </p>
        </div>
        <div className='p-6'>
          <div className='space-y-4'>
            {modules.map(module => {
              const modulePermissions = localPermissions.find(
                p => p.module === module.key
              ) || {
                module: module.key,
                view: false,
                edit: false,
                delete: false,
              };
              return (
                <div
                  key={module.key}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <h4 className='font-medium text-gray-900 mb-3'>
                    {module.name}
                  </h4>
                  <div className='grid grid-cols-3 gap-4'>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={modulePermissions.view}
                        onChange={e =>
                          handlePermissionChange(
                            module.key,
                            'view',
                            e.target.checked
                          )
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm text-gray-700'>Görüntüleme</span>
                    </label>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={modulePermissions.edit}
                        onChange={e =>
                          handlePermissionChange(
                            module.key,
                            'edit',
                            e.target.checked
                          )
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm text-gray-700'>Düzenleme</span>
                    </label>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={modulePermissions.delete}
                        onChange={e =>
                          handlePermissionChange(
                            module.key,
                            'delete',
                            e.target.checked
                          )
                        }
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm text-gray-700'>Silme</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className='p-6 border-t border-gray-200 flex justify-end space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors'
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors'
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
export default function DanismanYonetimiPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedConsultantId, setSelectedConsultantId] = useState<
    string | null
  >(null);
  const [selectedConsultantPermissions, setSelectedConsultantPermissions] =
    useState<Permission[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuthStore();
  // Fetch consultants from API
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/consultants');
        if (!response.ok) {
          throw new Error('Danışmanlar yüklenirken hata oluştu');
        }
        const data = await response.json();
        // Transform API data to match our interface
        const transformedConsultants = data.consultants.map(
          (consultant: any) => ({
            id: consultant.id,
            full_name: consultant.full_name,
            email: consultant.email,
            last_login_at: consultant.consultant_profiles?.[0]?.last_login_at,
            assignedCompanies: consultant.consultant_assignments?.length || 0,
            activeReports:
              consultant.consultant_reports?.filter(
                (r: any) => r.status === 'active'
              )?.length || 0,
            status: consultant.consultant_profiles?.[0]?.is_active
              ? 'active'
              : 'inactive',
            phone: consultant.consultant_profiles?.[0]?.phone,
            created_at: consultant.created_at,
            consultant_profiles: consultant.consultant_profiles,
          })
        );
        setConsultants(transformedConsultants);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    };
    // TEMPORARY: Always fetch consultants for testing (remove this in production)
    fetchConsultants();
  }, [user]);
  const handleEditPermissions = (consultantId: string) => {
    setSelectedConsultantId(consultantId);
    setSelectedConsultantPermissions([
      { module: 'firma_yonetimi', view: true, edit: false, delete: false },
      { module: 'proje_yonetimi', view: true, edit: true, delete: false },
      { module: 'egitim_yonetimi', view: true, edit: false, delete: false },
      { module: 'etkinlik_yonetimi', view: true, edit: false, delete: false },
      { module: 'raporlama', view: true, edit: false, delete: false },
      { module: 'forum_yonetimi', view: true, edit: false, delete: false },
    ]);
    setShowPermissionsModal(true);
  };
  const handleToggleStatus = async (consultantId: string) => {
    try {
      const response = await fetch(`/api/consultants/${consultantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status:
            consultants.find(c => c.id === consultantId)?.status === 'active'
              ? 'inactive'
              : 'active',
        }),
      });
      if (response.ok) {
        setConsultants(prev =>
          prev.map(c =>
            c.id === consultantId
              ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
              : c
          )
        );
      }
    } catch (error) {}
  };
  const handleViewDetail = (consultantId: string) => {
    // Navigate to consultant detail page
  };
  const handleDeleteConsultant = async (consultantId: string) => {
    if (!confirm('Bu danışmanı silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      const response = await fetch(`/api/consultants/${consultantId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setConsultants(prev => prev.filter(c => c.id !== consultantId));
      }
    } catch (error) {}
  };
  const handleSavePermissions = async (permissions: Permission[]) => {
    try {
      const response = await fetch(
        `/api/consultants/${selectedConsultantId}/permissions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ permissions }),
        }
      );
      if (response.ok) {
      }
    } catch (error) {}
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Danışmanlar yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-error-warning-line text-2xl text-red-600'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Hata Oluştu
          </h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors'
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Danışman Yönetimi
              </h1>
              <p className='text-gray-600 mt-1'>
                Danışmanları yönetin ve yetkilerini düzenleyin
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setShowAddModal(true)}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors'
              >
                <i className='ri-add-line mr-2'></i>
                Yeni Danışman
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <i className='ri-user-line text-2xl text-blue-600'></i>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Toplam Danışman
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {consultants.length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <i className='ri-check-line text-2xl text-green-600'></i>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Aktif Danışman
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {consultants.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                <i className='ri-building-line text-2xl text-purple-600'></i>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Toplam Atama
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {consultants.reduce((sum, c) => sum + c.assignedCompanies, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                <i className='ri-file-list-line text-2xl text-orange-600'></i>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Aktif Rapor</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {consultants.reduce((sum, c) => sum + c.activeReports, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Consultants Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {consultants.map(consultant => (
            <ConsultantCard
              key={consultant.id}
              consultant={consultant}
              onEditPermissions={handleEditPermissions}
              onToggleStatus={handleToggleStatus}
              onViewDetail={handleViewDetail}
              onDeleteConsultant={handleDeleteConsultant}
            />
          ))}
        </div>
        {consultants.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-user-line text-2xl text-gray-400'></i>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Henüz Danışman Yok
            </h3>
            <p className='text-gray-500 mb-4'>
              İlk danışmanı ekleyerek başlayın
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors'
            >
              Danışman Ekle
            </button>
          </div>
        )}
      </div>
      {/* Permissions Modal */}
      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        consultantId={selectedConsultantId || ''}
        permissions={selectedConsultantPermissions}
        onSave={handleSavePermissions}
      />
    </div>
  );
}
