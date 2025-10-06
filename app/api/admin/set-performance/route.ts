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
    // Get education sets with performance data
    const { data: educationSets, error: setsError } = await supabase
      .from('education_sets')
      .select(
        `
        id,
        name,
        category,
        status,
        created_at
      `
      )
      .eq('status', 'Aktif');
    if (setsError) {
      return NextResponse.json(
        {
          success: false,
          error: `Eğitim setleri getirilemedi: ${setsError.message}`,
        },
        { status: 500 }
      );
    }
    // Process performance data
    const performanceData =
      educationSets?.map(set => {
        return {
          id: set.id,
          name: set.name,
          category: set.category,
          video_count: 0, // Will be calculated separately if needed
          document_count: 0, // Will be calculated separately if needed
          assigned_companies: 0, // Will be calculated separately if needed
          average_completion: 0, // Will be calculated separately if needed
          total_views: 0, // Will be calculated separately if needed
        };
      }) || [];
    // Sort by average completion (descending)
    performanceData.sort((a, b) => b.average_completion - a.average_completion);
    return NextResponse.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Eğitim seti performans raporu getirilirken hata oluştu',
      },
      { status: 500 }
    );
  }
}
