import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { UpdateTopicDto } from '@/2-application/dtos/forum';

/**
 * GET /api/forum/topics/[id]
 * Get topic by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;

    const repository = new SupabaseForumRepository();
    const result = await repository.findTopicById(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
    }

    // Increment view count
    await repository.incrementViewCount(id);

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('GET /api/forum/topics/[id] error:', error);
    return NextResponse.json({ error: 'Konu getirilemedi' }, { status: 500 });
  }
}

/**
 * PUT /api/forum/topics/[id]
 * Update topic
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;

    // Check if topic exists and user is author
    const repository = new SupabaseForumRepository();
    const topicResult = await repository.findTopicById(id);

    if (topicResult.isFailure || !topicResult.value) {
      return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
    }

    const topic = topicResult.value;

    // Check if user is author or admin/consultant
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAuthor = topic.authorId === user.id;
    const isAdmin = userData?.role === 'master_admin' || userData?.role === 'consultant';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const dto: UpdateTopicDto = {
      title: body.title,
      content: body.content,
      categoryId: body.categoryId,
      status: body.status,
      priority: body.priority,
      isPinned: body.isPinned,
      isLocked: body.isLocked,
    };

    const result = await repository.updateTopic(id, dto);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('PUT /api/forum/topics/[id] error:', error);
    return NextResponse.json({ error: 'Konu güncellenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/topics/[id]
 * Delete topic
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;

    // Check if topic exists and user is author
    const repository = new SupabaseForumRepository();
    const topicResult = await repository.findTopicById(id);

    if (topicResult.isFailure || !topicResult.value) {
      return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
    }

    const topic = topicResult.value;

    // Check if user is author or admin/consultant
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAuthor = topic.authorId === user.id;
    const isAdmin = userData?.role === 'master_admin' || userData?.role === 'consultant';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const result = await repository.deleteTopic(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Konu silindi' });
  } catch (error) {
    console.error('DELETE /api/forum/topics/[id] error:', error);
    return NextResponse.json({ error: 'Konu silinemedi' }, { status: 500 });
  }
}
