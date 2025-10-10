'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import CategoryModal from '@/components/modals/CategoryModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
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
interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  company_id: string;
  status: string;
  is_featured: boolean;
  is_solved: boolean;
  view_count: number;
  reply_count: number;
  like_count: number;
  last_reply_at: string;
  last_reply_by: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  forum_categories?: {
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  users?: {
    email: string;
    full_name: string;
  };
}
interface ForumReply {
  id: string;
  topic_id: string;
  author_id: string;
  company_id: string;
  content: string;
  is_solution: boolean;
  is_hidden: boolean;
  like_count: number;
  parent_reply_id: string;
  created_at: string;
  updated_at: string;
  users?: {
    email: string;
    full_name: string;
  };
}
// API fonksiyonları
const fetchCategories = async (): Promise<ForumCategory[]> => {
  try {
    const response = await fetch(
      '/api/forum/categories?sort_by=sort_order&order=asc'
    );
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
const fetchTopics = async (filters: any = {}): Promise<ForumTopic[]> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, (value as any).toString());
      }
    });
    const response = await fetch(`/api/forum/topics?${params.toString()}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
const fetchReplies = async (filters: any = {}): Promise<ForumReply[]> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, (value as any).toString());
      }
    });
    const response = await fetch(`/api/forum/replies?${params.toString()}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};
