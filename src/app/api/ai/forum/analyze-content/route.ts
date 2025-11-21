/**
 * AI Forum Content Analysis API Route
 *
 * POST /api/ai/forum/analyze-content
 * Forum topic veya reply içeriğini analiz eder
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeForumContentUseCase } from '@/2-application/use-cases/ai/AnalyzeForumContentUseCase';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

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
    const { topicId, replyId, content, categoryId } = body;

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
    const useCase = new AnalyzeForumContentUseCase(
      forumRepository,
      aiRouter,
      promptManager,
      tokenTracker
    );

    // Execute use case
    const result = await useCase.execute({
      topicId,
      replyId,
      content: content || '',
      categoryId,
    });

    if (result.isFailure) {
      const error =
        result.error instanceof AppError
          ? result.error
          : new AppError('Failed to analyze content', 500);
      logger.error('Content analysis failed:', error);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
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
    logger.error('Error in content analysis API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
