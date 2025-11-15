import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { LockTopicUseCase, UnlockTopicUseCase } from '@/2-application/use-cases/forum';

/**
 * POST /api/forum/topics/[id]/lock
 * Lock a topic
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    if (!userData || !['master_admin', 'consultant'].includes(userData.role)) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const { id } = await params;

    const repository = new SupabaseForumRepository();
    const useCase = new LockTopicUseCase(repository);
    const result = await useCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Konu kilitlendi' });
  } catch (error) {
    console.error('POST /api/forum/topics/[id]/lock error:', error);
    return NextResponse.json({ error: 'Konu kilitlenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/forum/topics/[id]/lock
 * Unlock a topic
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

    if (!userData || !['master_admin', 'consultant'].includes(userData.role)) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const { id } = await params;

    const repository = new SupabaseForumRepository();
    const useCase = new UnlockTopicUseCase(repository);
    const result = await useCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Kilit açıldı' });
  } catch (error) {
    console.error('DELETE /api/forum/topics/[id]/lock error:', error);
    return NextResponse.json({ error: 'Kilit açılamadı' }, { status: 500 });
  }
}
