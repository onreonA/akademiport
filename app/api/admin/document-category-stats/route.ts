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
    // Get category statistics using the function
    const { data: categoryStats, error: statsError } = await supabase.rpc(
      'get_document_category_stats'
    );
    if (statsError) {
      return NextResponse.json(
        { success: false, error: 'Kategori istatistikleri getirilemedi' },
        { status: 500 }
      );
    }
    // Get additional statistics
    const { count: totalDocuments, error: totalError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Aktif');
    const { count: totalDownloads, error: downloadsError } = await supabase
      .from('documents')
      .select('download_count', { count: 'exact', head: true })
      .eq('status', 'Aktif');
    const { count: totalViews, error: viewsError } = await supabase
      .from('documents')
      .select('view_count', { count: 'exact', head: true })
      .eq('status', 'Aktif');
    // Calculate totals
    const totalDownloadsCount = totalDownloads || 0;
    const totalViewsCount = totalViews || 0;
    const stats = {
      categories: categoryStats || [],
      summary: {
        total_categories: categoryStats?.length || 0,
        total_documents: totalDocuments || 0,
        total_downloads: totalDownloadsCount,
        total_views: totalViewsCount,
        average_downloads_per_document:
          (totalDocuments || 0) > 0
            ? Math.round(totalDownloadsCount / (totalDocuments || 1))
            : 0,
        average_views_per_document:
          (totalDocuments || 0) > 0
            ? Math.round(totalViewsCount / (totalDocuments || 1))
            : 0,
      },
    };
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Kategori istatistikleri getirilirken hata oluştu',
      },
      { status: 500 }
    );
  }
}
