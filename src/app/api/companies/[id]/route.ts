/**
 * API Route: Company by ID
 *
 * GET /api/companies/[id] - Get company by ID
 * PATCH /api/companies/[id] - Update company
 * DELETE /api/companies/[id] - Delete company
 */

import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { UpdateCompanyDto } from '@/domain/entities/Company';

const repository = new CompanyRepository();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await repository.findById(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch {
    return NextResponse.json({ error: 'Firma alınamadı' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: UpdateCompanyDto = await request.json();

    const result = await repository.update(id, body);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
      message: 'Firma başarıyla güncellendi',
    });
  } catch {
    return NextResponse.json({ error: 'Firma güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await repository.delete(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Firma başarıyla silindi',
    });
  } catch {
    return NextResponse.json({ error: 'Firma silinemedi' }, { status: 500 });
  }
}
