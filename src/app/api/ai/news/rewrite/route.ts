/**
 * AI News Rewrite API Route
 *
 * POST /api/ai/news/rewrite
 * RSS feed item'ını AI ile yeniden yazma
 */

import { NextRequest, NextResponse } from 'next/server';
import { RewriteNewsWithAIUseCase } from '@/2-application/use-cases/ai/RewriteNewsWithAIUseCase';
import { SupabaseRSSFeedRepository } from '@/4-infrastructure/database/repositories/SupabaseRSSFeedRepository';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { logger } from '@/5-shared/utils/logger';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check (master_admin veya consultant)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userData.role !== 'master_admin' && userData.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { feedItemId, targetCategory, targetProgramId, language } = body;

    if (!feedItemId) {
      return NextResponse.json({ error: 'feedItemId is required' }, { status: 400 });
    }

    // Initialize dependencies
    const rssFeedRepository = new SupabaseRSSFeedRepository();
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
    const useCase = new RewriteNewsWithAIUseCase(
      rssFeedRepository,
      aiRouter,
      promptManager,
      tokenTracker
    );

    // Execute use case
    const result = await useCase.execute({
      feedItemId,
      targetCategory,
      targetProgramId,
      language,
    });

    if (result.isFailure) {
      logger.error('News rewrite failed:', result.error);
      return NextResponse.json(
        {
          error: result.error?.message || 'Failed to rewrite news',
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
    logger.error('Error in news rewrite API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
