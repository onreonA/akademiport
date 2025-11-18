/**
 * RSS Feed Items API Route
 *
 * GET /api/rss-feeds/[id]/items - Get RSS feed items
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { SupabaseRSSFeedRepository } from '@/4-infrastructure/database/repositories/SupabaseRSSFeedRepository';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const repository = new SupabaseRSSFeedRepository();
    const result = await repository.findFeedItemsByFeedId(id, limit, offset);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in GET /api/rss-feeds/[id]/items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
