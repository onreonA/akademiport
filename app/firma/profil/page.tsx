'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';
interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
  sector: string;
  city: string;
  authorized_person: string;
  created_at: string;
  updated_at: string;
}
export default function ProfilPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: '',
    sector: '',
    city: '',
    authorized_person: '',
  });
  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/firma/me');
      const result = await response.json();
      if (response.ok && result.company) {
        setCompany(result.company);
        setFormData({
          name: result.company.name || '',
          email: result.company.email || '',
          phone: result.company.phone || '',
          website: result.company.website || '',
          address: result.company.address || '',
          description: result.company.description || '',
          sector: result.company.sector || '',
          city: result.company.city || '',
          authorized_person: result.company.authorized_person || '',
        });
      } else {
        setError(result.error || 'Firma bilgileri yüklenirken hata oluştu');
      }
    } catch (error) {
      setError('Firma bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/companies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: company?.id,
          ...formData,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setCompany(result.company);
        setIsEditing(false);
        alert('Firma bilgileri başarıyla güncellendi');
      } else {
        setError(result.error || 'Firma bilgileri güncellenirken hata oluştu');
      }
    } catch (error) {
      setError('Firma bilgileri güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    if (company) {
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        address: company.address || '',
        description: company.description || '',
        sector: company.sector || '',
        city: company.city || '',
        authorized_person: company.authorized_person || '',
      });
    }
    setIsEditing(false);
  };
  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='mt-4 text-gray-600'>Firma bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (error && !company) {
    return (
      <div className='p-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='text-red-600 text-6xl mb-4'>⚠️</div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Hata</h2>
            <p className='text-gray-600 mb-4'>{error}</p>
            <button
              onClick={() => router.push('/giris')}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'
            >
              Giriş Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!company) {
    return (
      <div className='p-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='text-gray-400 text-6xl mb-4'>🏢</div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Firma Bulunamadı
            </h2>
            <p className='text-gray-600 mb-4'>Firma bilgileriniz bulunamadı.</p>
            <button
              onClick={() => router.push('/giris')}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'
            >
              Giriş Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Profil Yönetimi</h1>
          <p className='text-gray-600'>
            Firma bilgilerinizi görüntüleyin ve düzenleyin
          </p>
        </div>
        <div className='flex space-x-3'>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50'
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                onClick={handleCancel}
                className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400'
              >
                İptal
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            >
              Düzenle
            </button>
          )}
        </div>
      </div>
      {/* Error Message */}
      {error && (
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
      )}
      {/* Company Information */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-6'>
          Firma Bilgileri
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Firma Adı
            </label>
            {isEditing ? (
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            ) : (
              <p className='text-gray-900'>{company.name}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              E-posta
            </label>
            {isEditing ? (
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            ) : (
              <p className='text-gray-900'>{company.email}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Telefon
            </label>
            {isEditing ? (
              <input
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            ) : (
              <p className='text-gray-900'>
                {company.phone || 'Belirtilmemiş'}
              </p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Website
            </label>
            {isEditing ? (
              <input
                type='url'
                name='website'
                value={formData.website}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            ) : (
              <p className='text-gray-900'>
                {company.website || 'Belirtilmemiş'}
              </p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Sektör
            </label>
            {isEditing ? (
              <select
                name='sector'
                value={formData.sector}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Sektör Seçin</option>
                <option value='teknoloji'>Teknoloji</option>
                <option value='imalat'>İmalat</option>
                <option value='hizmet'>Hizmet</option>
                <option value='ticaret'>Ticaret</option>
                <option value='tarim'>Tarım</option>
                <option value='turizm'>Turizm</option>
                <option value='egitim'>Eğitim</option>
                <option value='saglik'>Sağlık</option>
                <option value='finans'>Finans</option>
                <option value='diger'>Diğer</option>
              </select>
            ) : (
              <p className='text-gray-900'>
                {company.sector || 'Belirtilmemiş'}
              </p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Şehir
            </label>
            {isEditing ? (
              <input
                type='text'
                name='city'
                value={formData.city}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            ) : (
              <p className='text-gray-900'>{company.city || 'Belirtilmemiş'}</p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Yetkili Kişi
            </label>
            {isEditing ? (
              <input
                type='text'
                name='authorized_person'
                value={formData.authorized_person}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            ) : (
              <p className='text-gray-900'>
                {company.authorized_person || 'Belirtilmemiş'}
              </p>
            )}
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Adres
            </label>
            {isEditing ? (
              <textarea
                name='address'
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            ) : (
              <p className='text-gray-900'>
                {company.address || 'Belirtilmemiş'}
              </p>
            )}
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Açıklama
            </label>
            {isEditing ? (
              <textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Firma hakkında kısa bir açıklama yazın...'
              />
            ) : (
              <p className='text-gray-900'>
                {company.description || 'Açıklama eklenmemiş'}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Account Information */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-6'>
          Hesap Bilgileri
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Hesap Oluşturulma Tarihi
            </label>
            <p className='text-gray-900'>
              {new Date(company.created_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Son Güncelleme
            </label>
            <p className='text-gray-900'>
              {new Date(company.updated_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
      {/* Security Settings */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-6'>
          Güvenlik Ayarları
        </h2>
        <div className='space-y-4'>
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
            <div>
              <h3 className='font-medium text-gray-900'>Şifre Değiştir</h3>
              <p className='text-sm text-gray-600'>
                Hesap şifrenizi güncelleyin
              </p>
            </div>
            <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'>
              Değiştir
            </button>
          </div>
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
            <div>
              <h3 className='font-medium text-gray-900'>
                İki Faktörlü Doğrulama
              </h3>
              <p className='text-sm text-gray-600'>
                Hesap güvenliğinizi artırın
              </p>
            </div>
            <button className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400'>
              Aktif Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
