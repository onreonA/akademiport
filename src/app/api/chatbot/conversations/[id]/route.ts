/**
 * Chatbot Conversation API Routes (Single Conversation)
 *
 * GET /api/chatbot/conversations/[id] - Get conversation with messages
 * PUT /api/chatbot/conversations/[id] - Update conversation
 * DELETE /api/chatbot/conversations/[id] - Delete conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { SupabaseChatbotRepository } from '@/4-infrastructure/database/repositories/SupabaseChatbotRepository';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repository = new SupabaseChatbotRepository();
    const result = await repository.findConversationWithMessages(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Konuşma bulunamadı' }, { status: 404 });
    }

    // Check if user owns this conversation
    if (result.value.userId !== user.id && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in GET /api/chatbot/conversations/[id]:', error);
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

    const { id } = await params;
    const body = await request.json();

    const repository = new SupabaseChatbotRepository();

    // Check ownership
    const conversationResult = await repository.findConversationById(id);
    if (conversationResult.isFailure || !conversationResult.value) {
      return NextResponse.json({ error: 'Konuşma bulunamadı' }, { status: 404 });
    }

    if (conversationResult.value.userId !== user.id && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.context !== undefined) updates.context = body.context;

    const result = await repository.updateConversation(id, updates);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in PUT /api/chatbot/conversations/[id]:', error);
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

    const { id } = await params;
    const repository = new SupabaseChatbotRepository();

    // Check ownership
    const conversationResult = await repository.findConversationById(id);
    if (conversationResult.isFailure || !conversationResult.value) {
      return NextResponse.json({ error: 'Konuşma bulunamadı' }, { status: 404 });
    }

    if (conversationResult.value.userId !== user.id && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await repository.deleteConversation(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error in DELETE /api/chatbot/conversations/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
