'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import FileUpload from '@/components/forms/FileUpload';
import MarkdownEditor from '@/components/forms/MarkdownEditor';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import { useAuthStore } from '@/lib/stores/auth-store';
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
      className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-blue-100 text-blue-900 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
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
      className={`w-full flex items-center pl-9 pr-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-blue-50 text-blue-800 font-medium'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
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
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  excerpt: string;
  category: string;
  author_id: string | null;
  published_at: string;
  status: string;
  image_url?: string;
  tags: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  reading_time: number;
  difficulty_level: string;
  is_featured: boolean;
  video_url?: string;
  podcast_url?: string;
  expert_author_id?: string;
  seo_keywords?: string;
  source_url?: string;
  news_experts?: {
    id: string;
    name: string;
    title: string;
  };
}
const NewsCard = ({
  article,
  onEdit,
  onDelete,
  onPublish,
}: {
  article: NewsArticle;
  onEdit: (article: NewsArticle) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'İhracat':
        return 'bg-blue-100 text-blue-800';
      case 'Ekonomi':
        return 'bg-green-100 text-green-800';
      case 'Teknoloji':
        return 'bg-purple-100 text-purple-800';
      case 'Eğitim':
        return 'bg-orange-100 text-orange-800';
      case 'Etkinlik':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Yayınlandı';
      case 'draft':
        return 'Taslak';
      case 'pending':
        return 'İnceleme Bekliyor';
      default:
        return status;
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
          <div className='absolute right-0 top-10 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-10 min-w-32'>
            <button
              onClick={() => {
                onEdit(article);
                setShowActions(false);
              }}
              className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
            >
              <i className='ri-edit-line text-blue-600'></i>
              Düzenle
            </button>
            {article.status !== 'published' && (
              <button
                onClick={() => {
                  onPublish(article.id);
                  setShowActions(false);
                }}
                className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
              >
                <i className='ri-send-plane-line text-green-600'></i>
                Yayınla
              </button>
            )}
            <button
              onClick={() => {
                onDelete(article.id);
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
      {/* Article Info */}
      <div className='mb-4'>
        <div className='flex items-start gap-2 mb-3'>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}
          >
            {article.category}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}
          >
            {getStatusText(article.status)}
          </span>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2 pr-8'>
          {article.title}
        </h3>
        <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
          {article.excerpt || article.summary}
        </p>
      </div>
      {/* Stats */}
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='text-center bg-blue-50 rounded-lg p-3'>
          <div className='text-2xl font-bold text-blue-900'>
            {article.view_count}
          </div>
          <div className='text-xs text-blue-600 font-medium'>Görüntüleme</div>
        </div>
        <div className='text-center bg-green-50 rounded-lg p-3'>
          <div className='text-2xl font-bold text-green-900'>
            {article.tags.length}
          </div>
          <div className='text-xs text-green-600 font-medium'>Etiket</div>
        </div>
      </div>
      {/* Meta Info */}
      <div className='text-xs text-gray-500 mb-4'>
        <div>Yazar: {article.news_experts?.name || 'Sistem'}</div>
        <div>
          Tarih: {new Date(article.published_at).toLocaleDateString('tr-TR')}
        </div>
      </div>
      {/* Tags */}
      {article.tags.length > 0 && (
        <div className='flex flex-wrap gap-1 mb-4'>
          {article.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'>
              +{article.tags.length - 3} daha
            </span>
          )}
        </div>
      )}
      {/* Action Button */}
      <button
        onClick={() => onEdit(article)}
        className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap'
      >
        Haberi Düzenle
      </button>
    </div>
  );
};
export default function NewsManagement() {
  const { user, isAdmin } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('news');
  const [educationExpanded, setEducationExpanded] = useState(false);
  const [projeExpanded, setProjeExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(
    null
  );
  const [createFormData, setCreateFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    summary: '',
    category: '',
    tags: [] as string[],
    image_url: '',
    video_url: '',
    podcast_url: '',
    reading_time: 5,
    difficulty_level: 'Başlangıç',
    expert_author_id: '',
    is_featured: false,
    seo_keywords: '',
    source_url: '',
    status: 'draft',
  });
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  // API calls
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news', {
        headers: {
          'X-User-Email': user?.email || 'admin@akademiport.com',
        },
      });
      const data = await response.json();
      if (data.success) {
        setArticles(data.data.news);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    // Admin sayfasında otomatik olarak admin kullanıcısı olarak giriş yap
    if (!user) {
      // login('admin@ihracatakademi.com', 'admin');
    }
    fetchNews();
    fetchCategories();
    fetchExperts();
  }, [user, fetchNews]);
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/news/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
      }
    } catch (error) {}
  };
  const fetchExperts = async () => {
    try {
      const response = await fetch('/api/news/experts');
      const data = await response.json();
      if (data.success) {
        setExperts(data.data);
      }
    } catch (error) {}
  };
  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesCategory =
      !selectedCategory || article.category === selectedCategory;
    const matchesStatus = !selectedStatus || article.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });
  const handleEditArticle = (article: NewsArticle) => {
    setEditingArticle(article);
    setCreateFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      summary: article.summary || '',
      category: article.category || '',
      tags: article.tags || [],
      image_url: article.image_url || '',
      video_url: article.video_url || '',
      podcast_url: article.podcast_url || '',
      reading_time: article.reading_time || 5,
      difficulty_level: article.difficulty_level || 'Başlangıç',
      expert_author_id: article.expert_author_id || '',
      is_featured: article.is_featured || false,
      seo_keywords: article.seo_keywords || '',
      source_url: article.source_url || '',
      status: article.status || 'draft',
    });
    setShowCreateForm(true);
  };
  const handleDeleteArticle = async (id: string) => {
    if (confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/news/${id}`, {
          method: 'DELETE',
          headers: {
            'X-User-Email': user?.email || 'admin@akademiport.com',
          },
        });
        const data = await response.json();
        if (data.success) {
          setArticles(articles.filter(a => a.id !== id));
          alert('Haber başarıyla silindi!');
        } else {
          alert('Haber silinemedi: ' + data.error);
        }
      } catch (error) {
        alert('Haber silinirken bir hata oluştu.');
      }
    }
  };
  const handlePublishArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': user?.email || 'admin@akademiport.com',
        },
        body: JSON.stringify({
          status: 'published',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setArticles(
          articles.map(a =>
            a.id === id
              ? {
                  ...a,
                  status: 'published',
                  published_at: new Date().toISOString(),
                  is_published: true,
                }
              : a
          )
        );
        alert('Haber başarıyla yayınlandı!');
      } else {
        alert('Haber yayınlanamadı: ' + data.error);
      }
    } catch (error) {
      alert('Haber yayınlanırken bir hata oluştu.');
    }
  };
  const handleCreateArticle = async () => {
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': user?.email || 'admin@akademiport.com',
        },
        body: JSON.stringify(createFormData),
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateForm(false);
        setCreateFormData({
          title: '',
          content: '',
          excerpt: '',
          summary: '',
          category: '',
          tags: [],
          image_url: '',
          video_url: '',
          podcast_url: '',
          reading_time: 5,
          difficulty_level: 'Başlangıç',
          expert_author_id: '',
          is_featured: false,
          seo_keywords: '',
          source_url: '',
          status: 'draft',
        });
        fetchNews(); // Haberleri yeniden yükle
        alert('Haber başarıyla oluşturuldu!');
      } else {
        alert('Haber oluşturulamadı: ' + data.error);
      }
    } catch (error) {
      alert('Haber oluşturulurken bir hata oluştu.');
    }
  };
  const handleUpdateArticle = async () => {
    if (!editingArticle) return;
    try {
      const response = await fetch(`/api/news/${editingArticle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': user?.email || 'admin@akademiport.com',
        },
        body: JSON.stringify(createFormData),
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateForm(false);
        setEditingArticle(null);
        setCreateFormData({
          title: '',
          content: '',
          excerpt: '',
          summary: '',
          category: '',
          tags: [],
          image_url: '',
          video_url: '',
          podcast_url: '',
          reading_time: 5,
          difficulty_level: 'Başlangıç',
          expert_author_id: '',
          is_featured: false,
          seo_keywords: '',
          source_url: '',
          status: 'draft',
        });
        fetchNews(); // Haberleri yeniden yükle
        alert('Haber başarıyla güncellendi!');
      } else {
        alert('Haber güncellenemedi: ' + data.error);
      }
    } catch (error) {
      alert('Haber güncellenirken bir hata oluştu.');
    }
  };
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedStatus('');
    setSearchQuery('');
  };
  const notifications = [
    {
      id: 1,
      type: 'info',
      message: '2 yeni haber onay bekliyor',
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
                  <span className="font-['Pacifico'] text-xl text-blue-900 leading-tight">
                    Akademi Port
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
                  Haber Yönetimi
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
                              className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'info'
                                  ? 'bg-blue-500'
                                  : notification.type === 'warning'
                                    ? 'bg-yellow-500'
                                    : notification.type === 'success'
                                      ? 'bg-green-500'
                                      : 'bg-red-500'
                              }`}
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
                        admin@akademiport.com
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
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Kariyer Portalı */}
            <MenuItem
              icon='ri-briefcase-line'
              title='Kariyer Portalı'
              isActive={activeMenuItem === 'career'}
              onClick={() => setActiveMenuItem('career')}
              href='/admin/kariyer-portali'
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
          {/* Page Header */}
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Haber Yönetimi
              </h2>
              <p className='text-gray-600'>
                Haber içeriklerini oluşturun ve yönetin
              </p>
            </div>
            <button
              onClick={() => {
                setEditingArticle(null);
                setShowCreateForm(true);
              }}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap'
            >
              <i className='ri-add-line'></i>
              Yeni Haber Ekle
            </button>
          </div>
          {/* Filters */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Filtreler</h3>
              <button
                onClick={clearFilters}
                className='text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer'
              >
                Filtreleri Temizle
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                >
                  <option value=''>Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                  <option value='published'>Yayınlandı</option>
                  <option value='draft'>Taslak</option>
                  <option value='pending'>İnceleme Bekliyor</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Haber Ara
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                    <i className='ri-search-line text-gray-400 text-sm'></i>
                  </div>
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder='Haber başlığı ara...'
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                  />
                </div>
              </div>
            </div>
            <div className='text-sm text-gray-600'>
              <span className='font-medium'>{filteredArticles.length}</span>{' '}
              haber bulundu
            </div>
          </div>
          {/* Articles Grid */}
          {loading ? (
            <div className='text-center py-12'>
              <div className='animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'></div>
              <p className='text-gray-500'>Haberler yükleniyor...</p>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredArticles.map(article => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onEdit={handleEditArticle}
                  onDelete={handleDeleteArticle}
                  onPublish={handlePublishArticle}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type='no-news'
              size='lg'
              variant='elevated'
              description='İlk haberinizi oluşturmak için başlayın'
              action={{
                label: 'Haber Ekle',
                onClick: () => {
                  setEditingArticle(null);
                  setShowCreateForm(true);
                },
                variant: 'primary',
              }}
            />
          )}
        </div>
      </div>
      {/* Haber Oluşturma/Düzenleme Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingArticle(null);
          setCreateFormData({
            title: '',
            content: '',
            excerpt: '',
            summary: '',
            category: '',
            tags: [],
            image_url: '',
            video_url: '',
            podcast_url: '',
            reading_time: 5,
            difficulty_level: 'Başlangıç',
            expert_author_id: '',
            is_featured: false,
            seo_keywords: '',
            source_url: '',
            status: 'draft',
          });
        }}
        title={editingArticle ? 'Haber Düzenle' : 'Yeni Haber Oluştur'}
        size='xl'
      >
        <div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Sol Kolon */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Başlık *
                </label>
                <input
                  type='text'
                  value={createFormData.title}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      title: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Haber başlığı...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Özet
                </label>
                <textarea
                  value={createFormData.excerpt}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      excerpt: e.target.value,
                    })
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Haber özeti...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kategori
                </label>
                <select
                  value={createFormData.category}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      category: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Kategori Seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Uzman Yazar
                </label>
                <select
                  value={createFormData.expert_author_id}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      expert_author_id: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Uzman Seçin</option>
                  {experts.map(expert => (
                    <option key={expert.id} value={expert.id}>
                      {expert.name} - {expert.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Zorluk Seviyesi
                </label>
                <select
                  value={createFormData.difficulty_level}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      difficulty_level: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='Başlangıç'>Başlangıç</option>
                  <option value='Orta'>Orta</option>
                  <option value='İleri'>İleri</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Okuma Süresi (dakika)
                </label>
                <input
                  type='number'
                  value={createFormData.reading_time}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      reading_time: parseInt(e.target.value),
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  min='1'
                  max='60'
                />
              </div>
            </div>
            {/* Sağ Kolon */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Durum
                </label>
                <select
                  value={createFormData.status}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      status: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='draft'>Taslak</option>
                  <option value='pending'>İnceleme Bekliyor</option>
                  <option value='published'>Yayınlandı</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Resim
                </label>
                <FileUpload
                  type='image'
                  onUploadSuccess={(file: any) =>
                    setCreateFormData({
                      ...createFormData,
                      image_url: file.file_url,
                    })
                  }
                  onUploadError={(error: any) => alert(error)}
                  className='mb-2'
                />
                <input
                  type='url'
                  value={createFormData.image_url}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      image_url: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder="Veya resim URL'si girin..."
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Video
                </label>
                <FileUpload
                  type='document'
                  onUploadSuccess={(file: any) =>
                    setCreateFormData({
                      ...createFormData,
                      video_url: file.file_url,
                    })
                  }
                  onUploadError={(error: any) => alert(error)}
                  className='mb-2'
                />
                <input
                  type='url'
                  value={createFormData.video_url}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      video_url: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder="Veya video URL'si girin..."
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Podcast URL
                </label>
                <input
                  type='url'
                  value={createFormData.podcast_url}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      podcast_url: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='https://spotify.com/episode/...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kaynak URL
                </label>
                <input
                  type='url'
                  value={createFormData.source_url}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      source_url: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='https://example.com/source'
                />
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='is_featured'
                  checked={createFormData.is_featured}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      is_featured: e.target.checked,
                    })
                  }
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label
                  htmlFor='is_featured'
                  className='ml-2 block text-sm text-gray-900'
                >
                  Öne Çıkan Haber
                </label>
              </div>
            </div>
          </div>
          {/* İçerik Alanı */}
          <div className='mt-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              İçerik *
            </label>
            <MarkdownEditor
              value={createFormData.content}
              onChange={value =>
                setCreateFormData({ ...createFormData, content: value })
              }
              placeholder='Haber içeriği... (Markdown formatında yazabilirsiniz)'
              rows={10}
            />
          </div>
          {/* Etiketler */}
          <div className='mt-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Etiketler (virgülle ayırın)
            </label>
            <input
              type='text'
              value={createFormData.tags.join(', ')}
              onChange={e =>
                setCreateFormData({
                  ...createFormData,
                  tags: e.target.value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag),
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='e-ticaret, ihracat, pazaryeri'
            />
          </div>
          {/* SEO Anahtar Kelimeler */}
          <div className='mt-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              SEO Anahtar Kelimeler (virgülle ayırın)
            </label>
            <input
              type='text'
              value={createFormData.seo_keywords}
              onChange={e =>
                setCreateFormData({
                  ...createFormData,
                  seo_keywords: e.target.value,
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='e-ticaret, ihracat, pazaryeri, amazon'
            />
          </div>
        </div>
        <ModalFooter>
          <Button
            variant='secondary'
            onClick={() => {
              setShowCreateForm(false);
              setEditingArticle(null);
              setCreateFormData({
                title: '',
                content: '',
                excerpt: '',
                summary: '',
                category: '',
                tags: [],
                image_url: '',
                video_url: '',
                podcast_url: '',
                reading_time: 5,
                difficulty_level: 'Başlangıç',
                expert_author_id: '',
                is_featured: false,
                seo_keywords: '',
                source_url: '',
                status: 'draft',
              });
            }}
          >
            İptal
          </Button>
          <Button
            variant='primary'
            onClick={editingArticle ? handleUpdateArticle : handleCreateArticle}
          >
            {editingArticle ? 'Güncelle' : 'Oluştur'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
