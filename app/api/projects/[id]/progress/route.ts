import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
// Firma proje ilerlemesini güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { companyId, progressData } = await request.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
        'https://frylotuwbjhqybcxvvzs.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY'
    );
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userCompanyId = request.cookies.get('auth-user-company-id')?.value;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    // Kullanıcı yetkisini kontrol et
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, company_id')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Firma kullanıcıları sadece kendi firmalarının ilerlemesini güncelleyebilir
    if (['firma_admin', 'firma_kullanıcı'].includes(userRole || '')) {
      if (userCompanyId !== companyId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    // Proje atamasının var olduğunu kontrol et
    const { data: assignment, error: assignmentError } = await supabase
      .from('project_assignments')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single();
    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Project assignment not found' },
        { status: 404 }
      );
    }
    // İlerleme verilerini güncelle
    const { data: updatedProgress, error: updateError } = await supabase
      .from('company_project_progress')
      .update({
        progress_percentage: progressData.progressPercentage || 0,
        completed_tasks: progressData.completedTasks || 0,
        total_tasks: progressData.totalTasks || 0,
        completed_sub_projects: progressData.completedSubProjects || 0,
        total_sub_projects: progressData.totalSubProjects || 0,
        last_updated: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        notes: progressData.notes || null,
      })
      .eq('project_id', projectId)
      .eq('company_id', companyId)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      message: 'İlerleme başarıyla güncellendi',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Firma proje ilerlemesini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
        'https://frylotuwbjhqybcxvvzs.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY'
    );
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userCompanyId = request.cookies.get('auth-user-company-id')?.value;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    // Kullanıcı yetkisini kontrol et
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, company_id')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Firma kullanıcıları sadece kendi firmalarının ilerlemesini görebilir
    if (['firma_admin', 'firma_kullanıcı'].includes(userRole || '')) {
      if (userCompanyId !== companyId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    let query = supabase
      .from('company_project_progress')
      .select(
        `
        id,
        project_id,
        company_id,
        progress_percentage,
        completed_tasks,
        total_tasks,
        completed_sub_projects,
        total_sub_projects,
        last_updated,
        last_activity,
        notes,
        projects (
          id,
          title,
          description,
          status,
          start_date,
          end_date
        ),
        companies (
          id,
          name,
          email
        )
      `
      )
      .eq('project_id', projectId);
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    const { data: progressData, error: progressError } = await query;
    if (progressError) {
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      progress: companyId ? progressData?.[0] || null : progressData || [],
      total: progressData?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
