// =====================================================
// REFACTORED COMPANIES API ROUTE
// =====================================================
import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  withErrorHandling,
} from '@/lib/middleware/error-handler';
import { CompanyService } from '@/lib/services/company-service';
const companyService = new CompanyService();
// GET /api/v2/companies - Firma listesi
export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = new URL(request.url).searchParams;
  // Filtreler
  const filters = {
    status: searchParams.get('status') || undefined,
    industry: searchParams.get('industry') || undefined,
    size: searchParams.get('size') || undefined,
    country: searchParams.get('country') || undefined,
  };
  // Pagination
  const pagination = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'),
  };
  // Sort
  const sort = {
    field: searchParams.get('sortBy') || 'name',
    direction: (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc',
  };
  const result = await companyService.getCompanies(
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
}, 'GET /api/v2/companies');
// POST /api/v2/companies - Yeni firma oluşturma
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const result = await companyService.createCompany(request, body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return createSuccessResponse(result.data, result.message);
}, 'POST /api/v2/companies');
