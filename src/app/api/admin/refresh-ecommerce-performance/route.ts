import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseEcommerceRepository } from '@/4-infrastructure/database/repositories/SupabaseEcommerceRepository';

/**
 * POST /api/admin/refresh-ecommerce-performance
 * Refresh the ecommerce_performance materialized view
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    // Refresh the view
    const repository = new SupabaseEcommerceRepository();
    const refreshResult = await repository.refreshPerformance();

    if (refreshResult.isFailure) {
      return NextResponse.json(
        { error: refreshResult.error || 'View yenilenemedi' },
        { status: 500 }
      );
    }

    // Check companies count
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, program_id, is_active')
      .eq('is_active', true);

    if (companiesError) {
      return NextResponse.json(
        { error: `Firmalar alınamadı: ${companiesError.message}` },
        { status: 500 }
      );
    }

    // Check companies in view
    const { data: viewCompanies, error: viewError } = await supabase
      .from('ecommerce_performance')
      .select('company_id, company_name, program_id');

    if (viewError) {
      return NextResponse.json(
        { error: `View verileri alınamadı: ${viewError.message}` },
        { status: 500 }
      );
    }

    const kayseriProgramIdOld = '10000000-0000-0000-0000-000000000001';
    const kayseriProgramIdNew = '0560190a-9b8f-4c39-8c2b-c12bf81c46a6';

    const kayseriCompaniesOld =
      companies?.filter((c) => c.program_id === kayseriProgramIdOld) || [];
    const kayseriCompaniesNew =
      companies?.filter((c) => c.program_id === kayseriProgramIdNew) || [];

    return NextResponse.json({
      success: true,
      message: 'View başarıyla yenilendi',
      data: {
        totalCompanies: companies?.length || 0,
        companiesInView: viewCompanies?.length || 0,
        kayseriCompaniesOldId: kayseriCompaniesOld.length,
        kayseriCompaniesNewId: kayseriCompaniesNew.length,
        allProgramIds: Array.from(new Set(companies?.map((c) => c.program_id) || [])),
      },
    });
  } catch (error) {
    console.error('Refresh ecommerce performance error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'View yenilenemedi' },
      { status: 500 }
    );
  }
}
