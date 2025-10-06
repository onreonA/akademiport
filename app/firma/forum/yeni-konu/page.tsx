'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuthStore } from '@/lib/stores/auth-store';
interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  topic_count: number;
  created_at: string;
  updated_at: string;
}
export default function CreateTopicPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    tags: '',
  });
  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          '/api/forum/categories?is_active=true&sort_by=sort_order&order=asc'
        );
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        } else {
          setError('Kategoriler yüklenemedi');
        }
      } catch (error) {
        setError('Kategoriler yüklenirken hata oluştu');
      }
    };
    if (user) {
      fetchCategories();
    }
  }, [user]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userEmail = user?.email || '';
      if (!userEmail) {
        setError('Kullanıcı bilgisi bulunamadı');
        return;
      }
      // Önce kullanıcının company_id'sini bul
      const companyResponse = await fetch('/api/companies', {
        headers: {
          'X-User-Email': userEmail,
        },
      });
      if (!companyResponse.ok) {
        setError('Firma bilgisi alınamadı');
        return;
      }
      const companyData = await companyResponse.json();
      const userCompany = companyData.companies?.find(
        (c: any) => c.email === userEmail
      );
      if (!userCompany) {
        setError('Firma bulunamadı');
        return;
      }
      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category_id: formData.category_id,
          tags: formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0),
          author_id: user?.id || '',
          company_id: userCompany.id,
          status: 'active',
        }),
      });
      const result = await response.json();
      if (result.success) {
        router.push('/firma/forum');
      } else {
        setError(result.error || 'Konu oluşturulamadı');
      }
    } catch (error) {
      setError('Konu oluşturulurken hata oluştu');
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
  return (
    <FirmaLayout title='Yeni Konu' description="Forum'da yeni konu oluşturun">
      <div className='p-6'>
        <div className='max-w-4xl mx-auto'>
          {/* Page Header */}
          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  Yeni Konu Oluştur 💬
                </h1>
                <p className='text-gray-600'>
                  Deneyimlerinizi paylaşın veya sorularınızı sorun
                </p>
              </div>
              <Link href='/firma/forum'>
                <button className='text-gray-600 hover:text-gray-800 font-medium cursor-pointer'>
                  <i className='ri-arrow-left-line mr-2'></i>
                  Foruma Dön
                </button>
              </Link>
            </div>
          </div>
          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <i className='ri-error-warning-line text-red-500'></i>
                <span className='text-red-700 font-medium'>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className='ml-auto text-red-500 hover:text-red-700'
                >
                  <i className='ri-close-line'></i>
                </button>
              </div>
            </div>
          )}
          {/* Form */}
          <div className='bg-white rounded-xl border border-gray-200 p-8'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Title */}
              <div>
                <label
                  htmlFor='title'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Konu Başlığı *
                </label>
                <input
                  type='text'
                  id='title'
                  name='title'
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Konunuzun başlığını yazın...'
                />
              </div>
              {/* Category */}
              <div>
                <label
                  htmlFor='category_id'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Kategori *
                </label>
                <select
                  id='category_id'
                  name='category_id'
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Kategori seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Content */}
              <div>
                <label
                  htmlFor='content'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  İçerik *
                </label>
                <textarea
                  id='content'
                  name='content'
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={8}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Konunuzun detaylarını yazın...'
                />
              </div>
              {/* Tags */}
              <div>
                <label
                  htmlFor='tags'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Etiketler
                </label>
                <input
                  type='text'
                  id='tags'
                  name='tags'
                  value={formData.tags}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='etiket1, etiket2, etiket3 (virgülle ayırın)'
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Etiketler konunuzun daha kolay bulunmasını sağlar
                </p>
              </div>
              {/* Submit Button */}
              <div className='flex items-center justify-end gap-4 pt-6 border-t border-gray-200'>
                <Link href='/firma/forum'>
                  <button
                    type='button'
                    className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                  >
                    İptal
                  </button>
                </Link>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2'
                >
                  {loading ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <i className='ri-add-line'></i>
                      Konu Oluştur
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
