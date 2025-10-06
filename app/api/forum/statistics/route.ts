import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Forum istatistiklerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // Gün sayısı
    const categoryId = searchParams.get('category_id');
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    // Temel istatistikler
    const [
      totalTopics,
      totalReplies,
      totalUsers,
      totalCategories,
      recentTopics,
      recentReplies,
      popularTopics,
      activeUsers,
      categoryStats,
    ] = await Promise.all([
      // Toplam konu sayısı
      supabase
        .from('forum_topics')
        .select('id', { count: 'exact' })
        .neq('status', 'hidden'),
      // Toplam yanıt sayısı
      supabase
        .from('forum_replies')
        .select('id', { count: 'exact' })
        .eq('is_hidden', false),
      // Toplam kullanıcı sayısı (forum aktivitesi olan) - ayrı ayrı alacağız
      supabase.from('forum_topics').select('author_id').neq('status', 'hidden'),
      // Toplam kategori sayısı
      supabase
        .from('forum_categories')
        .select('id', { count: 'exact' })
        .eq('is_active', true),
      // Son dönemdeki konular
      supabase
        .from('forum_topics')
        .select('id, title, created_at, view_count, reply_count, like_count')
        .gte('created_at', daysAgo.toISOString())
        .neq('status', 'hidden')
        .order('created_at', { ascending: false })
        .limit(10),
      // Son dönemdeki yanıtlar
      supabase
        .from('forum_replies')
        .select('id, content, created_at, like_count')
        .gte('created_at', daysAgo.toISOString())
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(10),
      // Popüler konular (görüntülenme ve yanıt sayısına göre)
      supabase
        .from('forum_topics')
        .select(
          `
          id, 
          title, 
          view_count, 
          reply_count, 
          like_count, 
          created_at,
          forum_categories(name, color)
        `
        )
        .neq('status', 'hidden')
        .order('view_count', { ascending: false })
        .limit(10),
      // En aktif kullanıcılar
      supabase
        .from('forum_topics')
        .select(
          `
          author_id,
          users(full_name, email)
        `
        )
        .neq('status', 'hidden')
        .gte('created_at', daysAgo.toISOString()),
      // Kategori bazlı istatistikler
      supabase
        .from('forum_categories')
        .select(
          `
          id,
          name,
          color,
          topic_count
        `
        )
        .eq('is_active', true)
        .order('topic_count', { ascending: false }),
    ]);
    // Kullanıcı istatistiklerini hesapla
    const userActivity: any = {};
    // Konu yazarlarını ekle
    activeUsers.data?.forEach((topic: any) => {
      const userId = topic.author_id;
      if (!userActivity[userId]) {
        userActivity[userId] = {
          id: userId,
          name: topic.users?.full_name || 'Anonim',
          email: topic.users?.email,
          topics: 0,
          replies: 0,
        };
      }
      userActivity[userId].topics++;
    });
    // Yanıt istatistiklerini de ekle
    const replyStats = await supabase
      .from('forum_replies')
      .select(
        `
        author_id,
        users(full_name, email)
      `
      )
      .eq('is_hidden', false)
      .gte('created_at', daysAgo.toISOString());
    replyStats.data?.forEach((reply: any) => {
      const userId = reply.author_id;
      if (userActivity[userId]) {
        userActivity[userId].replies++;
      } else {
        userActivity[userId] = {
          id: userId,
          name: reply.users?.full_name || 'Anonim',
          email: reply.users?.email,
          topics: 0,
          replies: 1,
        };
      }
    });
    // Kullanıcıları aktiviteye göre sırala
    const topUsers = Object.values(userActivity || {})
      .sort((a: any, b: any) => b.topics + b.replies - (a.topics + a.replies))
      .slice(0, 10);
    // Günlük aktivite grafiği için veri
    const dailyActivity = await supabase
      .from('forum_topics')
      .select('created_at')
      .gte('created_at', daysAgo.toISOString())
      .neq('status', 'hidden');
    const dailyStats = dailyActivity.data?.reduce((acc: any, topic: any) => {
      const date = new Date(topic.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalTopics: totalTopics.count || 0,
          totalReplies: totalReplies.count || 0,
          totalUsers: Object.keys(userActivity || {}).length,
          totalCategories: totalCategories.count || 0,
          period: parseInt(period),
        },
        recentActivity: {
          topics: recentTopics.data || [],
          replies: recentReplies.data || [],
        },
        popularTopics: popularTopics.data || [],
        topUsers: topUsers,
        categoryStats: categoryStats.data || [],
        dailyActivity: dailyStats || {},
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'İstatistikler getirilemedi' },
      { status: 500 }
    );
  }
}
