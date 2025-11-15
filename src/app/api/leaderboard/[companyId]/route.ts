import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { GetCompanyRankingUseCase } from '@/2-application/use-cases/leaderboard';

/**
 * GET /api/leaderboard/[companyId]
 * Get company ranking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { companyId } = await params;
    const programId = request.nextUrl.searchParams.get('programId');

    if (!programId) {
      return NextResponse.json({ error: 'programId gerekli' }, { status: 400 });
    }

    const repository = new SupabaseLeaderboardRepository();
    const useCase = new GetCompanyRankingUseCase(repository);
    const result = await useCase.execute(companyId, programId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ ranking: result.value });
  } catch (error) {
    console.error('GET /api/leaderboard/[companyId] error:', error);
    return NextResponse.json({ error: 'Firma sıralaması alınamadı' }, { status: 500 });
  }
}
