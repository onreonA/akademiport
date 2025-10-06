import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

import { createClient } from '@/lib/supabase/server';
// POST /api/export - Export data to Excel/CSV
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const {
      type, // 'companies', 'projects', 'documents', 'events', 'notifications'
      format, // 'excel', 'csv'
      filters = {},
      dateRange = {},
    } = body;
    if (!type || !format) {
      return NextResponse.json(
        { error: 'Type and format are required' },
        { status: 400 }
      );
    }
    let data: any[] = [];
    let filename = '';
    // Find user's company for filtering
    let userCompanyId: string | null = null;
    if (!['admin', 'master_admin'].includes(userRole || '')) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (companyError && companyError.code === 'PGRST116') {
        const { data: userCompanyData, error: userCompanyError } =
          await supabase
            .from('company_users')
            .select('company_id')
            .eq('email', userEmail)
            .single();
        if (userCompanyData) {
          company = { id: userCompanyData.company_id };
        }
      }
      if (company) {
        userCompanyId = company.id;
      }
    }
    // Export Companies
    if (type === 'companies') {
      let query = supabase
        .from('companies')
        .select(
          `
          id,
          name,
          email,
          phone,
          website,
          address,
          description,
          sector,
          city,
          authorized_person,
          created_at,
          updated_at
        `
        )
        .order('created_at', { ascending: false });
      if (userCompanyId) {
        query = query.eq('id', userCompanyId);
      }
      // Apply filters
      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (dateRange.start && dateRange.end) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }
      const { data: companies, error } = await query;
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch companies' },
          { status: 500 }
        );
      }
      data =
        companies?.map(company => ({
          'Firma Adı': company.name,
          'E-posta': company.email,
          Telefon: company.phone,
          Website: company.website,
          Adres: company.address,
          Açıklama: company.description,
          Sektör: company.sector,
          Şehir: company.city,
          'Yetkili Kişi': company.authorized_person,
          'Oluşturulma Tarihi': new Date(company.created_at).toLocaleDateString(
            'tr-TR'
          ),
          'Güncellenme Tarihi': new Date(company.updated_at).toLocaleDateString(
            'tr-TR'
          ),
        })) || [];
      filename = `firmalar_${new Date().toISOString().split('T')[0]}`;
    }
    // Export Projects
    else if (type === 'projects') {
      let query = supabase
        .from('projects')
        .select(
          `
          id,
          name,
          description,
          status,
          progress_percentage,
          start_date,
          end_date,
          created_at,
          updated_at,
          company_id,
          companies (name, email)
        `
        )
        .order('created_at', { ascending: false });
      if (userCompanyId) {
        query = query.eq('company_id', userCompanyId);
      }
      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (dateRange.start && dateRange.end) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }
      const { data: projects, error } = await query;
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch projects' },
          { status: 500 }
        );
      }
      data =
        projects?.map(project => ({
          'Proje Adı': project.name,
          Açıklama: project.description,
          Durum: project.status,
          'İlerleme (%)': project.progress_percentage,
          'Başlangıç Tarihi': project.start_date
            ? new Date(project.start_date).toLocaleDateString('tr-TR')
            : '',
          'Bitiş Tarihi': project.end_date
            ? new Date(project.end_date).toLocaleDateString('tr-TR')
            : '',
          Firma: project.companies?.[0]?.name || '',
          'Firma E-posta': project.companies?.[0]?.email || '',
          'Oluşturulma Tarihi': new Date(project.created_at).toLocaleDateString(
            'tr-TR'
          ),
          'Güncellenme Tarihi': new Date(project.updated_at).toLocaleDateString(
            'tr-TR'
          ),
        })) || [];
      filename = `projeler_${new Date().toISOString().split('T')[0]}`;
    }
    // Export Documents
    else if (type === 'documents') {
      let query = supabase
        .from('files')
        .select(
          `
          id,
          name,
          file_name,
          file_type,
          upload_type,
          file_size,
          status,
          created_at,
          updated_at,
          company_id,
          uploaded_by,
          companies (name, email)
        `
        )
        .order('created_at', { ascending: false });
      if (userCompanyId) {
        query = query.eq('company_id', userCompanyId);
      }
      // Apply filters
      if (filters.upload_type) {
        query = query.eq('upload_type', filters.upload_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (dateRange.start && dateRange.end) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }
      const { data: documents, error } = await query;
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch documents' },
          { status: 500 }
        );
      }
      data =
        documents?.map(doc => ({
          'Dosya Adı': doc.name,
          'Dosya Türü': doc.file_type,
          'Yükleme Türü': doc.upload_type,
          'Dosya Boyutu (KB)': Math.round(doc.file_size / 1024),
          Durum: doc.status,
          Firma: doc.companies?.[0]?.name || '',
          'Firma E-posta': doc.companies?.[0]?.email || '',
          Yükleyen: doc.uploaded_by,
          'Oluşturulma Tarihi': new Date(doc.created_at).toLocaleDateString(
            'tr-TR'
          ),
          'Güncellenme Tarihi': new Date(doc.updated_at).toLocaleDateString(
            'tr-TR'
          ),
        })) || [];
      filename = `belgeler_${new Date().toISOString().split('T')[0]}`;
    }
    // Export Events
    else if (type === 'events') {
      let query = supabase
        .from('events')
        .select(
          `
          id,
          title,
          description,
          event_type,
          start_date,
          end_date,
          location,
          max_participants,
          current_participants,
          status,
          created_at,
          updated_at
        `
        )
        .order('created_at', { ascending: false });
      // Apply filters
      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (dateRange.start && dateRange.end) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }
      const { data: events, error } = await query;
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch events' },
          { status: 500 }
        );
      }
      data =
        events?.map(event => ({
          'Etkinlik Adı': event.title,
          Açıklama: event.description,
          'Etkinlik Türü': event.event_type,
          'Başlangıç Tarihi': event.start_date
            ? new Date(event.start_date).toLocaleDateString('tr-TR')
            : '',
          'Bitiş Tarihi': event.end_date
            ? new Date(event.end_date).toLocaleDateString('tr-TR')
            : '',
          Konum: event.location,
          'Maksimum Katılımcı': event.max_participants,
          'Mevcut Katılımcı': event.current_participants,
          Durum: event.status,
          'Oluşturulma Tarihi': new Date(event.created_at).toLocaleDateString(
            'tr-TR'
          ),
          'Güncellenme Tarihi': new Date(event.updated_at).toLocaleDateString(
            'tr-TR'
          ),
        })) || [];
      filename = `etkinlikler_${new Date().toISOString().split('T')[0]}`;
    }
    // Export Notifications
    else if (type === 'notifications') {
      let query = supabase
        .from('notifications')
        .select(
          `
          id,
          title,
          message,
          type,
          category,
          priority,
          read_at,
          created_at,
          updated_at,
          company_id,
          user_id,
          companies (name, email)
        `
        )
        .order('created_at', { ascending: false });
      if (userCompanyId) {
        query = query.eq('company_id', userCompanyId);
      }
      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.read_status === 'read') {
        query = query.not('read_at', 'is', null);
      } else if (filters.read_status === 'unread') {
        query = query.is('read_at', null);
      }
      if (dateRange.start && dateRange.end) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }
      const { data: notifications, error } = await query;
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch notifications' },
          { status: 500 }
        );
      }
      data =
        notifications?.map(notif => ({
          Başlık: notif.title,
          Mesaj: notif.message,
          Tür: notif.type,
          Kategori: notif.category,
          Öncelik: notif.priority,
          Okundu: notif.read_at ? 'Evet' : 'Hayır',
          'Okunma Tarihi': notif.read_at
            ? new Date(notif.read_at).toLocaleDateString('tr-TR')
            : '',
          Firma: notif.companies?.[0]?.name || '',
          'Firma E-posta': notif.companies?.[0]?.email || '',
          Kullanıcı: notif.user_id,
          'Oluşturulma Tarihi': new Date(notif.created_at).toLocaleDateString(
            'tr-TR'
          ),
          'Güncellenme Tarihi': new Date(notif.updated_at).toLocaleDateString(
            'tr-TR'
          ),
        })) || [];
      filename = `bildirimler_${new Date().toISOString().split('T')[0]}`;
    }
    if (data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data found to export',
        data: null,
      });
    }
    // Generate file based on format
    let fileBuffer: Buffer;
    let mimeType: string;
    let fileExtension: string;
    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Veriler');
      fileBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      mimeType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileExtension = 'xlsx';
    } else if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data));
      fileBuffer = Buffer.from(csv, 'utf-8');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
    // Return file as base64
    const base64Data = fileBuffer.toString('base64');
    return NextResponse.json({
      success: true,
      data: {
        filename: `${filename}.${fileExtension}`,
        mimeType,
        data: base64Data,
        recordCount: data.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
