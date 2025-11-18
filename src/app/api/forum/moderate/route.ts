/**
 * Forum Moderation API Routes
 *
 * GET /api/forum/moderate - Get pending topics/replies for moderation
 * POST /api/forum/moderate/approve - Approve topic/reply
 * POST /api/forum/moderate/reject - Reject topic/reply
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { logger } from '@/5-shared/utils/logger';

// Get pending items for moderation
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
    const type = searchParams.get('type') || 'all'; // 'topics', 'replies', 'all'

    const results: {
      topics: any[];
      replies: any[];
      spamDetections: any[];
    } = {
      topics: [],
      replies: [],
      spamDetections: [],
    };

    // Get pending topics
    if (type === 'all' || type === 'topics') {
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select(
          `
          *,
          forum_categories!inner(name, require_approval),
          spam_detections(*)
        `
        )
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!topicsError && topics) {
        results.topics = topics;
      }
    }

    // Get pending replies
    if (type === 'all' || type === 'replies') {
      const { data: replies, error: repliesError } = await supabase
        .from('forum_replies')
        .select(
          `
          *,
          forum_topics!inner(title, forum_categories!inner(name, require_approval)),
          spam_detections(*)
        `
        )
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!repliesError && replies) {
        results.replies = replies;
      }
    }

    // Get recent spam detections
    const { data: spamDetections } = await supabase
      .from('spam_detections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (spamDetections) {
      results.spamDetections = spamDetections;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    logger.error('Error in GET /api/forum/moderate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Approve topic or reply
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
    const { action, topicId, replyId } = body;

    if (!action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!topicId && !replyId) {
      return NextResponse.json({ error: 'topicId or replyId required' }, { status: 400 });
    }

    const forumRepository = new SupabaseForumRepository();

    if (topicId) {
      if (action === 'approve') {
        const result = await forumRepository.approveTopic(topicId);
        if (result.isFailure) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      } else {
        const result = await forumRepository.rejectTopic(topicId);
        if (result.isFailure) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      }
    } else if (replyId) {
      const supabase = await createClient();
      if (action === 'approve') {
        const { error } = await supabase
          .from('forum_replies')
          .update({ is_approved: true })
          .eq('id', replyId);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      } else {
        // Reject reply (delete or mark as rejected)
        const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error in POST /api/forum/moderate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
