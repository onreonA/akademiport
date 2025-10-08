import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, status')
      .limit(10);

    if (error) {
      console.error('Companies fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Firmalar getirilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: companies || [],
    });
  } catch (error) {
    console.error('Companies API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
