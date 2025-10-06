'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import FirmaLayout from '@/components/firma/FirmaLayout';
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
  content: string
): Promise<ForumReply | null> => {
  try {
    const response = await fetch('/api/forum/replies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic_id: topicId,
        author_id: '9d99c302-4084-42ec-8c02-f6d5d3c0dc3e', // Test kullanıcısı
        content: content,
      }),
    });
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
  const topicId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
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
    if (!newReply.trim() || !topic) return;
    setSubmitting(true);
    try {
      const reply = await createReply(topic.id, newReply);
      if (reply) {
        setReplies([...replies, reply]);
        setNewReply('');
        setShowReplyForm(false);
      }
    } catch (error) {
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
      <div className='p-4 sm:p-6 lg:p-8'>
        {/* Topic Header */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 mb-6'>
          <div className='p-6 border-b border-gray-100'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-3'>
                {topic.is_featured && (
                  <span className='inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full'>
                    <i className='ri-pushpin-line text-sm'></i>Öne Çıkan
                  </span>
                )}
                {topic.is_solved && (
                  <span className='inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full'>
                    <i className='ri-check-line text-sm'></i>Çözüldü
                  </span>
                )}
                {topic.forum_categories && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 ${topic.forum_categories.color} text-white text-sm font-medium rounded-full`}
                  >
                    <i className={`${topic.forum_categories.icon} text-sm`}></i>
                    {topic.forum_categories.name}
                  </span>
                )}
              </div>
              <span className='text-sm text-gray-500'>
                {getTimeAgo(topic.created_at)}
              </span>
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              {topic.title}
            </h1>
            {/* Tags */}
            {topic.tags && topic.tags.length > 0 && (
              <div className='flex items-center gap-2 mb-4 flex-wrap'>
                {topic.tags.map(tag => (
                  <span
                    key={tag}
                    className='inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {/* Meta */}
            <div className='flex items-center justify-between text-sm text-gray-500'>
              <div className='flex items-center gap-4'>
                <span>
                  <i className='ri-user-line mr-1'></i>
                  {topic.users?.full_name || 'Anonim'}
                </span>
              </div>
              <div className='flex items-center gap-4'>
                <span className='flex items-center gap-1'>
                  <i className='ri-message-3-line'></i>
                  {topic.reply_count} yanıt
                </span>
                <span className='flex items-center gap-1'>
                  <i className='ri-eye-line'></i>
                  {topic.view_count} görüntülenme
                </span>
              </div>
            </div>
          </div>
          {/* Topic Content */}
          <div className='p-6'>
            <div className='prose max-w-none'>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {topic.content}
              </p>
            </div>
          </div>
        </div>
        {/* Replies */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 mb-6'>
          <div className='p-6 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Yanıtlar ({replies.length})
              </h2>
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'
              >
                <i className='ri-add-line'></i>
                Yanıt Yaz
              </button>
            </div>
          </div>
          {/* Reply Form */}
          {showReplyForm && (
            <div className='p-6 border-b border-gray-100'>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Yanıtınız
                </label>
                <textarea
                  value={newReply}
                  onChange={e => setNewReply(e.target.value)}
                  placeholder='Yanıtınızı buraya yazın...'
                  className='w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
                />
              </div>
              <div className='flex items-center gap-3'>
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting || !newReply.trim()}
                  className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'
                >
                  {submitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <i className='ri-send-plane-line'></i>
                      Yanıt Gönder
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setNewReply('');
                  }}
                  className='text-gray-600 hover:text-gray-800 font-medium'
                >
                  İptal
                </button>
              </div>
            </div>
          )}
          {/* Replies List */}
          <div className='divide-y divide-gray-100'>
            {replies.length === 0 ? (
              <div className='p-12 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-message-3-line text-gray-400 text-2xl'></i>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Henüz Yanıt Yok
                </h3>
                <p className='text-gray-600 mb-4'>
                  Bu konuya ilk yanıtı siz yazın!
                </p>
                <button
                  onClick={() => setShowReplyForm(true)}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                >
                  İlk Yanıtı Yaz
                </button>
              </div>
            ) : (
              replies.map(reply => (
                <div key={reply.id} className='p-6'>
                  <div className='flex items-start gap-4'>
                    {/* Avatar */}
                    <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center'>
                      <span className='text-white text-sm font-medium'>
                        {reply.users?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-gray-900'>
                            {reply.users?.full_name || 'Anonim'}
                          </span>
                          {reply.is_solution && (
                            <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'>
                              <i className='ri-check-line text-xs'></i>Çözüm
                            </span>
                          )}
                        </div>
                        <span className='text-sm text-gray-500'>
                          {getTimeAgo(reply.created_at)}
                        </span>
                      </div>
                      <div className='prose max-w-none mb-3'>
                        <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                          {reply.content}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className='flex items-center gap-4 text-sm text-gray-500'>
                        <button
                          onClick={() => handleLike(reply.id)}
                          className='flex items-center gap-1 hover:text-blue-600 transition-colors'
                        >
                          <i className='ri-heart-line'></i>
                          {reply.like_count} beğeni
                        </button>
                        <button className='flex items-center gap-1 hover:text-blue-600 transition-colors'>
                          <i className='ri-reply-line'></i>
                          Yanıtla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
};
export default ForumTopicDetail;
