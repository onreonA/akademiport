'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
import { useAuth } from '@/contexts/AuthContext';
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
const fetchTopic = async (id: string): Promise<ForumTopic | null> => {
  try {
    const response = await fetch(`/api/forum/topics/${id}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};
const fetchReplies = async (topicId: string): Promise<ForumReply[]> => {
  try {
    const response = await fetch(
      `/api/forum/replies?topic_id=${topicId}&sort_by=created_at&order=asc`
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
const createReply = async (
  topicId: string,
  content: string,
  authorId?: string,
  parentReplyId?: string
): Promise<ForumReply | null> => {
  try {
    // Eğer authorId yoksa, mevcut yanıtlardan birini kullan
    const fallbackAuthorId = authorId || 'cd9bf9ec-f2ef-4672-87e4-428fb1b5241e';

    const requestBody = {
      topic_id: topicId,
      author_id: fallbackAuthorId,
      content: content,
      parent_reply_id: parentReplyId || null,
    };

    const response = await fetch('/api/forum/replies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': 'info@mundo.com', // Firma kullanıcısı
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      console.error('API Error:', result.error);
      return null;
    }
  } catch (error) {
    console.error('createReply error:', error);
    return null;
  }
};
const toggleLike = async (replyId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/forum/likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: '9d99c302-4084-42ec-8c02-f6d5d3c0dc3e', // Test kullanıcısı
        reply_id: replyId,
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    return false;
  }
};
const ForumTopicDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const topicId = params.id as string;

  // Debug: Auth durumunu kontrol et (sadece bir kez)
  useEffect(() => {
    // Auth state tracking
  }, [user]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyToReply, setReplyToReply] = useState('');

  // Gerçek kullanıcı bilgisini al
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user', {
          headers: {
            'X-User-Email': 'info@mundo.com', // Firma kullanıcısı
          },
        });
        const result = await response.json();
        if (result.success) {
          setCurrentUserId(result.data.id);
        } else {
          console.error('Failed to get current user:', result.error);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
    
    // Sayfa yüklendiğinde form state'lerini temizle
    setNewReply('');
    setReplyToReply('');
    setReplyingTo(null);
    setShowReplyForm(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [topicData, repliesData] = await Promise.all([
          fetchTopic(topicId),
          fetchReplies(topicId),
        ]);
        setTopic(topicData);
        setReplies(repliesData);

        // Kullanıcı bilgilerini basit şekilde ayarla
        const newUserMap: Record<string, any> = {};
        repliesData.forEach(reply => {
          if (reply.author_id === '6fcc9e92-4169-4b06-9c2f-a8c6cc284d73') {
            newUserMap[reply.author_id] = {
              full_name: 'Mundo Yatak Mustafa Nebi Doğan',
              email: 'info@mundo.com',
            };
          } else if (
            reply.author_id === 'cd9bf9ec-f2ef-4672-87e4-428fb1b5241e'
          ) {
            newUserMap[reply.author_id] = {
              full_name: 'Admin User',
              email: 'admin@akademiport.com',
            };
          } else {
            newUserMap[reply.author_id] = {
              full_name: 'Anonim',
              email: 'unknown@example.com',
            };
          }
        });
        setUserMap(newUserMap);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    if (topicId) {
      loadData();
    }
    // Clock update
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(clock);
    };
  }, [topicId]);
  const handleSubmitReply = async () => {
    if (!newReply.trim() || !topic) {
      return;
    }

    setSubmitting(true);
    try {
      // Önce currentUserId'yi kullan, yoksa user?.id'yi kullan, son olarak fallback
      const authorId = currentUserId || user?.id;

      const reply = await createReply(topic.id, newReply, authorId);

      if (reply) {
        setReplies([...replies, reply]);

        // Yeni yanıt için kullanıcı bilgisini ekle
        const newUserMap = { ...userMap };
        if (reply.author_id === '6fcc9e92-4169-4b06-9c2f-a8c6cc284d73') {
          newUserMap[reply.author_id] = {
            full_name: 'Mundo Yatak Mustafa Nebi Doğan',
            email: 'info@mundo.com',
          };
        } else if (reply.author_id === 'cd9bf9ec-f2ef-4672-87e4-428fb1b5241e') {
          newUserMap[reply.author_id] = {
            full_name: 'Admin User',
            email: 'admin@akademiport.com',
          };
        } else {
          newUserMap[reply.author_id] = {
            full_name: 'Anonim',
            email: 'unknown@example.com',
          };
        }
        setUserMap(newUserMap);

        setNewReply('');
        setShowReplyForm(false);
      } else {
        // Reply creation failed
      }
    } catch (error) {
      console.error('Yanıt gönderme hatası:', error);
    } finally {
      setSubmitting(false);
    }
  };
  const handleLike = async (replyId: string) => {
    const success = await toggleLike(replyId);
    if (success) {
      // Yanıtları yeniden yükle
      const updatedReplies = await fetchReplies(topicId);
      setReplies(updatedReplies);
    }
  };

  const handleReplyToReply = async (parentReplyId: string) => {
    if (!replyToReply.trim() || !topic || !currentUserId) {
      return;
    }

    setSubmitting(true);
    try {
      const reply = await createReply(topic.id, replyToReply, currentUserId, parentReplyId);
      if (reply) {
        // Yanıtları yeniden yükle
        const updatedReplies = await fetchReplies(topicId);
        setReplies(updatedReplies);

        // Kullanıcı bilgilerini güncelle
        const newUserMap = { ...userMap };
        if (reply.author_id === '6fcc9e92-4169-4b06-9c2f-a8c6cc284d73') {
          newUserMap[reply.author_id] = {
            full_name: 'Mundo Yatak Mustafa Nebi Doğan',
            email: 'info@mundo.com',
          };
        } else if (reply.author_id === 'cd9bf9ec-f2ef-4672-87e4-428fb1b5241e') {
          newUserMap[reply.author_id] = {
            full_name: 'Admin User',
            email: 'admin@akademiport.com',
          };
        } else {
          newUserMap[reply.author_id] = {
            full_name: 'Anonim',
            email: 'unknown@example.com',
          };
        }
        setUserMap(newUserMap);

        setReplyToReply('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Yanıt yanıtlama hatası:', error);
    } finally {
      setSubmitting(false);
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
  if (loading) {
    return (
      <FirmaLayout
        title='Forum Konusu'
        description='Forum konusu detaylarını görüntüleyin'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Konu Yükleniyor
            </h3>
            <p className='text-gray-600'>Konu detayları hazırlanıyor...</p>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  if (!topic) {
    return (
      <FirmaLayout
        title='Forum Konusu'
        description='Forum konusu detaylarını görüntüleyin'
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-error-warning-line text-red-600 text-2xl'></i>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Konu Bulunamadı
            </h3>
            <p className='text-gray-600 mb-4'>
              Aradığınız konu mevcut değil veya silinmiş olabilir.
            </p>
            <Link href='/firma/forum'>
              <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
                Foruma Dön
              </button>
            </Link>
          </div>
        </div>
      </FirmaLayout>
    );
  }
  return (
    <FirmaLayout
      title='Forum Konusu'
      description='Forum konusu detaylarını görüntüleyin'
    >
      <div className='max-w-5xl mx-auto space-y-4'>
        {/* Breadcrumb Navigation */}
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <Link
            href='/firma/forum'
            className='hover:text-blue-600 transition-colors'
          >
            <i className='ri-forum-line mr-1'></i>
            Forum
          </Link>
          <i className='ri-arrow-right-s-line text-gray-400'></i>
          <span className='text-gray-900 font-medium line-clamp-1'>
            {topic.title}
          </span>
        </div>

        {/* Compact Topic Header */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Header Bar */}
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-2 flex-wrap'>
                  {topic.is_featured && (
                    <span
                      className='inline-flex items-center justify-center w-7 h-7 bg-white/20 backdrop-blur-sm text-white rounded-lg'
                      title='Öne Çıkan'
                    >
                      <i className='ri-star-fill text-sm'></i>
                    </span>
                  )}
                  {topic.is_solved && (
                    <span
                      className='inline-flex items-center justify-center w-7 h-7 bg-white/20 backdrop-blur-sm text-white rounded-lg'
                      title='Çözüldü'
                    >
                      <i className='ri-check-line text-sm'></i>
                    </span>
                  )}
                  {topic.forum_categories && (
                    <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-lg'>
                      <i
                        className={`${topic.forum_categories.icon} text-sm`}
                      ></i>
                      {topic.forum_categories.name}
                    </span>
                  )}
                </div>
                <h1 className='text-xl font-bold text-white mb-2'>
                  {topic.title}
                </h1>
                <div className='flex items-center gap-4 text-sm text-blue-100'>
                  <span className='flex items-center gap-1'>
                    <i className='ri-user-line'></i>
                    {topic.users?.full_name || 'Anonim'}
                  </span>
                  <span className='flex items-center gap-1'>
                    <i className='ri-time-line'></i>
                    {getTimeAgo(topic.created_at)}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-3 text-white flex-shrink-0'>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>{topic.reply_count}</div>
                  <div className='text-xs text-blue-100'>Yanıt</div>
                </div>
                <div className='w-px h-10 bg-white/20'></div>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>{topic.view_count}</div>
                  <div className='text-xs text-blue-100'>Görüntüleme</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-6'>
            <div className='prose max-w-none mb-4'>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {topic.content}
              </p>
            </div>

            {/* Tags */}
            {topic.tags && topic.tags.length > 0 && (
              <div className='flex items-center gap-2 pt-4 border-t border-gray-100 flex-wrap'>
                <i className='ri-price-tag-3-line text-gray-400'></i>
                {topic.tags.map(tag => (
                  <span
                    key={tag}
                    className='inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Compact Replies Section */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Replies Header */}
          <div className='bg-gray-50 px-6 py-4 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center'>
                  <i className='ri-message-3-line text-white text-lg'></i>
                </div>
                <div>
                  <h2 className='text-lg font-bold text-gray-900'>Yanıtlar</h2>
                  <p className='text-sm text-gray-500'>
                    {replies.length} yanıt bulundu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className='px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                <i
                  className={showReplyForm ? 'ri-close-line' : 'ri-add-line'}
                ></i>
                {showReplyForm ? 'Kapat' : 'Yanıt Yaz'}
              </button>
            </div>
          </div>

          {/* Compact Reply Form */}
          {showReplyForm && (
            <div className='p-6 bg-blue-50 border-b border-blue-100'>
              <div className='bg-white rounded-xl p-4'>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3'>
                  <i className='ri-edit-line text-blue-600'></i>
                  Yanıtınızı yazın
                </label>
                <textarea
                  value={newReply}
                  onChange={e => setNewReply(e.target.value)}
                  placeholder='Düşüncelerinizi paylaşın...'
                  className='w-full h-28 px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-sm'
                />
                <div className='flex items-center justify-between mt-4'>
                  <span className='text-xs text-gray-500'>
                    <i className='ri-information-line mr-1'></i>
                    Lütfen saygılı bir dil kullanın
                  </span>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => {
                        setShowReplyForm(false);
                        setNewReply('');
                      }}
                      className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-lg hover:bg-gray-100'
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => {
                        handleSubmitReply();
                      }}
                      disabled={submitting || !newReply.trim()}
                      className='px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg disabled:shadow-none'
                    >
                      {submitting ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <i className='ri-send-plane-fill'></i>
                          Gönder
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Modern Replies List */}
          <div className='divide-y divide-gray-100'>
            {replies.length === 0 ? (
              <div className='p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-chat-quote-line text-blue-600 text-3xl'></i>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>
                  Henüz Yanıt Yok
                </h3>
                <p className='text-gray-600 mb-6 max-w-sm mx-auto'>
                  Tartışmayı başlatın ve toplulukla etkileşime geçin!
                </p>
                <button
                  onClick={() => setShowReplyForm(true)}
                  className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105'
                >
                  <i className='ri-chat-new-line'></i>
                  İlk Yanıtı Yaz
                </button>
              </div>
            ) : (
              replies
                .filter(reply => !reply.parent_reply_id) // Sadece ana yanıtları göster
                .map((reply, index) => {
                  const childReplies = replies.filter(child => child.parent_reply_id === reply.id);
                  return (
                <div
                  key={reply.id}
                  className='p-5 hover:bg-gray-50 transition-colors group'
                >
                  <div className='flex items-start gap-4'>
                    {/* Modern Avatar */}
                    <div className='relative flex-shrink-0'>
                      <div className='w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform'>
                        <span className='text-white text-base font-bold'>
                          {reply.users?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      {reply.is_solution && (
                        <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white'>
                          <i className='ri-check-line text-white text-xs'></i>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='font-semibold text-gray-900'>
                            {userMap[reply.author_id]?.full_name || 'Anonim'}
                          </span>
                          {reply.is_solution && (
                            <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md'>
                              <i className='ri-verified-badge-fill'></i>
                              Çözüm
                            </span>
                          )}
                          <span className='text-xs text-gray-500'>
                            • {getTimeAgo(reply.created_at)}
                          </span>
                        </div>
                        <span className='text-xs text-gray-400'>
                          #{index + 1}
                        </span>
                      </div>

                      <div className='prose max-w-none mb-3'>
                        <p className='text-gray-700 leading-relaxed whitespace-pre-wrap text-sm'>
                          {reply.content}
                        </p>
                      </div>

                      {/* Modern Actions */}
                      <div className='flex items-center gap-3'>
                        <button
                          onClick={() => handleLike(reply.id)}
                          className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-xs font-medium transition-all group/like'
                        >
                          <i className='ri-heart-line group-hover/like:ri-heart-fill'></i>
                          <span>{reply.like_count}</span>
                        </button>
                        <button
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === reply.id ? null : reply.id
                            )
                          }
                          className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg text-xs font-medium transition-all'
                        >
                          <i className='ri-reply-line'></i>
                          Yanıtla
                        </button>
                        <button className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-all'>
                          <i className='ri-share-line'></i>
                          Paylaş
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Yanıt Yanıtlama Formu */}
                  {replyingTo === reply.id && (
                    <div className='ml-16 mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100'>
                      <div className='bg-white rounded-lg p-4'>
                        <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3'>
                          <i className='ri-edit-line text-blue-600'></i>
                          {userMap[reply.author_id]?.full_name || 'Anonim'}{' '}
                          kullanıcısına yanıt
                        </label>
                        <textarea
                          value={replyToReply}
                          onChange={e => setReplyToReply(e.target.value)}
                          placeholder='Yanıtınızı yazın...'
                          className='w-full h-20 px-3 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-sm'
                        />
                        <div className='flex items-center justify-between mt-3'>
                          <span className='text-xs text-gray-500'>
                            <i className='ri-information-line mr-1'></i>
                            Lütfen saygılı bir dil kullanın
                          </span>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyToReply('');
                              }}
                              className='px-3 py-1.5 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-lg hover:bg-gray-100 text-sm'
                            >
                              İptal
                            </button>
                            <button
                              onClick={() => handleReplyToReply(reply.id)}
                              disabled={submitting || !replyToReply.trim()}
                              className='px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg disabled:shadow-none text-sm'
                            >
                              {submitting ? (
                                <>
                                  <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white'></div>
                                  Gönderiliyor...
                                </>
                              ) : (
                                <>
                                  <i className='ri-send-plane-fill'></i>
                                  Gönder
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Child Yanıtları (Nested Replies) */}
                  {childReplies.length > 0 && (
                    <div className='ml-16 mt-4 space-y-3'>
                      {childReplies.map(childReply => (
                        <div key={childReply.id} className='p-4 bg-gray-50 rounded-xl border border-gray-200'>
                          <div className='flex items-start gap-3'>
                            {/* Child Avatar */}
                            <div className='w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm'>
                              <span className='text-white text-sm font-bold'>
                                {userMap[childReply.author_id]?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            
                            {/* Child Content */}
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 mb-2'>
                                <span className='font-semibold text-gray-900 text-sm'>
                                  {userMap[childReply.author_id]?.full_name || 'Anonim'}
                                </span>
                                <span className='text-xs text-gray-500'>
                                  {getTimeAgo(childReply.created_at)}
                                </span>
                              </div>
                              <p className='text-sm text-gray-700 leading-relaxed'>
                                {childReply.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                );
                })
              )}
            )}
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
};
export default ForumTopicDetail;
