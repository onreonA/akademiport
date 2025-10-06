import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// Projeye firma ata
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { companyIds } = await request.json();
    const supabase = createClient();
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    // Kullanıcı yetkisini kontrol et
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Sadece adminler firma atayabilir
    if (!['admin', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        { error: 'Company IDs are required' },
        { status: 400 }
      );
    }
    // Eski sistem: Sadece ilk firmayı ata (1:1 ilişki)
    const firstCompanyId = companyIds[0];
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        company_id: firstCompanyId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();
    if (updateError) {
      return NextResponse.json(
        {
          error: 'Failed to assign company to project',
          details: updateError.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      project: updatedProject,
      assignedCount: 1,
      message: 'Firma başarıyla projeye atandı',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Projeye atanmış firmaları getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    // Kullanıcı bilgilerini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, company_id')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Projeye atanmış firmayı getir (eski sistem)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(
        `
        id,
        company_id,
        updated_at,
        companies (
          id,
          name,
          email,
          phone,
          city,
          status
        )
      `
      )
      .eq('id', id)
      .single();
    if (projectError) {
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      );
    }
    const assignment = project.company_id
      ? {
          id: project.id,
          projectId: project.id,
          companyId: project.company_id,
          assignedAt: project.updated_at,
          company: project.companies,
        }
      : null;
    return NextResponse.json({
      success: true,
      assignments: assignment ? [assignment] : [],
      total: assignment ? 1 : 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
