import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { GetCompanyBadgesUseCase } from '@/2-application/use-cases/leaderboard';

/**
 * GET /api/leaderboard/badges/company/[companyId]
 * Get company badges
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
    const repository = new SupabaseLeaderboardRepository();
    const useCase = new GetCompanyBadgesUseCase(repository);
    const result = await useCase.execute(companyId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ badges: result.value });
  } catch (error) {
    console.error('GET /api/leaderboard/badges/company/[companyId] error:', error);
    return NextResponse.json({ error: 'Firma rozetleri alınamadı' }, { status: 500 });
  }
}
