'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
interface Document {
  id: string;
  title: string;
  description?: string;
  set_id: string;
  category_id?: string;
  file_type: string;
  file_size: number;
  file_url: string;
  storage_path?: string;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  total_downloads: number;
  last_downloaded_at?: string;
  uploaded_by?: string;
  education_sets?: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  document_categories?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}
interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  order_index: number;
  status: string;
}
interface EducationSet {
  id: string;
  name: string;
  description: string;
  video_count: number;
}
export default function DocumentManagement() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('education-docs');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEducationSet, setSelectedEducationSet] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    set_id: '',
    status: 'Aktif',
    file: null as File | null,
  });
  const [educationSets, setEducationSets] = useState<EducationSet[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  useEffect(() => {
    fetchEducationSets();
    fetchDocuments();
    fetchCategories();
  }, []);
  const fetchEducationSets = async () => {
    try {
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
        setEducationSets(
          result.data.map((set: any) => ({
            id: set.id,
            name: set.name,
            description: set.description,
            video_count: set.video_count || 0,
          }))
        );
      } else {
        setError(result.error || 'Bilinmeyen hata');
      }
    } catch (err) {
      setError('Eğitim setleri yüklenirken hata oluştu');
    }
  };
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (!response.ok) {
        throw new Error('Dökümanlar getirilemedi');
      }
      const result = await response.json();
      if (result.success) {
        setDocuments(result.data);
      } else {
        setError(result.error || 'Bilinmeyen hata');
      }
    } catch (err) {
      setError('Dökümanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/document-categories', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (!response.ok) {
        throw new Error('Kategoriler getirilemedi');
      }
      const result = await response.json();
      if (result.success) {
        setCategories(result.data || []);
      } else {
      }
    } catch (err) {}
  };
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory =
      selectedCategory === 'all' ||
      !selectedCategory ||
      doc.document_categories?.id === selectedCategory;
    const matchesEducationSet =
      !selectedEducationSet || doc.set_id === selectedEducationSet;
    const matchesFileType =
      !selectedFileType || doc.file_type.toUpperCase() === selectedFileType;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return (
      matchesCategory &&
      matchesEducationSet &&
      matchesFileType &&
      matchesStatus &&
      matchesSearch
    );
  });
  const handleCreateDocument = async () => {
    if (!formData.file || !formData.set_id || !formData.title) {
      alert('Lütfen gerekli alanları doldurun');
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.file);
      formDataToSend.append('set_id', formData.set_id);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('order_index', '0');
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
        body: formDataToSend,
      });
      if (!response.ok) {
        throw new Error('Döküman yüklenemedi');
      }
      const result = await response.json();
      if (result.success) {
        fetchDocuments();
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          set_id: '',
          status: 'Aktif',
          file: null,
        });
        alert('Döküman başarıyla yüklendi');
      } else {
        alert(result.error || 'Döküman yüklenirken hata oluştu');
      }
    } catch (error) {
      alert('Döküman yüklenirken hata oluştu');
    }
  };
  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setFormData({
      title: doc.title,
      description: doc.description || '',
      set_id: doc.set_id,
      status: doc.status,
      file: null,
    });
    setShowCreateForm(true);
  };
  const handleDeleteDocument = async (id: string) => {
    if (confirm('Bu dökümanı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/documents?id=${id}`, {
          method: 'DELETE',
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        });
        if (!response.ok) {
          throw new Error('Döküman silinemedi');
        }
        const result = await response.json();
        if (result.success) {
          fetchDocuments();
          alert('Döküman başarıyla silindi');
        } else {
          alert(result.error || 'Döküman silinirken hata oluştu');
        }
      } catch (error) {
        alert('Döküman silinirken hata oluştu');
      }
    }
  };
  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDetailModal(true);
  };
  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedEducationSet('');
    setSelectedFileType('');
    setSelectedStatus('');
    setSearchQuery('');
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
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
                  Eğitim Dökümanları
                </span>
              </nav>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-20 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        <div className='px-4 sm:px-6 lg:px-8 py-8'>
          {/* Page Header */}
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Eğitim Dökümanları
              </h2>
              <p className='text-gray-600'>
                Eğitim materyallerini ve belgelerini yönetin
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Link
                href='/admin/egitim-yonetimi/dokumanlar/kategoriler'
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap'
              >
                <i className='ri-folder-line'></i>Kategoriler
              </Link>
              <Link
                href='/admin/egitim-yonetimi/dokumanlar/atama'
                className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap'
              >
                <i className='ri-user-add-line'></i>Firma Atama
              </Link>
              <button
                onClick={() => {
                  setEditingDocument(null);
                  setFormData({
                    title: '',
                    description: '',
                    set_id: '',
                    status: 'Aktif',
                    file: null,
                  });
                  setShowCreateForm(true);
                }}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap'
              >
                <i className='ri-add-line'></i>
                Yeni Döküman Ekle
              </button>
            </div>
          </div>
          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Filtreler
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='all'>Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Eğitim Seti
                </label>
                <select
                  value={selectedEducationSet}
                  onChange={e => setSelectedEducationSet(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Tüm Setler</option>
                  {educationSets.map(set => (
                    <option key={set.id} value={set.id}>
                      {set.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dosya Türü
                </label>
                <select
                  value={selectedFileType}
                  onChange={e => setSelectedFileType(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Tüm Türler</option>
                  <option value='PDF'>PDF</option>
                  <option value='DOCX'>DOCX</option>
                  <option value='PPTX'>PPTX</option>
                  <option value='XLSX'>XLSX</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Tüm Durumlar</option>
                  <option value='Aktif'>Aktif</option>
                  <option value='Pasif'>Pasif</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Arama
                </label>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Döküman adı ara...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div className='flex items-end'>
                <button
                  onClick={clearFilters}
                  className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </div>
          {/* Documents Grid */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            {loading ? (
              <div className='text-center py-12'>
                <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Dökümanlar yükleniyor...</p>
              </div>
            ) : error ? (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-error-warning-line text-red-600 text-2xl'></i>
                </div>
                <h3 className='text-lg font-medium text-red-900 mb-2'>
                  Hata Oluştu
                </h3>
                <p className='text-red-700 mb-6'>{error}</p>
                <button
                  onClick={fetchDocuments}
                  className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
                >
                  Tekrar Dene
                </button>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className='text-center py-12'>
                <i className='ri-file-text-line text-gray-400 text-4xl mb-4'></i>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Döküman bulunamadı
                </h3>
                <p className='text-gray-500 mb-6'>
                  Filtrelerinizi değiştirin veya yeni döküman ekleyin.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer'
                >
                  İlk Dökümanı Ekle
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {filteredDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200'
                  >
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-red-50'>
                          <i className='ri-file-pdf-line text-red-500 text-lg'></i>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-sm font-semibold text-gray-900 truncate'>
                            {doc.title}
                          </h3>
                          {doc.document_categories ? (
                            <span
                              className='px-2 py-1 rounded-full text-xs font-medium'
                              style={{
                                backgroundColor:
                                  doc.document_categories.color + '20',
                                color: doc.document_categories.color,
                              }}
                            >
                              {doc.document_categories.name}
                            </span>
                          ) : (
                            <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                              Kategorisiz
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {doc.description && (
                      <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
                        {doc.description}
                      </p>
                    )}
                    <div className='grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600'>
                      <div>
                        <div className='font-medium'>
                          {formatFileSize(doc.file_size)}
                        </div>
                        <div className='text-xs'>Dosya Boyutu</div>
                      </div>
                      <div>
                        <div className='font-medium'>
                          {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                        </div>
                        <div className='text-xs'>Yayın Tarihi</div>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Link
                        href={`/admin/egitim-yonetimi/dokumanlar/${doc.id}`}
                        className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm flex items-center justify-center'
                      >
                        Detay
                      </Link>
                      <button
                        onClick={() => handleEditDocument(doc)}
                        className='flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className='flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-sm'
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Create/Edit Document Modal */}
      {showCreateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-xl font-semibold text-gray-900'>
                {editingDocument ? 'Döküman Düzenle' : 'Yeni Döküman Ekle'}
              </h3>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleCreateDocument();
              }}
              className='p-6 space-y-6'
            >
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Döküman Başlığı <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Döküman hakkında kısa açıklama...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Eğitim Seti <span className='text-red-500'>*</span>
                </label>
                <select
                  value={formData.set_id}
                  onChange={e =>
                    setFormData({ ...formData, set_id: e.target.value })
                  }
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                >
                  <option value=''>Eğitim Seti Seçin</option>
                  {educationSets.map(set => (
                    <option key={set.id} value={set.id}>
                      {set.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dosya <span className='text-red-500'>*</span>
                </label>
                <input
                  type='file'
                  onChange={e =>
                    setFormData({
                      ...formData,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  accept='.pdf,.docx,.pptx,.xlsx'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Desteklenen formatlar: PDF, DOCX, PPTX, XLSX (Maksimum 50MB)
                </p>
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
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='Aktif'>Aktif</option>
                  <option value='Pasif'>Pasif</option>
                </select>
              </div>
              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowCreateForm(false)}
                  className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  İptal
                </button>
                <button
                  type='submit'
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  {editingDocument ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
