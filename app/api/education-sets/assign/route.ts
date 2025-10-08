import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// POST - Eğitim setini firmalara ata
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı email gerekli' },
        { status: 401 }
      );
    }
    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    if (!['admin', 'master_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
    const body = await request.json();
    const { set_id, company_ids, assign_all } = body;
    if (!set_id) {
      return NextResponse.json(
        { error: 'Eğitim seti ID gerekli' },
        { status: 400 }
      );
    }
    // Check if education set exists
    const { data: educationSet, error: setError } = await supabase
      .from('education_sets')
      .select('id, name')
      .eq('id', set_id)
      .single();
    if (setError || !educationSet) {
      return NextResponse.json(
        { error: 'Eğitim seti bulunamadı' },
        { status: 404 }
      );
    }
    let companiesToAssign = [];
    if (assign_all) {
      // Get all companies (not just active ones)
      const { data: allCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id');
      if (companiesError) {
        return NextResponse.json(
          { error: 'Firmalar getirilemedi' },
          { status: 500 }
        );
      }
      companiesToAssign = allCompanies || [];
    } else if (company_ids && company_ids.length > 0) {
      // Get specific companies
      const { data: specificCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .in('id', company_ids);
      if (companiesError) {
        return NextResponse.json(
          { error: 'Firmalar getirilemedi' },
          { status: 500 }
        );
      }
      companiesToAssign = specificCompanies || [];
    } else {
      return NextResponse.json(
        { error: 'Atanacak firma belirtilmedi' },
        { status: 400 }
      );
    }
    if (companiesToAssign.length === 0) {
      return NextResponse.json(
        { error: 'Atanacak firma bulunamadı' },
        { status: 404 }
      );
    }
    // Check existing assignments to avoid duplicates
    const { data: existingAssignments, error: existingError } = await supabase
      .from('company_education_assignments')
      .select('company_id')
      .eq('set_id', set_id)
      .in(
        'company_id',
        companiesToAssign.map(c => c.id)
      );
    if (existingError) {
      return NextResponse.json(
        { error: 'Mevcut atamalar kontrol edilemedi' },
        { status: 500 }
      );
    }
    const existingCompanyIds =
      existingAssignments?.map(a => a.company_id) || [];
    const newCompanyIds = companiesToAssign
      .map(c => c.id)
      .filter(id => !existingCompanyIds.includes(id));
    if (newCompanyIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tüm firmalar zaten bu eğitim setine atanmış',
        assigned_count: 0,
      });
    }
    // Create new assignments
    const assignmentsToInsert = newCompanyIds.map(company_id => ({
      company_id,
      set_id,
      assigned_by: user.id,
      status: 'active',
      progress_percentage: 0,
    }));
    const { data: newAssignments, error: insertError } = await supabase
      .from('company_education_assignments')
      .insert(assignmentsToInsert)
      .select();
    if (insertError) {
      return NextResponse.json(
        { error: 'Firma atamaları oluşturulamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `${newAssignments.length} firmaya eğitim seti başarıyla atandı`,
      assigned_count: newAssignments.length,
      data: newAssignments,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
// GET - Eğitim setinin atandığı firmaları getir
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı email gerekli' },
        { status: 401 }
      );
    }
    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    if (!['admin', 'master_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const set_id = searchParams.get('set_id');
    if (!set_id) {
      return NextResponse.json(
        { error: 'Eğitim seti ID gerekli' },
        { status: 400 }
      );
    }
    // Get assignments for this education set
    const { data: assignments, error: assignmentsError } = await supabase
      .from('company_education_assignments')
      .select(
        `
        *,
        companies (
          id,
          name,
          email,
          status
        )
      `
      )
      .eq('set_id', set_id);
    if (assignmentsError) {
      return NextResponse.json(
        { error: 'Firma atamaları getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: assignments || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// DELETE - Eğitim seti atamasını kaldır
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı email gerekli' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { set_id, company_id } = body;

    if (!set_id || !company_id) {
      return NextResponse.json(
        { error: 'Eğitim seti ID ve Firma ID gerekli' },
        { status: 400 }
      );
    }

    // Atamayı kaldır
    const { error: deleteError } = await supabase
      .from('company_education_assignments')
      .delete()
      .eq('set_id', set_id)
      .eq('company_id', company_id);

    if (deleteError) {
      console.error('Assignment removal error:', deleteError);
      return NextResponse.json(
        { error: 'Atama kaldırma işlemi başarısız' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Eğitim seti ataması başarıyla kaldırıldı',
    });
  } catch (error) {
    console.error('Education set assignment removal error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
