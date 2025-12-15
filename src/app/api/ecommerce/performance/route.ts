import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';
import { GetEcommercePerformanceUseCase } from '@/2-application/use-cases/ecommerce';
import { EcommercePerformanceFilterDtoSchema } from '@/2-application/dtos/ecommerce';

/**
 * GET /api/ecommerce/performance
 * Get e-commerce performance data
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

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const filterData = {
      programId: searchParams.get('programId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      minRevenue: searchParams.get('minRevenue')
        ? parseFloat(searchParams.get('minRevenue')!)
        : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // For company users, restrict to their company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (userData?.role === 'company_admin' || userData?.role === 'company_user') {
      if (userData.company_id) {
        filterData.companyId = userData.company_id;
      }
    }

    const filterResult = EcommercePerformanceFilterDtoSchema.safeParse(filterData);
    if (!filterResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz filtre parametreleri', details: filterResult.error.issues },
        { status: 400 }
      );
    }

    const repository = new SupabaseEcommerceRepository();

    // Auto-refresh view if it seems stale (for admin users)
    if (userData?.role === 'master_admin') {
      // Check if view needs refresh by comparing companies count
      const { data: companiesCount } = await supabase
        .from('companies')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      const { data: viewCount } = await supabase
        .from('ecommerce_performance')
        .select('company_id', { count: 'exact', head: true });

      // If view has significantly fewer companies, refresh it
      if (companiesCount && viewCount && companiesCount > viewCount * 2) {
        await repository.refreshPerformance().catch((err) => {
          console.error('Auto-refresh failed:', err);
        });
      }
    }

    const useCase = new GetEcommercePerformanceUseCase(repository);
    const result = await useCase.execute(filterResult.data);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ performance: result.value });
  } catch (error) {
    console.error('GET /api/ecommerce/performance error:', error);
    return NextResponse.json({ error: 'Performans verileri alınamadı' }, { status: 500 });
  }
}
