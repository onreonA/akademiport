import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// Kullanıcının puan bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Kullanıcının seviye bilgilerini getir
    const { data: userLevel, error: levelError } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_email', userEmail)
      .single();
    if (levelError && levelError.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'Seviye bilgileri getirilemedi' },
        { status: 500 }
      );
    }
    // Kullanıcının başarımlarını getir (basit sorgu)
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_email', userEmail)
      .order('earned_at', { ascending: false });
    if (achievementsError) {
      // Başarım hatası olsa bile devam et, boş array kullan
    }
    // Son 10 puan işlemini getir
    const { data: recentTransactions, error: transactionsError } =
      await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(10);
    if (transactionsError) {
      return NextResponse.json(
        { success: false, error: 'İşlem geçmişi getirilemedi' },
        { status: 500 }
      );
    }
    // Eğer kullanıcının seviye kaydı yoksa oluştur
    if (!userLevel) {
      const { data: newUserLevel, error: createError } = await supabase
        .from('user_levels')
        .insert({
          user_email: userEmail,
          current_level: 1,
          current_points: 0,
          total_points_earned: 0,
          level_progress_percentage: 0,
        })
        .select()
        .single();
      if (createError) {
        return NextResponse.json(
          { success: false, error: 'Seviye oluşturulamadı' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        data: {
          level: newUserLevel,
          achievements: achievements || [],
          recentTransactions: recentTransactions || [],
        },
      });
    }
    return NextResponse.json({
      success: true,
      data: {
        level: userLevel,
        achievements: achievements || [],
        recentTransactions: recentTransactions || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// Puan ekleme (sistem tarafından kullanılır)
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    const {
      points,
      transaction_type,
      description,
      reference_id,
      reference_type,
      source = 'system',
    } = body;
    if (!points || !transaction_type || !description) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    // Puan işlemini kaydet
    const { data: transaction, error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_email: userEmail,
        points,
        transaction_type,
        description,
        reference_id,
        reference_type,
        source,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (transactionError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Puan işlemi kaydedilemedi',
          details: transactionError,
        },
        { status: 500 }
      );
    }
    if (transactionError) {
      return NextResponse.json(
        { success: false, error: 'Puan işlemi kaydedilemedi' },
        { status: 500 }
      );
    }
    // Kullanıcının seviye bilgilerini güncelle
    const { data: currentLevel, error: levelError } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_email', userEmail)
      .single();
    if (levelError) {
      return NextResponse.json(
        { success: false, error: 'Seviye bilgileri getirilemedi' },
        { status: 500 }
      );
    }
    const newTotalPoints = (currentLevel?.total_points_earned || 0) + points;
    const newCurrentPoints = (currentLevel?.current_points || 0) + points;
    const newLevel = await supabase.rpc('calculate_level', {
      points: newCurrentPoints,
    });
    const newProgress = await supabase.rpc('calculate_level_progress', {
      points: newCurrentPoints,
    });
    const { data: updatedLevel, error: updateError } = await supabase
      .from('user_levels')
      .update({
        current_points: newCurrentPoints,
        total_points_earned: newTotalPoints,
        current_level: newLevel.data,
        level_progress_percentage: newProgress.data,
        last_level_up_at:
          newLevel.data > (currentLevel?.current_level || 1)
            ? new Date().toISOString()
            : currentLevel?.last_level_up_at,
        updated_at: new Date().toISOString(),
      })
      .eq('user_email', userEmail)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Seviye güncellenemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        transaction,
        level: updatedLevel,
        levelUp: newLevel.data > (currentLevel?.current_level || 1),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
