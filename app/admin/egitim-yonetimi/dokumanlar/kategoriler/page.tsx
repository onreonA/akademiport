'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  order_index: number;
  status: string;
}
export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'ri-folder-line',
    order_index: 0,
    status: 'active',
  });
  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/document-categories', {
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCategories(result.data || []);
        } else {
          setError(result.error || 'Kategoriler yüklenemedi');
        }
      } else {
        setError('Kategoriler yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      alert('Kategori adı gerekli');
      return;
    }
    try {
      const response = await fetch('/api/document-categories', {
        method: 'POST',
        headers: {
          'X-User-Email': 'admin@ihracatakademi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          color: '#3B82F6',
          icon: 'ri-folder-line',
          order_index: 0,
          status: 'active',
        });
        fetchCategories();
        alert('Kategori başarıyla oluşturuldu');
      } else {
        alert(result.error || 'Kategori oluşturulamadı');
      }
    } catch (err) {
      alert('Kategori oluşturulurken hata oluştu');
    }
  };
  const handleEditCategory = async (categoryId: string) => {
    // TODO: Implement edit functionality
    alert('Düzenleme özelliği yakında eklenecek');
  };
  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        'Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      )
    ) {
      return;
    }
    try {
      const response = await fetch(
        `/api/document-categories?id=${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            'X-User-Email': 'admin@ihracatakademi.com',
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        fetchCategories();
        alert('Kategori başarıyla silindi');
      } else {
        alert(result.error || 'Kategori silinemedi');
      }
    } catch (err) {
      alert('Kategori silinirken hata oluştu');
    }
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Kategoriler yükleniyor...</p>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <Link
                href='/admin/egitim-yonetimi/dokumanlar'
                className='flex items-center gap-2 text-gray-600 hover:text-blue-600'
              >
                <i className='ri-arrow-left-line'></i>
                <span>Geri Dön</span>
              </Link>
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/admin'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Ana Panel
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <Link
                  href='/admin/egitim-yonetimi/dokumanlar'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Dökümanlar
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>Kategoriler</span>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Döküman Kategorileri
              </h1>
              <p className='text-gray-600'>
                Döküman kategorilerini yönetin ve organize edin
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer'
            >
              <i className='ri-add-line'></i>
              Yeni Kategori
            </button>
          </div>
          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center gap-2'>
                <i className='ri-error-warning-line text-red-600'></i>
                <p className='text-red-800'>{error}</p>
              </div>
            </div>
          )}
          {/* Create Form */}
          {showCreateForm && (
            <div className='mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Yeni Kategori Oluştur
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Kategori Adı <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Kategori adını girin'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Renk
                  </label>
                  <input
                    type='color'
                    value={formData.color}
                    onChange={e =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className='w-full h-10 border border-gray-300 rounded-lg cursor-pointer'
                  />
                </div>
                <div className='md:col-span-2'>
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
                    placeholder='Kategori açıklaması (opsiyonel)'
                  />
                </div>
              </div>
              <div className='flex justify-end gap-3 mt-6'>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors'
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateCategory}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
                >
                  Oluştur
                </button>
              </div>
            </div>
          )}
          {/* Categories List */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>
              Mevcut Kategoriler
            </h3>
            {categories.length === 0 ? (
              <div className='text-center py-12'>
                <i className='ri-folder-line text-gray-400 text-4xl mb-4'></i>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Henüz kategori bulunmuyor
                </h3>
                <p className='text-gray-500'>
                  İlk kategoriyi oluşturmak için &quot;Yeni Kategori&quot;
                  butonuna tıklayın.
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {categories.map(category => (
                  <div
                    key={category.id}
                    className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-3'>
                        <div
                          className='w-10 h-10 rounded-lg flex items-center justify-center'
                          style={{
                            backgroundColor: category.color + '20',
                            color: category.color,
                          }}
                        >
                          <i className={`${category.icon} text-lg`}></i>
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-900'>
                            {category.name}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {category.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleEditCategory(category.id)}
                          className='text-blue-600 hover:text-blue-800 p-1'
                          title='Düzenle'
                        >
                          <i className='ri-edit-line'></i>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className='text-red-600 hover:text-red-800 p-1'
                          title='Sil'
                        >
                          <i className='ri-delete-bin-line'></i>
                        </button>
                      </div>
                    </div>
                    {category.description && (
                      <p className='text-sm text-gray-600 mb-3'>
                        {category.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
