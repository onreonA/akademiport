/**
 * Consultant Unavailable Dates API Route
 * GET, POST /api/consultants/[id]/unavailable
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';
import { AvailabilityRepository } from '@/4-infrastructure/database/repositories/AvailabilityRepository';
import { ManageUnavailableDatesUseCase } from '@/application/use-cases/availability';
import { logger } from '@/shared/utils/logger';

const availabilityRepository = new AvailabilityRepository();
const manageUnavailableDatesUseCase = new ManageUnavailableDatesUseCase(availabilityRepository);

/**
 * GET /api/consultants/[id]/unavailable
 * Get consultant unavailable dates
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: consultantId } = await params;
    const user = await requireAuth(request);
    const userRole = user.role as UserRole;

    // Authorization: Consultant can view their own, admins can view all, company users can view consultants in their program
    if (userRole === UserRole.CONSULTANT && user.id !== consultantId) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;
    const programId = searchParams.get('programId') || undefined;

    const result = await manageUnavailableDatesUseCase.getUnavailableDatesByConsultant(
      consultantId,
      startDate,
      endDate,
      programId === 'null' ? null : programId || null
    );

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value || [],
    });
  } catch (error) {
    logger.error('Error in GET /api/consultants/[id]/unavailable:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/consultants/[id]/unavailable
 * Create new unavailable date
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: consultantId } = await params;
    const user = await requireAuth(request);
    const userRole = user.role as UserRole;

    // Authorization: Consultant can create their own, admins can create for any
    if (userRole === UserRole.CONSULTANT && user.id !== consultantId) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();

    const result = await manageUnavailableDatesUseCase.createUnavailableDate({
      consultantId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      reason: body.reason || null,
      notes: body.notes || null,
      programId: body.programId || null,
    });

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/consultants/[id]/unavailable:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
