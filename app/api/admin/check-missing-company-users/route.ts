import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const userEmail = request.cookies.get('auth-user-email')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin kontrolü
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', userEmail)
      .single();

    if (
      userError ||
      !user ||
      (user.role !== 'admin' && user.role !== 'master_admin')
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Tüm firmaları al
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email, status');

    if (companiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    // Her firma için kullanıcı hesabı var mı kontrol et
    const companyUserStatus = [];

    for (const company of companies) {
      const { data: companyUser, error: userError } = await supabase
        .from('company_users')
        .select('id, email, role, status')
        .eq('company_id', company.id)
        .single();

      companyUserStatus.push({
        company_id: company.id,
        company_name: company.name,
        company_email: company.email,
        company_status: company.status,
        has_user: !!companyUser && !userError,
        user_email: companyUser?.email || null,
        user_role: companyUser?.role || null,
        user_status: companyUser?.status || null,
        error: userError?.message || null,
      });
    }

    // İstatistikler
    const totalCompanies = companies.length;
    const companiesWithUsers = companyUserStatus.filter(c => c.has_user).length;
    const companiesWithoutUsers = totalCompanies - companiesWithUsers;
    const activeCompanies = companies.filter(c => c.status === 'active').length;

    return NextResponse.json({
      success: true,
      statistics: {
        total_companies: totalCompanies,
        active_companies: activeCompanies,
        companies_with_users: companiesWithUsers,
        companies_without_users: companiesWithoutUsers,
        coverage_percentage:
          totalCompanies > 0
            ? Math.round((companiesWithUsers / totalCompanies) * 100)
            : 0,
      },
      companies: companyUserStatus,
      missing_users: companyUserStatus.filter(c => !c.has_user),
    });
  } catch (error) {
    console.error('Error checking company users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
