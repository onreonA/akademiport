/**
 * API Route: Companies
 *
 * GET /api/companies - List all companies
 * POST /api/companies - Create new company
 */

import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';

// TODO: Company DTOs will be created in Sprint 6
interface CreateCompanyDto {
  programId: string;
  name: string;
  legalName?: string;
  taxNumber?: string;
  tradeRegistryNumber?: string;
  slug?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  sector?: string;
  subSector?: string;
  employeeCount?: number;
  foundationYear?: number;
  maxUsers?: number;
}

const repository = new CompanyRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');
    const city = searchParams.get('city');

    let result;

    if (programId) {
      result = await repository.findByProgramId(programId);
    } else if (city) {
      result = await repository.findByCity(city);
    } else {
      result = await repository.findAll();
    }

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
      count: result.value.length,
    });
  } catch {
    return NextResponse.json({ error: 'Firmalar alınamadı' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCompanyDto = await request.json();

    // Validation
    if (!body.name || !body.programId) {
      return NextResponse.json({ error: 'Firma adı ve program ID zorunludur' }, { status: 400 });
    }

    const result = await repository.create(body);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
        message: 'Firma başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Firma oluşturulamadı' }, { status: 500 });
  }
}
