import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { UpdateReplyUseCase, DeleteReplyUseCase } from '@/2-application/use-cases/forum';
import { UpdateReplyDto, UpdateReplyDtoSchema } from '@/2-application/dtos/forum';

/**
 * PUT /api/forum/replies/[id]
 * Update a reply
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
    const body = await request.json();

    // Validate request body
    const validationResult = UpdateReplyDtoSchema.safeParse({
      content: body.content,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Geçersiz veri',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const dto: UpdateReplyDto = validationResult.data;

    const repository = new SupabaseForumRepository();
    const useCase = new UpdateReplyUseCase(repository);
    const result = await useCase.execute(id, dto, user.id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('PUT /api/forum/replies/[id] error:', error);
    return NextResponse.json({ error: 'Yanıt güncellenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/replies/[id]
 * Delete a reply
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

    // Check if user is admin or consultant
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'master_admin' || userData?.role === 'consultant';

    const { id } = await params;

    const repository = new SupabaseForumRepository();
    const useCase = new DeleteReplyUseCase(repository);
    const result = await useCase.execute(id, user.id, isAdmin);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Yanıt silindi' });
  } catch (error) {
    console.error('DELETE /api/forum/replies/[id] error:', error);
    return NextResponse.json({ error: 'Yanıt silinemedi' }, { status: 500 });
  }
}
