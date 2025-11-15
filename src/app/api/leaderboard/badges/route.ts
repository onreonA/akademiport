import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { GetBadgesUseCase, CreateBadgeUseCase } from '@/2-application/use-cases/leaderboard';
import { CreateBadgeDtoSchema } from '@/2-application/dtos/leaderboard';

/**
 * GET /api/leaderboard/badges
 * Get all badges
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const category = request.nextUrl.searchParams.get('category') || undefined;
    const isActive =
      request.nextUrl.searchParams.get('isActive') === 'true'
        ? true
        : request.nextUrl.searchParams.get('isActive') === 'false'
          ? false
          : undefined;

    const repository = new SupabaseLeaderboardRepository();
    const useCase = new GetBadgesUseCase(repository);
    const result = await useCase.execute({ category, isActive });

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ badges: result.value });
  } catch (error) {
    console.error('GET /api/leaderboard/badges error:', error);
    return NextResponse.json({ error: 'Rozetler alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/leaderboard/badges
 * Create new badge (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is master_admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'master_admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const dtoResult = CreateBadgeDtoSchema.safeParse(body);

    if (!dtoResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: dtoResult.error.issues },
        { status: 400 }
      );
    }

    const repository = new SupabaseLeaderboardRepository();
    const useCase = new CreateBadgeUseCase(repository);
    const result = await useCase.execute(dtoResult.data);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ badge: result.value }, { status: 201 });
  } catch (error) {
    console.error('POST /api/leaderboard/badges error:', error);
    return NextResponse.json({ error: 'Rozet oluşturulamadı' }, { status: 500 });
  }
}
