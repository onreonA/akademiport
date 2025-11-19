import { NextRequest, NextResponse } from 'next/server';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';

/**
 * POST /api/cron/leaderboard/snapshot
 * Create weekly snapshot (called by cron)
 */

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const repository = new SupabaseLeaderboardRepository();
    const result = await repository.createSnapshot();

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Snapshot oluşturuldu' });
  } catch (error) {
    console.error('POST /api/cron/leaderboard/snapshot error:', error);
    return NextResponse.json({ error: 'Snapshot oluşturulamadı' }, { status: 500 });
  }
}
