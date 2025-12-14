import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';

/**
 * GET /api/projects/[id]/assignments/companies
 * Get all companies assigned to a project
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const supabase = await createClient();

    // Get distinct companies assigned to this project
    const { data: assignments, error } = await supabase
      .from('company_project_assignments')
      .select(
        `
        company_id,
        companies!inner (
          id,
          name
        )
      `
      )
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch company assignments' }, { status: 500 });
    }

    // Extract unique companies
    const uniqueCompanies = new Map<string, { id: string; name: string }>();

    if (assignments) {
      for (const assignment of assignments) {
        const company = (assignment as Record<string, any>).companies;
        if (company && !uniqueCompanies.has(company.id)) {
          uniqueCompanies.set(company.id, {
            id: company.id,
            name: company.name,
          });
        }
      }
    }

    return NextResponse.json({
      companies: Array.from(uniqueCompanies.values()),
      count: uniqueCompanies.size,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
