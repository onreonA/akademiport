import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const period = searchParams.get('period') || 'all'; // 'all', 'month', 'week'
    const limit = parseInt(searchParams.get('limit') || '10');
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Firma ID gerekli' },
        { status: 400 }
      );
    }
    let dateFilter = '';
    if (period === 'month') {
      dateFilter = "AND up.updated_at >= NOW() - INTERVAL '1 month'";
    } else if (period === 'week') {
      dateFilter = "AND up.updated_at >= NOW() - INTERVAL '1 week'";
    }
    // Get leaderboard data
    const { data: leaderboard, error: leaderboardError } = await supabase.rpc(
      'get_leaderboard',
      {
        p_company_id: companyId,
        p_period_filter: dateFilter,
        p_limit_count: limit,
      }
    );
    if (leaderboardError) {
      return NextResponse.json(
        { success: false, error: 'Liderlik tablosu getirilemedi' },
        { status: 500 }
      );
    }
    // Get current user's rank if user email is provided
    const userEmail = request.headers.get('X-User-Email');
    let userRank = null;
    if (userEmail) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (!userError && user) {
        const { data: userPoints, error: userPointsError } = await supabase
          .from('user_points')
          .select('*')
          .eq('user_id', user.id)
          .eq('company_id', companyId)
          .single();
        if (!userPointsError && userPoints) {
          // Calculate user's rank
          const userRankData = leaderboard?.find(
            (entry: any) => entry.user_id === user.id
          );
          if (userRankData) {
            userRank = {
              rank: userRankData.rank,
              points: userRankData.points,
              level: userRankData.level,
              experience_points: userRankData.experience_points,
            };
          }
        }
      }
    }
    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboard || [],
        user_rank: userRank,
        period: period,
        total_participants: leaderboard?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Liderlik tablosu getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
