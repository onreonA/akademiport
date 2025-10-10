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
        { success: false, error: 'User email required' },
        { status: 400 }
      );
    }

    // Companies tablosundan kullanıcı bilgilerini al
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, email')
      .eq('email', userEmail)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Users tablosundan kullanıcı bilgilerini al (eğer varsa)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, company_id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      // Users tablosunda yoksa, company bilgilerini kullan
      const fallbackUser = {
        id: company.id, // Company ID'yi user ID olarak kullan
        email: company.email,
        full_name: company.name,
        role: 'firma',
        company_id: company.id,
      };

      return NextResponse.json({
        success: true,
        data: fallbackUser,
      });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Current user error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
