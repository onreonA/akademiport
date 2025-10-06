import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Tüm kullanıcıların seviye bilgilerini getir
    const { data: userLevels, error: levelsError } = await supabase
      .from('user_levels')
      .select('*')
      .order('current_points', { ascending: false })
      .limit(20);
    if (levelsError) {
      return NextResponse.json(
        { success: false, error: 'Seviye bilgileri getirilemedi' },
        { status: 500 }
      );
    }
    // Her kullanıcı için başarım sayısını getir
    const leaderboard = await Promise.all(
      (userLevels || []).map(async userLevel => {
        const { data: achievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('id', { count: 'exact' })
          .eq('user_email', userLevel.user_email);
        return {
          user_email: userLevel.user_email,
          current_level: userLevel.current_level,
          current_points: userLevel.current_points,
          total_points_earned: userLevel.total_points_earned,
          achievements_count: achievements?.length || 0,
        };
      })
    );
    // Kullanıcının sıralamasını bul
    const userRank =
      leaderboard.findIndex(entry => entry.user_email === userEmail) + 1;
    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        userRank: userRank > 0 ? userRank : null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
