/**
 * AI News Spam Detection API Route
 *
 * POST /api/ai/news/detect-spam
 * Haber içeriğinde spam tespiti
 */

import { NextRequest, NextResponse } from 'next/server';
import { DetectNewsSpamUseCase } from '@/2-application/use-cases/ai/DetectNewsSpamUseCase';
import { SupabaseNewsRepository } from '@/4-infrastructure/database/repositories/SupabaseNewsRepository';
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
    const { newsId, title, content, summary, authorId, authorEmail } = body;

    if (!newsId && !title && !content) {
      return NextResponse.json({ error: 'newsId veya title/content gereklidir' }, { status: 400 });
    }

    // Initialize dependencies
    const newsRepository = new SupabaseNewsRepository();
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
    const useCase = new DetectNewsSpamUseCase(
      newsRepository,
      aiRouter,
      promptManager,
      tokenTracker
    );

    // Execute use case
    const result = await useCase.execute({
      newsId,
      title,
      content,
      summary,
      authorId,
      authorEmail,
    });

    if (result.isFailure) {
      logger.error('News spam detection failed:', result.error);
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
    logger.error('Error in news spam detection API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
