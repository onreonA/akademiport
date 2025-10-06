'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
interface EducationSet {
  id: string;
  name: string;
  description: string;
  category: string;
  video_count: number;
  total_duration: number; // dakika
  status: string;
  created_at: string;
}
interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
}
interface Assignment {
  id: string;
  company_id: string;
  set_id: string;
  status: string;
  progress_percentage: number;
  assigned_at: string;
  companies: Company;
}
export default function EducationSetsManagement() {
  const [educationSets, setEducationSets] = useState<EducationSet[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingSet, setEditingSet] = useState<EducationSet | null>(null);
  const [selectedSetForAssignment, setSelectedSetForAssignment] =
    useState<EducationSet | null>(null);
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'B2B',
    status: 'Aktif',
  });
  // Fetch education sets from API
  const fetchEducationSets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/education-sets', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (!response.ok) {
        throw new Error('Eğitim setleri getirilemedi');
      }
      const result = await response.json();
      if (result.success) {
        setEducationSets(result.data || []);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  // Load data on component mount
  useEffect(() => {
    fetchEducationSets();
    fetchCompanies();
  }, []);
  // Fetch companies for assignment
  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCompanies(result.companies || []);
        }
      }
    } catch (error) {}
  };
  // Fetch assignments for a specific set
  const fetchAssignments = async (setId: string) => {
    try {
      const response = await fetch(
        `/api/education-sets/assign?set_id=${setId}`,
        {
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAssignments(result.data || []);
        }
      }
    } catch (error) {}
  };
  // Handle company assignment
  const handleAssignCompanies = async (
    companyIds: string[],
    assignAll: boolean = false
  ) => {
    if (!selectedSetForAssignment) return;
    try {
      setAssignLoading(true);
      const response = await fetch('/api/education-sets/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          set_id: selectedSetForAssignment.id,
          company_ids: assignAll ? [] : companyIds,
          assign_all: assignAll,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Firma atama işlemi başarısız');
      }
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchAssignments(selectedSetForAssignment.id);
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      alert('Firma atama işlemi başarısız: ' + error.message);
    } finally {
      setAssignLoading(false);
    }
  };
  // Handle open assignment modal
  const handleOpenAssignModal = (set: EducationSet) => {
    setSelectedSetForAssignment(set);
    fetchAssignments(set.id);
    setShowAssignModal(true);
  };
  // Handle create/update education set
  const handleCreateSet = async () => {
    try {
      const response = await fetch('/api/education-sets', {
        method: editingSet ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: JSON.stringify({
          id: editingSet?.id,
          ...formData,
        }),
      });
      if (!response.ok) {
        throw new Error('Eğitim seti kaydedilemedi');
      }
      const result = await response.json();
      if (result.success) {
        fetchEducationSets();
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          category: 'B2B',
          status: 'Aktif',
        });
        setEditingSet(null);
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      alert('Eğitim seti kaydedilirken hata oluştu');
    }
  };
  // Handle delete education set
  const handleDeleteSet = async (id: string) => {
    if (!confirm('Bu eğitim setini silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      const response = await fetch(`/api/education-sets?id=${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        fetchEducationSets();
      } else {
        alert('Eğitim seti silinemedi');
      }
    } catch (error) {
      alert('Eğitim seti silinirken hata oluştu');
    }
  };
  // Handle edit education set
  const handleEditSet = (set: EducationSet) => {
    setEditingSet(set);
    setFormData({
      name: set.name,
      description: set.description,
      category: set.category,
      status: set.status,
    });
    setShowCreateForm(true);
  };
  // Filter education sets
  const filteredSets = educationSets.filter(set => {
    const matchesCategory =
      !selectedCategory || set.category === selectedCategory;
    const matchesStatus = !selectedStatus || set.status === selectedStatus;
    const matchesSearch =
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });
  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}sa ${mins}dk`;
    }
    return `${mins}dk`;
  };
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <Link href='/' className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-global-line text-white text-lg w-5 h-5 flex items-center justify-center'></i>
                </div>
                <div className='flex flex-col'>
                  <span className="font-['Pacifico'] text-xl text-blue-900 leading-tight">
                    İhracat Akademi
                  </span>
                  <span className='text-xs text-gray-500 font-medium'>
                    Admin Panel
                  </span>
                </div>
              </Link>
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Ana Panel
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>
                  Eğitim Setleri
                </span>
              </nav>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => {
                  setEditingSet(null);
                  setFormData({
                    name: '',
                    description: '',
                    category: 'B2B',
                    status: 'Aktif',
                  });
                  setShowCreateForm(true);
                }}
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer'
              >
                <i className='ri-add-line'></i>
                Yeni Set Oluştur
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className='pt-20 px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Page Header */}
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Eğitim Setleri
            </h1>
            <p className='text-gray-600'>
              Eğitim videolarını gruplandırın ve organize edin
            </p>
          </div>
          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Filtreler</h3>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedStatus('');
                  setSearchQuery('');
                }}
                className='text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer'
              >
                Filtreleri Temizle
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                >
                  <option value=''>Tüm Kategoriler</option>
                  <option value='B2B'>B2B</option>
                  <option value='B2C'>B2C</option>
                  <option value='Destek'>Destek</option>
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
                  <option value=''>Tüm Durumlar</option>
                  <option value='Aktif'>Aktif</option>
                  <option value='Pasif'>Pasif</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Set Ara
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                    <i className='ri-search-line text-gray-400 text-sm'></i>
                  </div>
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder='Set adı ara...'
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                  />
                </div>
              </div>
            </div>
            <div className='text-sm text-gray-600 mt-4'>
              <span className='font-medium'>{filteredSets.length}</span> eğitim
              seti bulundu
            </div>
          </div>
          {/* Education Sets Grid */}
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Eğitim setleri yükleniyor...</p>
              </div>
            </div>
          ) : filteredSets.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredSets.map(set => (
                <div
                  key={set.id}
                  className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200'
                >
                  {/* Header */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-3'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            set.category === 'B2B'
                              ? 'bg-purple-100 text-purple-800'
                              : set.category === 'B2C'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {set.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            set.status === 'Aktif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {set.status}
                        </span>
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        {set.name}
                      </h3>
                      <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                        {set.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => handleEditSet(set)}
                        className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer'
                      >
                        <i className='ri-edit-line text-gray-600'></i>
                      </button>
                      <button
                        onClick={() => handleDeleteSet(set.id)}
                        className='w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer'
                      >
                        <i className='ri-delete-bin-line text-red-600'></i>
                      </button>
                    </div>
                  </div>
                  {/* Statistics */}
                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <div className='text-center bg-blue-50 rounded-lg p-3'>
                      <div className='text-xl font-bold text-blue-900'>
                        {set.video_count || 0}
                      </div>
                      <div className='text-xs text-blue-600 font-medium'>
                        Video
                      </div>
                    </div>
                    <div className='text-center bg-purple-50 rounded-lg p-3'>
                      <div className='text-xl font-bold text-purple-900'>
                        {formatDuration(set.total_duration || 0)}
                      </div>
                      <div className='text-xs text-purple-600 font-medium'>
                        Toplam Süre
                      </div>
                    </div>
                  </div>
                  {/* Date */}
                  <div className='text-xs text-gray-500 mb-4'>
                    <div className='font-medium'>Oluşturulma:</div>
                    <div>
                      {new Date(set.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className='flex gap-2'>
                    <Link
                      href={`/admin/egitim-yonetimi/videolar?set_id=${set.id}`}
                      className='flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm text-center'
                    >
                      <i className='ri-video-line mr-2'></i>
                      Videoları Görüntüle
                    </Link>
                    <button
                      onClick={() => handleOpenAssignModal(set)}
                      className='px-4 py-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                      title='Firma Ata'
                    >
                      <i className='ri-user-add-line'></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center'>
              <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-folder-line text-gray-400 text-3xl'></i>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Henüz eğitim seti bulunmuyor
              </h3>
              <p className='text-gray-500 mb-6'>
                İlk eğitim setinizi oluşturarak başlayın
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer'
              >
                <i className='ri-add-line mr-2'></i>
                Eğitim Seti Oluştur
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Create/Edit Education Set Modal */}
      {showCreateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-xl font-semibold text-gray-900'>
                {editingSet
                  ? 'Eğitim Seti Düzenle'
                  : 'Yeni Eğitim Seti Oluştur'}
              </h3>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleCreateSet();
              }}
              className='p-6 space-y-6'
            >
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Set Adı <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Açıklama <span className='text-red-500'>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Eğitim seti hakkında açıklama...'
                  required
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Kategori <span className='text-red-500'>*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    required
                  >
                    <option value='B2B'>B2B</option>
                    <option value='B2C'>B2C</option>
                    <option value='Destek'>Destek</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value='Aktif'>Aktif</option>
                    <option value='Pasif'>Pasif</option>
                  </select>
                </div>
              </div>
              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowCreateForm(false)}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium cursor-pointer'
                >
                  İptal
                </button>
                <button
                  type='submit'
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
                >
                  {editingSet ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Company Assignment Modal */}
      {showAssignModal && selectedSetForAssignment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex justify-between items-center'>
                <div>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Firma Atama - {selectedSetForAssignment.name}
                  </h3>
                  <p className='text-gray-600 text-sm mt-1'>
                    Bu eğitim setini firmalara atayın
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer'
                >
                  <i className='ri-close-line text-gray-600'></i>
                </button>
              </div>
            </div>
            <div className='p-6'>
              {/* Quick Actions */}
              <div className='mb-6'>
                <div className='flex gap-3'>
                  <button
                    onClick={() => handleAssignCompanies([], true)}
                    disabled={assignLoading}
                    className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                  >
                    {assignLoading ? 'İşleniyor...' : 'Tüm Firmalara Ata'}
                  </button>
                  <button
                    onClick={() => {
                      const activeCompanyIds = companies
                        .filter(c => c.status === 'active')
                        .map(c => c.id);
                      handleAssignCompanies(activeCompanyIds);
                    }}
                    disabled={assignLoading}
                    className='bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                  >
                    {assignLoading ? 'İşleniyor...' : 'Aktif Firmalara Ata'}
                  </button>
                </div>
              </div>
              {/* Companies List */}
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {companies.map(company => {
                  const isAssigned = assignments.some(
                    a => a.company_id === company.id
                  );
                  return (
                    <div
                      key={company.id}
                      className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center'>
                          <span className='text-white font-medium text-sm'>
                            {company.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            {company.name}
                          </h4>
                          <p className='text-sm text-gray-500'>
                            {company.email}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            company.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {company.status === 'active'
                            ? 'Aktif'
                            : company.status}
                        </span>
                        {isAssigned ? (
                          <span className='px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            Atanmış
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAssignCompanies([company.id])}
                            disabled={assignLoading}
                            className='px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer'
                          >
                            {assignLoading ? 'İşleniyor...' : 'Ata'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Assigned Companies Summary */}
              {assignments.length > 0 && (
                <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>
                    Atanan Firmalar ({assignments.length})
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                    {assignments.map(assignment => (
                      <div
                        key={assignment.id}
                        className='flex items-center justify-between text-sm'
                      >
                        <span className='text-blue-800'>
                          {assignment.companies.name}
                        </span>
                        <span className='text-blue-600'>
                          {assignment.progress_percentage}% tamamlandı
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
