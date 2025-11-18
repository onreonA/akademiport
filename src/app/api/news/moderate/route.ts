/**
 * News Moderation API Routes
 *
 * GET /api/news/moderate - Get pending news for moderation
 * POST /api/news/moderate - Approve/reject news
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { SupabaseNewsRepository } from '@/4-infrastructure/database/repositories/SupabaseNewsRepository';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { NewsStatus } from '@/3-domain/enums/NewsEnums';
import { logger } from '@/5-shared/utils/logger';

// Get pending news for moderation
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can moderate
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'draft'; // 'draft', 'pending', 'all'

    // Get pending news (draft status)
    const query = supabase
      .from('news')
      .select(
        `
        *,
        news_spam_detections(*)
      `
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (status === 'draft') {
      query.eq('status', NewsStatus.DRAFT);
    } else if (status === 'pending') {
      // News with spam detection recommendation = 'review'
      // This would require a join, but for simplicity we'll get all drafts
      query.eq('status', NewsStatus.DRAFT);
    }

    const { data: news, error: newsError } = await query;

    if (newsError) {
      logger.error('Failed to get pending news:', newsError);
      return NextResponse.json({ error: 'Failed to get pending news' }, { status: 500 });
    }

    // Get recent spam detections
    const { data: spamDetections } = await supabase
      .from('news_spam_detections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    return NextResponse.json(
      {
        news: news || [],
        spamDetections: spamDetections || [],
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in GET /api/news/moderate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Approve or reject news
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can moderate
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, newsId } = body;

    if (!action || (action !== 'approve' && action !== 'reject' && action !== 'publish')) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!newsId) {
      return NextResponse.json({ error: 'newsId required' }, { status: 400 });
    }

    const newsRepository = new SupabaseNewsRepository();

    if (action === 'approve' || action === 'publish') {
      const result = await newsRepository.update(newsId, {
        status: action === 'publish' ? NewsStatus.PUBLISHED : NewsStatus.DRAFT,
      });
      if (result.isFailure) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    } else if (action === 'reject') {
      // Delete news or mark as rejected (we'll delete for now)
      const result = await newsRepository.delete(newsId);
      if (result.isFailure) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error in POST /api/news/moderate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
