/**
 * RSS Feed API Routes (Single Feed)
 *
 * GET /api/rss-feeds/[id] - Get RSS feed
 * PUT /api/rss-feeds/[id] - Update RSS feed
 * DELETE /api/rss-feeds/[id] - Delete RSS feed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { SupabaseRSSFeedRepository } from '@/4-infrastructure/database/repositories/SupabaseRSSFeedRepository';
import { UpdateRSSFeedDto } from '@/3-domain/interfaces/repositories/IRSSFeedRepository';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repository = new SupabaseRSSFeedRepository();
    const result = await repository.findById(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'RSS feed not found' }, { status: 404 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in GET /api/rss-feeds/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin can update RSS feeds
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const dto: UpdateRSSFeedDto = {
      name: body.name,
      feedUrl: body.feedUrl,
      description: body.description,
      category: body.category,
      isActive: body.isActive,
      autoPublish: body.autoPublish,
      checkIntervalMinutes: body.checkIntervalMinutes,
      updatedBy: user.id,
    };

    const repository = new SupabaseRSSFeedRepository();
    const result = await repository.update(id, dto);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in PUT /api/rss-feeds/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin can delete RSS feeds
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const repository = new SupabaseRSSFeedRepository();
    const result = await repository.delete(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error in DELETE /api/rss-feeds/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
