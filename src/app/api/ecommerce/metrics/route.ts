import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';
import {
  CreateEcommerceMetricsUseCase,
  GetEcommerceMetricsUseCase,
} from '@/2-application/use-cases/ecommerce';
import {
  CreateEcommerceMetricsDtoSchema,
  EcommerceMetricsFilterDtoSchema,
} from '@/2-application/dtos/ecommerce';

/**
 * POST /api/ecommerce/metrics
 * Create e-commerce metrics
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

    // Get user data to check company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('User data error:', userError);
      return NextResponse.json({ error: 'Kullanıcı bilgileri alınamadı' }, { status: 400 });
    }

    const body = await request.json();

    // Validate DTO
    const dtoResult = CreateEcommerceMetricsDtoSchema.safeParse(body);
    if (!dtoResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: dtoResult.error.issues },
        { status: 400 }
      );
    }

    // Ensure companyId matches user's company
    const companyId = dtoResult.data.companyId || userData.company_id;
    if (!companyId) {
      return NextResponse.json({ error: 'Firma bilgisi bulunamadı' }, { status: 400 });
    }

    // Verify user belongs to this company (for company users)
    if (
      (userData.role === 'company_admin' || userData.role === 'company_user') &&
      userData.company_id !== companyId
    ) {
      return NextResponse.json({ error: 'Bu firma için yetkiniz yok' }, { status: 403 });
    }

    // Get company to find program_id
    let programId = dtoResult.data.programId;

    if (!programId) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('program_id')
        .eq('id', companyId)
        .single();

      if (companyError || !companyData) {
        console.error('Company data error:', companyError);
        return NextResponse.json({ error: 'Firma bilgisi alınamadı' }, { status: 400 });
      }

      programId = companyData.program_id;
    }

    if (!programId) {
      return NextResponse.json({ error: 'Program ID gerekli' }, { status: 400 });
    }

    const repository = new SupabaseEcommerceRepository();
    const useCase = new CreateEcommerceMetricsUseCase(repository);
    const result = await useCase.execute(
      {
        ...dtoResult.data,
        companyId,
        programId,
      },
      user.id
    );

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({ id: result.value.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/ecommerce/metrics error:', error);
    return NextResponse.json({ error: 'Metrik oluşturulamadı' }, { status: 500 });
  }
}

/**
 * GET /api/ecommerce/metrics
 * Get e-commerce metrics list
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
      companyId: searchParams.get('companyId') || undefined,
      programId: searchParams.get('programId') || undefined,
      periodYear: searchParams.get('periodYear')
        ? parseInt(searchParams.get('periodYear')!)
        : undefined,
      periodMonth: searchParams.get('periodMonth')
        ? parseInt(searchParams.get('periodMonth')!)
        : undefined,
      platformType: searchParams.get('platformType') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
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

    const filterResult = EcommerceMetricsFilterDtoSchema.safeParse(filterData);
    if (!filterResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz filtre parametreleri', details: filterResult.error.issues },
        { status: 400 }
      );
    }

    const repository = new SupabaseEcommerceRepository();
    const useCase = new GetEcommerceMetricsUseCase(repository);
    const result = await useCase.execute(filterResult.data);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    return NextResponse.json({
      metrics: result.value.metrics,
      total: result.value.total,
    });
  } catch (error) {
    console.error('GET /api/ecommerce/metrics error:', error);
    return NextResponse.json({ error: 'Metrikler alınamadı' }, { status: 500 });
  }
}
