/**
 * RSS Feeds API Routes
 *
 * GET /api/rss-feeds - List RSS feeds
 * POST /api/rss-feeds - Create RSS feed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { SupabaseRSSFeedRepository } from '@/4-infrastructure/database/repositories/SupabaseRSSFeedRepository';
import { CreateRSSFeedDto } from '@/3-domain/interfaces/repositories/IRSSFeedRepository';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin can manage RSS feeds
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const repository = new SupabaseRSSFeedRepository();
    const searchParams = request.nextUrl.searchParams;
    const programId = searchParams.get('programId') || undefined;
    const isActive = searchParams.get('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined;

    const result = await repository.findAll({
      programId,
      isActive,
      limit: 100,
      offset: 0,
    });

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in GET /api/rss-feeds:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin can create RSS feeds
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const dto: CreateRSSFeedDto = {
      programId: body.programId,
      name: body.name,
      feedUrl: body.feedUrl,
      description: body.description,
      category: body.category,
      isActive: body.isActive ?? true,
      autoPublish: body.autoPublish ?? false,
      checkIntervalMinutes: body.checkIntervalMinutes ?? 360,
      createdBy: user.id,
    };

    // Validation
    if (!dto.programId || !dto.name || !dto.feedUrl) {
      return NextResponse.json(
        { error: 'programId, name, and feedUrl are required' },
        { status: 400 }
      );
    }

    const repository = new SupabaseRSSFeedRepository();
    const result = await repository.create(dto);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/rss-feeds:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