const updateTopicStatus = async (
  topicId: string,
  status: string
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/forum/topics/${topicId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    return false;
  }
};
const updateReplyStatus = async (
  replyId: string,
  isHidden: boolean
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/forum/replies/${replyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_hidden: isHidden }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    return false;
  }
};
const ForumManagementPage = () => {
  const [activeTab, setActiveTab] = useState('categories');
  // Data state
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  // UI state
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  // Modal state
  const [categoryModal, setCategoryModal] = useState({
    isOpen: false,
    mode: 'create' as 'create' | 'edit',
    category: null as ForumCategory | null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null as ForumCategory | null,
  });
  // Filters
  const [topicFilters, setTopicFilters] = useState({
    category_id: '',
    status: '',
    is_featured: '',
    is_solved: '',
  });
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesData, topicsData, repliesData] = await Promise.all([
          fetchCategories(),
          fetchTopics(),
          fetchReplies(),
        ]);
        setCategories(categoriesData);
        setTopics(topicsData);
        setReplies(repliesData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const handleTopicStatusChange = async (
    topicId: string,
    newStatus: string
  ) => {
    setUpdating(topicId);
    try {
      const success = await updateTopicStatus(topicId, newStatus);
      if (success) {
        // Konuları yeniden yükle
        const updatedTopics = await fetchTopics(topicFilters);
        setTopics(updatedTopics);
      }
    } catch (error) {
    } finally {
      setUpdating(null);
    }
  };
  const handleReplyVisibilityChange = async (
    replyId: string,
    isHidden: boolean
  ) => {
    setUpdating(replyId);
    try {
      const success = await updateReplyStatus(replyId, isHidden);
      if (success) {
        // Yanıtları yeniden yükle
        const updatedReplies = await fetchReplies();
        setReplies(updatedReplies);
      }
    } catch (error) {
    } finally {
      setUpdating(null);
    }
  };
  // Kategori işlemleri
  const handleCreateCategory = () => {
    setCategoryModal({
      isOpen: true,
      mode: 'create',
      category: null,
    });
  };
  const handleEditCategory = (category: ForumCategory) => {
    setCategoryModal({
      isOpen: true,
      mode: 'edit',
      category: category,
    });
  };
  const handleDeleteCategory = (category: ForumCategory) => {
    setDeleteModal({
      isOpen: true,
      category: category,
    });
  };
  const handleSaveCategory = async (
    categoryData: Partial<ForumCategory>
  ): Promise<boolean> => {
    try {
      const url =
        categoryModal.mode === 'create'
          ? '/api/forum/categories'
          : `/api/forum/categories/${categoryModal.category?.id}`;
      const method = categoryModal.mode === 'create' ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      const result = await response.json();
      if (result.success) {
        // Kategorileri yeniden yükle
        const updatedCategories = await fetchCategories();
        setCategories(updatedCategories);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };
  const handleConfirmDeleteCategory = async (): Promise<boolean> => {
    if (!deleteModal.category) return false;
    try {
      const response = await fetch(
        `/api/forum/categories/${deleteModal.category.id}`,
        {
          method: 'DELETE',
        }
      );
      const result = await response.json();
      if (result.success) {
        // Kategorileri yeniden yükle
        const updatedCategories = await fetchCategories();
        setCategories(updatedCategories);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Aktif' },
      pinned: { color: 'bg-blue-100 text-blue-800', text: 'Sabitlenmiş' },
      locked: { color: 'bg-red-100 text-red-800', text: 'Kilitli' },
      hidden: { color: 'bg-gray-100 text-gray-800', text: 'Gizli' },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Sayfa Yükleniyor
          </h3>
          <p className='text-gray-600'>
            Forum yönetimi verileri hazırlanıyor...
          </p>
        </div>
      </div>
    );
  }
  return (
    <AdminLayout title="Forum Yönetimi">
      {/* Main content */}
        <div className='max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'>
          {/* Page Header */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  Forum Yönetimi
                </h1>
                <p className='text-gray-600'>
                  Forum kategorilerini, konuları ve yanıtları yönetin.
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <Link href='/admin/forum-istatistikleri'>
                  <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'>
                    <i className='ri-bar-chart-line'></i>
                    İstatistikler
                  </button>
                </Link>
                <Link href='/firma/forum' target='_blank'>
                  <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'>
                    <i className='ri-external-link-line'></i>
                    Forumu Görüntüle
                  </button>
                </Link>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 mb-6'>
            <div className='border-b border-gray-200'>
              <nav className='flex space-x-8 px-6'>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'categories'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='ri-folder-line mr-2'></i>
                  Kategoriler ({categories.length})
                </button>
                <button
                  onClick={() => setActiveTab('topics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'topics'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='ri-chat-3-line mr-2'></i>
                  Konular ({topics.length})
                </button>
                <button
                  onClick={() => setActiveTab('replies')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'replies'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='ri-message-3-line mr-2'></i>
                  Yanıtlar ({replies.length})
                </button>
              </nav>
            </div>
            {/* Tab Content */}
            <div className='p-6'>
              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Forum Kategorileri
                    </h2>
                    <button
                      onClick={handleCreateCategory}
                      className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'
                    >
                      <i className='ri-add-line'></i>
                      Yeni Kategori
                    </button>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Kategori
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Açıklama
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Konu Sayısı
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Durum
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Sıra
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {categories.map(category => (
                          <tr key={category.id} className='hover:bg-gray-50'>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='flex items-center'>
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color} text-white mr-3`}
                                >
                                  <i className={`${category.icon} text-sm`}></i>
                                </div>
                                <div>
                                  <div className='text-sm font-medium text-gray-900'>
                                    {category.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4'>
                              <div className='text-sm text-gray-900 max-w-xs truncate'>
                                {category.description || 'Açıklama yok'}
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                {category.topic_count || 0}
                              </span>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  category.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {category.is_active ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {category.sort_order}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                              <div className='flex items-center gap-2'>
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className='text-blue-600 hover:text-blue-900'
                                >
                                  <i className='ri-edit-line'></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category)}
                                  className='text-red-600 hover:text-red-900'
                                >
                                  <i className='ri-delete-bin-line'></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Topics Tab */}
              {activeTab === 'topics' && (
                <div>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Forum Konuları
                    </h2>
                    <div className='flex items-center gap-3'>
                      {/* Filters */}
                      <select
                        value={topicFilters.category_id}
                        onChange={e =>
                          setTopicFilters({
                            ...topicFilters,
                            category_id: e.target.value,
                          })
                        }
                        className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      >
                        <option value=''>Tüm Kategoriler</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={topicFilters.status}
                        onChange={e =>
                          setTopicFilters({
                            ...topicFilters,
                            status: e.target.value,
                          })
                        }
                        className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      >
                        <option value=''>Tüm Durumlar</option>
                        <option value='active'>Aktif</option>
                        <option value='pinned'>Sabitlenmiş</option>
                        <option value='locked'>Kilitli</option>
                        <option value='hidden'>Gizli</option>
                      </select>
                    </div>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Konu
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Kategori
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Yazar
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            İstatistikler
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Durum
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Tarih
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {topics.map(topic => (
                          <tr key={topic.id} className='hover:bg-gray-50'>
                            <td className='px-6 py-4'>
                              <div className='flex items-start'>
                                <div className='flex-shrink-0'>
                                  {topic.is_featured && (
                                    <i className='ri-pushpin-line text-yellow-500 text-sm'></i>
                                  )}
                                  {topic.is_solved && (
                                    <i className='ri-check-line text-green-500 text-sm'></i>
                                  )}
                                </div>
                                <div className='ml-2'>
                                  <div className='text-sm font-medium text-gray-900 max-w-xs truncate'>
                                    {topic.title}
                                  </div>
                                  <div className='text-sm text-gray-500 max-w-xs truncate'>
                                    {topic.content.substring(0, 100)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              {topic.forum_categories && (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${topic.forum_categories.color} text-white`}
                                >
                                  {topic.forum_categories.name}
                                </span>
                              )}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm text-gray-900'>
                                {topic.users?.full_name || 'Anonim'}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {topic.users?.email}
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm text-gray-900'>
                                <div className='flex items-center gap-4'>
                                  <span className='flex items-center gap-1'>
                                    <i className='ri-message-3-line text-gray-400'></i>
                                    {topic.reply_count}
                                  </span>
                                  <span className='flex items-center gap-1'>
                                    <i className='ri-eye-line text-gray-400'></i>
                                    {topic.view_count}
                                  </span>
                                  <span className='flex items-center gap-1'>
                                    <i className='ri-heart-line text-gray-400'></i>
                                    {topic.like_count}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              {getStatusBadge(topic.status)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {getTimeAgo(topic.created_at)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                              <div className='flex items-center gap-2'>
                                <select
                                  value={topic.status}
                                  onChange={e =>
                                    handleTopicStatusChange(
                                      topic.id,
                                      e.target.value
                                    )
                                  }
                                  disabled={updating === topic.id}
                                  className='px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                >
                                  <option value='active'>Aktif</option>
                                  <option value='pinned'>Sabitle</option>
                                  <option value='locked'>Kilitle</option>
                                  <option value='hidden'>Gizle</option>
                                </select>
                                <Link
                                  href={`/firma/forum/${topic.id}`}
                                  target='_blank'
                                >
                                  <button className='text-blue-600 hover:text-blue-900'>
                                    <i className='ri-external-link-line'></i>
                                  </button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Replies Tab */}
              {activeTab === 'replies' && (
                <div>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Forum Yanıtları
                    </h2>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Yanıt
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Yazar
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Beğeni
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Durum
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Tarih
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {replies.map(reply => (
                          <tr key={reply.id} className='hover:bg-gray-50'>
                            <td className='px-6 py-4'>
                              <div className='flex items-start'>
                                <div className='flex-shrink-0'>
                                  {reply.is_solution && (
                                    <i className='ri-check-line text-green-500 text-sm'></i>
                                  )}
                                </div>
                                <div className='ml-2'>
                                  <div className='text-sm text-gray-900 max-w-xs truncate'>
                                    {reply.content.substring(0, 150)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm text-gray-900'>
                                {reply.users?.full_name || 'Anonim'}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {reply.users?.email}
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800'>
                                {reply.like_count}
                              </span>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  reply.is_hidden
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {reply.is_hidden ? 'Gizli' : 'Görünür'}
                              </span>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {getTimeAgo(reply.created_at)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                              <div className='flex items-center gap-2'>
                                <button
                                  onClick={() =>
                                    handleReplyVisibilityChange(
                                      reply.id,
                                      !reply.is_hidden
                                    )
                                  }
                                  disabled={updating === reply.id}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                    reply.is_hidden
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                >
                                  {updating === reply.id ? (
                                    <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-current'></div>
                                  ) : reply.is_hidden ? (
                                    'Göster'
                                  ) : (
                                    'Gizle'
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      {/* Modals */}
      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={() =>
          setCategoryModal({ isOpen: false, mode: 'create', category: null })
        }
        onSave={handleSaveCategory}
        category={categoryModal.category}
        mode={categoryModal.mode}
      />
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={handleConfirmDeleteCategory}
        title='Kategori Sil'
        message={`"${deleteModal.category?.name}" kategorisini silmek istediğinizden emin misiniz?`}
        itemName={deleteModal.category?.name || ''}
      />
    </AdminLayout>
  );
};
export default ForumManagementPage;
