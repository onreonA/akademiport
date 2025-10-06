import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Get all badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('points', { ascending: false });
    if (badgesError) {
      return NextResponse.json(
        { success: false, error: 'Rozetler getirilemedi' },
        { status: 500 }
      );
    }
    // Get user's earned badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select(
        `
        *,
        badges (
          id,
          name,
          description,
          icon,
          color,
          points,
          category
        )
      `
      )
      .eq('user_id', user.id);
    if (userBadgesError) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı rozetleri getirilemedi' },
        { status: 500 }
      );
    }
    // Process badges to show earned status
    const processedBadges = badges?.map(badge => {
      const earned = userBadges?.some(ub => ub.badge_id === badge.id);
      return {
        ...badge,
        earned,
        earned_at: earned
          ? userBadges?.find(ub => ub.badge_id === badge.id)?.earned_at
          : null,
      };
    });
    return NextResponse.json({
      success: true,
      data: {
        badges: processedBadges || [],
        earned_count: userBadges?.length || 0,
        total_count: badges?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Rozetler getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    const { badge_id } = body;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    if (!badge_id) {
      return NextResponse.json(
        { success: false, error: 'Rozet ID gerekli' },
        { status: 400 }
      );
    }
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Check if badge exists
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badge_id)
      .single();
    if (badgeError || !badge) {
      return NextResponse.json(
        { success: false, error: 'Rozet bulunamadı' },
        { status: 404 }
      );
    }
    // Check if user already has this badge
    const { data: existingBadge, error: existingError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id)
      .eq('badge_id', badge_id)
      .single();
    if (existingBadge) {
      return NextResponse.json(
        { success: false, error: 'Bu rozet zaten kazanılmış' },
        { status: 400 }
      );
    }
    // Award the badge
    const { data: newUserBadge, error: awardError } = await supabase
      .from('user_badges')
      .insert({
        user_id: user.id,
        badge_id: badge_id,
      })
      .select(
        `
        *,
        badges (
          id,
          name,
          description,
          icon,
          color,
          points,
          category
        )
      `
      )
      .single();
    if (awardError) {
      return NextResponse.json(
        { success: false, error: 'Rozet verilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        message: 'Rozet başarıyla kazanıldı!',
        badge: newUserBadge,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Rozet verilirken hata oluştu' },
      { status: 500 }
    );
  }
}
