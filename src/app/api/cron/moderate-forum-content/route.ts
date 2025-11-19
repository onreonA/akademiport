/**
 * Cron Job: Moderate Forum Content
 *
 * Her 15 dakikada bir çalışır ve bekleyen forum içeriklerini moderasyon yapar
 * Spam kontrolü yapar ve otomatik onay/reddet yapar
 *
 * GET /api/cron/moderate-forum-content
 * Authorization: Cron secret key (header: x-cron-secret)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { DetectSpamUseCase } from '@/2-application/use-cases/ai/DetectSpamUseCase';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { TopicStatus } from '@/3-domain/enums/ForumEnums';
import { logger } from '@/5-shared/utils/logger';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Cron secret kontrolü
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      logger.warn('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Forum moderation cron job started');

    const supabase = await createClient();
    const forumRepository = new SupabaseForumRepository();

    // AI services
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();
    const detectSpamUseCase = new DetectSpamUseCase(
      forumRepository,
      aiRouter,
      promptManager,
      tokenTracker
    );

    // Bekleyen topic'leri bul (isApproved = false ve requireApproval = true olan kategorilerde)
    const { data: pendingTopics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*, forum_categories!inner(require_approval)')
      .eq('is_approved', false)
      .eq('forum_categories.require_approval', true)
      .limit(20); // Her çalıştırmada max 20 topic

    // Bekleyen reply'leri bul (isApproved = false)
    const { data: pendingReplies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('*, forum_topics!inner(forum_categories!inner(require_approval))')
      .eq('is_approved', false)
      .limit(20); // Her çalıştırmada max 20 reply

    if (repliesError) {
      logger.error('Failed to get pending replies:', repliesError);
      return NextResponse.json({ error: 'Failed to get pending replies' }, { status: 500 });
    }

    const results = {
      totalTopics: pendingTopics?.length || 0,
      totalReplies: pendingReplies?.length || 0,
      processedTopics: 0,
      processedReplies: 0,
      approvedTopics: 0,
      rejectedTopics: 0,
      approvedReplies: 0,
      rejectedReplies: 0,
      errors: [] as string[],
    };

    // Topic'leri işle
    for (const topic of pendingTopics || []) {
      try {
        logger.info(`Processing topic: ${topic.id}`);

        // Spam kontrolü yap
        const spamResult = await detectSpamUseCase.execute({
          topicId: topic.id,
          content: topic.content,
          authorId: topic.author_id,
        });

        if (spamResult.isFailure) {
          logger.error(`Spam detection failed for topic ${topic.id}:`, spamResult.error);
          results.errors.push(`Topic ${topic.id}: Spam detection failed`);
          continue;
        }

        const spamDetection = spamResult.value;

        // Spam detection kaydet
        await supabase.from('spam_detections').insert({
          topic_id: topic.id,
          content: topic.content,
          spam_score: spamDetection.spamScore,
          is_spam: spamDetection.isSpam,
          spam_reason: spamDetection.spamReason,
          recommendation: spamDetection.recommendation,
          factors: spamDetection.factors,
        });

        // Öneriye göre işlem yap
        if (spamDetection.recommendation === 'approve') {
          await forumRepository.approveTopic(topic.id);
          results.approvedTopics++;
          logger.info(`Topic ${topic.id} auto-approved (spam score: ${spamDetection.spamScore})`);
        } else if (spamDetection.recommendation === 'reject') {
          await forumRepository.rejectTopic(topic.id);
          results.rejectedTopics++;
          logger.info(`Topic ${topic.id} auto-rejected (spam score: ${spamDetection.spamScore})`);
        }
        // 'review' durumunda admin onayı bekler, bir şey yapmıyoruz

        results.processedTopics++;
      } catch (error) {
        logger.error(`Failed to process topic ${topic.id}:`, error);
        results.errors.push(
          `Topic ${topic.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Reply'leri işle
    for (const reply of pendingReplies || []) {
      try {
        logger.info(`Processing reply: ${reply.id}`);

        // Spam kontrolü yap
        const spamResult = await detectSpamUseCase.execute({
          replyId: reply.id,
          content: reply.content,
          authorId: reply.author_id,
        });

        if (spamResult.isFailure) {
          logger.error(`Spam detection failed for reply ${reply.id}:`, spamResult.error);
          results.errors.push(`Reply ${reply.id}: Spam detection failed`);
          continue;
        }

        const spamDetection = spamResult.value;

        // Spam detection kaydet
        await supabase.from('spam_detections').insert({
          reply_id: reply.id,
          content: reply.content,
          spam_score: spamDetection.spamScore,
          is_spam: spamDetection.isSpam,
          spam_reason: spamDetection.spamReason,
          recommendation: spamDetection.recommendation,
          factors: spamDetection.factors,
        });

        // Öneriye göre işlem yap
        if (spamDetection.recommendation === 'approve') {
          await supabase.from('forum_replies').update({ is_approved: true }).eq('id', reply.id);
          results.approvedReplies++;
          logger.info(`Reply ${reply.id} auto-approved (spam score: ${spamDetection.spamScore})`);
        } else if (spamDetection.recommendation === 'reject') {
          // Reply'leri silmek yerine is_approved = false bırakıyoruz
          // Admin manuel olarak silebilir
          results.rejectedReplies++;
          logger.info(`Reply ${reply.id} auto-rejected (spam score: ${spamDetection.spamScore})`);
        }
        // 'review' durumunda admin onayı bekler

        results.processedReplies++;
      } catch (error) {
        logger.error(`Failed to process reply ${reply.id}:`, error);
        results.errors.push(
          `Reply ${reply.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    logger.info('Forum moderation cron job completed', results);

    return NextResponse.json(
      {
        success: true,
        message: 'Forum content moderated',
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in forum moderation cron job:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
