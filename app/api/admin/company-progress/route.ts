import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
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
    // Get company progress data
    const { data: companyProgress, error: progressError } = await supabase
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
          category
        )
      `
      )
      .eq('companies.status', 'active');
    if (progressError) {
      return NextResponse.json(
        { success: false, error: 'Firma ilerleme verileri getirilemedi' },
        { status: 500 }
      );
    }
    // Process and aggregate company progress
    const companyMap = new Map();
    companyProgress?.forEach(assignment => {
      const companyId = assignment.companies?.id;
      const companyName = assignment.companies?.name;
      const companyEmail = assignment.companies?.email;
      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          id: companyId,
          name: companyName,
          email: companyEmail,
          total_assigned: 0,
          completed_sets: 0,
          progress_percentage: 0,
          last_activity: assignment.assigned_at || assignment.created_at,
        });
      }
      const company = companyMap.get(companyId);
      company.total_assigned += 1;
      if (assignment.status === 'completed') {
        company.completed_sets += 1;
      }
      // Update progress percentage
      const currentProgress = assignment.progress_percentage || 0;
      company.progress_percentage = Math.round(
        (company.progress_percentage + currentProgress) / 2
      );
      // Update last activity
      const assignmentDate = new Date(
        assignment.assigned_at || assignment.created_at
      );
      const currentDate = new Date(company.last_activity);
      if (assignmentDate > currentDate) {
        company.last_activity = assignment.assigned_at || assignment.created_at;
      }
    });
    const processedData = Array.from(companyMap.values()).map(company => ({
      ...company,
      progress_percentage: Math.round(company.progress_percentage),
    }));
    // Sort by progress percentage (descending)
    processedData.sort((a, b) => b.progress_percentage - a.progress_percentage);
    return NextResponse.json({
      success: true,
      data: processedData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Firma ilerleme raporu getirilirken hata oluştu',
      },
      { status: 500 }
    );
  }
}
