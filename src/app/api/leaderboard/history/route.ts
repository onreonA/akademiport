import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { GetLeaderboardHistoryUseCase } from '@/2-application/use-cases/leaderboard';

/**
 * GET /api/leaderboard/history
 * Get leaderboard history
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

    const companyId = request.nextUrl.searchParams.get('companyId') || undefined;
    const programId = request.nextUrl.searchParams.get('programId') || undefined;
    const startDate = request.nextUrl.searchParams.get('startDate')
      ? new Date(request.nextUrl.searchParams.get('startDate')!)
      : undefined;
    const endDate = request.nextUrl.searchParams.get('endDate')
      ? new Date(request.nextUrl.searchParams.get('endDate')!)
      : undefined;

    const repository = new SupabaseLeaderboardRepository();
    const useCase = new GetLeaderboardHistoryUseCase(repository);
    const result = await useCase.execute({ companyId, programId, startDate, endDate });

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ history: result.value });
  } catch (error) {
    console.error('GET /api/leaderboard/history error:', error);
    return NextResponse.json({ error: 'Geçmiş veriler alınamadı' }, { status: 500 });
  }
}
