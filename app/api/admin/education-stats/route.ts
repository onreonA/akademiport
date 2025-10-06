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
    // Get total education sets
    const { count: totalSets, error: setsError } = await supabase
      .from('education_sets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    if (setsError) {
    }
    // Get total videos
    const { count: totalVideos, error: videosError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    if (videosError) {
    }
    // Get total documents
    const { count: totalDocuments, error: documentsError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Aktif');
    if (documentsError) {
    }
    // Get total active companies
    const { count: totalCompanies, error: companiesError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    if (companiesError) {
    }
    // Get education assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('company_education_assignments')
      .select('*');
    if (assignmentsError) {
    }
    // Calculate assignment statistics
    const activeAssignments =
      assignments?.filter(a => a.status === 'active').length || 0;
    const completedAssignments =
      assignments?.filter(a => a.status === 'completed').length || 0;
    // Calculate average progress
    const totalProgress =
      assignments?.reduce(
        (sum, assignment) => sum + (assignment.progress_percentage || 0),
        0
      ) || 0;
    const averageProgress =
      assignments && assignments.length > 0
        ? Math.round(totalProgress / assignments.length)
        : 0;
    const stats = {
      total_sets: totalSets || 0,
      total_videos: totalVideos || 0,
      total_documents: totalDocuments || 0,
      total_companies: totalCompanies || 0,
      active_assignments: activeAssignments,
      completed_assignments: completedAssignments,
      average_progress: averageProgress,
    };
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'İstatistikler getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
