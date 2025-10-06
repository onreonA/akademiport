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
    const companyId = searchParams.get('company_id');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Get user points
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();
    if (pointsError && pointsError.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı puanları getirilemedi' },
        { status: 500 }
      );
    }
    // If no points record exists, create one
    if (!userPoints) {
      const { data: newPoints, error: createError } = await supabase
        .from('user_points')
        .insert({
          user_id: user.id,
          company_id: companyId,
          points: 0,
          total_points: 0,
          level: 1,
          experience_points: 0,
        })
        .select()
        .single();
      if (createError) {
        return NextResponse.json(
          { success: false, error: 'Kullanıcı puanları oluşturulamadı' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        data: newPoints,
      });
    }
    return NextResponse.json({
      success: true,
      data: userPoints,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Kullanıcı puanları getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    const {
      company_id,
      points,
      transaction_type,
      source,
      source_id,
      description,
    } = body;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    if (!company_id || !points || !transaction_type || !source) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Award points using the database function
    const { data: result, error: awardError } = await supabase.rpc(
      'award_points',
      {
        p_user_id: user.id,
        p_company_id: company_id,
        p_points: points,
        p_transaction_type: transaction_type,
        p_source: source,
        p_source_id: source_id,
        p_description: description,
      }
    );
    if (awardError) {
      return NextResponse.json(
        { success: false, error: 'Puanlar verilemedi' },
        { status: 500 }
      );
    }
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Puan verme işlemi başarısız' },
        { status: 500 }
      );
    }
    // Get updated user points
    const { data: updatedPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .eq('company_id', company_id)
      .single();
    if (pointsError) {
    }
    return NextResponse.json({
      success: true,
      data: {
        message: 'Puanlar başarıyla verildi',
        points_awarded: points,
        updated_points: updatedPoints,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Puanlar verilirken hata oluştu' },
      { status: 500 }
    );
  }
}
