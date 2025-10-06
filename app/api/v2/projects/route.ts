// =====================================================
// REFACTORED PROJECTS API ROUTE
// =====================================================
// Yeni service layer kullanarak refactor edilmiş API
import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  withErrorHandling,
} from '@/lib/middleware/error-handler';
import { ProjectService } from '@/lib/services/project-service';
const projectService = new ProjectService();
// GET /api/v2/projects - Proje listesi
export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = new URL(request.url).searchParams;
  // Filtreler
  const filters = {
    status: searchParams.get('status') || undefined,
    type: searchParams.get('type') || undefined,
    companyId: searchParams.get('companyId') || undefined,
    consultantId: searchParams.get('consultantId') || undefined,
  };
  // Pagination
  const pagination = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'),
  };
  // Sort
  const sort = {
    field: searchParams.get('sortBy') || 'created_at',
    direction: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
  };
  const result = await projectService.getProjects(
    request,
    filters,
    pagination,
    sort
  );
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return createSuccessResponse(result.data, result.message, {
    total: result.total,
    page: pagination.page,
    limit: pagination.limit,
  });
}, 'GET /api/v2/projects');
// POST /api/v2/projects - Yeni proje oluşturma
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const result = await projectService.createProject(request, body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return createSuccessResponse(result.data, result.message);
}, 'POST /api/v2/projects');
