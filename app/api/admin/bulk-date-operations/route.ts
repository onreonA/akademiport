import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/bulk-date-operations
 * Toplu tarih işlemleri (bulk operations)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Admin kontrolü
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (
      !userEmail ||
      !['admin', 'master_admin', 'danışman'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { operation, level, items, dateData, selectedCompanies, operations } =
      body;

    if (!operation || !level || !items) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Kullanıcı ID'sini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const results = [];
    const errors = [];

    // Çoklu firma desteği
    if (
      operation === 'assign_dates' &&
      selectedCompanies &&
      selectedCompanies.length > 0
    ) {
      // Her öğe için her firma için işlem yap
      for (const item of items) {
        for (const companyId of selectedCompanies) {
          try {
            let result;

            switch (level) {
              case 'project':
                result = await handleProjectBulkOperation(
                  supabase,
                  operation,
                  item.id,
                  {
                    companyId,
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    isFlexible: false,
                  },
                  user.id
                );
                break;
              case 'sub-project':
                result = await handleSubProjectBulkOperation(
                  supabase,
                  operation,
                  item.id,
                  {
                    companyId,
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    isFlexible: false,
                  },
                  user.id
                );
                break;
              case 'task':
                result = await handleTaskBulkOperation(
                  supabase,
                  operation,
                  item.id,
                  {
                    companyId,
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    isFlexible: false,
                  },
                  user.id
                );
                break;
              default:
                throw new Error(`Invalid level: ${level}`);
            }

            results.push({
              itemId: item.id,
              companyId,
              success: true,
              data: result,
            });
          } catch (error) {
            errors.push({
              itemId: item.id,
              companyId,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }
    } else {
      // Tek firma veya kaldırma işlemi
      if (
        operation === 'remove_dates' &&
        selectedCompanies &&
        selectedCompanies.length > 0
      ) {
        // Kaldırma işlemi için çoklu firma desteği
        for (const item of items) {
          for (const companyId of selectedCompanies) {
            try {
              let result;

              switch (level) {
                case 'project':
                  result = await handleProjectBulkOperation(
                    supabase,
                    operation,
                    item.id,
                    { companyId },
                    user.id
                  );
                  break;
                case 'sub-project':
                  result = await handleSubProjectBulkOperation(
                    supabase,
                    operation,
                    item.id,
                    { companyId },
                    user.id
                  );
                  break;
                case 'task':
                  result = await handleTaskBulkOperation(
                    supabase,
                    operation,
                    item.id,
                    { companyId },
                    user.id
                  );
                  break;
                default:
                  throw new Error(`Invalid level: ${level}`);
              }

              results.push({
                itemId: item.id,
                companyId,
                success: true,
                data: result,
              });
            } catch (error) {
              errors.push({
                itemId: item.id,
                companyId,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        }
      } else {
        // Tek firma işlemi
        for (const item of items) {
          try {
            let result;

            switch (level) {
              case 'project':
                result = await handleProjectBulkOperation(
                  supabase,
                  operation,
                  item.id,
                  dateData,
                  user.id
                );
                break;
              case 'sub-project':
                result = await handleSubProjectBulkOperation(
                  supabase,
                  operation,
                  item.id,
                  dateData,
                  user.id
                );
                break;
              case 'task':
                result = await handleTaskBulkOperation(
                  supabase,
                  operation,
                  item.id,
                  dateData,
                  user.id
                );
                break;
              default:
                throw new Error(`Invalid level: ${level}`);
            }

            results.push({ itemId: item.id, success: true, data: result });
          } catch (error) {
            errors.push({
              itemId: item.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: items.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Proje seviyesinde toplu işlem
 */
async function handleProjectBulkOperation(
  supabase: any,
  operation: string,
  projectId: string,
  dateData: any,
  userId: string
) {
  const { companyId, startDate, endDate, isFlexible } = dateData;

  switch (operation) {
    case 'assign_dates':
      // Mevcut kaydı kontrol et
      const { data: existingRecord } = await supabase
        .from('project_company_dates')
        .select('id')
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .maybeSingle();

      if (existingRecord) {
        // Güncelle
        const { data, error } = await supabase
          .from('project_company_dates')
          .update({
            start_date: startDate || null,
            end_date: endDate,
            is_flexible: isFlexible,
            updated_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Yeni kayıt ekle
        const { data, error } = await supabase
          .from('project_company_dates')
          .insert({
            project_id: projectId,
            company_id: companyId,
            start_date: startDate || null,
            end_date: endDate,
            is_flexible: isFlexible,
            created_by: userId,
            updated_by: userId,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

    case 'remove_dates':
      const { error: deleteError } = await supabase
        .from('project_company_dates')
        .delete()
        .eq('project_id', projectId)
        .eq('company_id', companyId);

      if (deleteError) throw deleteError;
      return { deleted: true };

    default:
      throw new Error(`Invalid operation: ${operation}`);
  }
}

/**
 * Alt proje seviyesinde toplu işlem
 */
async function handleSubProjectBulkOperation(
  supabase: any,
  operation: string,
  subProjectId: string,
  dateData: any,
  userId: string
) {
  const { companyId, startDate, endDate, isFlexible } = dateData;

  switch (operation) {
    case 'assign_dates':
      // Mevcut kaydı kontrol et
      const { data: existingRecord } = await supabase
        .from('sub_project_company_dates')
        .select('id')
        .eq('sub_project_id', subProjectId)
        .eq('company_id', companyId)
        .maybeSingle();

      if (existingRecord) {
        // Güncelle
        const { data, error } = await supabase
          .from('sub_project_company_dates')
          .update({
            start_date: startDate || null,
            end_date: endDate,
            is_flexible: isFlexible,
            updated_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Yeni kayıt ekle
        const { data, error } = await supabase
          .from('sub_project_company_dates')
          .insert({
            sub_project_id: subProjectId,
            company_id: companyId,
            start_date: startDate || null,
            end_date: endDate,
            is_flexible: isFlexible,
            created_by: userId,
            updated_by: userId,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

    case 'remove_dates':
      const { error: deleteError } = await supabase
        .from('sub_project_company_dates')
        .delete()
        .eq('sub_project_id', subProjectId)
        .eq('company_id', companyId);

      if (deleteError) throw deleteError;
      return { deleted: true };

    default:
      throw new Error(`Invalid operation: ${operation}`);
  }
}

/**
 * Görev seviyesinde toplu işlem
 */
async function handleTaskBulkOperation(
  supabase: any,
  operation: string,
  taskId: string,
  dateData: any,
  userId: string
) {
  const { companyId, startDate, endDate, isFlexible } = dateData;

  switch (operation) {
    case 'assign_dates':
      // Mevcut kaydı kontrol et
      const { data: existingRecord } = await supabase
        .from('task_company_dates')
        .select('id')
        .eq('task_id', taskId)
        .eq('company_id', companyId)
        .maybeSingle();

      if (existingRecord) {
        // Güncelle
        const { data, error } = await supabase
          .from('task_company_dates')
          .update({
            start_date: startDate || null,
            end_date: endDate,
            is_flexible: isFlexible,
            updated_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Yeni kayıt ekle
        const { data, error } = await supabase
          .from('task_company_dates')
          .insert({
            task_id: taskId,
            company_id: companyId,
            start_date: startDate || null,
            end_date: endDate,
            is_flexible: isFlexible,
            created_by: userId,
            updated_by: userId,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

    case 'remove_dates':
      const { error: deleteError } = await supabase
        .from('task_company_dates')
        .delete()
        .eq('task_id', taskId)
        .eq('company_id', companyId);

      if (deleteError) throw deleteError;
      return { deleted: true };

    default:
      throw new Error(`Invalid operation: ${operation}`);
  }
}
