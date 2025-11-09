/**
 * Consultant Unavailable Date API Route
 * PUT, DELETE /api/consultants/[id]/unavailable/[dateId]
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
 * PUT /api/consultants/[id]/unavailable/[dateId]
 * Update unavailable date
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dateId: string }> }
) {
  try {
    const { id: consultantId, dateId } = await params;
    const user = await requireAuth(request);
    const userRole = user.role as UserRole;

    // Authorization: Consultant can update their own, admins can update any
    if (userRole === UserRole.CONSULTANT && user.id !== consultantId) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();

    const result = await manageUnavailableDatesUseCase.updateUnavailableDate(dateId, {
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      reason: body.reason !== undefined ? body.reason || null : undefined,
      notes: body.notes !== undefined ? body.notes || null : undefined,
      programId: body.programId !== undefined ? body.programId || null : undefined,
    });

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    logger.error('Error in PUT /api/consultants/[id]/unavailable/[dateId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/consultants/[id]/unavailable/[dateId]
 * Delete unavailable date
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dateId: string }> }
) {
  try {
    const { id: consultantId, dateId } = await params;
    const user = await requireAuth(request);
    const userRole = user.role as UserRole;

    // Authorization: Consultant can delete their own, admins can delete any
    if (userRole === UserRole.CONSULTANT && user.id !== consultantId) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const result = await manageUnavailableDatesUseCase.deleteUnavailableDate(dateId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    logger.error('Error in DELETE /api/consultants/[id]/unavailable/[dateId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
