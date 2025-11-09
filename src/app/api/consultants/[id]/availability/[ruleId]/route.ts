/**
 * Consultant Availability Rule API Route
 * PUT, DELETE /api/consultants/[id]/availability/[ruleId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';
import { AvailabilityRepository } from '@/4-infrastructure/database/repositories/AvailabilityRepository';
import { ManageAvailabilityUseCase } from '@/application/use-cases/availability';
import { logger } from '@/shared/utils/logger';

const availabilityRepository = new AvailabilityRepository();
const manageAvailabilityUseCase = new ManageAvailabilityUseCase(availabilityRepository);

/**
 * PUT /api/consultants/[id]/availability/[ruleId]
 * Update availability rule
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const { id: consultantId, ruleId } = await params;
    const user = await requireAuth(request);
    const userRole = user.role as UserRole;

    // Authorization: Consultant can update their own, admins can update any
    if (userRole === UserRole.CONSULTANT && user.id !== consultantId) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();

    const result = await manageAvailabilityUseCase.updateAvailability(ruleId, {
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      programId: body.programId || null,
      isActive: body.isActive,
    });

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    logger.error('Error in PUT /api/consultants/[id]/availability/[ruleId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/consultants/[id]/availability/[ruleId]
 * Delete availability rule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const { id: consultantId, ruleId } = await params;
    const user = await requireAuth(request);
    const userRole = user.role as UserRole;

    // Authorization: Consultant can delete their own, admins can delete any
    if (userRole === UserRole.CONSULTANT && user.id !== consultantId) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const result = await manageAvailabilityUseCase.deleteAvailability(ruleId);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    logger.error('Error in DELETE /api/consultants/[id]/availability/[ruleId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
