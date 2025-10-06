import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const { searchParams } = new URL(request.url);
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    // Get query parameters
    const companyId = searchParams.get('company_id');
    const setId = searchParams.get('set_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    // Build query
    let query = supabase
      .from('company_education_assignments')
      .select(
        `
        *,
        companies (
          id,
          name,
          email,
          status
        ),
        education_sets (
          id,
          name,
          category,
          description
        ),
        users (
          id,
          full_name,
          email
        )
      `
      )
      .order('created_at', { ascending: false });
    // Apply filters
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    if (setId) {
      query = query.eq('set_id', setId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    // Apply pagination
    query = query.range(
      parseInt(offset),
      parseInt(offset) + parseInt(limit) - 1
    );
    const { data: assignments, error: assignmentsError, count } = await query;
    if (assignmentsError) {
      return NextResponse.json(
        { success: false, error: 'Atama geçmişi getirilemedi' },
        { status: 500 }
      );
    }
    // Process assignment data
    const processedData =
      assignments?.map(assignment => ({
        id: assignment.id,
        company_name: assignment.companies?.name || 'Bilinmeyen Firma',
        company_email: assignment.companies?.email || '',
        set_name: assignment.education_sets?.name || 'Bilinmeyen Set',
        set_category: assignment.education_sets?.category || '',
        status: assignment.status,
        progress_percentage: assignment.progress_percentage || 0,
        assigned_by: assignment.users?.full_name || 'Sistem',
        assigned_at: assignment.created_at,
        updated_at: assignment.assigned_at,
        completed_at:
          assignment.status === 'completed' ? assignment.assigned_at : null,
        notes: assignment.admin_notes || '',
      })) || [];
    return NextResponse.json({
      success: true,
      data: processedData,
      count: count || 0,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Atama geçmişi getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
