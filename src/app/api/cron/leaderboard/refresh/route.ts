import { NextRequest, NextResponse } from 'next/server';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';

/**
 * POST /api/cron/leaderboard/refresh
 * Refresh leaderboard rankings (called by cron)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const repository = new SupabaseLeaderboardRepository();
    const result = await repository.refreshRankings();

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error?.message || result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Liderlik tablosu yenilendi' });
  } catch (error) {
    console.error('POST /api/cron/leaderboard/refresh error:', error);
    return NextResponse.json({ error: 'Liderlik tablosu yenilenemedi' }, { status: 500 });
  }
}



