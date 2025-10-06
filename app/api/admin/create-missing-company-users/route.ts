import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const userEmail = request.cookies.get('auth-user-email')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin kontrolü
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', userEmail)
      .single();

    if (
      userError ||
      !user ||
      (user.role !== 'admin' && user.role !== 'master_admin')
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Request body'den parametreleri al
    const {
      defaultPassword = '123456',
      userRole = 'admin',
      dryRun = false,
    } = await request.json();

    // Tüm firmaları al
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email, status');

    if (companiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    const results = [];
    let createdCount = 0;
    let errorCount = 0;

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    for (const company of companies) {
      try {
        // Bu firma için kullanıcı var mı kontrol et
        const { data: existingUser, error: checkError } = await supabase
          .from('company_users')
          .select('id')
          .eq('company_id', company.id)
          .single();

        if (existingUser && !checkError) {
          results.push({
            company_id: company.id,
            company_name: company.name,
            company_email: company.email,
            status: 'already_exists',
            message: 'Kullanıcı zaten mevcut',
          });
          continue;
        }

        if (dryRun) {
          results.push({
            company_id: company.id,
            company_name: company.name,
            company_email: company.email,
            status: 'would_create',
            message: 'Kullanıcı oluşturulacak (dry run)',
          });
          continue;
        }

        // Kullanıcı hesabı oluştur
        const { data: newUser, error: createError } = await supabase
          .from('company_users')
          .insert({
            company_id: company.id,
            email: company.email,
            password_hash: hashedPassword,
            name: company.name,
            role: userRole,
            status: 'active',
          })
          .select()
          .single();

        if (createError) {
          results.push({
            company_id: company.id,
            company_name: company.name,
            company_email: company.email,
            status: 'error',
            message: `Hata: ${createError.message}`,
          });
          errorCount++;
        } else {
          results.push({
            company_id: company.id,
            company_name: company.name,
            company_email: company.email,
            status: 'created',
            message: 'Kullanıcı başarıyla oluşturuldu',
            user_id: newUser.id,
          });
          createdCount++;
        }
      } catch (error) {
        results.push({
          company_id: company.id,
          company_name: company.name,
          company_email: company.email,
          status: 'error',
          message: `Beklenmeyen hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      dry_run: dryRun,
      statistics: {
        total_companies: companies.length,
        created_users: createdCount,
        existing_users: results.filter(r => r.status === 'already_exists')
          .length,
        errors: errorCount,
        would_create: dryRun
          ? results.filter(r => r.status === 'would_create').length
          : 0,
      },
      results,
      default_password: dryRun ? '***' : defaultPassword,
      message: dryRun
        ? `${results.filter(r => r.status === 'would_create').length} kullanıcı oluşturulacak`
        : `${createdCount} kullanıcı başarıyla oluşturuldu, ${errorCount} hata oluştu`,
    });
  } catch (error) {
    console.error('Error creating company users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
