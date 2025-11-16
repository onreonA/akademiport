import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';
import {
  UpdateEcommerceMetricsUseCase,
  GetEcommerceMetricsUseCase,
} from '@/2-application/use-cases/ecommerce';
import { UpdateEcommerceMetricsDtoSchema } from '@/2-application/dtos/ecommerce';

/**
 * GET /api/ecommerce/metrics/[id]
 * Get e-commerce metrics by ID
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

    const repository = new SupabaseEcommerceRepository();
    const result = await repository.findMetricsById(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Metrik bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ metrics: result.value });
  } catch (error) {
    console.error('GET /api/ecommerce/metrics/[id] error:', error);
    return NextResponse.json({ error: 'Metrik alınamadı' }, { status: 500 });
  }
}

/**
 * PATCH /api/ecommerce/metrics/[id]
 * Update e-commerce metrics
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Validate DTO
    const dtoResult = UpdateEcommerceMetricsDtoSchema.safeParse(body);
    if (!dtoResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: dtoResult.error.issues },
        { status: 400 }
      );
    }

    // Check if user has permission (company users can only update their own company's metrics)
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    const repository = new SupabaseEcommerceRepository();
    const existingResult = await repository.findMetricsById(id);

    if (existingResult.isFailure || !existingResult.value) {
      return NextResponse.json({ error: 'Metrik bulunamadı' }, { status: 404 });
    }

    // Check authorization
    if (
      (userData?.role === 'company_admin' || userData?.role === 'company_user') &&
      existingResult.value.companyId !== userData.company_id
    ) {
      return NextResponse.json({ error: 'Bu metrikleri güncelleme yetkiniz yok' }, { status: 403 });
    }

    const useCase = new UpdateEcommerceMetricsUseCase(repository);
    const result = await useCase.execute(id, dtoResult.data);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ id: result.value.id });
  } catch (error) {
    console.error('PATCH /api/ecommerce/metrics/[id] error:', error);
    return NextResponse.json({ error: 'Metrik güncellenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/ecommerce/metrics/[id]
 * Delete e-commerce metrics
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

    // Check authorization (only admin can delete)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    const repository = new SupabaseEcommerceRepository();
    const result = await repository.deleteMetrics(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/ecommerce/metrics/[id] error:', error);
    return NextResponse.json({ error: 'Metrik silinemedi' }, { status: 500 });
  }
}
