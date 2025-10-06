// =====================================================
// REFACTORED PROJECT DETAIL API ROUTE
// =====================================================
import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  withErrorHandling,
} from '@/lib/middleware/error-handler';
import { ProjectService } from '@/lib/services/project-service';
const projectService = new ProjectService();
// GET /api/v2/projects/[id] - Tek proje getir
export const GET = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const result = await projectService.getProject(request, (await params).id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return createSuccessResponse(result.data, result.message);
  },
  'GET /api/v2/projects/[id]'
);
// PUT /api/v2/projects/[id] - Proje güncelle
export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const body = await request.json();
    const result = await projectService.updateProject(
      request,
      (await params).id,
      body
    );
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return createSuccessResponse(result.data, result.message);
  },
  'PUT /api/v2/projects/[id]'
);
// DELETE /api/v2/projects/[id] - Proje sil
export const DELETE = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const result = await projectService.deleteProject(
      request,
      (await params).id
    );
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return createSuccessResponse(result.data, result.message);
  },
  'DELETE /api/v2/projects/[id]'
);
