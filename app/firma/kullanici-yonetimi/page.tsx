'use client';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  status: 'active' | 'inactive' | 'pending';
  last_login: string | null;
  created_at: string;
  user_permissions: Permission[];
}
interface Permission {
  id: string;
  module: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}
interface CompanyData {
  id: string;
  name: string;
  email: string;
  authorizedPerson: string;
}
const modules = [
  { id: 'education', name: 'Eğitim İçeriği', icon: 'ri-book-open-line' },
  { id: 'reports', name: 'Raporlar', icon: 'ri-bar-chart-line' },
  { id: 'forum', name: 'Forum / Etkinlik', icon: 'ri-group-line' },
  { id: 'tasks', name: 'Görev Düzenleme', icon: 'ri-task-line' },
  {
    id: 'company_management',
    name: 'Firma Yönetimi',
    icon: 'ri-building-line',
  },
  {
    id: 'user_management',
    name: 'Kullanıcı Yönetimi',
    icon: 'ri-user-settings-line',
  },
  { id: 'events', name: 'Etkinlikler', icon: 'ri-calendar-event-line' },
  { id: 'news', name: 'Haberler', icon: 'ri-newspaper-line' },
];
export default function KullaniciYonetimiPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  // Yeni kullanıcı formu
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'operator' as const,
    permissions: modules.map(module => ({
      module: module.id,
      can_read: true,
      can_create: false,
      can_update: false,
      can_delete: false,
    })),
  });
  useEffect(() => {
    if (user?.company_id) {
      fetchUsers();
      fetchCompanyData();
    }
  }, [user?.company_id]);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/company/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError('Kullanıcılar yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const fetchCompanyData = async () => {
    try {
      const response = await fetch('/api/company/profile');
      if (response.ok) {
        const data = await response.json();
        setCompanyData(data.company);
      }
    } catch (err) {}
  };
  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/company/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          company_id: user?.company_id,
        }),
      });
      if (response.ok) {
        await fetchUsers();
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          role: 'operator',
          permissions: modules.map(module => ({
            module: module.id,
            can_read: true,
            can_create: false,
            can_update: false,
            can_delete: false,
          })),
        });
      } else {
        setError('Kullanıcı eklenirken hata oluştu');
      }
    } catch (err) {
      setError('Kullanıcı eklenirken hata oluştu');
    }
  };
  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/company/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await fetchUsers();
        setShowEditUserModal(false);
        setSelectedUser(null);
      } else {
        setError('Kullanıcı güncellenirken hata oluştu');
      }
    } catch (err) {
      setError('Kullanıcı güncellenirken hata oluştu');
    }
  };
  const handleDeleteUser = async (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/company/users/${userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchUsers();
        } else {
          setError('Kullanıcı silinirken hata oluştu');
        }
      } catch (err) {
        setError('Kullanıcı silinirken hata oluştu');
      }
    }
  };
  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await handleUpdateUser(userId, { status: newStatus as any });
  };
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'operator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };
  if (loading) {
    return (
      <FirmaLayout
        title='Kullanıcı Yönetimi'
        description='Firma kullanıcılarını yönetin ve yetkilendirin'
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
        title='Kullanıcı Yönetimi'
        description='Firma kullanıcılarını yönetin ve yetkilendirin'
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
      title='Kullanıcı Yönetimi'
      description='Firma kullanıcılarını yönetin ve yetkilendirin'
    >
      <div className='space-y-6'>
        {/* Firma Bilgileri */}
        {companyData && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              Firma Bilgileri
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Firma Adı
                </label>
                <p className='mt-1 text-sm text-gray-900'>{companyData.name}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  E-posta
                </label>
                <p className='mt-1 text-sm text-gray-900'>
                  {companyData.email}
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Yetkili Kişi
                </label>
                <p className='mt-1 text-sm text-gray-900'>
                  {companyData.authorizedPerson}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Filtreler ve Arama */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <input
                type='text'
                placeholder='Kullanıcı adı veya e-posta ile ara...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div className='flex gap-2'>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>Tüm Durumlar</option>
                <option value='active'>Aktif</option>
                <option value='inactive'>Pasif</option>
                <option value='pending'>Beklemede</option>
              </select>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>Tüm Roller</option>
                <option value='admin'>Admin</option>
                <option value='manager'>Yönetici</option>
                <option value='operator'>Operatör</option>
              </select>
              <button
                onClick={() => setShowAddUserModal(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
              >
                <i className='ri-add-line mr-2'></i>
                Yeni Kullanıcı
              </button>
            </div>
          </div>
        </div>
        {/* Kullanıcı Listesi */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Kullanıcılar ({filteredUsers.length})
            </h2>
          </div>
          <div className='divide-y divide-gray-200'>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className='p-6 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex-shrink-0'>
                        <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                          <i className='ri-user-line text-blue-600'></i>
                        </div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3 mb-1'>
                          <h3 className='text-lg font-medium text-gray-900'>
                            {user.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                          >
                            {user.role === 'admin'
                              ? 'Admin'
                              : user.role === 'manager'
                                ? 'Yönetici'
                                : 'Operatör'}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                          >
                            {user.status === 'active'
                              ? 'Aktif'
                              : user.status === 'inactive'
                                ? 'Pasif'
                                : 'Beklemede'}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600'>{user.email}</p>
                        <div className='flex items-center gap-4 text-xs text-gray-500 mt-1'>
                          <span>
                            <i className='ri-calendar-line mr-1'></i>
                            Katılım: {formatDate(user.created_at)}
                          </span>
                          {user.last_login && (
                            <span>
                              <i className='ri-time-line mr-1'></i>
                              Son Giriş: {formatDate(user.last_login)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditUserModal(true);
                        }}
                        className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                        title='Düzenle'
                      >
                        <i className='ri-edit-line'></i>
                      </button>
                      <button
                        onClick={() =>
                          handleToggleUserStatus(user.id, user.status)
                        }
                        className={`p-2 transition-colors ${
                          user.status === 'active'
                            ? 'text-green-400 hover:text-red-600'
                            : 'text-red-400 hover:text-green-600'
                        }`}
                        title={
                          user.status === 'active'
                            ? 'Pasifleştir'
                            : 'Aktifleştir'
                        }
                      >
                        <i
                          className={
                            user.status === 'active'
                              ? 'ri-pause-line'
                              : 'ri-play-line'
                          }
                        ></i>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                        title='Sil'
                      >
                        <i className='ri-delete-bin-line'></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='p-12 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-user-line text-2xl text-gray-400'></i>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Kullanıcı Bulunamadı
                </h3>
                <p className='text-gray-500 mb-4'>
                  Arama kriterlerinize uygun kullanıcı bulunamadı.
                </p>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  İlk Kullanıcıyı Ekle
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Yeni Kullanıcı Modal */}
        {showAddUserModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
              <div className='p-6 border-b border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Yeni Kullanıcı Ekle
                </h3>
              </div>
              <div className='p-6 space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Ad Soyad
                  </label>
                  <input
                    type='text'
                    value={newUser.name}
                    onChange={e =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    E-posta
                  </label>
                  <input
                    type='email'
                    value={newUser.email}
                    onChange={e =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Rol
                  </label>
                  <select
                    value={newUser.role}
                    onChange={e =>
                      setNewUser({ ...newUser, role: e.target.value as any })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='operator'>Operatör</option>
                    <option value='manager'>Yönetici</option>
                    <option value='admin'>Admin</option>
                  </select>
                </div>
              </div>
              <div className='p-6 border-t border-gray-200 flex justify-end gap-3'>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                >
                  İptal
                </button>
                <button
                  onClick={handleAddUser}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                >
                  Kullanıcı Ekle
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Düzenleme Modal */}
        {showEditUserModal && selectedUser && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
              <div className='p-6 border-b border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Kullanıcı Düzenle
                </h3>
              </div>
              <div className='p-6 space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Ad Soyad
                  </label>
                  <input
                    type='text'
                    defaultValue={selectedUser.name}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    E-posta
                  </label>
                  <input
                    type='email'
                    defaultValue={selectedUser.email}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Rol
                  </label>
                  <select
                    defaultValue={selectedUser.role}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='operator'>Operatör</option>
                    <option value='manager'>Yönetici</option>
                    <option value='admin'>Admin</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Durum
                  </label>
                  <select
                    defaultValue={selectedUser.status}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='active'>Aktif</option>
                    <option value='inactive'>Pasif</option>
                    <option value='pending'>Beklemede</option>
                  </select>
                </div>
              </div>
              <div className='p-6 border-t border-gray-200 flex justify-end gap-3'>
                <button
                  onClick={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                  }}
                  className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    // Burada güncelleme işlemi yapılacak
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                  }}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}
