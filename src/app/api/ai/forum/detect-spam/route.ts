/**
 * AI Forum Spam Detection API Route
 *
 * POST /api/ai/forum/detect-spam
 * Forum topic veya reply içeriğinde spam tespiti
 */

import { NextRequest, NextResponse } from 'next/server';
import { DetectSpamUseCase } from '@/2-application/use-cases/ai/DetectSpamUseCase';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { logger } from '@/5-shared/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can use AI features
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { topicId, replyId, content, authorId, authorEmail } = body;

    if (!content && !topicId && !replyId) {
      return NextResponse.json(
        { error: 'content veya topicId/replyId gereklidir' },
        { status: 400 }
      );
    }

    // Initialize dependencies
    const forumRepository = new SupabaseForumRepository();
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
    const useCase = new DetectSpamUseCase(forumRepository, aiRouter, promptManager, tokenTracker);

    // Execute use case
    const result = await useCase.execute({
      topicId,
      replyId,
      content: content || '',
      authorId,
      authorEmail,
    });

    if (result.isFailure) {
      logger.error('Spam detection failed:', result.error);
      return NextResponse.json(
        {
          error: result.error?.message || 'Failed to detect spam',
          code: (result.error as any)?.code || undefined,
        },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in spam detection API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
