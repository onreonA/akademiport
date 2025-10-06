import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/search - Global search across all modules
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'all', 'companies', 'projects', 'documents', 'events', 'news'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          results: [],
          total: 0,
          suggestions: [],
        },
      });
    }
    const searchTerm = query.trim().toLowerCase();
    const results: any[] = [];
    let totalCount = 0;
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
    // Search Companies
    if (!type || type === 'all' || type === 'companies') {
      let companyQuery = supabase
        .from('companies')
        .select(
          `
          id,
          name,
          email,
          sector,
          city,
          description,
          created_at
        `
        )
        .or(
          `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,sector.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        )
        .order('created_at', { ascending: false });
      if (userCompanyId) {
        companyQuery = companyQuery.eq('id', userCompanyId);
      }
      const { data: companies, error: companiesError } = await companyQuery;
      if (!companiesError && companies) {
        const companyResults = companies.map(company => ({
          id: company.id,
          type: 'company',
          title: company.name,
          description:
            company.description || `${company.sector} - ${company.city}`,
          url: `/admin/firma-yonetimi/${company.id}`,
          metadata: {
            email: company.email,
            sector: company.sector,
            city: company.city,
            created_at: company.created_at,
          },
        }));
        results.push(...companyResults);
        totalCount += companyResults.length;
      }
    }
    // Search Projects
    if (!type || type === 'all' || type === 'projects') {
      let projectQuery = supabase
        .from('projects')
        .select(
          `
          id,
          name,
          description,
          status,
          progress_percentage,
          created_at,
          company_id,
          companies (name, email)
        `
        )
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });
      if (userCompanyId) {
        projectQuery = projectQuery.eq('company_id', userCompanyId);
      }
      const { data: projects, error: projectsError } = await projectQuery;
      if (!projectsError && projects) {
        const projectResults = projects.map(project => ({
          id: project.id,
          type: 'project',
          title: project.name,
          description:
            project.description ||
            `Durum: ${project.status} - İlerleme: ${project.progress_percentage}%`,
          url: `/firma/proje-yonetimi/${project.id}`,
          metadata: {
            status: project.status,
            progress: project.progress_percentage,
            company: project.companies?.[0]?.name,
            created_at: project.created_at,
          },
        }));
        results.push(...projectResults);
        totalCount += projectResults.length;
      }
    }
    // Search Documents
    if (!type || type === 'all' || type === 'documents') {
      let documentQuery = supabase
        .from('files')
        .select(
          `
          id,
          name,
          file_type,
          upload_type,
          created_at,
          company_id,
          companies (name, email)
        `
        )
        .ilike('name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });
      if (userCompanyId) {
        documentQuery = documentQuery.eq('company_id', userCompanyId);
      }
      const { data: documents, error: documentsError } = await documentQuery;
      if (!documentsError && documents) {
        const documentResults = documents.map(doc => ({
          id: doc.id,
          type: 'document',
          title: doc.name,
          description: `${doc.file_type} - ${doc.upload_type}`,
          url: (doc as any).file_url,
          metadata: {
            file_type: doc.file_type,
            upload_type: doc.upload_type,
            company: doc.companies?.[0]?.name,
            created_at: doc.created_at,
          },
        }));
        results.push(...documentResults);
        totalCount += documentResults.length;
      }
    }
    // Search Events
    if (!type || type === 'all' || type === 'events') {
      const eventQuery = supabase
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
          created_at
        `
        )
        .or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`
        )
        .order('created_at', { ascending: false });
      const { data: events, error: eventsError } = await eventQuery;
      if (!eventsError && events) {
        const eventResults = events.map(event => ({
          id: event.id,
          type: 'event',
          title: event.title,
          description:
            event.description || `${event.event_type} - ${event.location}`,
          url: `/firma/etkinlikler/${event.id}`,
          metadata: {
            event_type: event.event_type,
            start_date: event.start_date,
            end_date: event.end_date,
            location: event.location,
            created_at: event.created_at,
          },
        }));
        results.push(...eventResults);
        totalCount += eventResults.length;
      }
    }
    // Search News
    if (!type || type === 'all' || type === 'news') {
      const newsQuery = supabase
        .from('news')
        .select(
          `
          id,
          title,
          content,
          category,
          published_at,
          created_at
        `
        )
        .or(
          `title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
        )
        .order('created_at', { ascending: false });
      const { data: news, error: newsError } = await newsQuery;
      if (!newsError && news) {
        const newsResults = news.map(newsItem => ({
          id: newsItem.id,
          type: 'news',
          title: newsItem.title,
          description: newsItem.content?.substring(0, 150) + '...',
          url: `/firma/haberler/${newsItem.id}`,
          metadata: {
            category: newsItem.category,
            published_at: newsItem.published_at,
            created_at: newsItem.created_at,
          },
        }));
        results.push(...newsResults);
        totalCount += newsResults.length;
      }
    }
    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(searchTerm);
      const bExact = b.title.toLowerCase().includes(searchTerm);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return (
        new Date(b.metadata.created_at).getTime() -
        new Date(a.metadata.created_at).getTime()
      );
    });
    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);
    // Generate search suggestions
    const suggestions = generateSearchSuggestions(searchTerm, results);
    return NextResponse.json({
      success: true,
      data: {
        results: paginatedResults,
        total: totalCount,
        suggestions,
        query: searchTerm,
        type: type || 'all',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Helper function to generate search suggestions
function generateSearchSuggestions(query: string, results: any[]): string[] {
  const suggestions: string[] = [];
  // Extract unique words from results
  const words = new Set<string>();
  results.forEach(result => {
    const titleWords = result.title.toLowerCase().split(/\s+/);
    titleWords.forEach((word: any) => {
      if (word.length > 2 && word.includes(query)) {
        words.add(word);
      }
    });
  });
  // Convert to array and limit
  return Array.from(words).slice(0, 5);
}
