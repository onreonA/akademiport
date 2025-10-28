/**
 * API Route: Program by ID
 *
 * GET /api/programs/[id] - Get program by ID
 * PATCH /api/programs/[id] - Update program
 * DELETE /api/programs/[id] - Delete program
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/infrastructure/database/repositories/ProgramRepository';
import { UpdateProgramDto } from '@/domain/entities/Program';

const repository = new ProgramRepository();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await repository.findById(id);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Program bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch {
    return NextResponse.json({ error: 'Program alınamadı' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: UpdateProgramDto = await request.json();

    // Convert dates if provided
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    const result = await repository.update(id, body);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
      message: 'Program başarıyla güncellendi',
    });
  } catch {
    return NextResponse.json({ error: 'Program güncellenemedi' }, { status: 500 });
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
      message: 'Program başarıyla silindi',
    });
  } catch {
    return NextResponse.json({ error: 'Program silinemedi' }, { status: 500 });
  }
}
