import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { GetLeaderboardUseCase } from '@/2-application/use-cases/leaderboard';
import { LeaderboardFilterDtoSchema } from '@/2-application/dtos/leaderboard';

/**
 * GET /api/leaderboard
 * Get leaderboard rankings
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

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const filterData = {
      programId: searchParams.get('programId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const filterResult = LeaderboardFilterDtoSchema.safeParse(filterData);
    if (!filterResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz filtre parametreleri', details: filterResult.error.issues },
        { status: 400 }
      );
    }

    const repository = new SupabaseLeaderboardRepository();
    const useCase = new GetLeaderboardUseCase(repository);
    const result = await useCase.execute(filterResult.data);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ rankings: result.value });
  } catch (error) {
    console.error('GET /api/leaderboard error:', error);
    return NextResponse.json({ error: 'Liderlik tablosu alınamadı' }, { status: 500 });
  }
}
