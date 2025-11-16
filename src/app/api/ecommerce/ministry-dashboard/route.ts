import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';
import { GetMinistryDashboardUseCase } from '@/2-application/use-cases/ecommerce';

/**
 * GET /api/ecommerce/ministry-dashboard
 * Get ministry dashboard statistics
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

    // Check authorization (only admin can access)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    // Get programId from query params (optional)
    const searchParams = request.nextUrl.searchParams;
    const programId = searchParams.get('programId') || undefined;

    const repository = new SupabaseEcommerceRepository();
    const useCase = new GetMinistryDashboardUseCase(repository);
    const result = await useCase.execute(programId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ dashboard: result.value });
  } catch (error) {
    console.error('GET /api/ecommerce/ministry-dashboard error:', error);
    return NextResponse.json({ error: 'Dashboard verileri alınamadı' }, { status: 500 });
  }
}
