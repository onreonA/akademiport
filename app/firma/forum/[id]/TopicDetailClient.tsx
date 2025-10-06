'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
interface Reply {
  id: string;
  content: string;
  author: {
    name: string;
    company: string;
    avatar: string;
    isConsultant: boolean;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
}
interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    name: string;
    company: string;
    avatar: string;
  };
  createdAt: string;
  replies: Reply[];
  views: number;
  likes: number;
  isLiked: boolean;
  isPinned: boolean;
  isAnswered: boolean;
  tags: string[];
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}
const categories = [
  {
    id: 'marketplace',
    name: 'Pazaryeri Soruları',
    icon: 'ri-store-3-line',
    color: 'bg-blue-500',
  },
  {
    id: 'education',
    name: 'Eğitim İçerikleri',
    icon: 'ri-graduation-cap-line',
    color: 'bg-green-500',
  },
  {
    id: 'technical',
    name: 'Teknik Destek',
    icon: 'ri-tools-line',
    color: 'bg-orange-500',
  },
  {
    id: 'feedback',
    name: 'Yorum ve Geri Bildirim',
    icon: 'ri-feedback-line',
    color: 'bg-purple-500',
  },
  {
    id: 'general',
    name: 'Genel Konular',
    icon: 'ri-chat-3-line',
    color: 'bg-teal-500',
  },
];
const mockTopics: { [key: string]: ForumTopic } = {
  'topic-001': {
    id: 'topic-001',
    title: 'E-ihracat platformunda ürün fotoğrafları için öneriler',
    content:
      'Ürünlerimi e-ihracat platformuna yüklerken fotoğraf kalitesi konusunda zorlanıyorum. Hangi çözünürlük ve format kullanmalıyım? Ayrıca ürün çekimleri için özel bir düzenek kurmalı mıyım?\n\nŞu ana kadar denediğim formatlar:\n- JPG (300 DPI)\n- PNG (yüksek dosya boyutu problemi)\n- WebP (tarayıcı uyumluluk sorunu)\n\nHerhangi bir öneriniz var mı?',
    category: 'marketplace',
    author: {
      name: 'Mehmet Özkan',
      company: 'Özkan Tekstil Ltd.',
      avatar:
        'https://readdy.ai/api/search-image?query=Professional%20business%20man%20portrait%2C%20middle%20aged%2C%20friendly%20smile%2C%20modern%20business%20attire%2C%20clean%20background%20for%20forum%20avatar%20photo%2C%20realistic%20professional%20headshot&width=100&height=100&seq=forum-avatar-001&orientation=squarish',
    },
    createdAt: '2024-03-10T14:30:00Z',
    replies: [
      {
        id: 'reply-001',
        content:
          'JPG formatını kullanmanızı öneririm. 300 DPI kalitesinde ve dosya boyutu 500KB altında tutmaya çalışın. Ayrıca fotoğraflarda beyaz arka plan kullanmak daha profesyonel görünüyor.',
        author: {
          name: 'Dr. Ayşe Kılıç',
          company: 'İhracat Akademi',
          avatar:
            'https://readdy.ai/api/search-image?query=Professional%20consultant%20woman%2C%20expert%20advisor%2C%20modern%20office%20setting%2C%20confident%20smile%2C%20business%20attire%20for%20forum%20avatar%20photo%2C%20clean%20background&width=100&height=100&seq=consultant-avatar-001&orientation=squarish',
          isConsultant: true,
        },
        createdAt: '2024-03-10T15:45:00Z',
        likes: 8,
        isLiked: false,
      },
      {
        id: 'reply-002',
        content:
          'Ben de aynı problemi yaşadım. Lightbox kullanarak çekimler yaptım ve çok iyi sonuç aldım. Maliyeti de çok yüksek değil.',
        author: {
          name: 'Fatma Demir',
          company: 'Demir Gıda San. Tic.',
          avatar:
            'https://readdy.ai/api/search-image?query=Professional%20business%20woman%20portrait%2C%20confident%20smile%2C%20business%20casual%20attire%2C%20modern%20office%20background%20for%20forum%20avatar%2C%20clean%20professional%20headshot%20photo&width=100&height=100&seq=forum-avatar-002&orientation=squarish',
          isConsultant: false,
        },
        createdAt: '2024-03-11T09:20:00Z',
        likes: 3,
        isLiked: true,
      },
    ],
    views: 142,
    likes: 15,
    isLiked: false,
    isPinned: false,
    isAnswered: true,
    tags: ['e-ihracat', 'ürün-fotoğrafı', 'kalite'],
    attachments: [
      {
        id: 'att-001',
        name: 'ornek-urun-fotograflari.pdf',
        type: 'application/pdf',
        size: 2400000,
        url: '#',
      },
    ],
  },
  'topic-002': {
    id: 'topic-002',
    title: 'Dijital pazarlama eğitimi sonrası uygulama deneyimleri',
    content:
      'Geçen hafta tamamladığım dijital pazarlama eğitimini uygulamaya geçirmeye başladım. Özellikle Google Ads ve Facebook reklamları konusunda deneyimlerimi paylaşmak istiyorum.\n\nUyguladığım stratejiler:\n1. Hedef kitle analizi\n2. Reklamların A/B testleri\n3. Bütçe optimizasyonu\n\nİlk hafta sonuçları oldukça umut verici. Tıklama oranlarımda %40 artış var.',
    category: 'education',
    author: {
      name: 'Ayşe Demir',
      company: 'Demir Gıda San. Tic.',
      avatar:
        'https://readdy.ai/api/search-image?query=Professional%20business%20woman%20portrait%2C%20confident%20smile%2C%20business%20casual%20attire%2C%20modern%20office%20background%20for%20forum%20avatar%2C%20clean%20professional%20headshot%20photo&width=100&height=100&seq=forum-avatar-002&orientation=squarish',
    },
    createdAt: '2024-03-09T11:20:00Z',
    replies: [
      {
        id: 'reply-003',
        content:
          'Harika sonuçlar! Google Ads için hangi anahtar kelime stratejisini kullandınız? Ben de benzer bir sektördeyim.',
        author: {
          name: 'Ali Yılmaz',
          company: 'Yılmaz Tarım Ürünleri',
          avatar:
            'https://readdy.ai/api/search-image?query=Professional%20farmer%20entrepreneur%2C%20middle%20aged%20man%2C%20confident%20expression%2C%20agricultural%20business%20owner%20portrait%20for%20forum%20avatar&width=100&height=100&seq=forum-avatar-006&orientation=squarish',
          isConsultant: false,
        },
        createdAt: '2024-03-09T14:30:00Z',
        likes: 2,
        isLiked: false,
      },
    ],
    views: 89,
    likes: 12,
    isLiked: true,
    isPinned: true,
    isAnswered: false,
    tags: ['dijital-pazarlama', 'eğitim', 'deneyim'],
    attachments: [],
  },
};
interface TopicDetailClientProps {
  topicId: string;
}
const TopicDetailClient = ({ topicId }: TopicDetailClientProps) => {
  const router = useRouter();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    // Simüle edilen veri yükleme
    setTimeout(() => {
      const foundTopic = mockTopics[topicId];
      if (foundTopic) {
        setTopic(foundTopic);
        // Görüntüleme sayısını artır
        foundTopic.views += 1;
      }
      setLoading(false);
    }, 1000);
    // Saat güncellemesi
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [topicId]);
  const handleLikeTopic = () => {
    if (!topic) return;
    setTopic(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      };
    });
  };
  const handleLikeReply = (replyId: string) => {
    if (!topic) return;
    setTopic(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        replies: prev.replies.map(reply => {
          if (reply.id === replyId) {
            return {
              ...reply,
              isLiked: !reply.isLiked,
              likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
            };
          }
          return reply;
        }),
      };
    });
  };
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !topic) return;
    setIsSubmitting(true);
    // Simüle edilen API çağrısı
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newReplyObj: Reply = {
        id: `reply-${Date.now()}`,
        content: newReply,
        author: {
          name: 'Ahmet Yılmaz',
          company: 'Tekno Elektronik A.Ş.',
          avatar:
            'https://readdy.ai/api/search-image?query=Professional%20business%20man%20portrait%2C%20current%20user%20avatar%2C%20friendly%20expression%2C%20modern%20business%20attire%20for%20forum%20profile%20photo&width=100&height=100&seq=current-user-avatar&orientation=squarish',
          isConsultant: false,
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };
      setTopic(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          replies: [...prev.replies, newReplyObj],
        };
      });
      setNewReply('');
    } catch (error) {
    } finally {
      setIsSubmitting(false);
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
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };
  const notifications = [
    {
      id: 1,
      type: 'info',
      message: 'Konunuza yeni yanıt geldi',
      time: '10 dk önce',
      unread: true,
    },
    {
      id: 2,
      type: 'success',
      message: 'Yanıtınız beğenildi',
      time: '1 saat önce',
      unread: false,
    },
  ];
  const unreadNotifications = notifications.filter(n => n.unread).length;
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Konu Yükleniyor
          </h3>
          <p className='text-gray-600'>Konu detayları hazırlanıyor...</p>
        </div>
      </div>
    );
  }
  if (!topic) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <i className='ri-chat-delete-line text-red-600 text-2xl'></i>
          </div>
          <h3 className='text-xl font-bold text-gray-900 mb-4'>
            Konu Bulunamadı
          </h3>
          <p className='text-gray-600 mb-6'>
            Aradığınız forum konusu bulunamadı. Konu silinmiş veya taşınmış
            olabilir.
          </p>
          <Link href='/firma/forum'>
            <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap'>
              Forum&apos;a Dön
            </button>
          </Link>
        </div>
      </div>
    );
  }
  const categoryInfo = getCategoryInfo(topic.category);
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
                <i className='ri-menu-line text-lg text-gray-600'></i>
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
                    Firma Paneli
                  </span>
                </div>
              </Link>
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                <Link
                  href='/firma'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Firma Paneli
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <Link
                  href='/firma/forum'
                  className='hover:text-blue-600 cursor-pointer'
                >
                  Forum
                </Link>
                <i className='ri-arrow-right-s-line mx-1'></i>
                <span className='text-gray-900 font-medium'>Konu Detayı</span>
              </nav>
            </div>
            <div className='flex items-center gap-3'>
              <div className='hidden lg:flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg'>
                <i className='ri-time-line text-gray-400 text-sm'></i>
                <span
                  className='text-sm text-gray-600 font-mono'
                  suppressHydrationWarning={true}
                >
                  {currentTime.toLocaleTimeString('tr-TR')}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Link href='/firma/egitimlerim/videolar'>
                  <button className='w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer'>
                    <i className='ri-graduation-cap-line text-lg'></i>
                  </button>
                </Link>
                <Link href='/firma/egitimlerim/dokumanlar'>
                  <button className='w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors cursor-pointer'>
                    <i className='ri-file-text-line text-lg'></i>
                  </button>
                </Link>
                <Link href='/firma/proje-yonetimi'>
                  <button className='w-9 h-9 flex items-center justify-center rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors cursor-pointer'>
                    <i className='ri-folder-line text-lg'></i>
                  </button>
                </Link>
              </div>
              <div className='w-px h-6 bg-gray-300'></div>
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
              </div>
              <div className='relative'>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
                >
                  <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-medium'>A</span>
                  </div>
                  <i className='ri-arrow-down-s-line text-gray-500 text-sm'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out fixed left-0 top-16 h-full z-30 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className='h-full overflow-y-auto'>
          <nav className='p-2 space-y-1'>
            <Link href='/firma'>
              <button className='w-full flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200'>
                <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
                  <i className='ri-dashboard-3-line text-lg'></i>
                </div>
                {!sidebarCollapsed && (
                  <span className='ml-3 truncate'>Ana Panel</span>
                )}
              </button>
            </Link>
            <Link href='/firma/egitimlerim/videolar'>
              <button className='w-full flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200'>
                <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
                  <i className='ri-graduation-cap-line text-lg'></i>
                </div>
                {!sidebarCollapsed && (
                  <span className='ml-3 truncate'>Eğitimlerim</span>
                )}
              </button>
            </Link>
            <Link href='/firma/proje-yonetimi'>
              <button className='w-full flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200'>
                <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
                  <i className='ri-folder-line text-lg'></i>
                </div>
                {!sidebarCollapsed && (
                  <span className='ml-3 truncate'>Proje Yönetimi</span>
                )}
              </button>
            </Link>
            <Link href='/firma/egitimlerim/dokumanlar'>
              <button className='w-full flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200'>
                <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
                  <i className='ri-file-text-line text-lg'></i>
                </div>
                {!sidebarCollapsed && (
                  <span className='ml-3 truncate'>Dökümanlarım</span>
                )}
              </button>
            </Link>
            <Link href='/firma/etkinlikler'>
              <button className='w-full flex items-center px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200'>
                <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
                  <i className='ri-calendar-event-line text-lg'></i>
                </div>
                {!sidebarCollapsed && (
                  <span className='ml-3 truncate'>Etkinlikler</span>
                )}
              </button>
            </Link>
            <Link href='/firma/forum'>
              <button className='w-full flex items-center px-3 py-3 rounded-lg bg-blue-100 text-blue-900 font-semibold transition-all duration-200'>
                <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
                  <i className='ri-chat-3-line text-lg'></i>
                </div>
                {!sidebarCollapsed && (
                  <span className='ml-3 truncate'>Forum</span>
                )}
              </button>
            </Link>
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-20 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        <div className='p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto'>
          {/* Back to Forum */}
          <div className='mb-6'>
            <Link href='/firma/forum'>
              <button className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'>
                <i className='ri-arrow-left-line'></i>
                Forum&apos;a Dön
              </button>
            </Link>
          </div>
          {/* Topic Header */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
            <div className='flex items-start gap-4'>
              <div className='w-16 h-16 rounded-full overflow-hidden flex-shrink-0'>
                <Image
                  src={topic.author.avatar}
                  alt={topic.author.name}
                  width={64}
                  height={64}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    {topic.isPinned && (
                      <span className='inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full'>
                        <i className='ri-pushpin-line text-sm'></i>
                        Sabitlenmiş
                      </span>
                    )}
                    {topic.isAnswered && (
                      <span className='inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full'>
                        <i className='ri-check-line text-sm'></i>
                        Yanıtlandı
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 ${categoryInfo.color} text-white text-sm font-medium rounded-full`}
                    >
                      <i className={`${categoryInfo.icon} text-sm`}></i>
                      {categoryInfo.name}
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>
                    {getTimeAgo(topic.createdAt)}
                  </span>
                </div>
                <h1 className='text-2xl font-bold text-gray-900 mb-3'>
                  {topic.title}
                </h1>
                <div className='flex items-center text-sm text-gray-600 mb-4'>
                  <span className='font-medium'>{topic.author.name}</span>
                  <span className='mx-2'>•</span>
                  <span>{topic.author.company}</span>
                  <span className='mx-2'>•</span>
                  <span className='flex items-center gap-1'>
                    <i className='ri-eye-line'></i>
                    {topic.views} görüntülenme
                  </span>
                </div>
                <div className='prose max-w-none text-gray-700 mb-4'>
                  <p className='whitespace-pre-wrap'>{topic.content}</p>
                </div>
                {/* Tags */}
                <div className='flex items-center gap-2 mb-4 flex-wrap'>
                  {topic.tags.map(tag => (
                    <span
                      key={tag}
                      className='inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full'
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                {/* Attachments */}
                {topic.attachments.length > 0 && (
                  <div className='border-t pt-4 mb-4'>
                    <h4 className='text-sm font-medium text-gray-700 mb-3'>
                      📎 Eklenen Dosyalar
                    </h4>
                    <div className='space-y-2'>
                      {topic.attachments.map(attachment => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          className='flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
                        >
                          <i className='ri-file-text-line text-gray-400 text-lg'></i>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-gray-900'>
                              {attachment.name}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {(attachment.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <i className='ri-download-line text-gray-400'></i>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {/* Actions */}
                <div className='flex items-center gap-4 border-t pt-4'>
                  <button
                    onClick={handleLikeTopic}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      topic.isLiked
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i
                      className={
                        topic.isLiked ? 'ri-heart-fill' : 'ri-heart-line'
                      }
                    ></i>
                    <span>{topic.likes}</span>
                  </button>
                  <button className='flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'>
                    <i className='ri-message-3-line'></i>
                    <span>{topic.replies.length} Yanıt</span>
                  </button>
                  <button className='flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'>
                    <i className='ri-share-line'></i>
                    Paylaş
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Replies */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 mb-6'>
            <div className='p-6 border-b border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-900'>
                💬 Yanıtlar ({topic.replies.length})
              </h3>
            </div>
            <div className='divide-y divide-gray-100'>
              {topic.replies.map(reply => (
                <div key={reply.id} className='p-6'>
                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 rounded-full overflow-hidden flex-shrink-0'>
                      <Image
                        src={reply.author.avatar}
                        alt={reply.author.name}
                        width={48}
                        height={48}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='font-medium text-gray-900'>
                          {reply.author.name}
                        </span>
                        {reply.author.isConsultant && (
                          <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full'>
                            <i className='ri-star-fill text-xs'></i>
                            Danışman Yanıtı
                          </span>
                        )}
                        <span className='text-sm text-gray-500'>
                          • {reply.author.company}
                        </span>
                        <span className='text-sm text-gray-500'>
                          • {getTimeAgo(reply.createdAt)}
                        </span>
                      </div>
                      <div className='prose max-w-none text-gray-700 mb-3'>
                        <p className='whitespace-pre-wrap'>{reply.content}</p>
                      </div>
                      <div className='flex items-center gap-3'>
                        <button
                          onClick={() => handleLikeReply(reply.id)}
                          className={`flex items-center gap-1 text-sm transition-colors cursor-pointer ${
                            reply.isLiked
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <i
                            className={
                              reply.isLiked ? 'ri-heart-fill' : 'ri-heart-line'
                            }
                          ></i>
                          {reply.likes > 0 && <span>{reply.likes}</span>}
                        </button>
                        <button className='text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer'>
                          <i className='ri-reply-line mr-1'></i>
                          Yanıtla
                        </button>
                        <button className='text-sm text-gray-500 hover:text-red-600 transition-colors cursor-pointer'>
                          <i className='ri-flag-line mr-1'></i>
                          Şikâyet Et
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Reply Form */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              ✍️ Yanıt Yazın
            </h3>
            <form onSubmit={handleSubmitReply}>
              <div className='mb-4'>
                <textarea
                  value={newReply}
                  onChange={e => setNewReply(e.target.value)}
                  placeholder='Yanıtınızı buraya yazın...'
                  rows={6}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
                  maxLength={2000}
                />
                <p className='mt-2 text-sm text-gray-500'>
                  {newReply.length}/2000 karakter
                </p>
              </div>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-gray-600'>
                  <i className='ri-information-line mr-1'></i>
                  Saygılı ve yapıcı bir dil kullanın
                </div>
                <button
                  type='submit'
                  disabled={!newReply.trim() || isSubmitting}
                  className='px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2'
                >
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <i className='ri-send-plane-line'></i>
                      Yanıtı Gönder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TopicDetailClient;
