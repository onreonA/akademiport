import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseForumRepository } from '@/4-infrastructure/database/repositories/SupabaseForumRepository';
import { CreateCategoryDto } from '@/2-application/dtos/forum';

/**
 * GET /api/forum/categories
 * List categories for a program
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Get user's role and program
    const { data: userData } = await supabase
      .from('users')
      .select('role, companies(program_id)')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı' }, { status: 404 });
    }

    const isAdmin = userData.role === 'master_admin';
    // For admin, programId must come from query params
    // For other users, use their company's program_id
    const programId =
      request.nextUrl.searchParams.get('programId') ||
      (isAdmin ? undefined : userData.companies?.[0]?.program_id);

    if (!programId) {
      return NextResponse.json({ error: 'Program ID gereklidir' }, { status: 400 });
    }

    const repository = new SupabaseForumRepository();
    const result = await repository.findAllCategories(programId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('GET /api/forum/categories error:', error);
    return NextResponse.json({ error: 'Kategoriler listelenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/forum/categories
 * Create category (Admin/Consultant only)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Generate slug from name
    const slug: string = (body.name || '')
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const dto: CreateCategoryDto = {
      programId: body.programId,
      name: body.name,
      description: body.description ?? null,
      icon: body.icon ?? null,
      color: body.color ?? null,
      orderIndex: body.orderIndex || 0,
      requireApproval: body.requireApproval || false,
    };

    const repository = new SupabaseForumRepository();
    const result = await repository.createCategory({
      programId: dto.programId,
      name: dto.name,
      slug,
      description: dto.description ?? null,
      icon: dto.icon ?? null,
      color: dto.color ?? null,
      orderIndex: dto.orderIndex ?? 0,
      isActive: true,
      requireApproval: dto.requireApproval ?? false,
      createdBy: user.id,
    });

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('POST /api/forum/categories error:', error);
    return NextResponse.json({ error: 'Kategori oluşturulamadı' }, { status: 500 });
  }
}
