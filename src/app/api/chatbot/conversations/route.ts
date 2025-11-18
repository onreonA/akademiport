/**
 * Chatbot Conversations API Routes
 *
 * GET /api/chatbot/conversations - List conversations
 * POST /api/chatbot/conversations - Create conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { SupabaseChatbotRepository } from '@/4-infrastructure/database/repositories/SupabaseChatbotRepository';
import { CreateChatbotConversationDto } from '@/3-domain/entities/Chatbot';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new SupabaseChatbotRepository();
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const result = await repository.findUserConversations(user.id, limit, offset);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in GET /api/chatbot/conversations:', error);
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

    const body = await request.json();
    const dto: CreateChatbotConversationDto = {
      userId: user.id,
      companyId: body.companyId || user.companyId || null,
      programId: body.programId || null,
      title: body.title || null,
      context: body.context || {},
    };

    const repository = new SupabaseChatbotRepository();
    const result = await repository.createConversation(dto);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/chatbot/conversations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
