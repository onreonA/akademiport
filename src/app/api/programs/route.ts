/**
 * API Route: Programs
 *
 * GET /api/programs - List all programs
 * POST /api/programs - Create new program
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { CreateProgramDto } from '@/application/dto/program';

const repository = new ProgramRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const city = searchParams.get('city');

    let result;

    if (status) {
      result = await repository.findByStatus(status);
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
    return NextResponse.json({ error: 'Programlar alınamadı' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProgramDto = await request.json();

    // Validation
    if (!body.name || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Program adı, başlangıç ve bitiş tarihi zorunludur' },
        { status: 400 }
      );
    }

    // Convert dates
    body.startDate = new Date(body.startDate);
    body.endDate = new Date(body.endDate);

    const result = await repository.create(body);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
        message: 'Program başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Program oluşturulamadı' }, { status: 500 });
  }
}
