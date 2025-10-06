import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

import { createClient } from '@/lib/supabase/server';
// POST /api/import - Import data from Excel/CSV
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail || !['admin', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'companies', 'projects', 'events'
    const mode = formData.get('mode') as string; // 'create', 'update', 'upsert'
    if (!file || !type || !mode) {
      return NextResponse.json(
        { error: 'File, type and mode are required' },
        { status: 400 }
      );
    }
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file.',
        },
        { status: 400 }
      );
    }
    // Read file content
    const buffer = await file.arrayBuffer();
    let workbook: XLSX.WorkBook;
    try {
      if (file.type === 'text/csv') {
        const csvText = Buffer.from(buffer).toString('utf-8');
        workbook = XLSX.read(csvText, { type: 'string' });
      } else {
        workbook = XLSX.read(buffer, { type: 'buffer' });
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid file format. Please check your file and try again.' },
        { status: 400 }
      );
    }
    // Get first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'No data found in the file' },
        { status: 400 }
      );
    }
    const results = {
      total: jsonData.length,
      success: 0,
      errors: 0,
      errorDetails: [] as any[],
    };
    // Import Companies
    if (type === 'companies') {
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        try {
          // Map Excel columns to database fields
          const companyData = {
            name: row['Firma Adı'] || row['Company Name'] || row['name'],
            email: row['E-posta'] || row['Email'] || row['email'],
            phone: row['Telefon'] || row['Phone'] || row['phone'],
            website: row['Website'] || row['website'],
            address: row['Adres'] || row['Address'] || row['address'],
            description:
              row['Açıklama'] || row['Description'] || row['description'],
            sector: row['Sektör'] || row['Sector'] || row['sector'],
            city: row['Şehir'] || row['City'] || row['city'],
            authorized_person:
              row['Yetkili Kişi'] ||
              row['Authorized Person'] ||
              row['authorized_person'],
          };
          // Validate required fields
          if (!companyData.name || !companyData.email) {
            throw new Error('Firma adı ve e-posta alanları zorunludur');
          }
          // Check if company exists
          const { data: existingCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('email', companyData.email)
            .single();
          if (existingCompany && mode === 'create') {
            throw new Error('Bu e-posta adresi ile kayıtlı firma zaten mevcut');
          }
          let result;
          if (existingCompany && (mode === 'update' || mode === 'upsert')) {
            // Update existing company
            result = await supabase
              .from('companies')
              .update(companyData)
              .eq('id', existingCompany.id)
              .select();
          } else {
            // Create new company
            result = await supabase
              .from('companies')
              .insert(companyData)
              .select();
          }
          if (result.error) {
            throw new Error(result.error.message);
          }
          results.success++;
        } catch (error: any) {
          results.errors++;
          results.errorDetails.push({
            row: i + 1,
            error: error.message,
            data: row,
          });
        }
      }
    }
    // Import Projects
    else if (type === 'projects') {
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        try {
          // Map Excel columns to database fields
          const projectData = {
            name: row['Proje Adı'] || row['Project Name'] || row['name'],
            description:
              row['Açıklama'] || row['Description'] || row['description'],
            status: row['Durum'] || row['Status'] || row['status'] || 'active',
            progress_percentage: parseInt(
              row['İlerleme (%)'] ||
                row['Progress (%)'] ||
                row['progress_percentage'] ||
                '0'
            ),
            start_date:
              row['Başlangıç Tarihi'] || row['Start Date'] || row['start_date'],
            end_date: row['Bitiş Tarihi'] || row['End Date'] || row['end_date'],
          };
          // Validate required fields
          if (!projectData.name) {
            throw new Error('Proje adı zorunludur');
          }
          // Find company by email
          const companyEmail =
            row['Firma E-posta'] ||
            row['Company Email'] ||
            row['company_email'];
          if (!companyEmail) {
            throw new Error('Firma e-posta adresi zorunludur');
          }
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('email', companyEmail)
            .single();
          if (!company) {
            throw new Error(
              'Belirtilen e-posta adresi ile kayıtlı firma bulunamadı'
            );
          }
          projectData.company_id = company.id;
          // Check if project exists
          const { data: existingProject } = await supabase
            .from('projects')
            .select('id')
            .eq('name', projectData.name)
            .eq('company_id', company.id)
            .single();
          let result;
          if (existingProject && (mode === 'update' || mode === 'upsert')) {
            // Update existing project
            result = await supabase
              .from('projects')
              .update(projectData)
              .eq('id', existingProject.id)
              .select();
          } else if (existingProject && mode === 'create') {
            throw new Error('Bu proje zaten mevcut');
          } else {
            // Create new project
            result = await supabase
              .from('projects')
              .insert(projectData)
              .select();
          }
          if (result.error) {
            throw new Error(result.error.message);
          }
          results.success++;
        } catch (error: any) {
          results.errors++;
          results.errorDetails.push({
            row: i + 1,
            error: error.message,
            data: row,
          });
        }
      }
    }
    // Import Events
    else if (type === 'events') {
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        try {
          // Map Excel columns to database fields
          const eventData = {
            title: row['Etkinlik Adı'] || row['Event Title'] || row['title'],
            description:
              row['Açıklama'] || row['Description'] || row['description'],
            event_type:
              row['Etkinlik Türü'] ||
              row['Event Type'] ||
              row['event_type'] ||
              'seminar',
            start_date:
              row['Başlangıç Tarihi'] || row['Start Date'] || row['start_date'],
            end_date: row['Bitiş Tarihi'] || row['End Date'] || row['end_date'],
            location: row['Konum'] || row['Location'] || row['location'],
            max_participants: parseInt(
              row['Maksimum Katılımcı'] ||
                row['Max Participants'] ||
                row['max_participants'] ||
                '100'
            ),
            status: row['Durum'] || row['Status'] || row['status'] || 'active',
          };
          // Validate required fields
          if (!eventData.title) {
            throw new Error('Etkinlik adı zorunludur');
          }
          // Check if event exists
          const { data: existingEvent } = await supabase
            .from('events')
            .select('id')
            .eq('title', eventData.title)
            .eq('start_date', eventData.start_date)
            .single();
          let result;
          if (existingEvent && (mode === 'update' || mode === 'upsert')) {
            // Update existing event
            result = await supabase
              .from('events')
              .update(eventData)
              .eq('id', existingEvent.id)
              .select();
          } else if (existingEvent && mode === 'create') {
            throw new Error('Bu etkinlik zaten mevcut');
          } else {
            // Create new event
            result = await supabase.from('events').insert(eventData).select();
          }
          if (result.error) {
            throw new Error(result.error.message);
          }
          results.success++;
        } catch (error: any) {
          results.errors++;
          results.errorDetails.push({
            row: i + 1,
            error: error.message,
            data: row,
          });
        }
      }
    }
    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
