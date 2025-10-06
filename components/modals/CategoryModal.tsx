'use client';
import { useState, useEffect } from 'react';
interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<ForumCategory>) => Promise<boolean>;
  category?: ForumCategory | null;
  mode: 'create' | 'edit';
}
const iconOptions = [
  { value: 'ri-folder-line', label: '📁 Klasör' },
  { value: 'ri-chat-3-line', label: '💬 Sohbet' },
  { value: 'ri-store-3-line', label: '🏪 Mağaza' },
  { value: 'ri-graduation-cap-line', label: '🎓 Eğitim' },
  { value: 'ri-tools-line', label: '🔧 Araçlar' },
  { value: 'ri-feedback-line', label: '💭 Geri Bildirim' },
  { value: 'ri-question-line', label: '❓ Soru' },
  { value: 'ri-lightbulb-line', label: '💡 Fikir' },
  { value: 'ri-star-line', label: '⭐ Yıldız' },
  { value: 'ri-heart-line', label: '❤️ Kalp' },
  { value: 'ri-fire-line', label: '🔥 Ateş' },
  { value: 'ri-rocket-line', label: '🚀 Roket' },
];
const colorOptions = [
  { value: 'bg-blue-500', label: 'Mavi' },
  { value: 'bg-green-500', label: 'Yeşil' },
  { value: 'bg-red-500', label: 'Kırmızı' },
  { value: 'bg-yellow-500', label: 'Sarı' },
  { value: 'bg-purple-500', label: 'Mor' },
  { value: 'bg-pink-500', label: 'Pembe' },
  { value: 'bg-indigo-500', label: 'İndigo' },
  { value: 'bg-teal-500', label: 'Teal' },
  { value: 'bg-orange-500', label: 'Turuncu' },
  { value: 'bg-gray-500', label: 'Gri' },
];
const CategoryModal = ({
  isOpen,
  onClose,
  onSave,
  category,
  mode,
}: CategoryModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'ri-folder-line',
    color: 'bg-blue-500',
    sort_order: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon,
        color: category.color,
        sort_order: category.sort_order,
        is_active: category.is_active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'ri-folder-line',
        color: 'bg-blue-500',
        sort_order: 0,
        is_active: true,
      });
    }
    setErrors({});
  }, [category, mode, isOpen]);
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Kategori adı gerekli';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Kategori adı en az 3 karakter olmalı';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Kategori adı en fazla 50 karakter olabilir';
    }
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Açıklama en fazla 200 karakter olabilir';
    }
    if (formData.sort_order < 0) {
      newErrors.sort_order = 'Sıra numarası 0 veya daha büyük olmalı';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-900'>
              {mode === 'create' ? 'Yeni Kategori Oluştur' : 'Kategori Düzenle'}
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <i className='ri-close-line text-2xl'></i>
            </button>
          </div>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6'>
          {/* Name */}
          <div className='mb-6'>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Kategori Adı *
            </label>
            <input
              type='text'
              id='name'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder='Kategori adını girin...'
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={50}
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
            )}
            <p className='mt-1 text-sm text-gray-500'>
              {formData.name.length}/50 karakter
            </p>
          </div>
          {/* Description */}
          <div className='mb-6'>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Açıklama (İsteğe bağlı)
            </label>
            <textarea
              id='description'
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='Kategori açıklamasını girin...'
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={200}
            />
            {errors.description && (
              <p className='mt-1 text-sm text-red-600'>{errors.description}</p>
            )}
            <p className='mt-1 text-sm text-gray-500'>
              {formData.description.length}/200 karakter
            </p>
          </div>
          {/* Icon and Color */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            {/* Icon */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                İkon
              </label>
              <select
                value={formData.icon}
                onChange={e =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Color */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Renk
              </label>
              <div className='grid grid-cols-5 gap-2'>
                {colorOptions.map(option => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() =>
                      setFormData({ ...formData, color: option.value })
                    }
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === option.value
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${option.value}`}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Sort Order and Status */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            {/* Sort Order */}
            <div>
              <label
                htmlFor='sort_order'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Sıra Numarası
              </label>
              <input
                type='number'
                id='sort_order'
                value={formData.sort_order}
                onChange={e =>
                  setFormData({
                    ...formData,
                    sort_order: parseInt(e.target.value) || 0,
                  })
                }
                min='0'
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.sort_order ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.sort_order && (
                <p className='mt-1 text-sm text-red-600'>{errors.sort_order}</p>
              )}
            </div>
            {/* Status */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Durum
              </label>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='is_active'
                  checked={formData.is_active}
                  onChange={e =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <label
                  htmlFor='is_active'
                  className='ml-2 text-sm text-gray-700'
                >
                  Aktif
                </label>
              </div>
            </div>
          </div>
          {/* Preview */}
          <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>Önizleme</h4>
            <div className='flex items-center gap-3'>
              <div
                className={`w-8 h-8 ${formData.color} rounded-lg flex items-center justify-center`}
              >
                <i className={`${formData.icon} text-white text-sm`}></i>
              </div>
              <div>
                <span className='font-medium text-gray-900'>
                  {formData.name || 'Kategori Adı'}
                </span>
                {formData.description && (
                  <p className='text-sm text-gray-600'>
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className='flex items-center justify-end gap-3 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors'
            >
              İptal
            </button>
            <button
              type='submit'
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <i className='ri-save-line'></i>
                  {mode === 'create' ? 'Oluştur' : 'Güncelle'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CategoryModal;
